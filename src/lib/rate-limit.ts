/**
 * Rate limiting con soporte para almacén compartido (producción) o en memoria (desarrollo).
 *
 * Sirve para proteger endpoints públicos que consultan tablas privadas
 * (como /api/precios-venta, que usa service_role) contra scraping o
 * agotamiento de conexiones a Supabase.
 *
 * Por defecto usa un almacén en memoria (Map), efectivo en una sola
 * instancia. Para producción en Vercel serverless, donde cada función
 * tiene su propio almacén, se puede inyectar un almacén compartido
 * (Vercel KV, Upstash, Redis) pasando `externalStore` a `rateLimit`.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Almacén externo opcional para producción distribuida.
 * Debe implementar get(key) y set(key, value, ttlMs).
 */
export interface ExternalRateLimitStore {
  get(key: string): Promise<RateLimitEntry | null>;
  set(key: string, value: RateLimitEntry, ttlMs: number): Promise<void>;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Verifica si la clave dada ha excedido el límite de requests en la ventana.
 *
 * Si se proporciona `externalStore`, se usa ese almacén compartido (útil en
 * producción con Vercel KV, Upstash o Redis). De lo contrario, usa el
 * almacén en memoria local.
 */
export async function rateLimit(
  key: string,
  options: { maxRequests: number; windowMs: number },
  externalStore?: ExternalRateLimitStore,
): Promise<RateLimitResult> {
  const now = Date.now();

  if (externalStore) {
    const entry = await externalStore.get(key);

    if (!entry || now > entry.resetTime) {
      await externalStore.set(key, {
        count: 1,
        resetTime: now + options.windowMs,
      }, options.windowMs);
      return {
        allowed: true,
        remaining: options.maxRequests - 1,
        resetTime: now + options.windowMs,
      };
    }

    if (entry.count >= options.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    entry.count++;
    await externalStore.set(key, entry, entry.resetTime - now);
    return {
      allowed: true,
      remaining: options.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  // Almacén en memoria (desarrollo / una sola instancia)
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + options.windowMs });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime: now + options.windowMs,
    };
  }

  if (entry.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count++;
  rateLimitStore.set(key, entry);
  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Extrae la IP del cliente de los headers de la request.
 * Prioriza x-forwarded-for (proxies/Vercel), luego x-real-ip.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

/**
 * Limpia entradas expiradas del almacén para evitar crecimiento ilimitado.
 * Se puede llamar periódicamente o en cada request bajo volumen.
 */
export function cleanupExpiredRateLimits(now?: number): void {
  const t = now ?? Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (t > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

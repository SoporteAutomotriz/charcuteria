/**
 * Rate limiting simple en memoria (ventana deslizante por IP).
 *
 * Sirve para proteger endpoints públicos que consultan tablas privadas
 * (como /api/precios-venta, que usa service_role) contra scraping o
 * agotamiento de conexiones a Supabase.
 *
 * Nota: el almacén es en memoria, por lo que es efectivo en una sola
 * instancia (desarrollo/local). En producción (Vercel serverless) cada
 * función tiene su propio almacén; para protección distribuida se
 * debería usar un almacén compartido (Redis, Vercel KV, Upstash, etc.).
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Verifica si la clave dada ha excedido el límite de requests en la ventana.
 * Retorna un resultado con allowed, remaining y resetTime.
 */
export function rateLimit(
  key: string,
  options: { maxRequests: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Entrada nueva o ventana expirada: reiniciar contador
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + options.windowMs });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime: now + options.windowMs,
    };
  }

  // Límite alcanzado
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

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit, getClientIp, cleanupExpiredRateLimits } from "@/lib/rate-limit";
import { generarIdempotencyKey } from "@/lib/cotizar/idempotency";

/**
 * Middleware de rate limiting para rutas públicas críticas.
 *
 * Sirve como primera línea de defensa antes de que la request llegue
 * a los endpoints de API o páginas públicas. Se ejecuta en el edge de
 * Vercel en cada request.
 *
 * Rutas protegidas:
 *   - /api/precios-venta (60 req/IP/60s) — defensa en profundidad,
 *     complementa el rate limiting ya existente en la route.
 *   - /cotizaciones/[token] (30 req/IP/60s) — protege la consulta pública
 *     por token contra scraping y enumeración.
 *
 * Adicionalmente, establece una clave de idempotencia httpOnly la primera
 * vez que el cliente entra al flujo de armado de cotización (/cotizar),
 * de forma que sobreviva a recargas y navegaciones, y el formulario de
 * envío solo la reutilice sin sincronización desde el navegador.
 *
 * Nota: el almacén es en memoria por instancia. En producción (Vercel
 * serverless) cada función/edge tiene su propio almacén, por lo que el
 * límite se aplica por instancia, no globalmente. Para un límite
 * distribuido real se debería usar un almacén compartido (Vercel KV,
 * Upstash, Redis).
 */

export const config = {
  matcher: ["/api/precios-venta", "/cotizaciones/:token*", "/cotizar/:path*"],
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const ip = getClientIp(request);

  // Limpieza periódica del almacén en memoria
  cleanupExpiredRateLimits();

  // Rate limiting para /api/precios-venta
  if (pathname === "/api/precios-venta") {
    const limit = await rateLimit(`precios-venta:${ip}`, {
      maxRequests: 60,
      windowMs: 60_000,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta de nuevo más tarde." },
        { status: 429 },
      );
    }
  }

  // Rate limiting para consulta pública por token
  if (pathname.startsWith("/cotizaciones/")) {
    const limit = await rateLimit(`cotizacion-publica:${ip}`, {
      maxRequests: 30,
      windowMs: 60_000,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Demasiadas consultas. Intenta de nuevo más tarde." },
        { status: 429 },
      );
    }
  }

  // Idempotency key: generar una sola vez al entrar al flujo de armado
  // de cotización y establecerla como cookie httpOnly. Si ya existe,
  // no se toca (sobrevive a recargas y navegaciones).
  if (pathname.startsWith("/cotizar/") || pathname === "/cotizar") {
    const existingKey = request.cookies.get("idempotency_key")?.value;
    if (!existingKey) {
      const response = NextResponse.next();
      response.cookies.set("idempotency_key", generarIdempotencyKey(), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15, // 15 minutos
      });
      return response;
    }
  }

  return NextResponse.next();
}

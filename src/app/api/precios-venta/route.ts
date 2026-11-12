import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cotizar, paraCliente } from "@/lib/precios/motor";
import { rateLimit, getClientIp, cleanupExpiredRateLimits } from "@/lib/rate-limit";

/**
 * Endpoint público: devuelve precios de venta unitarios de productos activos.
 *
 * Calcula los precios en el servidor usando el motor determinista con costos
 * y márgenes de tablas privadas (service_role). Retorna SOLO datos aptos para
 * el cliente: ID, nombre, categoría y precio de venta. Nunca expone costos
 * ni márgenes internos.
 *
 * Rate limiting por IP para proteger contra scraping y agotamiento de
 * conexiones a Supabase (usa service_role para leer tablas privadas).
 */
export async function GET(request: NextRequest) {
  // 0. Rate limiting por IP (ventana de 60s, 60 requests por IP)
  // Nota: el middleware también aplica rate limiting a esta ruta como
  // primera línea de defensa. Esta llamada es defensa en profundidad.
  cleanupExpiredRateLimits();
  const clientIp = getClientIp(request);
  const limit = await rateLimit(clientIp, { maxRequests: 60, windowMs: 60_000 });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo más tarde." },
      { status: 429 },
    );
  }

  const supabase = await createAdminClient();

  // 1. Leer productos activos
  const { data: productos, error: productosError } = await supabase
    .from("productos")
    .select("id, nombre, categoria_id, estado")
    .eq("estado", "activo")
    .order("nombre", { ascending: true });

  if (productosError || !productos) {
    return NextResponse.json(
      { error: "No se pudieron cargar los productos" },
      { status: 500 },
    );
  }

  // 2. Leer costos privados (tabla privada, solo propietario)
  const productoIds = productos.map((p) => p.id);
  const { data: costos, error: costosError } = await supabase
    .from("producto_costos")
    .select("producto_id, costo_unitario_compra")
    .in("producto_id", productoIds);

  if (costosError) {
    return NextResponse.json(
      { error: "No se pudieron cargar los costos de productos" },
      { status: 500 },
    );
  }

  // 3. Leer márgenes privados (tabla privada, solo propietario)
  const { data: margenes, error: margenesError } = await supabase
    .from("producto_margenes")
    .select("producto_id, margen_propio_pct, precio_fijo_manual")
    .in("producto_id", productoIds);

  if (margenesError) {
    return NextResponse.json(
      { error: "No se pudieron cargar los márgenes de productos" },
      { status: 500 },
    );
  }

  // 4. Leer parámetros globales (margen_global_pct, iva_pct)
  const { data: parametros, error: parametrosError } = await supabase
    .from("parametros_globales")
    .select("clave, valor")
    .in("clave", ["margen_global_pct", "iva_pct"]);

  if (parametrosError) {
    return NextResponse.json(
      { error: "No se pudieron cargar los parámetros globales" },
      { status: 500 },
    );
  }

  const margenGlobalPct =
    parametros?.find((p) => p.clave === "margen_global_pct")?.valor ?? 0;
  const ivaPct =
    parametros?.find((p) => p.clave === "iva_pct")?.valor ?? 0;

  // 5. Construir estructuras para el motor
  const costosPrivados: Record<
    string,
    {
      costoUnitarioCompra: string;
      merma: string;
      factorConversion: string;
      margenPropioPct?: string;
      precioFijoManual?: string;
    }
  > = {};
  const categorias: Record<string, { margenPct: string }> = {};

  for (const p of productos) {
    const costo = costos?.find((c) => c.producto_id === p.id);
    const margen = margenes?.find((m) => m.producto_id === p.id);

    costosPrivados[String(p.id)] = {
      costoUnitarioCompra: costo?.costo_unitario_compra ?? "0",
      merma: "0",
      factorConversion: "1",
      ...(margen?.margen_propio_pct !== undefined
        ? { margenPropioPct: String(margen.margen_propio_pct) }
        : {}),
      ...(margen?.precio_fijo_manual !== undefined
        ? { precioFijoManual: String(margen.precio_fijo_manual) }
        : {}),
    };

    if (p.categoria_id) {
      categorias[String(p.categoria_id)] = {
        margenPct: String(margenGlobalPct),
      };
    }
  }

  // 6. Calcular precio de venta para cada producto (uno a uno, motor determinista)
  const preciosVenta: Array<{
    productoId: number;
    nombre: string;
    categoriaId: number | null;
    precioVenta: string;
    activo: boolean;
  }> = [];

  for (const p of productos) {
    try {
      const entrada = {
        items: [
          {
            productoId: String(p.id),
            cantidadServida: "1",
            categoriaId: String(p.categoria_id ?? 0),
          },
        ],
        costosPrivados,
        categorias,
        margenGlobalPct: String(margenGlobalPct),
        ivaPct: String(ivaPct),
      };

      const salidaInterna = cotizar(entrada);
      const salidaCliente = paraCliente(salidaInterna);

      const linea = salidaCliente.lineas[0];

      preciosVenta.push({
        productoId: p.id,
        nombre: p.nombre,
        categoriaId: p.categoria_id,
        precioVenta: linea?.precioVentaLinea ?? "0",
        activo: true,
      });
    } catch {
      // Si un producto no puede calcularse (falta costo, margen inválido),
      // se omite de la lista pública en lugar de exponer un error 500.
      continue;
    }
  }

  return NextResponse.json(preciosVenta);
}

/**
 * Cliente del estimado para el navegador (Fase 5).
 *
 * Llama al endpoint público /api/precios-venta para obtener los precios de
 * venta unitarios de los productos (calculados en el servidor, sin exponer
 * costos ni márgenes internos). El cliente usa estos precios para mostrar
 * el estimado preliminar en el carrito.
 */

export interface PrecioVentaProducto {
  productoId: number;
  nombre: string;
  categoriaId: number | null;
  precioVenta: string; // decimal con 2 decimales, MXN
  activo: boolean;
}

const BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL ?? "";

/** Obtiene los precios de venta de todos los productos activos. */
export async function obtenerPreciosVenta(): Promise<PrecioVentaProducto[]> {
  const res = await fetch(`${BASE_URL}/api/precios-venta`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Error al obtener precios de venta: ${res.statusText}`);
  }

  return res.json();
}

/** Calcula el subtotal de venta para una lista de productos seleccionados. */
export function calcularSubtotalVenta(
  precios: Record<number, PrecioVentaProducto>,
  productos: { productoId: number; cantidadServida: number }[],
): string {
  const total = productos.reduce((acc, p) => {
    const precio = precios[p.productoId];
    if (!precio) return acc;
    return acc + Number(precio.precioVenta) * p.cantidadServida;
  }, 0);
  return total.toFixed(2);
}

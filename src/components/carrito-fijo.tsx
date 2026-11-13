"use client";

/**
 * Carrito fijo del configurador del cliente (Fase 5).
 *
 * Muestra el estimado preliminar en vivo mientras el cliente navega por los
 * pasos. Obtiene precios de venta del endpoint público /api/precios-venta
 * (servidor, sin costos ni márgenes internos). Nunca expone costos ni márgenes
 * al navegador.
 */

import {
  obtenerPreciosVenta,
  calcularSubtotalVenta,
} from "@/lib/cotizar/estimado";
import { leerBorrador } from "@/lib/cotizar/store";
import type { ProductoSeleccionado } from "@/lib/cotizar/store";
import type { PrecioVentaProducto } from "@/lib/cotizar/estimado";
import { useState, useEffect } from "react";

export default function CarritoFijo() {
  const [precios, setPrecios] = useState<Record<number, PrecioVentaProducto>>(
    {},
  );
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Leer el borrador solo en el cliente. Durante la hidratación inicial el
  // servidor renderiza con productos vacíos (localStorage no existe en el
  // servidor) y el cliente puede tener datos guardados, lo que causaría un
  // mismatch de hidratación (React #441). Se usa suppressHydrationWarning en
  // el contenedor para silenciar ese差异 y los datos del cliente se reflejan
  // tras la hidratación.
  const productos: ProductoSeleccionado[] =
    typeof window !== "undefined" ? (leerBorrador().productos ?? []) : [];

  useEffect(() => {
    let montado = true;
    (async () => {
      try {
        setCargando(true);
        setError(null);
        const lista = await obtenerPreciosVenta();
        if (!montado) return;
        const mapa: Record<number, PrecioVentaProducto> = {};
        for (const p of lista) {
          mapa[p.productoId] = p;
        }
        setPrecios(mapa);
      } catch {
        if (!montado) return;
        setError("No se pudieron cargar los precios. Intenta de nuevo.");
      } finally {
        if (!montado) return;
        setCargando(false);
      }
    })();
    return () => {
      montado = false;
    };
  }, []);

  const subtotal = calcularSubtotalVenta(precios, productos);

  if (cargando) {
    return (
      <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
        <p className="text-sm text-zinc-500">Cargando precios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg border border-amber-200 shadow-sm">
        <p className="text-sm text-amber-700">{error}</p>
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm sticky top-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-zinc-900">
          Estimado preliminar
        </span>
        <span className="text-xs text-zinc-500">sujeto a revisión</span>
      </div>
      <div className="text-lg font-bold text-zinc-900">
        ${Number(subtotal).toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
      <p className="text-xs text-zinc-500 mb-3">
        {productos.length} producto(s) · IVA estimado incluido ·{" "}
        <span className="font-medium text-amber-700">
          Estimado preliminar, sujeto a revisión y aprobación del propietario
        </span>
      </p>
      {productos.length > 0 && (
        <ul className="space-y-1 max-h-24 overflow-y-auto pb-2">
          {productos.map((p) => {
            const precio = precios[p.productoId];
            const lineaTotal = precio
              ? (Number(precio.precioVenta) * p.cantidadServida).toFixed(2)
              : "0.00";
            return (
              <li key={p.productoId} className="text-xs text-zinc-600 flex justify-between">
                <span>Producto #{p.productoId} × {p.cantidadServida}</span>
                <span>${Number(lineaTotal).toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

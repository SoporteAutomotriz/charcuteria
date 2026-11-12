"use server";

import Big from "big.js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePanelAccess, requirePropietario } from "@/lib/auth/server";
import type { EstadoCotizacion } from "@/lib/panel/cotizaciones-tipos";

/**
 * Cambia el estado de una cotización (solo propietario o administrador).
 * Al pasar a "enviada" por primera vez, el trigger de BD (migración 3)
 * congela automáticamente la versión 1 en cotizacion_versiones.
 *
 * Estados exclusivos del propietario: "enviada" y "confirmada".
 * El administrador puede cambiar a cualquier otro estado.
 */
export async function actualizarEstadoCotizacion(
  id: number,
  estado: EstadoCotizacion,
) {
  await requirePanelAccess();

  const estadosSoloPropietario: EstadoCotizacion[] = ["enviada", "confirmada"];

  if (
    estadosSoloPropietario.includes(estado)
  ) {
    await requirePropietario();
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("cotizaciones")
    .update({ estado, actualizado_en: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(`Error al actualizar estado: ${error.message}`);
  }

  redirect(`/panel/cotizaciones/${id}`);
}

/**
 * Aplica un descuento porcentual a una cotización (solo propietario).
 * El descuento se guarda en la columna descuento_pct de cotizaciones.
 * El total final se recalcula aplicando el descuento sobre total_venta.
 */
export async function aplicarDescuento(id: number, descuentoPct: number) {
  await requirePropietario();

  const supabase = await createClient();

  const { data: cotizacion, error: fetchError } = await supabase
    .from("cotizaciones")
    .select("total_venta")
    .eq("id", id)
    .single();

  if (fetchError || !cotizacion) {
    throw new Error("Cotización no encontrada");
  }

  if (descuentoPct < 0 || descuentoPct > 100) {
    throw new Error("El descuento debe estar entre 0 y 100");
  }

  const totalVenta = new Big(cotizacion.total_venta ?? "0");
  const descuentoFactor = new Big(1).minus(new Big(descuentoPct).div(100));
  const totalConDescuento = totalVenta.times(descuentoFactor);

  const { error } = await supabase
    .from("cotizaciones")
    .update({
      descuento_pct: descuentoPct,
      total_venta: totalConDescuento.toFixed(2),
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Error al aplicar descuento: ${error.message}`);
  }

  redirect(`/panel/cotizaciones/${id}`);
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { requirePanelAccess } from "@/lib/auth/server";
import type { Database } from "@/types/database";

export type CotizacionRow = Database["public"]["Tables"]["cotizaciones"]["Row"];

/**
 * Lista cotizaciones para el panel del propietario.
 * Solo lectura de tablas públicas; nunca expone costos ni márgenes.
 */
export async function listarCotizaciones() {
  await requirePanelAccess();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cotizaciones")
    .select(
      "id, folio, estado, datos_cliente, datos_evento, total_venta, creado_en, token_expires_en",
    )
    .order("creado_en", { ascending: false });

  if (error) {
    throw new Error(`Error al cargar cotizaciones: ${error.message}`);
  }

  return (data ?? []) as CotizacionRow[];
}

/**
 * Obtiene una cotización por su ID para el panel del propietario.
 * Incluye datos públicos y de contacto (solo propietario/administrador).
 */
export async function obtenerCotizacionPanel(id: number) {
  await requirePanelAccess();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cotizaciones")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as CotizacionRow;
}

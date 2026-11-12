import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type ZonaTransporte =
  Database["public"]["Tables"]["zonas_transporte"]["Row"];
export type ZonaTransporteInsert =
  Database["public"]["Tables"]["zonas_transporte"]["Insert"];
export type ZonaTransporteUpdate =
  Database["public"]["Tables"]["zonas_transporte"]["Update"];
export type TarifaMontaje =
  Database["public"]["Tables"]["tarifas_montaje"]["Row"];
export type TarifaMontajeInsert =
  Database["public"]["Tables"]["tarifas_montaje"]["Insert"];
export type TarifaMontajeUpdate =
  Database["public"]["Tables"]["tarifas_montaje"]["Update"];

export async function listarZonasTransporte(): Promise<ZonaTransporte[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("zonas_transporte")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    throw new Error(`Error al listar zonas de transporte: ${error.message}`);
  }

  return data ?? [];
}

export async function crearZonaTransporte(
  zona: Database["public"]["Tables"]["zonas_transporte"]["Insert"],
): Promise<ZonaTransporte> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("zonas_transporte")
    .insert(zona)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear zona de transporte: ${error.message}`);
  }

  return data;
}

export async function actualizarZonaTransporte(
  id: number,
  cambios: ZonaTransporteUpdate,
): Promise<ZonaTransporte> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("zonas_transporte")
    .update(cambios)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar zona de transporte: ${error.message}`);
  }

  return data;
}

export async function eliminarZonaTransporte(id: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("zonas_transporte")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Error al eliminar zona de transporte: ${error.message}`);
  }
}

export async function listarTarifasMontaje(): Promise<TarifaMontaje[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tarifas_montaje")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Error al listar tarifas de montaje: ${error.message}`);
  }

  return data ?? [];
}

export async function crearTarifaMontaje(
  tarifa: Database["public"]["Tables"]["tarifas_montaje"]["Insert"],
): Promise<TarifaMontaje> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tarifas_montaje")
    .insert(tarifa)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear tarifa de montaje: ${error.message}`);
  }

  return data;
}

export async function actualizarTarifaMontaje(
  id: number,
  cambios: TarifaMontajeUpdate,
): Promise<TarifaMontaje> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tarifas_montaje")
    .update(cambios)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar tarifa de montaje: ${error.message}`);
  }

  return data;
}

export async function eliminarTarifaMontaje(id: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tarifas_montaje")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Error al eliminar tarifa de montaje: ${error.message}`);
  }
}

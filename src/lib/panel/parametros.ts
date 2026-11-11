import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type ParametroGlobal =
  Database["public"]["Tables"]["parametros_globales"]["Row"];
export type ParametroGlobalInsert =
  Database["public"]["Tables"]["parametros_globales"]["Insert"];
export type ParametroGlobalUpdate =
  Database["public"]["Tables"]["parametros_globales"]["Update"];

export async function listarParametrosGlobales(): Promise<ParametroGlobal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("parametros_globales")
    .select("*")
    .order("clave", { ascending: true });

  if (error) {
    throw new Error(`Error al listar parámetros globales: ${error.message}`);
  }

  return data ?? [];
}

export async function obtenerParametroGlobal(
  clave: string,
): Promise<ParametroGlobal | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("parametros_globales")
    .select("*")
    .eq("clave", clave)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Error al obtener parámetro global: ${error.message}`);
  }

  return data;
}

export async function crearParametroGlobal(
  parametro: ParametroGlobalInsert,
): Promise<ParametroGlobal> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("parametros_globales")
    .insert(parametro)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear parámetro global: ${error.message}`);
  }

  return data;
}

export async function actualizarParametroGlobal(
  clave: string,
  cambios: ParametroGlobalUpdate,
): Promise<ParametroGlobal> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("parametros_globales")
    .update(cambios)
    .eq("clave", clave)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar parámetro global: ${error.message}`);
  }

  return data;
}

export async function eliminarParametroGlobal(clave: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("parametros_globales")
    .delete()
    .eq("clave", clave);

  if (error) {
    throw new Error(`Error al eliminar parámetro global: ${error.message}`);
  }
}

/** Valores de parámetros conocidos que usa el motor de precios. */
export const PARAMETROS_CONOCIDOS = {
  MARGEN_GLOBAL_PCT: "margen_global_pct",
  IVA_PCT: "iva_pct",
} as const;

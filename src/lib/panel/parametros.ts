import { createClient } from "@/lib/supabase/server";
import { requirePropietario } from "@/lib/auth/server";
import type { Database } from "@/types/database";

export type ParametroGlobal =
  Database["public"]["Tables"]["parametros_globales"]["Row"];
export type ParametroGlobalInsert =
  Database["public"]["Tables"]["parametros_globales"]["Insert"];
export type ParametroGlobalUpdate =
  Database["public"]["Tables"]["parametros_globales"]["Update"];

/** Claves cuyos valores deben ser siempre numéricos (usados por el motor de precios). */
export const PARAMETROS_NUMERICOS = new Set([
  "margen_global_pct",
  "iva_pct",
]);

/** Valida que el valor sea numérico para claves conocidas del motor de precios. */
function validarValorNumerico(clave: string, valor: unknown): void {
  if (!PARAMETROS_NUMERICOS.has(clave)) return;

  if (typeof valor !== "number" || !Number.isFinite(valor)) {
    throw new Error(
      `El parámetro '${clave}' debe contener un valor numérico válido`,
    );
  }
}

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
  await requirePropietario();

  validarValorNumerico(parametro.clave, parametro.valor);

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
  await requirePropietario();

  if (cambios.valor !== undefined) {
    validarValorNumerico(clave, cambios.valor);
  }

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
  await requirePropietario();

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

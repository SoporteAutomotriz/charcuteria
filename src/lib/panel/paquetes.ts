import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Paquete =
  Database["public"]["Tables"]["paquetes"]["Row"];
export type PaqueteInsert =
  Database["public"]["Tables"]["paquetes"]["Insert"];
export type PaqueteUpdate =
  Database["public"]["Tables"]["paquetes"]["Update"];
export type PaqueteComponente =
  Database["public"]["Tables"]["paquete_componentes"]["Row"];
export type PaqueteComponenteInsert =
  Database["public"]["Tables"]["paquete_componentes"]["Insert"];

export async function listarPaquetes(): Promise<Paquete[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("paquetes")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    throw new Error(`Error al listar paquetes: ${error.message}`);
  }

  return data ?? [];
}

export async function obtenerPaquete(
  id: number,
): Promise<{ paquete: Paquete | null; componentes: PaqueteComponente[] }> {
  const supabase = await createClient();

  const { data: paquete, error: paqueteError } = await supabase
    .from("paquetes")
    .select("*")
    .eq("id", id)
    .single();

  if (paqueteError && paqueteError.code !== "PGRST116") {
    throw new Error(`Error al obtener paquete: ${paqueteError.message}`);
  }

  const { data: componentes, error: componentesError } = await supabase
    .from("paquete_componentes")
    .select("*")
    .eq("paquete_id", id)
    .order("id", { ascending: true });

  if (componentesError) {
    throw new Error(
      `Error al obtener componentes del paquete: ${componentesError.message}`,
    );
  }

  return {
    paquete: paquete ?? null,
    componentes: componentes ?? [],
  };
}

export async function crearPaquete(
  paquete: PaqueteInsert,
): Promise<Paquete> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("paquetes")
    .insert(paquete)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear paquete: ${error.message}`);
  }

  return data;
}

export async function actualizarPaquete(
  id: number,
  cambios: PaqueteUpdate,
): Promise<Paquete> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("paquetes")
    .update(cambios)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar paquete: ${error.message}`);
  }

  return data;
}

export async function eliminarPaquete(id: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("paquetes").delete().eq("id", id);

  if (error) {
    throw new Error(`Error al eliminar paquete: ${error.message}`);
  }
}

export async function crearComponente(
  componente: PaqueteComponenteInsert,
): Promise<PaqueteComponente> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("paquete_componentes")
    .insert(componente)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear componente: ${error.message}`);
  }

  return data;
}

export async function actualizarComponente(
  id: number,
  cambios: Partial<PaqueteComponente>,
): Promise<PaqueteComponente> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("paquete_componentes")
    .update(cambios)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar componente: ${error.message}`);
  }

  return data;
}

export async function eliminarComponente(id: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("paquete_componentes")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Error al eliminar componente: ${error.message}`);
  }
}

export async function listarCategorias(): Promise<
  Database["public"]["Tables"]["categorias"]["Row"][]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("orden_visualizacion", { ascending: true });

  if (error) {
    throw new Error(`Error al listar categorías: ${error.message}`);
  }

  return data ?? [];
}

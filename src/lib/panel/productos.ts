import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Producto = Database["public"]["Tables"]["productos"]["Row"];
export type ProductoInsert =
  Database["public"]["Tables"]["productos"]["Insert"];
export type ProductoUpdate =
  Database["public"]["Tables"]["productos"]["Update"];

export async function listarProductos(): Promise<Producto[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .select("*, categorias(nombre)")
    .order("orden_visualizacion", { ascending: true });

  if (error) {
    throw new Error(`Error al listar productos: ${error.message}`);
  }

  return data ?? [];
}

export async function obtenerProducto(id: number): Promise<Producto | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .select("*, categorias(nombre)")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // no rows
    throw new Error(`Error al obtener producto: ${error.message}`);
  }

  return data;
}

export async function crearProducto(
  producto: ProductoInsert,
): Promise<Producto> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .insert(producto)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear producto: ${error.message}`);
  }

  return data;
}

export async function actualizarProducto(
  id: number,
  cambios: ProductoUpdate,
): Promise<Producto> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .update(cambios)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar producto: ${error.message}`);
  }

  return data;
}

export async function desactivarProducto(id: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("productos")
    .update({ estado: "inactivo" })
    .eq("id", id);

  if (error) {
    throw new Error(`Error al desactivar producto: ${error.message}`);
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

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Categoria =
  Database["public"]["Tables"]["categorias"]["Row"];
export type CategoriaInsert =
  Database["public"]["Tables"]["categorias"]["Insert"];
export type CategoriaUpdate =
  Database["public"]["Tables"]["categorias"]["Update"];

/**
 * Lista las categorías de productos ordenadas por orden de visualización.
 */
export async function listarCategorias(): Promise<Categoria[]> {
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

/**
 * Crea una nueva categoría de producto.
 */
export async function crearCategoria(
  categoria: CategoriaInsert,
): Promise<Categoria> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias")
    .insert(categoria)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear categoría: ${error.message}`);
  }

  return data;
}

/**
 * Actualiza una categoría existente por su ID.
 */
export async function actualizarCategoria(
  id: number,
  cambios: CategoriaUpdate,
): Promise<Categoria> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias")
    .update(cambios)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar categoría: ${error.message}`);
  }

  return data;
}

/**
 * Elimina una categoría por su ID.
 * No impide la eliminación si hay productos asociados; el dueño debe
 * gestionar esa dependencia antes de borrar.
 */
export async function eliminarCategoria(id: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categorias")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Error al eliminar categoría: ${error.message}`);
  }
}

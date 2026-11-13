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

/**
 * Elimina físicamente un producto del catálogo.
 * Solo debe usarse cuando no hay cotizaciones ni dependencias asociadas.
 */
export async function eliminarProducto(id: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("productos")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Error al eliminar producto: ${error.message}`);
  }
}

/**
 * Upsert del costo de compra de un producto.
 * producto_id tiene restricción UNIQUE, por lo que actualiza si ya existe.
 */
export async function upsertProductoCosto(
  producto_id: number,
  costo_unitario_compra: number,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("producto_costos")
    .upsert(
      { producto_id, costo_unitario_compra },
      { onConflict: "producto_id" },
    );

  if (error) {
    throw new Error(`Error al guardar el costo del producto: ${error.message}`);
  }
}

/**
 * Upsert del margen propio y precio fijo manual de un producto.
 * producto_id tiene restricción UNIQUE, por lo que actualiza si ya existe.
 */
export async function upsertProductoMargen(
  producto_id: number,
  margen_propio_pct: number,
  precio_fijo_manual: number | null,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("producto_margenes")
    .upsert(
      { producto_id, margen_propio_pct, precio_fijo_manual },
      { onConflict: "producto_id" },
    );

  if (error) {
    throw new Error(
      `Error al guardar el margen del producto: ${error.message}`,
    );
  }
}

/**
 * Obtiene el costo de compra de un producto (solo propietario por RLS).
 */
export async function obtenerProductoCosto(
  producto_id: number,
): Promise<{ costo_unitario_compra: number } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("producto_costos")
    .select("costo_unitario_compra")
    .eq("producto_id", producto_id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Error al obtener el costo del producto: ${error.message}`);
  }

  return data;
}

/**
 * Obtiene el margen propio y precio fijo manual de un producto (solo propietario por RLS).
 */
export async function obtenerProductoMargen(
  producto_id: number,
): Promise<{
  margen_propio_pct: number;
  precio_fijo_manual: number | null;
} | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("producto_margenes")
    .select("margen_propio_pct, precio_fijo_manual")
    .eq("producto_id", producto_id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Error al obtener el margen del producto: ${error.message}`);
  }

  return data;
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

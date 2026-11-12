import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Endpoint público: lista productos activos (para el carrito del cliente).
 * Retorna solo datos públicos: id, nombre, categoría, estado.
 * Nunca expone costos ni márgenes.
 */
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("productos")
    .select("id, nombre, categoria_id, estado")
    .eq("estado", "activo")
    .order("nombre", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "No se pudieron cargar los productos" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    (data ?? []).map((p) => ({
      id: p.id,
      nombre: p.nombre,
      categoria: String(p.categoria_id ?? ""),
      activo: p.estado === "activo",
    })),
  );
}

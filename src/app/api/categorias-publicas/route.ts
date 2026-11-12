import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Endpoint público: lista categorías activas (para filtros del carrito).
 */
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categorias")
    .select("id, nombre")
    .eq("activo", true)
    .order("orden_visualizacion", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "No se pudieron cargar las categorías" },
      { status: 500 },
    );
  }

  return NextResponse.json(data ?? []);
}

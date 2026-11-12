import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Endpoint público: lista paquetes disponibles (para el paso de punto de partida).
 * Retorna solo datos públicos: id, nombre, personas recomendadas.
 */
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("paquetes")
    .select("id, nombre, personas_recomendadas")
    .order("nombre", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "No se pudieron cargar los paquetes" },
      { status: 500 },
    );
  }

  return NextResponse.json(data ?? []);
}

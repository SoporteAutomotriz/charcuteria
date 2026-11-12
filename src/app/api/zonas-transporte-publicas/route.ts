import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Endpoint público: lista zonas de transporte activas (para el paso de lugar).
 * Retorna nombre de zona/municipio y si es zona especial.
 * Nunca expone tarifas internas (esas son privadas y se usan en el servidor).
 */
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("zonas_transporte")
    .select("nombre, zona_especial")
    .eq("activo", true)
    .order("nombre", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "No se pudieron cargar las zonas de transporte" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    (data ?? []).map((z) => ({
      nombre: z.nombre,
      zonaTransporteId: null, // el ID no se expone públicamente; se resuelve por nombre en el servidor
      zonaEspecial: z.zona_especial,
    })),
  );
}

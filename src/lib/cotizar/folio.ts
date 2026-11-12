import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Genera un folio único con formato CS-YYYY-NNNN.
 *
 * Intenta hasta `maxIntento` veces generar un folio y verificar que no
 * exista ya en la tabla cotizaciones. Si agota los intentos, lanza error.
 *
 * Nunca confía solo en Date.now() porque dos solicitudes en el mismo
 * milisegundo podrían colisionar.
 */
export async function generarFolioUnico(
  supabase: SupabaseClient,
  maxIntento = 5,
): Promise<string> {
  const anio = new Date().getFullYear();

  for (let i = 0; i < maxIntento; i++) {
    // Pequeña pausa para reducir probabilidad de colisión en el mismo milisegundo
    await new Promise((resolve) => setTimeout(resolve, 1));

    const secuencia = Date.now()
      .toString()
      .slice(-4)
      .padStart(4, "0");
    const folio = `CS-${anio}-${secuencia}`;

    const { data: existente } = await supabase
      .from("cotizaciones")
      .select("id")
      .eq("folio", folio)
      .maybeSingle();

    if (!existente) {
      return folio;
    }
  }

  throw new Error("No se pudo generar un folio único tras varios intentos");
}

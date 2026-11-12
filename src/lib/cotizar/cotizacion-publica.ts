import { createClient } from "@/lib/supabase/server";

/**
 * Obtiene los datos públicos de una cotización por su token privado.
 * Se usa tanto en el servidor (page.tsx) como en el cliente si hace falta.
 */
export async function obtenerCotizacionPublica(token: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cotizaciones")
    .select(
      "folio, estado, datos_cliente, datos_evento, datos_productos, datos_paquetes, total_venta, token_expires_en, creado_en",
    )
    .eq("token", token)
    .single();

  if (error || !data) {
    return null;
  }

  const expiracion = new Date(data.token_expires_en);
  if (expiracion <= new Date()) {
    return null;
  }

  return data;
}

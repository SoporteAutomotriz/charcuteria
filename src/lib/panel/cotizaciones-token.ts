import { createClient } from "@/lib/supabase/server";

/** Genera un token criptográficamente seguro para enlaces de cotización. */
export function generarTokenCotizacion(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 32);
}

/** Calcula la fecha de expiración del token (7 días desde ahora). */
export function fechaExpiracionToken(dias = 7): string {
  const ahora = new Date();
  ahora.setDate(ahora.getDate() + dias);
  return ahora.toISOString();
}

/**
 * Valida que un token de cotización exista y no haya expirado.
 * Retorna SOLO datos públicos de la cotización (folio, estado, datos_cliente,
 * datos_evento, datos_productos, datos_paquetes, total_venta, token_expires_en).
 * Nunca expone costos ni márgenes internos (esos viven en cotizaciones_costos).
 */
export async function validarTokenCotizacion(token: string) {
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

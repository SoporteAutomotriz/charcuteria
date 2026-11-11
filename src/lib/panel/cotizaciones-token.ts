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
 * Retorna la cotización si es válida, o null si no existe o expiró.
 */
export async function validarTokenCotizacion(token: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cotizaciones")
    .select("*, cotizaciones_costos(total_costo, datos_costo, creado_en)")
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

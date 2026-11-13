/**
 * Construye la URL pública de un objeto en el bucket 'productos' de Supabase Storage.
 * Esta función no es una Server Action: puede usarse desde componentes cliente.
 */
export function urlPublicaFotoProducto(ruta: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL");
  }
  return `${supabaseUrl}/storage/v1/object/public/productos/${ruta}`;
}

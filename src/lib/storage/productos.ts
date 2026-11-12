import { createClient } from "@/lib/supabase/server";
import { requirePanelAccess } from "@/lib/auth/server";

/**
 * Límite de tamaño: 5 MB en bytes
 */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * Tipos MIME permitidos
 */
export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/**
 * Valida un archivo de imagen antes de subirlo.
 * Lanza error si el archivo no cumple con los requisitos.
 */
export function validarImagen(
  file: File,
): { ok: true } | { ok: false; error: string } {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return {
      ok: false,
      error: "Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG y WebP.",
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    const maxMb = MAX_IMAGE_SIZE / (1024 * 1024);
    return {
      ok: false,
      error: `La imagen es demasiado pesada (${(file.size / (1024 * 1024)).toFixed(1)} MB). Máximo ${maxMb} MB.`,
    };
  }

  return { ok: true };
}

/**
 * Genera un nombre de archivo único usando UUID para evitar colisiones.
 * Se usa cuando aún no se conoce el ID del producto/paquete (creación).
 */
function nombreTemporal(ext: string): string {
  return `${crypto.randomUUID()}.${ext}`;
}

/**
 * Genera el nombre definitivo del archivo usando el ID del producto/paquete.
 */
function nombreDefinitivo(tipo: "producto" | "paquete", id: number, ext: string): string {
  return `${tipo}-${id}.${ext}`;
}

/**
 * Obtiene la extensión de un archivo (sin el punto).
 */
function extensionDe(file: File): string {
  return file.name.split(".").pop() ?? "";
}

/**
 * Sube una imagen al bucket público de Storage.
 *
 * - Si se proporciona `idDefinitivo`, el archivo se guarda directamente con el
 *   nombre definitivo (producto-{id}.{ext} o paquete-{id}.{ext}).
 * - Si no se proporciona, se sube con un nombre temporal basado en UUID y se
 *   retorna ese nombre para que el llamador lo renombre después de conocer el ID.
 *
 * Retorna la ruta del objeto en el bucket.
 */
export async function subirFotoProducto(
  file: File,
  opts: {
    tipo: "producto" | "paquete";
    idDefinitivo?: number;
  },
): Promise<{ ruta: string; nombreArchivo: string }> {
  await requirePanelAccess();

  const validacion = validarImagen(file);
  if (!validacion.ok) {
    throw new Error(validacion.error);
  }

  const supabase = await createClient();
  const ext = extensionDe(file);
  const nombreArchivo = opts.idDefinitivo
    ? nombreDefinitivo(opts.tipo, opts.idDefinitivo, ext)
    : nombreTemporal(ext);
  const ruta = `${nombreArchivo}`;

  const { error } = await supabase.storage
    .from("productos")
    .upload(ruta, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    throw new Error(`Error al subir la foto: ${error.message}`);
  }

  return { ruta, nombreArchivo };
}

/**
 * Renombra un objeto en Storage (se usa tras crear un producto/paquete para
 * pasar del nombre temporal al nombre definitivo con el ID conocido).
 */
export async function renombrarFotoProducto(
  rutaAnterior: string,
  opts: {
    tipo: "producto" | "paquete";
    id: number;
  },
): Promise<string> {
  await requirePanelAccess();

  const supabase = await createClient();
  const ext = rutaAnterior.split(".").pop() ?? "";
  const nombreDef = nombreDefinitivo(opts.tipo, opts.id, ext);
  const rutaNueva = `${nombreDef}`;

  const { error } = await supabase.storage
    .from("productos")
    .move(rutaAnterior, rutaNueva);

  if (error) {
    throw new Error(`Error al renombrar la foto: ${error.message}`);
  }

  return rutaNueva;
}

/**
 * Elimina una foto del bucket.
 */
export async function eliminarFotoProducto(ruta: string): Promise<void> {
  await requirePanelAccess();

  const supabase = await createClient();

  const { error } = await supabase.storage.from("productos").remove([ruta]);

  if (error) {
    throw new Error(`Error al eliminar la foto: ${error.message}`);
  }
}

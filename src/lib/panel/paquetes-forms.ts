import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePanelAccess } from "@/lib/auth/server";
import {
  subirFotoProducto,
  renombrarFotoProducto,
  eliminarFotoProducto,
} from "@/lib/storage/productos";
import { urlPublicaFotoProducto } from "@/lib/storage/url";
import {
  crearPaquete,
  actualizarPaquete,
  eliminarPaquete,
  type Paquete,
  type PaqueteInsert,
} from "@/lib/panel/paquetes";

/**
 * Form handler para crear un paquete.
 * Si se incluye un archivo en `foto`, se sube a Storage con nombre temporal,
 * se crea el paquete, y luego se renombra el archivo con el ID definitivo.
 */
export async function crearPaqueteForm(formData: FormData) {
  'use server';
  await requirePanelAccess();

  const archivoRaw = formData.get("foto");
  // Solo procesar la foto si es un File real, con nombre y con contenido.
  // Un input de archivo sin selección puede enviar un File vacío que
  // subirFotoProducto rechazaría como tipo no permitido.
  const archivo =
    archivoRaw instanceof File && archivoRaw.name && archivoRaw.size > 0
      ? (archivoRaw as File)
      : null;
  let fotoUrl: string | null = null;
  let nombreArchivoTemporal: string | null = null;

  if (archivo) {
    const { ruta, nombreArchivo } = await subirFotoProducto(archivo, {
      tipo: "paquete",
    });
    nombreArchivoTemporal = nombreArchivo;
    fotoUrl = urlPublicaFotoProducto(ruta);
  }

  const paquete: PaqueteInsert = {
    nombre: formData.get("nombre") as string,
    descripcion: (formData.get("descripcion") as string) || null,
    foto_url: fotoUrl,
    personas_recomendadas:
      Number(formData.get("personas_recomendadas")) || 1,
  };

  const paqueteCreado = await crearPaquete(paquete);

  // Renombrar el archivo con el ID definitivo y actualizar la URL
  if (nombreArchivoTemporal && paqueteCreado.id) {
    const rutaNueva = await renombrarFotoProducto(nombreArchivoTemporal, {
      tipo: "paquete",
      id: paqueteCreado.id,
    });
    const fotoUrlDefinitiva = urlPublicaFotoProducto(rutaNueva);
    await actualizarPaquete(paqueteCreado.id, { foto_url: fotoUrlDefinitiva });
  }

  redirect("/panel/paquetes");
}

/**
 * Form handler para editar un paquete.
 * Permite reemplazar la foto o eliminarla.
 */
export async function editarPaqueteForm(formData: FormData) {
  'use server';
  await requirePanelAccess();

  const id = Number(formData.get("id"));
  const archivo = formData.get("foto") as File | null;
  const eliminarFotoRaw = formData.get("eliminar_foto") === "on";

  // Obtener el paquete actual para saber si hay foto previa
  const supabase = await createClient();
  const { data: paqueteActual } = await supabase
    .from("paquetes")
    .select("foto_url")
    .eq("id", id)
    .single();

  let fotoUrl: string | null = null;
  let rutaAnterior: string | null = null;

  if (paqueteActual?.foto_url) {
    fotoUrl = paqueteActual.foto_url;
    // Extraer la ruta del objeto desde la URL pública
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const base = `${supabaseUrl}/storage/v1/object/public/productos/`;
      if (paqueteActual.foto_url.startsWith(base)) {
        rutaAnterior = paqueteActual.foto_url.slice(base.length);
      }
    }
  }

  if (eliminarFotoRaw) {
    // Eliminar la foto de Storage y poner foto_url en null
    if (rutaAnterior) {
      await eliminarFotoProducto(rutaAnterior);
    }
    fotoUrl = null;
  } else if (archivo) {
    // Subir la nueva foto sobrescribiendo la anterior (misma ruta con el ID)
    const rutaDefinitiva = `paquete-${id}.${archivo.name.split(".").pop() ?? ""}`;
    await subirFotoProducto(archivo, {
      tipo: "paquete",
      idDefinitivo: id,
    });
    fotoUrl = urlPublicaFotoProducto(rutaDefinitiva);
  }

  const cambios: Partial<Paquete> = {
    nombre: formData.get("nombre") as string,
    descripcion: (formData.get("descripcion") as string) || null,
    foto_url: fotoUrl,
    personas_recomendadas:
      Number(formData.get("personas_recomendadas")) || 1,
  };

  await actualizarPaquete(id, cambios);
  redirect("/panel/paquetes");
}

/**
 * Form handler para eliminar un paquete.
 */
export async function eliminarPaqueteForm(formData: FormData) {
  'use server';
  await requirePanelAccess();
  const id = Number(formData.get("id"));
  await eliminarPaquete(id);
  redirect("/panel/paquetes");
}

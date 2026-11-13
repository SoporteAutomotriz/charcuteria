"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getPanelSession,
  requirePanelAccess,
} from "@/lib/auth/server";
import {
  subirFotoProducto,
  renombrarFotoProducto,
  eliminarFotoProducto,
} from "@/lib/storage/productos";
import { urlPublicaFotoProducto } from "@/lib/storage/url";
import {
  crearProducto,
  actualizarProducto,
  desactivarProducto,
  listarCategorias,
  upsertProductoCosto,
  upsertProductoMargen,
  type Producto,
  type ProductoInsert,
} from "@/lib/panel/productos";

/**
 * Lista los productos con su categoría para la vista de administración.
 */
export async function listarProductosConCategorias(): Promise<
  Array<Producto & { categorias?: { nombre: string | null } | null }>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .select("*, categorias(nombre)")
    .order("orden_visualizacion", { ascending: true });

  if (error) {
    throw new Error(`Error al listar productos: ${error.message}`);
  }

  return (data ?? []) as Array<
    Producto & { categorias?: { nombre: string | null } | null }
  >;
}

/**
 * Lista las categorías para el desplegable del formulario.
 */
export async function listarCategoriasParaForm(): Promise<
  Array<{ id: number; nombre: string }>
> {
  const categorias = await listarCategorias();
  return categorias.map((c) => ({ id: c.id, nombre: c.nombre }));
}

/**
 * Form handler para crear un producto.
 * Si se incluye un archivo en `foto`, se sube a Storage con nombre temporal,
 * se crea el producto, y luego se renombra el archivo con el ID definitivo.
 *
 * Los campos privados (costo, margen, precio fijo) solo se escriben cuando
 * el usuario es propietario. Un administrador crea el producto sin tocarlos.
 */
export async function crearProductoForm(formData: FormData) {
  'use server';
  await requirePanelAccess();
  const session = await getPanelSession();
  const esPropietario = session?.rol === "propietario";

  try {
    const archivo = formData.get("foto") as File | null;
    let fotoUrl: string | null = null;
    let nombreArchivoTemporal: string | null = null;

    if (archivo) {
      const { ruta, nombreArchivo } = await subirFotoProducto(archivo, {
        tipo: "producto",
      });
      nombreArchivoTemporal = nombreArchivo;
      fotoUrl = urlPublicaFotoProducto(ruta);
    }

    const alergenosRaw = (formData.get("alergenos") as string) || "";
    const alergenos = alergenosRaw
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    const producto: ProductoInsert = {
      nombre: formData.get("nombre") as string,
      categoria_id:
        formData.get("categoria_id") === ""
          ? null
          : Number(formData.get("categoria_id")),
      descripcion: (formData.get("descripcion") as string) || null,
      foto_url: fotoUrl,
      orden_visualizacion: Number(formData.get("orden_visualizacion")) || 0,
      unidad_compra: (formData.get("unidad_compra") as string) || "kg",
      unidad_venta: (formData.get("unidad_venta") as string) || "pieza",
      factor_conversion: Number(formData.get("factor_conversion")) || 1,
      merma_pct: Number(formData.get("merma_pct")) || 0,
      porcion_referencia_persona:
        formData.get("porcion_referencia_persona") === ""
          ? null
          : Number(formData.get("porcion_referencia_persona")),
      alergenos: alergenos.length > 0 ? alergenos : null,
      etiquetas: null,
      estado: (() => {
        const estadoStr = formData.get("estado") as string;
        return ["activo", "agotado_temporal", "inactivo"].includes(estadoStr)
          ? (estadoStr as Producto["estado"])
          : "activo";
      })(),
    };

    const productoCreado = await crearProducto(producto);

    // Campos privados: solo el propietario escribe en tablas privadas.
    // Un administrador nunca toca producto_costos ni producto_margenes.
    if (esPropietario && productoCreado.id) {
      const costoRaw = (formData.get("costo_unitario_compra") as string) || "";
      const costo = costoRaw === "" ? null : Number(costoRaw);
      if (costo !== null) {
        await upsertProductoCosto(productoCreado.id, costo);
      }

      const margenRaw = (formData.get("margen_propio_pct") as string) || "";
      const margen = margenRaw === "" ? null : Number(margenRaw);
      const precioFijoRaw = (formData.get("precio_fijo_manual") as string) || "";
      const precioFijo = precioFijoRaw === "" ? null : Number(precioFijoRaw);
      if (margen !== null || precioFijo !== null) {
        await upsertProductoMargen(
          productoCreado.id,
          margen ?? 0,
          precioFijo,
        );
      }
    }

    // Renombrar el archivo con el ID definitivo y actualizar la URL
    if (nombreArchivoTemporal && productoCreado.id) {
      const rutaNueva = await renombrarFotoProducto(nombreArchivoTemporal, {
        tipo: "producto",
        id: productoCreado.id,
      });
      const fotoUrlDefinitiva = urlPublicaFotoProducto(rutaNueva);
      await actualizarProducto(productoCreado.id, { foto_url: fotoUrlDefinitiva });
    }
  } catch (error) {
    const mensaje =
      error instanceof Error ? error.message : String(error);
    throw new Error(`Error al crear el producto: ${mensaje}`);
  }

  redirect("/panel/productos");
}

/**
 * Form handler para editar un producto.
 * Permite reemplazar la foto o eliminarla.
 *
 * Los campos privados (costo, margen, precio fijo) solo se escriben cuando
 * el usuario es propietario. Un administrador edita el producto sin tocarlos.
 */
export async function editarProductoForm(formData: FormData) {
  'use server';
  await requirePanelAccess();
  const session = await getPanelSession();
  const esPropietario = session?.rol === "propietario";

  try {
    const id = Number(formData.get("id"));
    const archivoRaw = formData.get("foto");
    // Solo procesar la foto si es un File real, con nombre y con contenido.
    // Un input de archivo sin selección puede enviar un File vacío que
    // subirFotoProducto rechazaría como tipo no permitido.
    const archivo =
      archivoRaw instanceof File && archivoRaw.name && archivoRaw.size > 0
        ? (archivoRaw as File)
        : null;
    const eliminarFotoRaw = formData.get("eliminar_foto") === "on";

    // Obtener el producto actual para saber si hay foto previa
    const supabase = await createClient();
    const { data: productoActual } = await supabase
      .from("productos")
      .select("foto_url")
      .eq("id", id)
      .single();

    let fotoUrl: string | null = null;
    let rutaAnterior: string | null = null;

    if (productoActual?.foto_url) {
      fotoUrl = productoActual.foto_url;
      // Extraer la ruta del objeto desde la URL pública
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        const base = `${supabaseUrl}/storage/v1/object/public/productos/`;
        if (productoActual.foto_url.startsWith(base)) {
          rutaAnterior = productoActual.foto_url.slice(base.length);
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
      const ext = archivo.name.split(".").pop() ?? "";
      const rutaDefinitiva = `producto-${id}.${ext}`;
      await subirFotoProducto(archivo, { tipo: "producto", idDefinitivo: id });
      fotoUrl = urlPublicaFotoProducto(rutaDefinitiva);
    }

    const alergenosRaw = (formData.get("alergenos") as string) || "";
    const alergenos = alergenosRaw
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    const cambios: Partial<Producto> = {
      nombre: formData.get("nombre") as string,
      categoria_id:
        formData.get("categoria_id") === ""
          ? null
          : Number(formData.get("categoria_id")),
      descripcion: (formData.get("descripcion") as string) || null,
      foto_url: fotoUrl,
      orden_visualizacion: Number(formData.get("orden_visualizacion")) || 0,
      unidad_compra: (formData.get("unidad_compra") as string) || "kg",
      unidad_venta: (formData.get("unidad_venta") as string) || "pieza",
      factor_conversion: Number(formData.get("factor_conversion")) || 1,
      merma_pct: Number(formData.get("merma_pct")) || 0,
      porcion_referencia_persona:
        formData.get("porcion_referencia_persona") === ""
          ? null
          : Number(formData.get("porcion_referencia_persona")),
      alergenos: alergenos.length > 0 ? alergenos : null,
      etiquetas: null,
      estado: (() => {
        const estadoStr = formData.get("estado") as string;
        return ["activo", "agotado_temporal", "inactivo"].includes(estadoStr)
          ? (estadoStr as Producto["estado"])
          : "activo";
      })(),
    };

    await actualizarProducto(id, cambios);

    // Campos privados: solo el propietario escribe en tablas privadas.
    // Un administrador nunca toca producto_costos ni producto_margenes.
    if (esPropietario) {
      const costoRaw = (formData.get("costo_unitario_compra") as string) || "";
      const costo = costoRaw === "" ? null : Number(costoRaw);
      if (costo !== null) {
        await upsertProductoCosto(id, costo);
      }

      const margenRaw = (formData.get("margen_propio_pct") as string) || "";
      const margen = margenRaw === "" ? null : Number(margenRaw);
      const precioFijoRaw = (formData.get("precio_fijo_manual") as string) || "";
      const precioFijo = precioFijoRaw === "" ? null : Number(precioFijoRaw);
      if (margen !== null || precioFijo !== null) {
        await upsertProductoMargen(id, margen ?? 0, precioFijo);
      }
    }
  } catch (error) {
    const mensaje =
      error instanceof Error ? error.message : String(error);
    throw new Error(`Error al editar el producto: ${mensaje}`);
  }

  redirect("/panel/productos");
}

/**
 * Form handler para desactivar un producto.
 */
export async function desactivarProductoForm(formData: FormData) {
  'use server';
  await requirePanelAccess();
  const id = Number(formData.get("id"));
  try {
    await desactivarProducto(id);
  } catch (error) {
    const mensaje =
      error instanceof Error ? error.message : String(error);
    throw new Error(`Error al desactivar el producto: ${mensaje}`);
  }

  redirect("/panel/productos");
}

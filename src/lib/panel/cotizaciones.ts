"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cotizar } from "@/lib/precios/motor";
import { requirePanelAccess } from "@/lib/auth/server";
import { generarTokenCotizacion, fechaExpiracionToken } from "@/lib/panel/cotizaciones-token";
import { generarFolioUnico } from "@/lib/cotizar/folio";
import type { Database } from "@/types/database";

export type CotizacionInsert = Database["public"]["Tables"]["cotizaciones"]["Insert"];
export type CotizacionCostoInsert =
  Database["public"]["Tables"]["cotizaciones_costos"]["Insert"];

interface ProductoConCosto {
  id: number;
  nombre: string;
  categoria_id: number | null;
  merma_pct: number;
  factor_conversion: number;
  costo_unitario_compra: number;
  margen_propio_pct?: number;
  precio_fijo_manual?: number | null;
}

/**
 * Crea una cotización recalculando total_venta en el servidor usando el motor
 * de precios con costos y márgenes de tablas privadas (solo propietario).
 * Nunca confía en totales enviados desde el navegador.
 */
export async function crearCotizacion(formData: FormData) {
  await requirePanelAccess();

  const clienteNombre = formData.get("cliente_nombre") as string;
  const clienteTelefono = formData.get("cliente_telefono") as string;
  const clienteCorreo = formData.get("cliente_correo") as string;

  const zonaIdRaw = formData.get("zona_transporte_id");
  const zonaId = zonaIdRaw ? Number(zonaIdRaw) : null;

  const montajeHorasRaw = formData.get("montaje_horas");
  const montajeHoras = montajeHorasRaw ? Number(montajeHorasRaw) : 0;

  const personalHorasRaw = formData.get("personal_horas");
  const personalHoras = personalHorasRaw ? Number(personalHorasRaw) : 0;
  const personalInvitadosRaw = formData.get("personal_invitados");
  const personalInvitados = personalInvitadosRaw
    ? Number(personalInvitadosRaw)
    : 0;

  const supabase = await createClient();

  // 1. Leer parámetros globales (margen_global_pct, iva_pct) — servidor
  const { data: parametros, error: parametrosError } = await supabase
    .from("parametros_globales")
    .select("clave, valor")
    .in("clave", ["margen_global_pct", "iva_pct"]);

  if (parametrosError) {
    throw new Error(`Error al leer parámetros globales: ${parametrosError.message}`);
  }

  const margenGlobalPct =
    Number(parametros?.find((p) => p.clave === "margen_global_pct")?.valor ?? 0);
  const ivaPct =
    Number(parametros?.find((p) => p.clave === "iva_pct")?.valor ?? 0);

  // 2. Leer productos seleccionados con sus costos y márgenes (tablas privadas, solo propietario)
  const productosIdsRaw = formData.getAll("producto_id[]");
  const productosIds = productosIdsRaw.map((id) => Number(id));
  const cantidadesServidasRaw = formData.getAll("cantidad_servida[]");
  const cantidadesServidas = cantidadesServidasRaw.map((c) => Number(c));

  if (productosIds.length === 0) {
    throw new Error("La cotización debe tener al menos un producto");
  }

  const productosConCosto: ProductoConCosto[] = [];

  for (const productoId of productosIds) {
    const { data: costo, error: costoError } = await supabase
      .from("producto_costos")
      .select("costo_unitario_compra")
      .eq("producto_id", productoId)
      .single();

    if (costoError || !costo) {
      throw new Error(`No hay costo privado para el producto ${productoId}`);
    }

    const { data: margen, error: margenError } = await supabase
      .from("producto_margenes")
      .select("margen_propio_pct, precio_fijo_manual")
      .eq("producto_id", productoId)
      .single();

    if (margenError && margenError.code !== "PGRST116") {
      throw new Error(`Error al leer margen del producto ${productoId}`);
    }

    const { data: producto, error: productoError } = await supabase
      .from("productos")
      .select("nombre, categoria_id, merma_pct, factor_conversion")
      .eq("id", productoId)
      .single();

    if (productoError || !producto) {
      throw new Error(`Producto ${productoId} no encontrado`);
    }

    productosConCosto.push({
      id: productoId,
      nombre: producto.nombre,
      categoria_id: producto.categoria_id,
      merma_pct: producto.merma_pct ?? 0,
      factor_conversion: producto.factor_conversion ?? 1,
      costo_unitario_compra: costo.costo_unitario_compra,
      ...(margen?.margen_propio_pct !== undefined
        ? { margen_propio_pct: margen.margen_propio_pct }
        : {}),
      ...(margen?.precio_fijo_manual !== undefined
        ? { precio_fijo_manual: margen.precio_fijo_manual }
        : {}),
    });
  }

  // 3. Construir entrada del motor de precios (servidor)
  const items: { productoId: string; cantidadServida: string; categoriaId: string }[] = [];
  const costosPrivados: Record<
    string,
    {
      costoUnitarioCompra: string;
      merma: string;
      factorConversion: string;
      margenPropioPct?: string;
      precioFijoManual?: string;
    }
  > = {};
  const categorias: Record<string, { margenPct: string }> = {};

  for (let i = 0; i < productosConCosto.length; i++) {
    const p = productosConCosto[i];
    const cantidadServida = cantidadesServidas[i] ?? 0;

    items.push({
      productoId: String(p.id),
      cantidadServida: String(cantidadServida),
      categoriaId: String(p.categoria_id ?? 0),
    });

    costosPrivados[String(p.id)] = {
      costoUnitarioCompra: String(p.costo_unitario_compra),
      merma: String(p.merma_pct),
      factorConversion: String(p.factor_conversion),
      ...(p.margen_propio_pct !== undefined
        ? { margenPropioPct: String(p.margen_propio_pct) }
        : {}),
      ...(p.precio_fijo_manual !== undefined
        ? { precioFijoManual: String(p.precio_fijo_manual) }
        : {}),
    };

    if (p.categoria_id) {
      categorias[String(p.categoria_id)] = {
        margenPct: String(margenGlobalPct),
      };
    }
  }

  const entrada: Parameters<typeof cotizar>[0] = {
    items,
    costosPrivados,
    categorias,
    margenGlobalPct: String(margenGlobalPct),
    ivaPct: String(ivaPct),
  };

  // 4. Zona de transporte (opcional)
  if (zonaId) {
    const { data: zona } = await supabase
      .from("zonas_transporte")
      .select("*")
      .eq("id", zonaId)
      .single();

    if (zona) {
      entrada.transporte = {
        id: String(zona.id),
        municipios: zona.municipios,
        tarifaFija: String(zona.tarifa_fija),
        cargoDistancia: String(zona.cargo_distancia),
        cargoHorario: String(zona.cargo_horario),
        cargoAccesoDificil: String(zona.cargo_acceso_dificil),
        esZonaEspecial: zona.zona_especial,
      };
    }
  }

  // 5. Montaje (opcional)
  if (montajeHoras > 0) {
    const { data: tarifaMontaje } = await supabase
      .from("tarifas_montaje")
      .select("*")
      .eq("activo", true)
      .order("id", { ascending: true })
      .limit(1)
      .single();

    if (tarifaMontaje) {
      entrada.montaje = {
        tarifaPorHora: String(tarifaMontaje.tarifa_hora),
        horasMinimas: String(tarifaMontaje.horas_minimas),
        horas: String(montajeHoras),
      };
    }
  }

  // 6. Personal (opcional)
  if (personalHoras > 0) {
    const { data: tarifaMontaje } = await supabase
      .from("tarifas_montaje")
      .select("*")
      .eq("activo", true)
      .order("id", { ascending: true })
      .limit(1)
      .single();

    if (tarifaMontaje) {
      entrada.personal = {
        tarifaPorHora: String(tarifaMontaje.tarifa_hora),
        horasMinimas: String(tarifaMontaje.horas_minimas),
        horas: String(personalHoras),
        invitados: String(personalInvitados),
        invitadosPorPersona: String(tarifaMontaje.regla_personal_por_invitados),
      };
    }
  }

  // 7. Calcular en servidor con motor de precios (decimal exacto)
  const salida = cotizar(entrada);

  // 8. Insertar cotización con total_venta recalcado (nunca del navegador)
  const token = generarTokenCotizacion();
  const token_expires_en = fechaExpiracionToken();

  const cotizacion: CotizacionInsert = {
    folio: await generarFolioUnico(supabase),
    estado: "borrador",
    datos_cliente: {
      nombre: clienteNombre || null,
      telefono: clienteTelefono || null,
      correo: clienteCorreo || null,
    },
    datos_evento: {},
    datos_productos: {},
    datos_paquetes: {},
    total_venta: salida.totalConIva,
    token,
    token_expires_en,
    creado_en: new Date().toISOString(),
    actualizado_en: new Date().toISOString(),
  };

  const { data: cotizacionData, error: cotizacionError } = await supabase
    .from("cotizaciones")
    .insert(cotizacion)
    .select()
    .single();

  if (cotizacionError) {
    throw new Error(`Error al crear cotización: ${cotizacionError.message}`);
  }

  // 9. Guardar desglose de costos en tabla privada (solo propietario)
  const costoCotizacion: CotizacionCostoInsert = {
    cotizacion_id: cotizacionData.id,
    total_costo: salida.subtotalCosto,
    datos_costo: {
      lineas: JSON.parse(JSON.stringify(salida.lineas)),
      subtotalCosto: salida.subtotalCosto,
      costoTransporte: salida.costoTransporte,
      costoMontaje: salida.costoMontaje,
      costoPersonal: salida.costoPersonal,
      subtotalVentaIngredientes: salida.subtotalVentaIngredientes,
      subtotalServicios: salida.subtotalServicios,
      subtotalVenta: salida.subtotalVenta,
      ivaTotal: salida.ivaTotal,
    },
    creado_en: new Date().toISOString(),
  };

  const { error: costoError } = await supabase
    .from("cotizaciones_costos")
    .insert(costoCotizacion);

  if (costoError) {
    throw new Error(`Error al guardar costos de cotización: ${costoError.message}`);
  }

  redirect(`/panel/cotizaciones/${cotizacionData.id}`);
}

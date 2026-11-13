"use server";

/**
 * Server Action: enviarSolicitud (Fase 5, paso 8).
 *
 * Recibe los datos del borrador del cliente, recalcula TODO en el servidor
 * con el motor de precios determinista usando costos y márgenes de tablas
 * privadas (nunca confía en totales enviados desde el navegador), inserta la
 * cotización con estado "recibida", genera un token privado con expiración y
 * guarda el desglose de costos en la tabla privada cotizaciones_costos.
 *
 * Usa una clave de idempotencia generada en el servidor para evitar duplicados
 * por recarga o doble clic.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cotizar } from "@/lib/precios/motor";
import { generarTokenCotizacion, fechaExpiracionToken } from "@/lib/panel/cotizaciones-token";
import { generarFolioUnico } from "@/lib/cotizar/folio";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export type CotizacionInsert = Database["public"]["Tables"]["cotizaciones"]["Insert"];
export type CotizacionCostoInsert =
  Database["public"]["Tables"]["cotizaciones_costos"]["Insert"];

/**
 * Server Action: generarIdempotencyCookie (Fase 5, paso 8).
 *
 * Establece la cookie httpOnly con la clave de idempotencia que el servidor
 * ya generó y pasó al cliente. El cliente la envía en el formulario y el
 * servidor valida que coincida con la cookie antes de aceptar.
 */
export async function generarIdempotencyCookie(idempotencyKey: string) {
  const cookieStore = await cookies();

  cookieStore.set("idempotency_key", idempotencyKey, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 minutos
  });
}

interface ProductoConCosto {
  id: number;
  nombre: string;
  categoria_id: number | null;
  merma_pct: number;
  factor_conversion: number;
  costo_unitario_compra: string;
  margen_propio_pct?: string;
  precio_fijo_manual?: string | null;
}

type EntradaMotor = Parameters<typeof cotizar>[0] & {
  transporte?: {
    id: string;
    municipios: string[];
    tarifaFija: string;
    cargoDistancia?: string;
    cargoHorario?: string;
    cargoAccesoDificil?: string;
    esZonaEspecial: boolean;
  };
  montaje?: {
    tarifaPorHora: string;
    horasMinimas: string;
    horas: string;
  };
  personal?: {
    tarifaPorHora: string;
    horasMinimas: string;
    horas: string;
    invitados: string;
    invitadosPorPersona: string;
  };
};

export async function enviarSolicitud(formData: FormData) {
  const idempotencyKey = formData.get("idempotency_key") as string;

  // 0. Validar clave de idempotencia contra la cookie del servidor.
  // El cliente no puede falsificarla: es httpOnly y solo el servidor la genera.
  const cookieStore = await cookies();
  const cookieKey = cookieStore.get("idempotency_key")?.value;
  if (!idempotencyKey || typeof idempotencyKey !== "string") {
    throw new Error("Falta la clave de idempotencia de la solicitud");
  }
  if (!cookieKey || idempotencyKey !== cookieKey) {
    throw new Error("Clave de idempotencia inválida");
  }

  // Leer datos del formulario (envío del paso 8)
  const clienteNombre = formData.get("cliente_nombre") as string;
  const clienteTelefono = formData.get("cliente_telefono") as string;
  const clienteCorreo = formData.get("cliente_correo") as string;
  const canalPreferido = formData.get("canal_preferido") as string;
  const aceptaPrivacidad = formData.get("acepta_privacidad") === "on";

  const modalidad = formData.get("modalidad") as string;
  const tipoEvento = formData.get("tipo_evento") as string;
  const fechaEvento = formData.get("fecha_evento") as string;
  const horarioEvento = formData.get("horario_evento") as string;
  const invitados = Number(formData.get("invitados")) || 0;
  const duracion = formData.get("duracion")
    ? Number(formData.get("duracion"))
    : null;
  const direccion = formData.get("direccion") as string;
  const municipio = formData.get("municipio") as string;
  const zonaTransporteIdRaw = formData.get("zona_transporte_id");
  const zonaTransporteId = zonaTransporteIdRaw
    ? Number(zonaTransporteIdRaw)
    : null;

  const montajeHorasRaw = formData.get("montaje_horas");
  const montajeHoras = montajeHorasRaw ? Number(montajeHorasRaw) : 0;

  const personalHorasRaw = formData.get("personal_horas");
  const personalHoras = personalHorasRaw ? Number(personalHorasRaw) : 0;
  const personalInvitadosRaw = formData.get("personal_invitados");
  const personalInvitados = personalInvitadosRaw
    ? Number(personalInvitadosRaw)
    : 0;

  const productosIdsRaw = formData.getAll("producto_id[]");
  const productosIds = productosIdsRaw.map((id) => Number(id));
  const cantidadesServidasRaw = formData.getAll("cantidad_servida[]");
  const cantidadesServidas = cantidadesServidasRaw.map((c) => Number(c));

  const supabase = await createClient();

  // 1. Verificar idempotencia: si ya existe una cotización recibida con esta clave, no duplicar
  const { data: existente } = await supabase
    .from("cotizaciones")
    .select("id, folio, token")
    .eq("datos_cliente->>idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existente) {
    redirect(`/cotizaciones/${existente.token}`);
  }

  // 2. Leer parámetros globales (margen_global_pct, iva_pct) — servidor
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

  // 3. Leer productos seleccionados con sus costos y márgenes (tablas privadas)
  if (productosIds.length === 0) {
    throw new Error("La solicitud debe tener al menos un producto");
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
        ? { margen_propio_pct: String(margen.margen_propio_pct) }
        : {}),
      ...(margen?.precio_fijo_manual !== undefined
        ? { precio_fijo_manual: String(margen.precio_fijo_manual) }
        : {}),
    });
  }

  // 4. Construir entrada del motor de precios (servidor)
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
      costoUnitarioCompra: p.costo_unitario_compra,
      merma: String(p.merma_pct),
      factorConversion: String(p.factor_conversion),
      ...(p.margen_propio_pct !== undefined
        ? { margenPropioPct: p.margen_propio_pct }
        : {}),
      ...(p.precio_fijo_manual !== undefined && p.precio_fijo_manual !== null
        ? { precioFijoManual: String(p.precio_fijo_manual) }
        : {}),
    };

    if (p.categoria_id) {
      categorias[String(p.categoria_id)] = {
        margenPct: String(margenGlobalPct),
      };
    }
  }

  const entrada: EntradaMotor = {
    items,
    costosPrivados,
    categorias,
    margenGlobalPct: String(margenGlobalPct),
    ivaPct: String(ivaPct),
  };

  // 5. Zona de transporte (opcional)
  if (zonaTransporteId) {
    const { data: zona } = await supabase
      .from("zonas_transporte")
      .select("*")
      .eq("id", zonaTransporteId)
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

  // 6. Montaje (opcional)
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

  // 7. Personal (opcional)
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

  // 8. Calcular en servidor con motor de precios (decimal exacto)
  const salida = cotizar(entrada);

  // 9. Insertar cotización con total_venta recalcado (nunca del navegador)
  const token = generarTokenCotizacion();
  const token_expires_en = fechaExpiracionToken();

  // Folio único con formato válido para el CHECK constraint: CS-YYYY-NNNN
  const folio = await generarFolioUnico(supabase);

  const datosCliente = {
    nombre: clienteNombre || null,
    telefono: clienteTelefono || null,
    correo: clienteCorreo || null,
    canal_preferido: canalPreferido || null,
    acepta_privacidad: aceptaPrivacidad,
  };

  const datosEvento = {
    modalidad,
    tipo: tipoEvento || null,
    fecha: fechaEvento || null,
    horario: horarioEvento || null,
    invitados,
    duracion,
  };

  const datosProductos = {
    items,
    productos: productosConCosto.map((p) => ({
      id: p.id,
      nombre: p.nombre,
    })),
  };

  const datosPaquetes = {
    servicios: {
      montaje: montajeHoras > 0 ? { horas: montajeHoras } : null,
      personal: personalHoras > 0 ? { horas: personalHoras, invitados: personalInvitados } : null,
      transporte: zonaTransporteId ? { zona_id: zonaTransporteId } : null,
    },
    lugar: {
      direccion: direccion || null,
      municipio: municipio || null,
      zona_transporte_id: zonaTransporteId || null,
    },
  };

  const cotizacion: CotizacionInsert = {
    folio,
    estado: "recibida",
    datos_cliente: datosCliente,
    datos_evento: datosEvento,
    datos_productos: datosProductos,
    datos_paquetes: datosPaquetes,
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

  // 10. Guardar desglose de costos y todos los datos del cliente en tabla privada (solo propietario)
  const costoCotizacion: CotizacionCostoInsert = {
    cotizacion_id: cotizacionData.id,
    total_costo: salida.subtotalCosto,
    datos_costo: {
      datos_cliente: datosCliente,
      datos_evento: datosEvento,
      datos_lugar: {
        direccion: direccion || null,
        municipio: municipio || null,
        zona_transporte_id: zonaTransporteId || null,
      },
      datos_servicios: {
        montaje: montajeHoras > 0 ? { horas: montajeHoras } : null,
        personal: personalHoras > 0 ? { horas: personalHoras, invitados: personalInvitados } : null,
        transporte: zonaTransporteId ? { zona_id: zonaTransporteId } : null,
      },
      datos_productos: {
        items,
        productos: productosConCosto.map((p) => ({
          id: p.id,
          nombre: p.nombre,
        })),
      },
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

  redirect(`/cotizaciones/${token}`);
}

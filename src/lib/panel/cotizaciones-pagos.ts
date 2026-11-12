"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePanelAccess } from "@/lib/auth/server";

/**
 * Registra un pago (anticipo o saldo) para una cotización.
 * Solo el propietario puede verificar pagos; el administrador puede registrar
 * pero no verificar.
 *
 * Guarda en bitacora_auditoria el registro del pago.
 */
export async function registrarPago(formData: FormData) {
  const session = await requirePanelAccess();

  const cotizacionId = Number(formData.get("cotizacion_id"));
  const monto = Number(formData.get("monto"));
  const metodo = (formData.get("metodo") as string) || "transferencia";
  const referencia = (formData.get("referencia") as string) || null;
  const comprobante = (formData.get("comprobante") as string) || null;
  const esAnticipo = formData.get("es_anticipo") === "on";
  const verificar = formData.get("verificar") === "on" && session.rol === "propietario";

  if (!cotizacionId || !monto || monto <= 0) {
    throw new Error("Monto de pago inválido");
  }

  const supabase = await createClient();

  // 1. Obtener la cotización
  const { data: cotizacion, error: cotError } = await supabase
    .from("cotizaciones")
    .select("id, folio, estado, datos_evento, total_venta")
    .eq("id", cotizacionId)
    .single();

  if (cotError || !cotizacion) {
    throw new Error("Cotización no encontrada");
  }

  // 2. Insertar registro de pago en bitácora
  const { error: logError } = await supabase
    .from("bitacora_auditoria")
    .insert({
      tabla_afectada: "cotizaciones",
      registro_id: cotizacionId,
      accion: "update",
      valores_nuevos: {
        tipo: esAnticipo ? "anticipo" : "saldo",
        monto,
        metodo,
        referencia,
        comprobante,
        verificado: verificar,
        fecha: new Date().toISOString(),
      },
      usuario_id: session.user.id,
      fecha: new Date().toISOString(),
    });

  if (logError) {
    throw new Error(`Error al registrar pago en bitácora: ${logError.message}`);
  }

  // 3. Si es anticipo y se verifica, cambiar estado a confirmada (reserva la fecha)
  // La confirmación es atómica: verifica choque de fecha y actualiza el estado
  // en una sola transacción de base de datos, evitando race conditions.
  if (esAnticipo && verificar) {
    const { error: rpcError } = await supabase.rpc(
      "confirmar_cotizacion_atomica",
      { cotizacion_id: cotizacionId },
    );

    if (rpcError) {
      throw new Error(`Error al confirmar cotización: ${rpcError.message}`);
    }
  }

  redirect(`/panel/cotizaciones/${cotizacionId}`);
}

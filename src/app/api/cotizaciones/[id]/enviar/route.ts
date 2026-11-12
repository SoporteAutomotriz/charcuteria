"use server";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enviarCorreoCotizacion } from "@/lib/email/resend";
import { generarEnlaceWhatsApp } from "@/lib/whatsapp/link";

/**
 * Endpoint para enviar una cotización por correo y generar enlace de WhatsApp.
 *
 * Solo accesible desde el panel del propietario. Obtiene los datos públicos
 * de la cotización (folio, token, enlace) y los envía al destinatario indicado.
 *
 * El correo del destinatario se pasa en el body del request (lo ingresa el
 * propietario manualmente por ahora, hasta que se integren los datos del
 * cliente del configurador).
 */

interface EnviarCotizacionBody {
  destinatario: string;
  nombreCliente?: string | null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cotizacionId = Number(id);

  const supabase = await createClient();

  // Obtener datos públicos de la cotización
  const { data: cotizacion, error: cotError } = await supabase
    .from("cotizaciones")
    .select("folio, token, token_expires_en, datos_cliente")
    .eq("id", cotizacionId)
    .single();

  if (cotError || !cotizacion) {
    return NextResponse.json(
      { error: "Cotización no encontrada" },
      { status: 404 },
    );
  }

  const enlaceCotizacion = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/cotizaciones/${cotizacion.token}`;

  // Leer body del request
  let body: EnviarCotizacionBody;
  try {
    body = (await request.json()) as EnviarCotizacionBody;
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de la solicitud inválido" },
      { status: 400 },
    );
  }

  if (!body.destinatario) {
    return NextResponse.json(
      { error: "Falta el correo del destinatario" },
      { status: 400 },
    );
  }

  // Extraer nombre del cliente si está en datos_cliente
  const datosCliente =
    cotizacion.datos_cliente &&
    typeof cotizacion.datos_cliente === "object" &&
    !Array.isArray(cotizacion.datos_cliente)
      ? (cotizacion.datos_cliente as Record<string, unknown>)
      : {};

  const nombreCliente =
    body.nombreCliente ?? (datosCliente.nombre as string | undefined ?? null);

  // Enviar correo
  const resultadoCorreo = await enviarCorreoCotizacion({
    destinatario: body.destinatario,
    folio: cotizacion.folio ?? "—",
    enlaceCotizacion,
    nombreCliente,
  });

  if ("error" in resultadoCorreo) {
    return NextResponse.json(
      { error: resultadoCorreo.error },
      { status: 500 },
    );
  }

  // Generar enlace de WhatsApp (puede no estar disponible si falta WHATSAPP_NUMBER)
  const whatsapp = generarEnlaceWhatsApp({
    folio: cotizacion.folio ?? "—",
    enlaceCotizacion,
    nombreCliente,
  });

  return NextResponse.json({
    ok: true,
    correoId: resultadoCorreo.id,
    whatsapp,
  });
}

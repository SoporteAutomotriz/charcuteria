import { NextResponse } from "next/server";
import { validarTokenCotizacion } from "@/lib/panel/cotizaciones-token";

/**
 * Endpoint público para servir una cotización por su token privado.
 * Valida existencia y expiración del token. Nunca expone costos ni márgenes
 * internos (esos viven en cotizaciones_costos, tabla privada).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const cotizacion = await validarTokenCotizacion(token);

  if (!cotizacion) {
    return NextResponse.json(
      { error: "Cotización no encontrada o enlace expirado" },
      { status: 404 },
    );
  }

  const {
    folio,
    estado,
    datos_cliente,
    datos_evento,
    datos_productos,
    datos_paquetes,
    total_venta,
    token_expires_en,
  } = cotizacion;

  return NextResponse.json({
    folio,
    estado,
    datos_cliente,
    datos_evento,
    datos_productos,
    datos_paquetes,
    total_venta,
    token_expires_en,
  });
}

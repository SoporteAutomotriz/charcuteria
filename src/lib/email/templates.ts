/**
 * Plantillas de correo para el envío de cotizaciones.
 *
 * Todas las plantillas usan placeholders que se reemplazan en tiempo de
 * ejecución con los datos reales de la cotización.
 */

export function plantillaCorreoCotizacion({
  folio,
  nombreCliente,
  enlaceCotizacion,
}: {
  folio: string;
  nombreCliente?: string | null;
  enlaceCotizacion: string;
}): string {
  return `
<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #111827; font-size: 24px; margin-bottom: 16px;">
      Tu cotización ${folio} está lista
    </h1>
    <p>${
      nombreCliente ? `Hola ${nombreCliente},` : "Hola,"
    }</p>
    <p>
      Tu cotización de tablas de charcutería y quesos para eventos está lista para revisión.
    </p>
    <p>
      <a href="${enlaceCotizacion}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
        Ver cotización privada
      </a>
    </p>
    <p style="font-size: 14px; color: #6b7280;">
      El enlace expira en 7 días. Si tienes preguntas, contáctanos por WhatsApp.
    </p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 14px; color: #6b7280;">
      Esta es una cotización preliminar. El precio final lo confirma el propietario.
    </p>
  </body>
</html>
  `.trim();
}

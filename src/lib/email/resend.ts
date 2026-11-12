/**
 * Cliente de Resend para envío de correos de cotización.
 *
 * Solo para usar en el servidor. La API key se lee de la variable de
 * entorno RESEND_API_KEY. Nunca se expone al navegador.
 */

import { Resend } from "resend";

let resend: Resend | null = null;

export function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Falta variable de entorno RESEND_API_KEY para enviar correos",
      );
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

export interface EnvioCorreoCotizacion {
  destinatario: string;
  folio: string;
  enlaceCotizacion: string;
  nombreCliente?: string | null;
}

export async function enviarCorreoCotizacion(
  datos: EnvioCorreoCotizacion,
): Promise<{ id: string } | { error: string }> {
  const resend = getResend();

  const fromEmail = process.env.FROM_EMAIL;
  if (!fromEmail) {
    return {
      error:
        "Falta variable de entorno FROM_EMAIL. Configúrala en Vercel antes de enviar correos.",
    };
  }

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [datos.destinatario],
    subject: `Tu cotización ${datos.folio} está lista`,
    html: `
      <h2>Tu cotización ${datos.folio} está lista</h2>
      <p>${datos.nombreCliente ? `Hola ${datos.nombreCliente},` : "Hola,"}</p>
      <p>Tu cotización de tablas de charcutería y quesos para eventos está lista para revisión.</p>
      <p>
        <a href="${datos.enlaceCotizacion}" style="background:#2563eb;color:#ffffff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600;">
          Ver cotización privada
        </a>
      </p>
      <p>El enlace expira en 7 días. Si tienes preguntas, contáctanos por WhatsApp.</p>
      <hr />
      <p style="color:#6b7280;font-size:14px;">
        Esta es una cotización preliminar. El precio final lo confirma el propietario.
      </p>
    `,
  });

  if (error) {
    return { error: error.message };
  }

  return { id: data?.id ?? "" };
}

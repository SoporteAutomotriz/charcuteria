/**
 * Generador de enlaces de WhatsApp para cotizaciones.
 *
 * El número de teléfono se lee de la variable de entorno WHATSAPP_NUMBER.
 * Si no está definida, el enlace no se genera y se debe mostrar un aviso.
 */

export interface WhatsAppLink {
  url: string;
  texto: string;
  disponible: boolean;
  motivoNoDisponible?: string;
}

export function generarEnlaceWhatsApp({
  folio,
  enlaceCotizacion,
  nombreCliente,
}: {
  folio: string;
  enlaceCotizacion: string;
  nombreCliente?: string | null;
}): WhatsAppLink {
  const numero = process.env.WHATSAPP_NUMBER;

  if (!numero) {
    return {
      url: "",
      texto: "",
      disponible: false,
      motivoNoDisponible:
        "Falta variable de entorno WHATSAPP_NUMBER. Configúrala en Vercel para habilitar WhatsApp.",
    };
  }

  const texto = encodeURIComponent(
    `Hola, me interesa mi cotización ${folio}. Aquí está el enlace: ${enlaceCotizacion}${
      nombreCliente ? `\nCliente: ${nombreCliente}` : ""
    }`,
  );

  return {
    url: `https://wa.me/${numero}?text=${texto}`,
    texto,
    disponible: true,
  };
}

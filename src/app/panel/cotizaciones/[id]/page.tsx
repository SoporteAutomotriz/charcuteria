import Link from "next/link";
import { obtenerCotizacionPanel } from "@/lib/panel/cotizaciones-panel";
import CotizacionDetalle from "./detalle";

/**
 * Página de detalle de cotización en el panel (wrapper servidor).
 * Obtiene la cotización del servidor y la pasa al componente cliente.
 */
export default async function CotizacionPanelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cotizacionId = Number(id);

  const cotizacion = await obtenerCotizacionPanel(cotizacionId);

  if (!cotizacion) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans py-8 px-4 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg border border-zinc-200 shadow-sm text-center">
          <h1 className="text-xl font-bold text-zinc-900 mb-2">
            Cotización no encontrada
          </h1>
          <Link
            href="/panel/cotizaciones"
            className="text-sm text-blue-600 hover:underline"
          >
            Volver a cotizaciones
          </Link>
        </div>
      </div>
    );
  }

  return <CotizacionDetalle cotizacion={cotizacion} />;
}

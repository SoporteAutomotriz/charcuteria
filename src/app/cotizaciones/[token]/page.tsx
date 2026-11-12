/**
 * Página pública de cotización por token privado (Fase 5).
 *
 * El cliente accede mediante el enlace privado (token largo, aleatorio y con
 * expiración). Muestra solo datos aptos para el cliente: folio, estado, datos
 * del cliente, datos del evento, productos, servicios, lugar y total de venta.
 * Nunca expone costos ni márgenes internos (esos viven en cotizaciones_costos,
 * tabla privada).
 */

import { obtenerCotizacionPublica } from "@/lib/cotizar/cotizacion-publica";

export const dynamic = "force-dynamic";

interface DatosProductoItem {
  productoId: string | number;
  cantidadServida: number;
}

export default async function CotizacionPublicaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const cotizacion = await obtenerCotizacionPublica(token);

  if (!cotizacion) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg border border-zinc-200 shadow-sm text-center">
          <h1 className="text-xl font-bold text-zinc-900 mb-2">
            Cotización no encontrada o expirada
          </h1>
          <p className="text-sm text-zinc-600 mb-6">
            El enlace es inválido o ha pasado su vigencia (5 días). Solicita una
            nueva cotización.
          </p>
          <a
            href="/cotizar"
            className="text-sm text-blue-600 hover:underline"
          >
            Pedir una cotización nueva
          </a>
        </div>
      </div>
    );
  }

  const expiracion = new Date(cotizacion.token_expires_en);
  const vigente = expiracion > new Date();

  const datosEvento = cotizacion.datos_evento;
  const datosProductos = cotizacion.datos_productos;
  const datosPaquetes = cotizacion.datos_paquetes;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">
                Cotización {cotizacion.folio}
              </h1>
              <p className="text-sm text-zinc-600">
                Cotización de tablas de charcutería y quesos para eventos
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                vigente
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {vigente ? "Vigente" : "Expirada"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-zinc-50 p-3 rounded">
              <p className="text-xs font-semibold text-zinc-500 uppercase">
                Estado
              </p>
              <p className="text-sm text-zinc-900 font-medium">
                {cotizacion.estado}
              </p>
            </div>
            <div className="bg-zinc-50 p-3 rounded">
              <p className="text-xs font-semibold text-zinc-500 uppercase">
                Total de venta
              </p>
              <p className="text-sm text-zinc-900 font-medium">
                ${Number(cotizacion.total_venta ?? 0).toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {datosEvento && (
            <div className="bg-zinc-50 p-4 rounded-lg mb-6">
              <h2 className="text-sm font-semibold text-zinc-700 mb-3">
                Datos del evento
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <dt className="text-zinc-500">Tipo</dt>
                <dd className="text-zinc-900">{datosEvento.tipo ?? "—"}</dd>
                <dt className="text-zinc-500">Fecha</dt>
                <dd className="text-zinc-900">{datosEvento.fecha ?? "—"}</dd>
                <dt className="text-zinc-500">Horario</dt>
                <dd className="text-zinc-900">{datosEvento.horario ?? "—"}</dd>
                <dt className="text-zinc-500">Invitados</dt>
                <dd className="text-zinc-900">
                  {datosEvento.invitados ?? "—"}
                </dd>
              </dl>
            </div>
          )}

          {datosProductos && datosProductos.items && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-zinc-700 mb-3">
                Productos ({datosProductos.items.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="px-3 py-2 text-zinc-500 font-semibold">
                        Producto
                      </th>
                      <th className="px-3 py-2 text-zinc-500 font-semibold text-right">
                        Cantidad
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {datosProductos.items.map(
                      (item: DatosProductoItem, i: number) => (
                        <tr key={i}>
                          <td className="px-3 py-2 text-zinc-900">
                            Producto {item.productoId}
                          </td>
                          <td className="px-3 py-2 text-zinc-900 text-right">
                            {item.cantidadServida}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {datosPaquetes && (
            <div className="bg-zinc-50 p-4 rounded-lg mb-6">
              <h2 className="text-sm font-semibold text-zinc-700 mb-3">
                Servicios y lugar
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {datosPaquetes.servicios?.montaje && (
                  <>
                    <dt className="text-zinc-500">Montaje</dt>
                    <dd className="text-zinc-900">
                      {datosPaquetes.servicios.montaje.horas} hora(s)
                    </dd>
                  </>
                )}
                {datosPaquetes.servicios?.personal && (
                  <>
                    <dt className="text-zinc-500">Personal</dt>
                    <dd className="text-zinc-900">
                      {datosPaquetes.servicios.personal.horas} hora(s) ·
                      {datosPaquetes.servicios.personal.invitados} invitado(s)
                    </dd>
                  </>
                )}
                {datosPaquetes.lugar && (
                  <>
                    <dt className="text-zinc-500">Lugar</dt>
                    <dd className="text-zinc-900">
                      {datosPaquetes.lugar.direccion ?? "—"} ·
                      {datosPaquetes.lugar.municipio ?? "—"}
                    </dd>
                  </>
                )}
              </dl>
            </div>
          )}

          {!vigente && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-sm text-red-700">
              Este enlace ha expirado. La cotización ya no está vigente.
              Solicita una nueva cotización si aún te interesa el servicio.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

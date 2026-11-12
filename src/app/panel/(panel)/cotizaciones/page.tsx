import { listarCotizaciones } from "@/lib/panel/cotizaciones-panel";

/**
 * Bandeja de cotizaciones del panel del propietario.
 * Lista todas las cotizaciones con su estado para revisión y aprobación.
 */
export default async function CotizacionesPage() {
  const cotizaciones = await listarCotizaciones();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Cotizaciones</h1>
        <p className="text-zinc-600">
          Revisa y gestiona las solicitudes de cotización de los clientes.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-zinc-600 border-b border-zinc-200">
                Folio
              </th>
              <th className="px-4 py-3 font-semibold text-zinc-600 border-b border-zinc-200">
                Cliente
              </th>
              <th className="px-4 py-3 font-semibold text-zinc-600 border-b border-zinc-200">
                Evento
              </th>
              <th className="px-4 py-3 font-semibold text-zinc-600 border-b border-zinc-200">
                Fecha
              </th>
              <th className="px-4 py-3 font-semibold text-zinc-600 border-b border-zinc-200 text-right">
                Total de venta
              </th>
              <th className="px-4 py-3 font-semibold text-zinc-600 border-b border-zinc-200">
                Estado
              </th>
              <th className="px-4 py-3 font-semibold text-zinc-600 border-b border-zinc-200 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {cotizaciones.map((c) => {
              const datosCliente = c.datos_cliente as
                | { nombre?: string | null; telefono?: string | null }
                | null;
              const datosEvento = c.datos_evento as
                | { tipo?: string | null; fecha?: string | null }
                | null;
              const total = Number(c.total_venta ?? 0);

              return (
                <tr key={c.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900">{c.folio}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-zinc-900">
                      {datosCliente?.nombre ?? "—"}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {datosCliente?.telefono ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-zinc-900">
                      {datosEvento?.tipo ?? "—"}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {datosEvento?.fecha ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-900">
                    {new Date(c.creado_en).toLocaleDateString("es-MX")}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-zinc-900">
                    ${total.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        c.estado === "recibida"
                          ? "bg-amber-100 text-amber-700"
                          : c.estado === "en_revision"
                          ? "bg-blue-100 text-blue-700"
                          : c.estado === "enviada"
                          ? "bg-green-100 text-green-700"
                          : c.estado === "aceptada"
                          ? "bg-purple-100 text-purple-700"
                          : c.estado === "confirmada"
                          ? "bg-indigo-100 text-indigo-700"
                          : c.estado === "realizada"
                          ? "bg-teal-100 text-teal-700"
                          : c.estado === "cancelada"
                          ? "bg-red-100 text-red-700"
                          : "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {c.estado.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/panel/cotizaciones/${c.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Ver
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {cotizaciones.length === 0 && (
        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm text-center">
          <p className="text-zinc-500">No hay cotizaciones registradas.</p>
        </div>
      )}
    </div>
  );
}

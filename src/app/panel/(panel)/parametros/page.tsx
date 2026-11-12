"use server";

import { redirect } from "next/navigation";
import { getPanelSession, requirePanelAccess } from "@/lib/auth/server";
import {
  listarParametrosGlobales,
  crearParametroGlobal,
  actualizarParametroGlobal,
  eliminarParametroGlobal,
} from "@/lib/panel/parametros";
import type {
  ParametroGlobalInsert,
  ParametroGlobalUpdate,
} from "@/lib/panel/parametros";

export default async function ParametrosPage() {
  const session = await getPanelSession();
  const rol = session?.rol;
  const parametros = await listarParametrosGlobales();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Parámetros globales</h1>
        <p className="text-zinc-600">
          Configura los parámetros que usa el motor de precios: margen global
          y tasa de IVA. Estos valores son de uso interno y nunca se muestran
          al cliente.
        </p>
      </div>

      {rol === "propietario" && (
        <form
          action={crearParametroForm}
          className="space-y-4 bg-white p-6 rounded-lg border border-zinc-200 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            Nuevo parámetro
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Clave
              </label>
              <input
                name="clave"
                required
                placeholder="Ej: iva_pct"
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Valor (numérico)
              </label>
              <input
                name="valor"
                required
                type="number"
                step="0.01"
                defaultValue="0"
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="col-span-full sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                rows={2}
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
              >
                Crear parámetro
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200">
                Clave
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200 text-right">
                Valor
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200">
                Descripción
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200 text-center">
                Creado en
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {parametros.map((p) => (
              <tr key={p.clave} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {p.clave}
                </td>
                <td className="px-4 py-3 text-right text-zinc-700">
                  {typeof p.valor === "number" ? p.valor.toFixed(2) : String(p.valor)}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600">
                  {p.descripcion ?? "—"}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-500 text-center">
                  {new Date(p.creado_en).toLocaleDateString("es-MX")}
                </td>
                <td className="px-4 py-3 text-right">
                  {rol === "propietario" && (
                    <>
                      <button
                        formAction={editarParametroForm}
                        form={`parametro-${p.clave}`}
                        className="text-sm text-blue-600 hover:underline mr-2"
                      >
                        Editar
                      </button>
                      <button
                        formAction={eliminarParametroForm}
                        form={`eliminar-parametro-${p.clave}`}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {parametros.map((p) => (
        <form
          key={`editar-parametro-${p.clave}`}
          action={editarParametroForm}
          className="hidden"
          id={`parametro-${p.clave}`}
        >
          <input name="clave" defaultValue={p.clave} />
          <input name="valor" defaultValue={typeof p.valor === "number" ? String(p.valor) : String(p.valor)} />
          <input name="descripcion" defaultValue={p.descripcion ?? ""} />
        </form>
      ))}

      {parametros.map((p) => (
        <form
          key={`eliminar-parametro-${p.clave}`}
          action={eliminarParametroForm}
          className="hidden"
          id={`eliminar-parametro-${p.clave}`}
        >
          <input name="clave" defaultValue={p.clave} />
        </form>
      ))}
    </div>
  );
}

async function crearParametroForm(formData: FormData) {
  await requirePanelAccess();
  const valorRaw = formData.get("valor") as string;
  let valor: number | boolean | string = Number(valorRaw);
  if (Number.isNaN(valor)) {
    valor = valorRaw;
  }

  const parametro: ParametroGlobalInsert = {
    clave: formData.get("clave") as string,
    valor,
    descripcion: (formData.get("descripcion") as string) || null,
  };

  await crearParametroGlobal(parametro);
  redirect("/panel/parametros");
}

async function editarParametroForm(formData: FormData) {
  await requirePanelAccess();
  const clave = formData.get("clave") as string;
  const valorRaw = formData.get("valor") as string;
  let valor: number | boolean | string = Number(valorRaw);
  if (Number.isNaN(valor)) {
    valor = valorRaw;
  }

  const cambios: ParametroGlobalUpdate = {
    valor,
    descripcion: (formData.get("descripcion") as string) || null,
  };

  await actualizarParametroGlobal(clave, cambios);
  redirect("/panel/parametros");
}

async function eliminarParametroForm(formData: FormData) {
  await requirePanelAccess();
  const clave = formData.get("clave") as string;
  await eliminarParametroGlobal(clave);
  redirect("/panel/parametros");
}

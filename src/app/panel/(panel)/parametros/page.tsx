"use server";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getPanelSession, requirePanelAccess } from "@/lib/auth/server";
import {
  listarParametrosGlobales,
  obtenerParametroGlobal,
  crearParametroGlobal,
  actualizarParametroGlobal,
  eliminarParametroGlobal,
  IVA_MODO_OPCIONES,
} from "@/lib/panel/parametros";
import type {
  ParametroGlobalInsert,
  ParametroGlobalUpdate,
} from "@/lib/panel/parametros";

export default async function ParametrosPage() {
  const session = await getPanelSession();

  // Bloqueo explícito: solo el propietario puede acceder a esta sección.
  // Un Administrador que llegue directamente por URL ve un mensaje claro,
  // no una página vacía ni datos internos que no debería ver.
  if (!session || session.rol !== "propietario") {
    return (
      <div className="space-y-6 p-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-zinc-900">Sin acceso a esta sección</h1>
        <p className="text-zinc-600 mb-6">
          La edición de parámetros globales (margen global e IVA) es exclusiva
          del propietario del negocio.
        </p>
        <Link
          href="/panel"
          className="text-sm text-blue-600 hover:underline"
        >
          Volver al inicio del panel
        </Link>
      </div>
    );
  }

  const rol = session.rol;
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

      {/* Parámetros predefinidos de la sección 2 */}
      <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Parámetros predefinidos
        </h2>
        <p className="text-zinc-600 text-sm mb-4">
          Valores que usa el motor de precios y la presentación de cotizaciones.
        </p>
        <form
          action={crearParametroForm}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Margen global (%)
              </label>
              <input
                name="margen_global_pct"
                type="number"
                step="0.01"
                min="0"
                max="100"
                defaultValue="30"
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Tasa de IVA (%)
              </label>
              <input
                name="iva_pct"
                type="number"
                step="0.01"
                min="0"
                max="100"
                defaultValue="16"
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Anticipo (%)
              </label>
              <input
                name="anticipo_pct"
                type="number"
                step="0.01"
                min="0"
                max="100"
                defaultValue="50"
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Vigencia de cotización (días)
              </label>
              <input
                name="vigencia_cotizacion_dias"
                type="number"
                min="0"
                defaultValue="5"
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Holgura del estimado (%)
              </label>
              <input
                name="holgura_estimado_pct"
                type="number"
                step="0.01"
                min="0"
                max="100"
                defaultValue="10"
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Modo de IVA
              </label>
              <select
                name="iva_modo"
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {IVA_MODO_OPCIONES.map((o) => (
                  <option key={o} value={o}>
                    {o === "incluido" ? "Incluido en el precio" : "Desglosado"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
              >
                Guardar predefinidos
              </button>
            </div>
          </div>
        </form>
      </div>

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
  'use server';
  await requirePanelAccess();

  // Detecta si viene del formulario genérico (clave/valor/descripcion)
  // o del formulario de parámetros predefinidos (campos sueltos por clave).
  const claveGenerica = (formData.get("clave") as string) || "";
  const valorGenericoRaw = formData.get("valor") as string;

  if (claveGenerica) {
    let valor: number | boolean | string = Number(valorGenericoRaw);
    if (Number.isNaN(valor)) {
      valor = valorGenericoRaw;
    }

    const parametro: ParametroGlobalInsert = {
      clave: claveGenerica,
      valor,
      descripcion: (formData.get("descripcion") as string) || null,
    };

    await crearParametroGlobal(parametro);
    redirect("/panel/parametros");
    return;
  }

  // Formulario de parámetros predefinidos: guarda cada clave por separado.
  const predefinidos: Array<{ clave: string; valor: string }> = [
    { clave: "margen_global_pct", valor: formData.get("margen_global_pct") as string },
    { clave: "iva_pct", valor: formData.get("iva_pct") as string },
    { clave: "anticipo_pct", valor: formData.get("anticipo_pct") as string },
    {
      clave: "vigencia_cotizacion_dias",
      valor: formData.get("vigencia_cotizacion_dias") as string,
    },
    {
      clave: "holgura_estimado_pct",
      valor: formData.get("holgura_estimado_pct") as string,
    },
    { clave: "iva_modo", valor: formData.get("iva_modo") as string },
  ];

  for (const p of predefinidos) {
    let valor: number | boolean | string = Number(p.valor);
    if (Number.isNaN(valor)) {
      valor = p.valor;
    }

    // Upsert: si ya existe, actualiza; si no, crea.
    const existente = await obtenerParametroGlobal(p.clave);
    if (existente) {
      await actualizarParametroGlobal(p.clave, { valor });
    } else {
      await crearParametroGlobal({
        clave: p.clave,
        valor,
        descripcion: null,
      });
    }
  }

  redirect("/panel/parametros");
}

async function editarParametroForm(formData: FormData) {
  'use server';
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
  'use server';
  await requirePanelAccess();
  const clave = formData.get("clave") as string;
  await eliminarParametroGlobal(clave);
  redirect("/panel/parametros");
}

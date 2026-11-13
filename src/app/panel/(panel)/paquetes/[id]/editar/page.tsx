"use server";

import { redirect } from "next/navigation";
import { obtenerPaquete } from "@/lib/panel/paquetes";
import {
  editarPaqueteForm,
  eliminarComponenteForm,
  eliminarPaqueteForm,
} from "@/lib/panel/paquetes-forms";
import { FotoInput } from "@/components/foto-input";

export default async function PaqueteEditarPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);

  const { paquete, componentes } = await obtenerPaquete(id);

  if (!paquete) {
    redirect("/panel/paquetes");
  }

  return (
    <div className="space-y-6">
      <nav className="mb-4">
        <a
          href="/panel/paquetes"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          ← Volver a paquetes
        </a>
      </nav>

      <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
        <h1 className="text-xl font-bold text-zinc-900 mb-4">
          Editar paquete: {paquete.nombre}
        </h1>

        <form action={editarPaqueteForm} className="space-y-4">
          <input type="hidden" name="id" defaultValue={String(paquete.id)} />
          <input
            type="hidden"
            name="personas_recomendadas"
            defaultValue={String(paquete.personas_recomendadas)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="col-span-full sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Nombre del paquete
              </label>
              <input
                name="nombre"
                defaultValue={paquete.nombre}
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Personas recomendadas
              </label>
              <input
                name="personas_recomendadas"
                type="number"
                min="1"
                defaultValue={String(paquete.personas_recomendadas)}
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
                defaultValue={paquete.descripcion ?? ""}
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Fotografía
              </label>
              <FotoInput name="foto" currentUrl={paquete.foto_url} />
              {paquete.foto_url && (
                <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-600 mt-1">
                  <input
                    type="checkbox"
                    name="eliminar_foto"
                    defaultChecked={false}
                    value="on"
                  />
                  Eliminar foto existente
                </label>
              )}
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </form>

        {/* Componentes del paquete */}
        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            Componentes ({componentes.length})
          </h2>
          {componentes.length === 0 ? (
            <p className="text-zinc-500 text-sm">
              Este paquete no tiene componentes todavía.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-200">
              {componentes.map((c) => (
                <li key={c.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-zinc-900">{c.nombre}</div>
                    <div className="text-xs text-zinc-500">
                      {c.cantidad_referencia} · {c.tipo}
                    </div>
                  </div>
                  <form
                    action={eliminarComponenteForm}
                    className="hidden"
                    id={`eliminar-componente-${c.id}`}
                  >
                    <input name="id" defaultValue={String(c.id)} />
                    <input name="paquete_id" defaultValue={String(paquete.id)} />
                  </form>
                  <button
                    formAction={eliminarComponenteForm}
                    form={`eliminar-componente-${c.id}`}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form action={eliminarPaqueteForm} className="mt-6">
          <input type="hidden" name="id" defaultValue={String(paquete.id)} />
          <button
            type="submit"
            className="text-sm text-red-600 hover:underline"
          >
            Eliminar paquete
          </button>
        </form>
      </div>
    </div>
  );
}

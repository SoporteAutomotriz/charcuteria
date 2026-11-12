"use server";

import { redirect } from "next/navigation";
import {
  listarPaquetes,
  crearPaquete,
  actualizarPaquete,
  obtenerPaquete,
  eliminarPaquete,
  crearComponente,
  type Paquete,
  type PaqueteInsert,
} from "@/lib/panel/paquetes";
import { requirePanelAccess } from "@/lib/auth/server";

export default async function PaquetesPage() {
  const paquetes = await listarPaquetes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Paquetes</h1>
        <p className="text-zinc-600">
          Configura los paquetes iniciales (entre 3 y 6) con sus reglas de
          personalización. El cliente puede cambiar, agregar o quitar
          componentes en el configurador.
        </p>
      </div>

      <form action={crearPaqueteForm} className="space-y-4 bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Nuevo paquete</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="col-span-full sm:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Nombre del paquete
            </label>
            <input
              name="nombre"
              required
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
              defaultValue="4"
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
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
            >
              Crear paquete
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {paquetes.map((p) => (
          <PaqueteCard key={p.id} paquete={p} />
        ))}
      </div>
    </div>
  );
}

async function PaqueteCard({
  paquete,
}: {
  paquete: Paquete;
}) {
  const { paquete: paqueteData, componentes } = await obtenerPaquete(
    paquete.id,
  );

  return (
    <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900">
            {paqueteData?.nombre ?? paquete.nombre}
          </h3>
          <p className="text-sm text-zinc-500">
            {paqueteData?.personas_recomendadas ?? paquete.personas_recomendadas} personas recomendadas
          </p>
        </div>
        <div className="flex gap-2">
          <button
            formAction={editarPaqueteForm}
            form={`paquete-${paquete.id}`}
            className="text-sm text-blue-600 hover:underline mr-2"
          >
            Editar
          </button>
          <button
            formAction={eliminarPaqueteForm}
            form={`paquete-${paquete.id}`}
            className="text-sm text-red-600 hover:underline"
          >
            Eliminar
          </button>
        </div>
      </div>

      {paqueteData?.descripcion && (
        <p className="text-sm text-zinc-600 mb-4">
          {paqueteData.descripcion}
        </p>
      )}

      <h4 className="text-sm font-medium text-zinc-700 mb-2">
        Componentes ({componentes.length})
      </h4>
      <ul className="space-y-2 mb-6">
        {componentes.map((c) => (
          <li key={c.id} className="flex items-center justify-between text-sm text-zinc-700">
            <span>{c.nombre}</span>
            <span className="text-zinc-500">{c.cantidad_referencia}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                c.tipo === "fijo"
                  ? "bg-zinc-100 text-zinc-700"
                  : c.tipo === "sustituible"
                  ? "bg-blue-100 text-blue-700"
                  : c.tipo === "opcional"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {c.tipo}
            </span>
          </li>
        ))}
      </ul>

      <form action={agregarComponenteForm} className="space-y-4">
        <input name="paquete_id" value={String(paquete.id)} />
        <h5 className="text-sm font-medium text-zinc-700">Agregar componente</h5>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Nombre
            </label>
            <input
              name="nombre"
              required
              className="w-full border border-zinc-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Cantidad referencia
            </label>
            <input
              name="cantidad_referencia"
              type="number"
              step="0.0001"
              defaultValue="1"
              className="w-full border border-zinc-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Tipo
            </label>
            <select
              name="tipo"
              className="w-full border border-zinc-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="fijo">Fijo</option>
              <option value="sustituible">Sustituible</option>
              <option value="opcional">Opcional</option>
              <option value="quitable">Quitable</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium text-sm"
            >
              Agregar
            </button>
          </div>
        </div>
      </form>

      <form action={editarPaqueteForm} className="hidden" id={`paquete-${paquete.id}`}>
        <input name="id" />
        <input name="nombre" />
        <input name="descripcion" />
        <input name="personas_recomendadas" />
        <input name="foto_url" />
      </form>

      <form action={eliminarPaqueteForm} className="hidden" id={`eliminar-${paquete.id}`}>
        <input name="id" />
      </form>
    </div>
  );
}

async function crearPaqueteForm(formData: FormData) {
  await requirePanelAccess();
  const paquete: PaqueteInsert = {
    nombre: formData.get("nombre") as string,
    descripcion: (formData.get("descripcion") as string) || null,
    foto_url: (formData.get("foto_url") as string) || null,
    personas_recomendadas:
      Number(formData.get("personas_recomendadas")) || 1,
  };

  await crearPaquete(paquete);
  redirect("/panel/paquetes");
}

async function editarPaqueteForm(formData: FormData) {
  await requirePanelAccess();
  const id = Number(formData.get("id"));
  const cambios = {
    nombre: formData.get("nombre") as string,
    descripcion: (formData.get("descripcion") as string) || null,
    foto_url: (formData.get("foto_url") as string) || null,
    personas_recomendadas:
      Number(formData.get("personas_recomendadas")) || 1,
  };

  await actualizarPaquete(id, cambios);
  redirect("/panel/paquetes");
}

async function eliminarPaqueteForm(formData: FormData) {
  await requirePanelAccess();
  const id = Number(formData.get("id"));
  await eliminarPaquete(id);
  redirect("/panel/paquetes");
}

async function agregarComponenteForm(formData: FormData) {
  await requirePanelAccess();
  const componente = {
    paquete_id: Number(formData.get("paquete_id")),
    nombre: formData.get("nombre") as string,
    cantidad_referencia: Number(formData.get("cantidad_referencia")) || 1,
    tipo: (formData.get("tipo") as
      | "fijo"
      | "sustituible"
      | "opcional"
      | "quitable") || "fijo",
  };

  await crearComponente(componente);
  redirect(`/panel/paquetes`);
}

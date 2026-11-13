"use client";

import { FotoInput } from "@/components/foto-input";
import { editarPaqueteForm } from "@/lib/panel/paquetes-forms";

interface PaqueteEdicionProps {
  paquete: {
    id: number;
    nombre: string;
    descripcion: string | null;
    foto_url: string | null;
    personas_recomendadas: number;
  };
}

/**
 * Componente cliente para el formulario de edición de un paquete.
 * Usa la Server Action editarPaqueteForm como action del <form>.
 * Incluye FotoInput para subir/reemplazar la fotografía con vista previa.
 */
export function PaqueteEdicionForm({ paquete }: PaqueteEdicionProps) {
  const fotoUrlActual = paquete.foto_url;

  return (
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
          <FotoInput name="foto" currentUrl={fotoUrlActual} />
          {fotoUrlActual && (
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
  );
}

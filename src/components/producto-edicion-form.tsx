"use client";

import { FotoInput } from "@/components/foto-input";
import { editarProductoForm } from "@/lib/panel/productos-forms";

interface ProductoEdicionProps {
  producto: {
    id: number;
    nombre: string;
    descripcion: string | null;
    foto_url: string | null;
    categoria_id: number | null;
    orden_visualizacion: number;
    unidad_compra: string;
    unidad_venta: string;
    factor_conversion: number;
    merma_pct: number;
    porcion_referencia_persona: number | null;
    alergenos: string[] | null;
    etiquetas: string[] | null;
    estado: string;
  };
  categorias: { id: number; nombre: string }[];
}

/**
 * Componente cliente para el formulario de edición de un producto.
 * Usa la Server Action editarProductoForm como action del <form>.
 * Incluye FotoInput para subir/reemplazar la fotografía con vista previa.
 */
export function ProductoEdicionForm({
  producto,
  categorias,
}: ProductoEdicionProps) {
  const fotoUrlActual = producto.foto_url;

  return (
    <form action={editarProductoForm} className="space-y-4">
      <input type="hidden" name="id" defaultValue={String(producto.id)} />
      <input type="hidden" name="estado" defaultValue={producto.estado} />
      <input
        type="hidden"
        name="orden_visualizacion"
        defaultValue={String(producto.orden_visualizacion)}
      />
      <input
        type="hidden"
        name="unidad_compra"
        defaultValue={producto.unidad_compra}
      />
      <input
        type="hidden"
        name="unidad_venta"
        defaultValue={producto.unidad_venta}
      />
      <input
        type="hidden"
        name="factor_conversion"
        defaultValue={String(producto.factor_conversion)}
      />
      <input
        type="hidden"
        name="merma_pct"
        defaultValue={String(producto.merma_pct)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-full sm:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Nombre del producto
          </label>
          <input
            name="nombre"
            defaultValue={producto.nombre}
            className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Categoría
          </label>
          <select
            name="categoria_id"
            className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Sin categoría</option>
            {categorias.map((c) => (
              <option
                key={c.id}
                value={String(c.id)}
                selected={producto.categoria_id === c.id}
              >
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-full sm:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Descripción
          </label>
          <textarea
            name="descripcion"
            rows={2}
            defaultValue={producto.descripcion ?? ""}
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

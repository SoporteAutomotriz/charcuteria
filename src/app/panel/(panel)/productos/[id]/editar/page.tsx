"use server";

import { redirect } from "next/navigation";
import { getPanelSession } from "@/lib/auth/server";
import {
  obtenerProducto,
  obtenerProductoCosto,
  obtenerProductoMargen,
} from "@/lib/panel/productos";
import {
  editarProductoForm,
  desactivarProductoForm,
  listarCategoriasParaForm,
} from "@/lib/panel/productos-forms";
import { FotoInput } from "@/components/foto-input";

export default async function ProductoEditarPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getPanelSession();
  const esPropietario = session?.rol === "propietario";

  const { id: idParam } = await params;
  const id = Number(idParam);

  const producto = await obtenerProducto(id);

  if (!producto) {
    redirect("/panel/productos");
  }

  const categorias = await listarCategoriasParaForm();

  const [costo, margen] = esPropietario
    ? await Promise.all([
        obtenerProductoCosto(id),
        obtenerProductoMargen(id),
      ])
    : [null, null];

  return (
    <div className="space-y-6">
      <nav className="mb-4">
        <a
          href="/panel/productos"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          ← Volver a productos
        </a>
      </nav>

      <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
        <h1 className="text-xl font-bold text-zinc-900 mb-4">
          Editar producto: {producto.nombre}
        </h1>

        <form action={editarProductoForm} className="space-y-4">
          <input type="hidden" name="id" defaultValue={String(producto.id)} />
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
          <div className="col-span-full sm:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Merma (%)
            </label>
            <input
              name="merma_pct"
              type="number"
              step="0.01"
              min="0"
              max="100"
              defaultValue={String(producto.merma_pct)}
              className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

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
              <FotoInput name="foto" currentUrl={producto.foto_url} />
              {producto.foto_url && (
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
            <div className="col-span-full sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Porción de referencia por persona
              </label>
              <input
                name="porcion_referencia_persona"
                type="number"
                step="0.01"
                defaultValue={
                  producto.porcion_referencia_persona
                    ? String(producto.porcion_referencia_persona)
                    : ""
                }
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="col-span-full sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Alérgenos (separados por coma)
              </label>
              <input
                name="alergenos"
                defaultValue={producto.alergenos?.join(", ") ?? ""}
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            {esPropietario && (
              <div className="col-span-full sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Costo unitario de compra (MXN)
                </label>
                <input
                  name="costo_unitario_compra"
                  type="number"
                  step="0.01"
                  defaultValue={
                    costo?.costo_unitario_compra
                      ? String(costo.costo_unitario_compra)
                      : ""
                  }
                  className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            )}
            {esPropietario && (
              <div className="col-span-full sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Margen propio (%)
                </label>
                <input
                  name="margen_propio_pct"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  defaultValue={
                    margen?.margen_propio_pct
                      ? String(margen.margen_propio_pct)
                      : ""
                  }
                  className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            )}
            {esPropietario && (
              <div className="col-span-full sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Precio fijo manual (MXN, opcional)
                </label>
                <input
                  name="precio_fijo_manual"
                  type="number"
                  step="0.01"
                  defaultValue={
                    margen?.precio_fijo_manual
                      ? String(margen.precio_fijo_manual)
                      : ""
                  }
                  className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Estado
              </label>
              <select
                name="estado"
                defaultValue={producto.estado}
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="activo">Activo</option>
                <option value="agotado_temporal">Agotado temporal</option>
                <option value="inactivo">Inactivo</option>
              </select>
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

        <form action={desactivarProductoForm} className="mt-6">
          <input type="hidden" name="id" defaultValue={String(producto.id)} />
          <button
            type="submit"
            className="text-sm text-red-600 hover:underline"
          >
            Desactivar producto
          </button>
        </form>
      </div>
    </div>
  );
}

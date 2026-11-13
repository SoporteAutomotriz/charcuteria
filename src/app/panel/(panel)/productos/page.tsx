"use server";

import { getPanelSession } from "@/lib/auth/server";
import {
  crearProductoForm,
  desactivarProductoForm,
  eliminarProductoForm,
  listarProductosConCategorias,
  listarCategoriasParaForm,
} from "@/lib/panel/productos-forms";
import { FotoInput } from "@/components/foto-input";

export default async function ProductosPage() {
  const session = await getPanelSession();
  const esPropietario = session?.rol === "propietario";

  const [productos, categorias] = await Promise.all([
    listarProductosConCategorias(),
    listarCategoriasParaForm(),
  ]);

  const productosConCategoria = productos.map((p) => ({
    ...p,
    categoria_nombre: p.categorias?.nombre ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Catálogo de productos</h1>
        <p className="text-zinc-600">
          Administra los productos del catálogo. Los costos y márgenes privados
          solo son visibles para el propietario.
        </p>
      </div>

      {/* Formulario de creación con FotoInput */}
      <form
        action={crearProductoForm}
        className="space-y-4 bg-white p-6 rounded-lg border border-zinc-200 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Nuevo producto
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="col-span-full sm:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Nombre del producto
            </label>
            <input
              name="nombre"
              required
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
                <option key={c.id} value={String(c.id)}>
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
              className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="col-span-full">
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Fotografía
            </label>
            <FotoInput name="foto" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Unidad de compra
            </label>
            <input
              name="unidad_compra"
              defaultValue="kg"
              className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Unidad de venta
            </label>
            <input
              name="unidad_venta"
              defaultValue="rebanada"
              className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Factor de conversión
            </label>
            <input
              name="factor_conversion"
              type="number"
              step="0.0001"
              defaultValue="1"
              className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Merma (%)
            </label>
            <input
              name="merma_pct"
              type="number"
              step="0.01"
              defaultValue="0"
              className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="col-span-full sm:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Porción de referencia por persona
            </label>
            <input
              name="porcion_referencia_persona"
              type="number"
              step="0.01"
              className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="col-span-full sm:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Alérgenos (separados por coma)
            </label>
            <input
              name="alergenos"
              placeholder="Ej: gluten, leche, frutos secos"
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
              Crear producto
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200">
                Producto
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200">
                Categoría
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200">
                Estado
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {productosConCategoria.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-900">{p.nombre}</div>
                  <div className="text-xs text-zinc-500">
                    {p.unidad_compra} → {p.unidad_venta}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-zinc-600">
                    {p.categoria_nombre ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      p.estado === "activo"
                        ? "bg-green-100 text-green-700"
                        : p.estado === "agotado_temporal"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {p.estado.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`/panel/productos/${p.id}/editar`}
                    className="text-sm text-blue-600 hover:underline mr-4"
                  >
                    Editar
                  </a>
                  <form
                    action={desactivarProductoForm}
                    id={`desactivar-producto-${p.id}`}
                    className="hidden"
                  >
                    <input name="id" defaultValue={String(p.id)} />
                  </form>
                  <button
                    formAction={desactivarProductoForm}
                    form={`desactivar-producto-${p.id}`}
                    className="text-sm text-red-600 hover:underline mr-2"
                  >
                    Desactivar
                  </button>
                  {esPropietario && (
                    <>
                      <form
                        action={eliminarProductoForm}
                        id={`eliminar-producto-${p.id}`}
                        className="hidden"
                      >
                        <input name="id" defaultValue={String(p.id)} />
                      </form>
                      <button
                        formAction={eliminarProductoForm}
                        form={`eliminar-producto-${p.id}`}
                        className="text-sm text-red-700 hover:underline"
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

    </div>
  );
};

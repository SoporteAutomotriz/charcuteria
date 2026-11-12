"use server";

import { redirect } from "next/navigation";
import {
  crearProducto,
  desactivarProducto,
  listarCategorias,
  listarProductos,
  actualizarProducto,
  type Producto,
  type ProductoInsert,
} from "@/lib/panel/productos";
import { requirePanelAccess } from "@/lib/auth/server";

export default async function ProductosPage() {
  const [productos, categorias] = await Promise.all([
    listarProductos(),
    listarCategorias(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Catálogo de productos</h1>
        <p className="text-zinc-600">
          Administra los productos del catálogo. Los costos y márgenes privados
          se gestionan desde la sección de precios (Fase 5).
        </p>
      </div>

      <form action={crearProductoForm} className="space-y-4 bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Nuevo producto</h2>
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
          <div>
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
            {productos.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-900">{p.nombre}</div>
                  <div className="text-xs text-zinc-500">
                    {p.unidad_compra} → {p.unidad_venta}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-zinc-600">
                    {(p as { categorias?: { nombre: string | null } | null })
                      ?.categorias?.nombre ?? "—"}
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
                  <button
                    formAction={editarProductoForm}
                    form={String(p.id)}
                    className="text-sm text-blue-600 hover:underline mr-4"
                  >
                    Editar
                  </button>
                  <button
                    formAction={desactivarProductoForm}
                    form={String(p.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Desactivar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form action={editarProductoForm} className="hidden">
        <input name="id" />
        <input name="nombre" />
        <input name="descripcion" />
        <input name="foto_url" />
        <input name="categoria_id" />
        <input name="orden_visualizacion" />
        <input name="unidad_compra" />
        <input name="unidad_venta" />
        <input name="factor_conversion" />
        <input name="merma_pct" />
        <input name="porcion_referencia_persona" />
        <input name="alergenos" />
        <input name="etiquetas" />
        <input name="estado" />
      </form>

      <form action={desactivarProductoForm} className="hidden">
        <input name="id" />
      </form>
    </div>
  );
}

async function crearProductoForm(formData: FormData) {
  await requirePanelAccess();
  const producto: ProductoInsert = {
    nombre: formData.get("nombre") as string,
    categoria_id:
      formData.get("categoria_id") === ""
        ? null
        : Number(formData.get("categoria_id")),
    descripcion: (formData.get("descripcion") as string) || null,
    foto_url: (formData.get("foto_url") as string) || null,
    orden_visualizacion: Number(formData.get("orden_visualizacion")) || 0,
    unidad_compra: (formData.get("unidad_compra") as string) || "kg",
    unidad_venta: (formData.get("unidad_venta") as string) || "pieza",
    factor_conversion: Number(formData.get("factor_conversion")) || 1,
    merma_pct: Number(formData.get("merma_pct")) || 0,
    porcion_referencia_persona:
      formData.get("porcion_referencia_persona") === ""
        ? null
        : Number(formData.get("porcion_referencia_persona")),
    alergenos: null,
    etiquetas: null,
    estado: "activo",
  };

  await crearProducto(producto);
  redirect("/panel/productos");
}

async function editarProductoForm(formData: FormData) {
  await requirePanelAccess();
  const id = Number(formData.get("id"));
  const cambios = {
    nombre: formData.get("nombre") as string,
    categoria_id:
      formData.get("categoria_id") === ""
        ? null
        : Number(formData.get("categoria_id")),
    descripcion: (formData.get("descripcion") as string) || null,
    foto_url: (formData.get("foto_url") as string) || null,
    orden_visualizacion: Number(formData.get("orden_visualizacion")) || 0,
    unidad_compra: (formData.get("unidad_compra") as string) || "kg",
    unidad_venta: (formData.get("unidad_venta") as string) || "pieza",
    factor_conversion: Number(formData.get("factor_conversion")) || 1,
    merma_pct: Number(formData.get("merma_pct")) || 0,
    porcion_referencia_persona:
      formData.get("porcion_referencia_persona") === ""
        ? null
        : Number(formData.get("porcion_referencia_persona")),
    alergenos: null,
    etiquetas: null,
    estado: (() => {
      const estadoStr = formData.get("estado") as string;
      return ["activo", "agotado_temporal", "inactivo"].includes(estadoStr)
        ? (estadoStr as Producto["estado"])
        : "activo";
    })(),
  };

  await actualizarProducto(id, cambios);
  redirect("/panel/productos");
}

async function desactivarProductoForm(formData: FormData) {
  await requirePanelAccess();
  const id = Number(formData.get("id"));
  await desactivarProducto(id);
  redirect("/panel/productos");
}

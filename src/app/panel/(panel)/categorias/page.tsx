"use server";

import { redirect } from "next/navigation";
import Link from "next/link";
import {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  type CategoriaInsert,
  type CategoriaUpdate,
} from "@/lib/panel/categorias";
import { requirePanelAccess } from "@/lib/auth/server";

export default async function CategoriasPage() {
  await requirePanelAccess();

  const categorias = await listarCategorias();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Categorías</h1>
        <p className="text-zinc-600">
          Administra las categorías del catálogo de productos. Estas se usan
          en el formulario de producto y en el configurador del cliente.
        </p>
        <Link
          href="/panel/productos"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          ← Volver a productos
        </Link>
      </div>

      {/* Formulario de creación */}
      <form
        action={crearCategoriaForm}
        className="space-y-4 bg-white p-6 rounded-lg border border-zinc-200 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Nueva categoría
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="col-span-full sm:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Nombre
            </label>
            <input
              name="nombre"
              required
              className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Orden de visualización
            </label>
            <input
              name="orden_visualizacion"
              type="number"
              min="0"
              defaultValue="0"
              className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Activa
            </label>
            <div className="flex items-center">
              <input
                name="activo"
                type="checkbox"
                defaultChecked={true}
                value="true"
                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
            >
              Crear categoría
            </button>
          </div>
        </div>
      </form>

      {/* Listado */}
      <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200">
                Nombre
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200 text-center">
                Orden
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200 text-center">
                Activa
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {categorias.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {c.nombre}
                </td>
                <td className="px-4 py-3 text-center text-zinc-700">
                  {c.orden_visualizacion}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      c.activo
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {c.activo ? "Sí" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    formAction={editarCategoriaForm}
                    form={`categoria-${c.id}`}
                    className="text-sm text-blue-600 hover:underline mr-2"
                  >
                    Editar
                  </button>
                  <button
                    formAction={eliminarCategoriaForm}
                    form={`eliminar-categoria-${c.id}`}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {categorias.map((c) => (
        <form
          key={`editar-categoria-${c.id}`}
          action={editarCategoriaForm}
          className="hidden"
          id={`categoria-${c.id}`}
        >
          <input name="id" defaultValue={String(c.id)} />
          <input name="nombre" defaultValue={c.nombre} />
          <input
            name="orden_visualizacion"
            defaultValue={String(c.orden_visualizacion)}
          />
          <input name="activo" defaultValue={String(c.activo)} />
        </form>
      ))}

      {categorias.map((c) => (
        <form
          key={`eliminar-categoria-${c.id}`}
          action={eliminarCategoriaForm}
          className="hidden"
          id={`eliminar-categoria-${c.id}`}
        >
          <input name="id" defaultValue={String(c.id)} />
        </form>
      ))}
    </div>
  );
}

async function crearCategoriaForm(formData: FormData) {
  'use server';
  await requirePanelAccess();

  const categoria: {
    nombre: string;
    orden_visualizacion: number;
    activo: boolean;
  } = {
    nombre: formData.get("nombre") as string,
    orden_visualizacion:
      Number(formData.get("orden_visualizacion")) || 0,
    activo: formData.get("activo") === "true",
  };

  await crearCategoria(categoria);
  redirect("/panel/categorias");
}

async function editarCategoriaForm(formData: FormData) {
  'use server';
  await requirePanelAccess();

  const id = Number(formData.get("id"));
  const cambios: {
    nombre: string;
    orden_visualizacion: number;
    activo: boolean;
  } = {
    nombre: formData.get("nombre") as string,
    orden_visualizacion:
      Number(formData.get("orden_visualizacion")) || 0,
    activo: formData.get("activo") === "true",
  };

  await actualizarCategoria(id, cambios);
  redirect("/panel/categorias");
}

async function eliminarCategoriaForm(formData: FormData) {
  'use server';
  await requirePanelAccess();

  const id = Number(formData.get("id"));
  await eliminarCategoria(id);
  redirect("/panel/categorias");
}

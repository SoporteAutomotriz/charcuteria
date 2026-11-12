"use server";

import { redirect } from "next/navigation";
import {
  listarZonasTransporte,
  crearZonaTransporte,
  actualizarZonaTransporte,
  eliminarZonaTransporte,
  listarTarifasMontaje,
  crearTarifaMontaje,
  actualizarTarifaMontaje,
  eliminarTarifaMontaje,
} from "@/lib/panel/tarifas";
import { requirePanelAccess } from "@/lib/auth/server";

export default async function TarifasPage() {
  const [zonas, tarifasMontaje] = await Promise.all([
    listarZonasTransporte(),
    listarTarifasMontaje(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Servicios y tarifas</h1>
        <p className="text-zinc-600">
          Configura zonas de transporte, municipios y tarifas de montaje y
          personal. Estos valores se usan en el motor de precios.
        </p>
      </div>

      <section className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Zonas de transporte</h2>
        <form action={crearZonaForm} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="col-span-full sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Nombre de la zona
              </label>
              <input
                name="nombre"
                required
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="col-span-full sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Municipios (separados por coma)
              </label>
              <input
                name="municipios"
                defaultValue=""
                placeholder="Ej: Monterrey, San Pedro, Guadalupe"
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Tarifa fija (MXN)
              </label>
              <input
                name="tarifa_fija"
                type="number"
                step="0.01"
                defaultValue="0"
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Cargo por distancia (MXN)
              </label>
              <input
                name="cargo_distancia"
                type="number"
                step="0.01"
                defaultValue="0"
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Cargo por hora (MXN)
              </label>
              <input
                name="cargo_horario"
                type="number"
                step="0.01"
                defaultValue="0"
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Cargo acceso difícil (MXN)
              </label>
              <input
                name="cargo_acceso_dificil"
                type="number"
                step="0.01"
                defaultValue="0"
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  name="zona_especial"
                  type="checkbox"
                  defaultChecked={false}
                  value="true"
                  className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                Zona especial
              </label>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
              >
                Crear zona
              </button>
            </div>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200">
                  Zona
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200">
                  Municipios
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200 text-right">
                  Tarifa fija
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200 text-right">
                  Distancia
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200 text-center">
                  Especial
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {zonas.map((z) => (
                <tr key={z.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {z.nombre}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-600">
                    {z.municipios.join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-700">
                    {Number(z.tarifa_fija).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-700">
                    {Number(z.cargo_distancia).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {z.zona_especial ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                        Especial
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-700">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      formAction={editarZonaForm}
                      form={`zona-${z.id}`}
                      className="text-sm text-blue-600 hover:underline mr-2"
                    >
                      Editar
                    </button>
                    <button
                      formAction={eliminarZonaForm}
                      form={`zona-${z.id}`}
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

        {zonas.map((z) => (
          <form
            key={`editar-zona-${z.id}`}
            action={editarZonaForm}
            className="hidden"
            id={`zona-${z.id}`}
          >
            <input key="zona-id" name="id" defaultValue={String(z.id)} />
            <input key="zona-nombre" name="nombre" defaultValue={z.nombre} />
            <input
              key="zona-municipios"
              name="municipios"
              defaultValue={z.municipios.join(",")}
            />
            <input key="zona-tarifa" name="tarifa_fija" defaultValue={String(z.tarifa_fija)} />
            <input
              key="zona-distancia"
              name="cargo_distancia"
              defaultValue={String(z.cargo_distancia)}
            />
            <input key="zona-horario" name="cargo_horario" defaultValue={String(z.cargo_horario)} />
            <input
              key="zona-acceso"
              name="cargo_acceso_dificil"
              defaultValue={String(z.cargo_acceso_dificil)}
            />
            <input
              key="zona-especial"
              name="zona_especial"
              defaultValue={String(z.zona_especial)}
            />
            <input key="zona-activo" name="activo" defaultValue={String(z.activo)} />
          </form>
        ))}

        {zonas.map((z) => (
          <form
            key={`eliminar-zona-${z.id}`}
            action={eliminarZonaForm}
            className="hidden"
            id={`eliminar-zona-${z.id}`}
          >
            <input key="eliminar-zona-id" name="id" defaultValue={String(z.id)} />
          </form>
        ))}
      </section>

      <section className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Tarifas de montaje y personal
        </h2>
        <form action={crearTarifaMontajeForm} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Tarifa por hora (MXN)
              </label>
              <input
                name="tarifa_hora"
                type="number"
                step="0.01"
                defaultValue="0"
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Horas mínimas
              </label>
              <input
                name="horas_minimas"
                type="number"
                min="0"
                defaultValue="0"
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Invitados por persona (N)
              </label>
              <input
                name="regla_personal_por_invitados"
                type="number"
                min="0"
                defaultValue="0"
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
              >
                Crear tarifa
              </button>
            </div>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200">
                  Tarifa/hora
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200 text-right">
                  Horas mínimas
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200 text-right">
                  Invitados/persona
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200 text-center">
                  Activo
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-zinc-600 border-b border-zinc-200 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {tarifasMontaje.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 text-zinc-700">
                    {Number(t.tarifa_hora).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-700">
                    {t.horas_minimas}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-700">
                    {t.regla_personal_por_invitados}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {t.activo ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        Sí
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-700">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      formAction={editarTarifaMontajeForm}
                      form={`tarifa-${t.id}`}
                      className="text-sm text-blue-600 hover:underline mr-2"
                    >
                      Editar
                    </button>
                    <button
                      formAction={eliminarTarifaMontajeForm}
                      form={`tarifa-${t.id}`}
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

        {tarifasMontaje.map((t) => (
          <form
            key={`editar-tarifa-${t.id}`}
            action={editarTarifaMontajeForm}
            className="hidden"
            id={`tarifa-${t.id}`}
          >
            <input key="tarifa-id" name="id" defaultValue={String(t.id)} />
            <input key="tarifa-hora" name="tarifa_hora" defaultValue={String(t.tarifa_hora)} />
            <input key="tarifa-horas" name="horas_minimas" defaultValue={String(t.horas_minimas)} />
            <input
              key="tarifa-regla"
              name="regla_personal_por_invitados"
              defaultValue={String(t.regla_personal_por_invitados)}
            />
            <input key="tarifa-activo" name="activo" defaultValue={String(t.activo)} />
          </form>
        ))}

        {tarifasMontaje.map((t) => (
          <form
            key={`eliminar-tarifa-${t.id}`}
            action={eliminarTarifaMontajeForm}
            className="hidden"
            id={`eliminar-tarifa-${t.id}`}
          >
            <input key="eliminar-tarifa-id" name="id" defaultValue={String(t.id)} />
          </form>
        ))}
      </section>
    </div>
  );
}

async function crearZonaForm(formData: FormData) {
  'use server';
  await requirePanelAccess();
  const municipiosRaw = (formData.get("municipios") as string) || "";
  const zona = {
    nombre: formData.get("nombre") as string,
    municipios: municipiosRaw
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m.length > 0),
    tarifa_fija: Number(formData.get("tarifa_fija")) || 0,
    cargo_distancia: Number(formData.get("cargo_distancia")) || 0,
    cargo_horario: Number(formData.get("cargo_horario")) || 0,
    cargo_acceso_dificil: Number(formData.get("cargo_acceso_dificil")) || 0,
    zona_especial: formData.get("zona_especial") === "true",
    activo: true,
  };

  await crearZonaTransporte(zona);
  redirect("/panel/tarifas");
}

async function editarZonaForm(formData: FormData) {
  'use server';
  await requirePanelAccess();
  const id = Number(formData.get("id"));
  const municipiosRaw = (formData.get("municipios") as string) || "";
  const cambios = {
    nombre: formData.get("nombre") as string,
    municipios: municipiosRaw
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m.length > 0),
    tarifa_fija: Number(formData.get("tarifa_fija")) || 0,
    cargo_distancia: Number(formData.get("cargo_distancia")) || 0,
    cargo_horario: Number(formData.get("cargo_horario")) || 0,
    cargo_acceso_dificil: Number(formData.get("cargo_acceso_dificil")) || 0,
    zona_especial: formData.get("zona_especial") === "true",
    activo: formData.get("activo") !== "false",
  };

  await actualizarZonaTransporte(id, cambios);
  redirect("/panel/tarifas");
}

async function eliminarZonaForm(formData: FormData) {
  'use server';
  await requirePanelAccess();
  const id = Number(formData.get("id"));
  await eliminarZonaTransporte(id);
  redirect("/panel/tarifas");
}

async function crearTarifaMontajeForm(formData: FormData) {
  'use server';
  await requirePanelAccess();
  const tarifa = {
    tarifa_hora: Number(formData.get("tarifa_hora")) || 0,
    horas_minimas: Number(formData.get("horas_minimas")) || 0,
    regla_personal_por_invitados:
      Number(formData.get("regla_personal_por_invitados")) || 0,
    activo: true,
  };

  await crearTarifaMontaje(tarifa);
  redirect("/panel/tarifas");
}

async function editarTarifaMontajeForm(formData: FormData) {
  'use server';
  await requirePanelAccess();
  const id = Number(formData.get("id"));
  const cambios = {
    tarifa_hora: Number(formData.get("tarifa_hora")) || 0,
    horas_minimas: Number(formData.get("horas_minimas")) || 0,
    regla_personal_por_invitados:
      Number(formData.get("regla_personal_por_invitados")) || 0,
    activo: formData.get("activo") !== "false",
  };

  await actualizarTarifaMontaje(id, cambios);
  redirect("/panel/tarifas");
}

async function eliminarTarifaMontajeForm(formData: FormData) {
  'use server';
  await requirePanelAccess();
  const id = Number(formData.get("id"));
  await eliminarTarifaMontaje(id);
  redirect("/panel/tarifas");
}

"use client";

/**
 * Paso 6 del configurador: lugar del evento (dirección y municipio).
 * El municipio determina la zona de transporte. Zona especial = requiere evaluación.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { leerBorrador, guardarBorrador } from "@/lib/cotizar/store";
import type { DatosLugar } from "@/lib/cotizar/store";

interface MunicipioOpcion {
  nombre: string;
  zonaTransporteId?: number;
  zonaEspecial: boolean;
}

export default function LugarPage() {
  const router = useRouter();
  const borrador = leerBorrador();
  const lugarGuardado = borrador.lugar;

  const [direccion, setDireccion] = useState<string>(lugarGuardado?.direccion ?? "");
  const [municipio, setMunicipio] = useState<string>(lugarGuardado?.municipio ?? "");
  const [zonasDisponibles, setZonasDisponibles] = useState<MunicipioOpcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/zonas-transporte-publicas")
      .then((r) => {
        if (!r.ok) throw new Error("No se pudieron cargar las zonas");
        return r.json();
      })
      .then((data: MunicipioOpcion[]) => {
        setZonasDisponibles(data);
        setCargando(false);
      })
      .catch(() => {
        setError("No se pudieron cargar las zonas de servicio. Intenta de nuevo.");
        setCargando(false);
      });
  }, []);

  const zonaSeleccionada = zonasDisponibles.find(
    (z) => z.nombre === municipio,
  );

  const guardarYAvanzar = () => {
    const lugar: DatosLugar = {
      direccion: direccion.trim(),
      municipio: municipio.trim(),
    };
    if (zonaSeleccionada?.zonaTransporteId !== undefined) {
      lugar.zonaTransporteId = zonaSeleccionada.zonaTransporteId;
    }

    const borradorActual = leerBorrador();
    guardarBorrador({
      ...borradorActual,
      paso: 7,
      lugar,
    });
    router.push("/cotizar/contacto");
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <p className="text-sm text-zinc-500">Cargando zonas de servicio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <nav className="mb-6">
          <a
            href="/cotizar/servicios"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            ← Volver a servicios
          </a>
        </nav>

        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            Lugar del evento
          </h1>
          <p className="text-sm text-zinc-600 mb-6">
            Dirección y municipio. El municipio determina la zona de transporte.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={direccion}
                placeholder="Ej: Av. Juárez 123, Centro"
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Municipio
              </label>
              <select
                name="municipio"
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Selecciona un municipio</option>
                {zonasDisponibles.map((z) => (
                  <option key={z.nombre} value={z.nombre}>
                    {z.nombre}
                  </option>
                ))}
              </select>
              {zonaSeleccionada && zonaSeleccionada.zonaEspecial && (
                <p className="text-xs text-amber-700 mt-1">
                  Zona especial: el transporte requiere evaluación del
                  propietario
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="bg-amber-50 border border-amber-100 p-3 rounded text-sm text-amber-700">
              Si tu municipio no aparece, la solicitud se marcará como
              &quot;requiere evaluaci&oacute;n&quot; y el propietario se pondrá
              en contacto contigo.
            </div>
          </form>

          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => router.push("/cotizar/servicios")}
              className="text-sm text-zinc-600 hover:underline"
            >
              Atrás
            </button>
            <button
              onClick={guardarYAvanzar}
              disabled={!direccion.trim() || !municipio.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

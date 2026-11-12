"use client";

/**
 * Paso 5 del configurador: servicios complementarios (montaje, personal).
 * Solo aplica según la modalidad seleccionada en el paso 1.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { leerBorrador, guardarBorrador } from "@/lib/cotizar/store";
import type { DatosServicios } from "@/lib/cotizar/store";

export default function ServiciosPage() {
  const router = useRouter();
  const borrador = leerBorrador();
  const modalidad = borrador.modalidad;
  const serviciosGuardados = borrador.servicios;

  const [montajeHoras, setMontajeHoras] = useState<string>(
    String(serviciosGuardados?.montaje?.horas ?? ""),
  );
  const [personalHoras, setPersonalHoras] = useState<string>(
    String(serviciosGuardados?.personal?.horas ?? ""),
  );
  const [personalInvitados, setPersonalInvitados] = useState<string>(
    String(serviciosGuardados?.personal?.invitados ?? ""),
  );

  const guardarYAvanzar = () => {
    const servicios: DatosServicios = {};
    if (montajeHoras && Number(montajeHoras) > 0) {
      servicios.montaje = { horas: Number(montajeHoras) };
    }
    if (personalHoras && Number(personalHoras) > 0) {
      servicios.personal = {
        horas: Number(personalHoras),
        invitados: Number(personalInvitados) || 0,
      };
    }

    const borradorActual = leerBorrador();
    guardarBorrador({
      ...borradorActual,
      paso: 6,
      servicios,
    });
    router.push("/cotizar/lugar");
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <nav className="mb-6">
          <a
            href="/cotizar/ingredientes"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            ← Volver a ingredientes
          </a>
        </nav>

        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            Servicios complementarios
          </h1>
          <p className="text-sm text-zinc-600 mb-6">
            Agrega montaje y personal si lo necesitas. Estos cargos se suman al
            estimado sin margen adicional.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            {modalidad === "mesa" && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Horas de montaje
                </label>
                <input
                  type="number"
                  name="montaje_horas"
                  min="0"
                  step="0.5"
                  value={montajeHoras}
                  onChange={(e) => setMontajeHoras(e.target.value)}
                  className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Tarifa por hora configurada desde el panel del propietario
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Horas de personal
              </label>
              <input
                type="number"
                name="personal_horas"
                min="0"
                step="0.5"
                value={personalHoras}
                onChange={(e) => setPersonalHoras(e.target.value)}
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Personal de servicio durante el evento
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Invitados para el personal
              </label>
              <input
                type="number"
                name="personal_invitados"
                min="0"
                value={personalInvitados}
                onChange={(e) => setPersonalInvitados(e.target.value)}
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Se usa para calcular el número de personas de personal necesarias
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-3 rounded text-sm text-amber-700">
              Los servicios son opcionales. Si no los necesitas, deja los campos
              en cero.
            </div>
          </form>

          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => router.push("/cotizar/ingredientes")}
              className="text-sm text-zinc-600 hover:underline"
            >
              Atrás
            </button>
            <button
              onClick={guardarYAvanzar}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

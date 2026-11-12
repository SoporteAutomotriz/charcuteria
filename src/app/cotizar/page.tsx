"use client";

/**
 * Paso 1 del configurador: elegir modalidad (tabla individual o mesa montada).
 * Guarda la selección en el borrador de localStorage y avanza al paso 2.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { guardarBorrador, leerBorrador } from "@/lib/cotizar/store";
import type { Modalidad } from "@/lib/cotizar/store";

export default function ModalidadPage() {
  const router = useRouter();
  const [modalidad, setModalidad] = useState<Modalidad | null>(null);

  const continuar = () => {
    if (!modalidad) return;
    const borrador = leerBorrador();
    guardarBorrador({
      ...borrador,
      paso: 2,
      modalidad,
    });
    router.push("/cotizar/evento");
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <nav className="mb-6">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            ← Volver al inicio
          </Link>
        </nav>

        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            ¿Qué necesitas para tu evento?
          </h1>
          <p className="text-sm text-zinc-600 mb-6">
            Elige la modalidad de servicio. Puedes cambiarla después.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setModalidad("tabla")}
              className={`w-full py-4 rounded-lg border text-left font-medium transition-colors ${
                modalidad === "tabla"
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <span className="block text-zinc-900">Tabla individual</span>
              <span className="text-xs text-zinc-500 mt-1">
                Tabla de charcutería y quesos para servir en la mesa
              </span>
            </button>

            <button
              onClick={() => setModalidad("mesa")}
              className={`w-full py-4 rounded-lg border text-left font-medium transition-colors ${
                modalidad === "mesa"
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <span className="block text-zinc-900">Mesa montada</span>
              <span className="text-xs text-zinc-500 mt-1">
                Mesa montada en el evento con montaje y personal
              </span>
            </button>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              disabled={!modalidad}
              onClick={continuar}
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

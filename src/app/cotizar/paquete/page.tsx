"use client";

/**
 * Paso 3 del configurador: punto de partida — paquete existente o armado desde cero.
 * Si se elige paquete, lista los paquetes disponibles para seleccionar.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useBorrador,
  guardarBorrador,
  type BorradorCotizacion,
  type PuntoPartida,
} from "@/lib/cotizar/store";

interface PaqueteOpcion {
  id: number;
  nombre: string;
  personas_recomendadas: number;
}

export default function PaquetePage() {
  const router = useRouter();
  // useSyncExternalStore lee localStorage de forma segura con hidratación:
  // servidor renderiza vacío, cliente se sincroniza tras hidratación sin
  // setState en efectos ni mismatch (React #441).
  const borrador = useBorrador();
  const [paquetes, setPaquetes] = useState<PaqueteOpcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [puntoPartida, setPuntoPartida] = useState<PuntoPartida | null>(
    borrador.puntoPartida ?? null,
  );
  const [paqueteId, setPaqueteId] = useState<number | null>(
    borrador.paqueteId ?? null,
  );

  useEffect(() => {
    fetch("/api/paquetes-publicos")
      .then((r) => {
        if (!r.ok) throw new Error("No se pudieron cargar los paquetes");
        return r.json();
      })
      .then((data: PaqueteOpcion[]) => {
        setPaquetes(data);
        setCargando(false);
      })
      .catch(() => {
        setError("No se pudieron cargar los paquetes. Intenta de nuevo.");
        setCargando(false);
      });
  }, []);

  const continuar = () => {
    if (!puntoPartida) return;
    const cambios = {
      ...borrador,
      paso: 4,
      puntoPartida,
    } as BorradorCotizacion;
    if (puntoPartida === "paquete") {
      cambios.paqueteId = paqueteId ?? undefined;
    } else {
      cambios.paqueteId = undefined;
    }
    guardarBorrador(cambios);
    router.push("/cotizar/ingredientes");
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <p className="text-sm text-zinc-500">Cargando paquetes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <nav className="mb-6">
          <a
            href="/cotizar/evento"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            ← Volver a datos del evento
          </a>
        </nav>

        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            ¿Cómo quieres armar tu tabla o mesa?
          </h1>
          <p className="text-sm text-zinc-600 mb-6">
            Elige un paquete base o empieza desde cero con los productos que
            prefieras.
          </p>

          <div className="space-y-4 mb-6">
            <button
              onClick={() => setPuntoPartida("cero")}
              className={`w-full py-4 rounded-lg border text-left font-medium transition-colors ${
                puntoPartida === "cero"
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <span className="block text-zinc-900">Armado desde cero</span>
              <span className="text-xs text-zinc-500 mt-1">
                Eliges cada producto y cantidad tú mismo
              </span>
            </button>

            <button
              onClick={() => setPuntoPartida("paquete")}
              className={`w-full py-4 rounded-lg border text-left font-medium transition-colors ${
                puntoPartida === "paquete"
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <span className="block text-zinc-900">Paquete base</span>
              <span className="text-xs text-zinc-500 mt-1">
                Empieza con un paquete prediseñado y personalízalo
              </span>
            </button>
          </div>

          {puntoPartida === "paquete" && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-700 mb-3">
                Selecciona un paquete
              </h2>
              {error && (
                <p className="text-sm text-red-600 mb-3">{error}</p>
              )}
              <div className="space-y-2">
                {paquetes.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPaqueteId(p.id)}
                    className={`w-full py-3 rounded-lg border text-left transition-colors ${
                      paqueteId === p.id
                        ? "bg-blue-50 border-blue-200 text-blue-700 font-semibold"
                        : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <span className="block text-zinc-900">{p.nombre}</span>
                    <span className="text-xs text-zinc-500 mt-1">
                      {p.personas_recomendadas} personas recomendadas
                    </span>
                  </button>
                ))}
              </div>
              {!paqueteId && (
                <p className="text-xs text-red-600 mt-2">
                  Selecciona un paquete para continuar
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => router.push("/cotizar")}
              className="text-sm text-zinc-600 hover:underline"
            >
              Atrás
            </button>
            <button
              onClick={continuar}
              disabled={
                !puntoPartida ||
                (puntoPartida === "paquete" && !paqueteId)
              }
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

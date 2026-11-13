"use client";

/**
 * Paso 2 del configurador: datos del evento (tipo, fecha, horario, invitados, duración).
 * Valida anticipación mínima y guarda en el borrador.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useBorrador,
  guardarBorrador,
  type DatosEvento,
} from "@/lib/cotizar/store";
import { validarEvento } from "@/lib/cotizar/validaciones";

export default function EventoPage() {
  const router = useRouter();
  // useSyncExternalStore lee localStorage de forma segura con hidratación:
  // servidor renderiza vacío, cliente se sincroniza tras hidratación sin
  // setState en efectos ni mismatch (React #441).
  const borrador = useBorrador();
  const modalidad = borrador.modalidad;
  const eventoGuardado = borrador.evento;

  const [tipo, setTipo] = useState<string>(eventoGuardado?.tipo ?? "");
  const [fecha, setFecha] = useState<string>(eventoGuardado?.fecha ?? "");
  const [horario, setHorario] = useState<string>(eventoGuardado?.horario ?? "");
  const [invitados, setInvitados] = useState<string>(
    String(eventoGuardado?.invitados ?? ""),
  );
  const [duracion, setDuracion] = useState<string>(
    String(eventoGuardado?.duracion ?? ""),
  );
  const [errores, setErrores] = useState<string[]>([]);
  const [advertencias, setAdvertencias] = useState<string[]>([]);

  const cambiarPagina = (pagina: string) => {
    router.push(pagina);
  };

  const guardarYAvanzar = (e: React.FormEvent) => {
    e.preventDefault();

    const evento: DatosEvento = {
      tipo,
      fecha,
      horario,
      invitados: Number(invitados) || 0,
      ...(duracion ? { duracion: Number(duracion) } : {}),
    };

    const resultado = validarEvento(evento);
    setErrores(resultado.errores);
    setAdvertencias(resultado.advertencias);

    if (!resultado.valido) return;

    guardarBorrador({
      ...borrador,
      paso: 3,
      evento,
    });

    router.push("/cotizar/paquete");
  };

  const hoy = new Date();
  hoy.setDate(hoy.getDate() + 2); // anticipación mínima por defecto
  const fechaMin = hoy.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <nav className="mb-6">
          <a
            href="/cotizar"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            ← Volver a modalidad
          </a>
        </nav>

        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            Datos del evento
          </h1>
          <p className="text-sm text-zinc-600 mb-6">
            Cuéntanos cuándo y para cuántas personas será el servicio.
          </p>

          <form onSubmit={guardarYAvanzar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Tipo de evento
              </label>
              <select
                name="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Selecciona...</option>
                <option value="cumpleanos">Cumpleaños</option>
                <option value="boda">Boda</option>
                <option value="aniversario">Aniversario</option>
                <option value="bautizo">Bautizo</option>
                <option value="graduacion">Graduación</option>
                <option value="reunion">Reunión de trabajo</option>
                <option value="otro">Otro</option>
              </select>
              {!tipo && (
                <p className="text-xs text-red-600 mt-1">Selecciona un tipo de evento</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Fecha del evento
              </label>
              <input
                type="date"
                name="fecha"
                value={fecha}
                min={fechaMin}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {!fecha && (
                <p className="text-xs text-red-600 mt-1">Selecciona una fecha</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Horario estimado
              </label>
              <input
                type="time"
                name="horario"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {!horario && (
                <p className="text-xs text-red-600 mt-1">Selecciona un horario</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Número de invitados
              </label>
              <input
                type="number"
                name="invitados"
                min="1"
                value={invitados}
                onChange={(e) => setInvitados(e.target.value)}
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {!invitados || Number(invitados) < 1 && (
                <p className="text-xs text-red-600 mt-1">Mínimo 1 invitado</p>
              )}
            </div>

            {modalidad === "mesa" && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Duración de la mesa (horas)
                </label>
                <input
                  type="number"
                  name="duracion"
                  min="1"
                  step="0.5"
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                  className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Se usa para calcular montaje y personal
                </p>
              </div>
            )}

            {errores.length > 0 && (
              <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {errores.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {advertencias.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded text-sm text-amber-700">
                <ul className="list-disc list-inside space-y-1">
                  {advertencias.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => cambiarPagina("/cotizar")}
                className="text-sm text-zinc-600 hover:underline"
              >
                Atrás
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                Siguiente
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

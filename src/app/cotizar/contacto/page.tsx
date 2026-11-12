"use client";

/**
 * Paso 7 del configurador: contacto del cliente (nombre, teléfono, correo,
 * canal preferido, aviso de privacidad y consentimiento).
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { leerBorrador, guardarBorrador } from "@/lib/cotizar/store";
import type { DatosContacto } from "@/lib/cotizar/store";

export default function ContactoPage() {
  const router = useRouter();
  const borrador = leerBorrador();

  const [nombre, setNombre] = useState<string>(borrador.contacto?.nombre ?? "");
  const [telefono, setTelefono] = useState<string>(borrador.contacto?.telefono ?? "");
  const [correo, setCorreo] = useState<string>(borrador.contacto?.correo ?? "");
  const [canalPreferido, setCanalPreferido] = useState<DatosContacto["canalPreferido"]>(
    borrador.contacto?.canalPreferido ?? "whatsapp",
  );
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState<boolean>(
    borrador.contacto?.aceptaPrivacidad ?? false,
  );

  const guardarYAvanzar = () => {
    const contacto: DatosContacto = {
      nombre,
      telefono,
      correo,
      canalPreferido,
      aceptaPrivacidad,
    };

    const borradorActual = leerBorrador();
    guardarBorrador({
      ...borradorActual,
      paso: 8,
      contacto,
    });
    router.push("/cotizar/resumen");
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <nav className="mb-6">
          <a
            href="/cotizar/lugar"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            ← Volver al lugar
          </a>
        </nav>

        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            Tus datos de contacto
          </h1>
          <p className="text-sm text-zinc-600 mb-6">
            El propietario se pondrá en contacto contigo por tu canal preferido.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                name="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={telefono}
                placeholder="Ej: 222 123 4567"
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                name="correo"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Canal preferido de contacto
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="canal"
                    value="whatsapp"
                    checked={canalPreferido === "whatsapp"}
                    onChange={() => setCanalPreferido("whatsapp")}
                    className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                  WhatsApp
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="canal"
                    value="correo"
                    checked={canalPreferido === "correo"}
                    onChange={() => setCanalPreferido("correo")}
                    className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                  Correo
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="canal"
                    value="ambos"
                    checked={canalPreferido === "ambos"}
                    onChange={() => setCanalPreferido("ambos")}
                    className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                  Ambos
                </label>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                name="privacidad"
                checked={aceptaPrivacidad}
                onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 mt-0.5"
              />
              <label className="text-sm text-zinc-700 leading-relaxed">
                Acepto el{" "}
                <a href="/aviso-privacidad" className="text-blue-600 hover:underline">
                  aviso de privacidad
                </a>{" "}
                y doy mi consentimiento para ser contactado.
              </label>
            </div>

            {!aceptaPrivacidad && (
              <p className="text-xs text-red-600 mt-1">
                Debes aceptar el aviso de privacidad para continuar
              </p>
            )}
          </form>

          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => router.push("/cotizar/lugar")}
              className="text-sm text-zinc-600 hover:underline"
            >
              Atrás
            </button>
            <button
              onClick={guardarYAvanzar}
              disabled={!nombre || !telefono || !correo || !aceptaPrivacidad}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Revisar y enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

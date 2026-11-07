"use client";

import { useEffect, useState } from "react";
import { TurnstileWidget } from "@/components/turnstile-widget";

export default function HostingTestPage() {
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<
    string | { message?: string; code?: string; details?: string; hint?: string } | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/supabase-test")
      .then(async (r) => {
        const json = await r.json();
        if (!cancelled) {
          if (!r.ok) {
            setError(json.error ?? `HTTP ${r.status}`);
            setData(null);
          } else {
            setData(json.data);
            setError(json.error ?? null);
          }
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error desconocido");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Prueba de Hosting — Fase 1</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">1. Lectura de Supabase desde el servidor</h2>
        {error ? (
          <div className="p-3 bg-red-50 text-red-700 rounded border border-red-100">
            <p className="text-sm">
              Error:{" "}
              {typeof error === "string"
                ? error
                : `${error.message ?? "Error desconocido"}${
                    error.code ? ` (${error.code})` : ""
                  }`}
            </p>
            <p className="text-xs mt-1 text-red-600">
              Verifica que las variables de entorno NEXT_PUBLIC_SUPABASE_URL y
              NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY estén definidas en .env.local
            </p>
          </div>
        ) : (
          <div className="p-3 bg-green-50 text-green-700 rounded border border-green-100">
            <p className="text-sm">
              Lectura desde Supabase exitosa. Filas obtenidas:
              {Array.isArray(data) ? data.length : 0}
            </p>
            <pre className="mt-2 text-xs overflow-x-auto bg-gray-100 p-2 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">2. Formulario con Turnstile</h2>
        <p className="text-sm mb-4">
          Completa el widget de Turnstile y envía el formulario. El servidor validará
          el token con Cloudflare.
        </p>

        <TurnstileWidget
          action="contact"
          onVerify={async (token) => {
            const response = await fetch("/api/turnstile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            });
            const data = await response.json();
            if (!data.success) {
              throw new Error(data.error || "Validación fallida.");
            }
          }}
          verifyButtonLabel="Enviar a Turnstile"
        />
      </section>

      <section className="mt-8">
        <h3 className="text-sm font-medium text-gray-500">Criterios de la prueba (sección 12):</h3>
        <ul className="text-sm space-y-1 list-disc list-inside text-gray-600">
          <li>✅ Despliegue de la aplicación</li>
          <li>✅ Lectura de Supabase desde el servidor</li>
          <li>✅ Formulario con Turnstile</li>
        </ul>
      </section>
    </div>
  );
}

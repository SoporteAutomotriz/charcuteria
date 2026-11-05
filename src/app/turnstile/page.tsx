"use client";

import { useEffect, useState } from "react";

export default function TurnstileTestPage() {
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;

  // Cargar el script de Turnstile solo en el cliente (evita hydration mismatch)
  useEffect(() => {
    if (!siteKey || document.getElementById("turnstile-api")) {
      setTimeout(() => setScriptLoaded(true), 0);
      return;
    }

    const script = document.createElement("script");
    script.id = "turnstile-api";
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      setStatus("error");
      setMessage("No se pudo cargar el script de Cloudflare Turnstile.");
    };
    document.head.appendChild(script);

    return () => {
      // No remover el script para no romper widgets existentes
    };
  }, [siteKey]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("verifying");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const token = formData.get("cf-turnstile-response") as string;

    if (!token) {
      setStatus("error");
      setMessage("No se recibió el token de Turnstile. Completa el widget antes de enviar.");
      return;
    }

    try {
      const response = await fetch("/api/turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage("Turnstile validado correctamente.");
      } else {
        setStatus("error");
        setMessage(data.error || "Validación fallida.");
      }
    } catch {
      setStatus("error");
      setMessage("Error de conexión al servidor.");
    }
  };

  if (!siteKey) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-lg font-bold text-red-700">Falta configuración</h1>
        <p className="mt-2 text-sm">
          Define la variable de entorno <code className="font-mono">NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY</code>
          en tu archivo <code className="font-mono">.env.local</code> y reinicia el servidor de desarrollo.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-lg font-bold">Prueba de Cloudflare Turnstile</h1>
      <p className="mt-2 text-sm text-gray-600">
        Completa el widget y envía el formulario. El servidor validará el token.
      </p>

      {!scriptLoaded && (
        <p className="mt-4 text-sm text-yellow-700">Cargando widget de Turnstile…</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="w-full">
          {scriptLoaded && (
            <div
              className="cf-turnstile"
              data-sitekey={siteKey}
              data-action="contact"
              suppressHydrationWarning
            ></div>
          )}
        </div>

        <button
          type="submit"
          disabled={status === "verifying" || !scriptLoaded}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {!scriptLoaded ? "Cargando…" : status === "verifying" ? "Verificando…" : "Enviar"}
        </button>

        {status === "success" && (
          <p className="text-sm text-green-700">{message}</p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-700">{message}</p>
        )}
      </form>
    </div>
  );
}

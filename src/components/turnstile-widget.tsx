"use client";

import { useEffect, useState, useCallback } from "react";

export interface TurnstileWidgetProps {
  /** Clave pública de Turnstile. Si no se pasa, se lee de NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY. */
  siteKey?: string;
  /** Acción de Turnstile (default: "contact"). */
  action?: string;
  /** Clase CSS adicional para el contenedor del widget. */
  className?: string;
  /** Callback ejecutado al validar el token con éxito. Recibe el token como argumento. */
  onVerify?: (token: string) => void | Promise<void>;
  /** Deshabilita el botón de enviar. */
  disabled?: boolean;
  /** Texto del botón de enviar. */
  verifyButtonLabel?: string;
  /** Texto mostrado mientras carga el script. */
  loadingLabel?: string;
}

/**
 * Componente reutilizable de Cloudflare Turnstile.
 *
 * Encapsula:
 * - Carga del script de Turnstile una sola vez (evita inyección doble aunque se monte dos veces).
 * - Renderizado del widget <div className="cf-turnstile"> con data-sitekey.
 * - Estado de carga, verificación y errores.
 *
 * Diseñado para reutilizarse en el configurador del cliente (Fase 5).
 */
export function TurnstileWidget({
  siteKey: siteKeyProp,
  action = "contact",
  className,
  onVerify,
  disabled = false,
  verifyButtonLabel = "Enviar",
  loadingLabel = "Cargando…",
}: TurnstileWidgetProps) {
  const siteKey = siteKeyProp ?? process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [scriptError, setScriptError] = useState<string | null>(null);

  // ID fijo del script para detectar si ya está inyectado (evita duplicados)
  const scriptId = "turnstile-api";

  useEffect(() => {
    if (!siteKey) {
      setScriptError(
        "Falta NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY en las variables de entorno",
      );
      return;
    }

    // Si el script ya está inyectado (por esta u otra instancia), no inyectar de nuevo
    if (document.getElementById(scriptId)) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      setScriptError("No se pudo cargar el script de Cloudflare Turnstile.");
      setScriptLoaded(false);
    };
    document.head.appendChild(script);

    return () => {
      // No remover el script para no romper widgets existentes de otras instancias
    };
  }, [siteKey]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!onVerify) return;

      setVerifyStatus("verifying");
      setMessage("");

      const form = event.currentTarget;
      const formData = new FormData(form);
      const token = formData.get("cf-turnstile-response") as string;

      if (!token) {
        setVerifyStatus("error");
        setMessage("Completa el widget de Turnstile antes de enviar.");
        return;
      }

      try {
        await onVerify(token);
        setVerifyStatus("success");
        setMessage("Turnstile validado correctamente.");
      } catch {
        setVerifyStatus("error");
        setMessage("Error al validar con el servidor.");
      }
    },
    [onVerify]
  );

  if (!siteKey) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded border border-red-100">
        <p className="text-sm">
          Falta configuración: define la variable de entorno{" "}
          <code className="font-mono">NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY</code>.
        </p>
      </div>
    );
  }

  if (scriptError) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded border border-red-100">
        <p className="text-sm">{scriptError}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={className ?? "w-full"}>
        {!scriptLoaded && (
          <p className="mt-2 text-sm text-yellow-700">{loadingLabel}</p>
        )}
        {scriptLoaded && (
          <div
            className="cf-turnstile"
            data-sitekey={siteKey}
            data-action={action}
            suppressHydrationWarning
          ></div>
        )}
      </div>

      <button
        type="submit"
        disabled={disabled || verifyStatus === "verifying" || !scriptLoaded}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {!scriptLoaded
          ? loadingLabel
          : verifyStatus === "verifying"
            ? "Verificando…"
            : verifyButtonLabel}
      </button>

      {verifyStatus === "success" && (
        <p className="text-sm text-green-700">{message}</p>
      )}
      {verifyStatus === "error" && (
        <p className="text-sm text-red-700">{message}</p>
      )}
    </form>
  );
}

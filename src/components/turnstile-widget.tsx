"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface TurnstileWidgetProps {
  /** Clave pública de Turnstile. Si no se pasa, se lee de NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY. */
  siteKey?: string;
  /** Acción de Turnstile (default: "contact"). */
  action?: string;
  /** Clase CSS adicional para el contenedor del widget. */
  className?: string;
  /** Callback ejecutado cuando Turnstile devuelve un token válido. Recibe el token como argumento. */
  onVerify?: (token: string) => void | Promise<void>;
  /** Deshabilita el widget y el botón de enviar. */
  disabled?: boolean;
  /** Texto del botón de enviar. */
  verifyButtonLabel?: string;
  /** Texto mostrado mientras carga el script. */
  loadingLabel?: string;
}

/** Tipado mínimo de la API global de Cloudflare Turnstile para evitar casts a `any`. */
interface TurnstileRenderOptions {
  sitekey: string;
  action?: string;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
}

interface TurnstileApi {
  render: (
    element: HTMLElement,
    options: TurnstileRenderOptions,
  ) => number;
  remove: (widgetId: number) => void;
  reset: (widgetId: number) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/**
 * Componente reutilizable de Cloudflare Turnstile con renderizado explícito.
 *
 * Usa window.turnstile.render() para evitar condiciones de carrera entre
 * el script y el renderizado automático por data-sitekey.
 *
 * Encapsula:
 * - Carga del script de Turnstile una sola vez (evita inyección doble aunque se monte dos veces).
 * - Renderizado explícito del widget con window.turnstile.render().
 * - Limpieza del widgetId con turnstile.remove() al desmontar.
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

  const widgetRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);

  // ID fijo del script para detectar si ya está inyectado (evita duplicados)
  const scriptId = "turnstile-api";

  // Valores iniciales seguros para el servidor: nunca tocar document ni
  // window en el inicializador de useState (Next.js renderiza en el servidor).
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  // Limpiar el widget al desmontar el componente
  useEffect(() => {
    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignorar errores de limpieza
        }
        widgetIdRef.current = null;
      }
    };
  }, []);

  // Cargar el script de Turnstile una sola vez (solo en el navegador)
  useEffect(() => {
    if (!siteKey) {
      return;
    }

    // Si el script ya está inyectado (por esta u otra instancia), marcarlo
    // como cargado y renderizar el widget directamente. El setState se aplaza
    // con setTimeout para no ejecutarse de forma síncrona dentro del efecto
    // (evita cascadas de render y la regla de lint set-state-in-effect).
    const existente = document.getElementById(scriptId);
    if (existente) {
      setTimeout(() => setScriptLoaded(true), 0);
      if (
        widgetRef.current &&
        widgetIdRef.current === null &&
        window.turnstile
      ) {
        widgetIdRef.current = window.turnstile.render(widgetRef.current, {
          sitekey: siteKey,
          action,
          callback: (token: string) => {
            if (onVerify) {
              setVerifyStatus("verifying");
              setMessage("");
              Promise.resolve(onVerify(token))
                .then(() => {
                  setVerifyStatus("success");
                  setMessage("Turnstile validado correctamente.");
                })
                .catch(() => {
                  setVerifyStatus("error");
                  setMessage("Error al validar con el servidor.");
                });
            }
          },
          "expired-callback": () => {
            setVerifyStatus("idle");
            setMessage("");
            widgetIdRef.current = null;
          },
        });
      }
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setScriptLoaded(true);
      // Renderizar explícitamente el widget una vez cargado el script
      if (widgetRef.current && widgetIdRef.current === null && window.turnstile) {
        widgetIdRef.current = window.turnstile.render(widgetRef.current, {
          sitekey: siteKey,
          action,
          callback: (token: string) => {
            if (onVerify) {
              setVerifyStatus("verifying");
              setMessage("");
              Promise.resolve(onVerify(token))
                .then(() => {
                  setVerifyStatus("success");
                  setMessage("Turnstile validado correctamente.");
                })
                .catch(() => {
                  setVerifyStatus("error");
                  setMessage("Error al validar con el servidor.");
                });
            }
          },
          "expired-callback": () => {
            setVerifyStatus("idle");
            setMessage("");
            widgetIdRef.current = null;
          },
        });
      }
    };
    script.onerror = () => {
      setScriptError("No se pudo cargar el script de Cloudflare Turnstile.");
      setScriptLoaded(false);
    };
    document.head.appendChild(script);

    return () => {
      // No remover el script para no romper widgets existentes de otras instancias
    };
  }, [siteKey, action, onVerify]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!onVerify || !widgetIdRef.current) return;

      setVerifyStatus("verifying");
      setMessage("");

      // Resetear el widget para permitir una nueva verificación
      try {
        window.turnstile?.reset(widgetIdRef.current);
      } catch {
        // Ignorar errores de reset
      }

      // El token llegará por el callback de Turnstile, no por el formulario tradicional
      // Esperamos brevemente a que el callback se dispare
      // Si no llega en 5 segundos, reportamos error
      const timeout = setTimeout(() => {
        if (verifyStatus === "verifying") {
          setVerifyStatus("error");
          setMessage("Tiempo de espera agotado. Intenta de nuevo.");
        }
      }, 5000);

      // Limpiar el timeout cuando cambie el estado
      return () => clearTimeout(timeout);
    },
    [onVerify, verifyStatus],
  );

  // Render condicional al final (todos los hooks ya se ejecutaron arriba)
  if (!siteKey || scriptError) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded border border-red-100">
        <p className="text-sm">
          {!siteKey
            ? "Falta configuración: define la variable de entorno"
            : scriptError}
          {" "}
          {!siteKey ? (
            <code className="font-mono">NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY</code>
          ) : null}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div ref={widgetRef} className={className ?? "w-full"}>
        {!scriptLoaded && (
          <p className="mt-2 text-sm text-yellow-700">{loadingLabel}</p>
        )}
      </div>

      {!scriptLoaded ? (
        <button
          type="button"
          disabled
          className="px-4 py-2 bg-blue-600 text-white rounded opacity-50 cursor-not-allowed"
        >
          {loadingLabel}
        </button>
      ) : (
        <button
          type="submit"
          disabled={disabled || verifyStatus === "verifying"}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {verifyStatus === "verifying" ? "Verificando…" : verifyButtonLabel}
        </button>
      )}

      {verifyStatus === "success" && (
        <p className="text-sm text-green-700">{message}</p>
      )}
      {verifyStatus === "error" && (
        <p className="text-sm text-red-700">{message}</p>
      )}
    </form>
  );
}

"use client";

import { TurnstileWidget } from "@/components/turnstile-widget";

export default function TurnstileTestPage() {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-lg font-bold">Prueba de Cloudflare Turnstile</h1>
      <p className="mt-2 text-sm text-gray-600">
        Completa el widget y envía el formulario. El servidor validará el token.
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
    </div>
  );
}

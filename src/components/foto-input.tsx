"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Componente cliente para input de tipo archivo con vista previa.
 * Diseñado para usarse dentro de un <form action={ServerAction}> de Next.js.
 *
 * Props:
 * - name: name attribute del <input type="file"> (debe coincidir con lo que lee la Server Action)
 * - accept: tipos MIME aceptados (ej. "image/jpeg,image/png,image/webp")
 * - maxSizeMB: tamaño máximo en MB
 * - currentUrl: URL pública de la foto actual (para edición; se muestra como vista previa inicial)
 * - disabled: si el input está deshabilitado
 * - className: clases CSS adicionales para el input
 */
export function FotoInput({
  name = "foto",
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMB = 5,
  currentUrl,
  disabled = false,
  className = "",
}: {
  name?: string;
  accept?: string;
  maxSizeMB?: number;
  currentUrl?: string | null;
  disabled?: boolean;
  className?: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [modificado, setModificado] = useState(false);
  const previewUrlRef = useRef<string | null>(null);

  // Limpiar URL de objeto previa al desmontar
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setError(null);

    if (!file) {
      setPreviewUrl(currentUrl ?? null);
      setModificado(false);
      return;
    }

    // Validar tipo
    const allowedTypes = accept
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!allowedTypes.includes(file.type)) {
      setError(
        "Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG y WebP.",
      );
      event.target.value = "";
      setPreviewUrl(currentUrl ?? null);
      setModificado(false);
      return;
    }

    // Validar tamaño
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(
        `La imagen es demasiado pesada (${(file.size / (1024 * 1024)).toFixed(
          1,
        )} MB). Máximo ${maxSizeMB} MB.`,
      );
      event.target.value = "";
      setPreviewUrl(currentUrl ?? null);
      setModificado(false);
      return;
    }

    // Crear URL de objeto para vista previa
    const newPreview = URL.createObjectURL(file);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = newPreview;

    setPreviewUrl(newPreview);
    setModificado(true);
  };

  const handleEliminar = () => {
    setError(null);
    setPreviewUrl(null);
    setModificado(false);
    // Limpiar el input de archivo
    const input = document.querySelector(`input[name="${name}"]`);
    if (input && input instanceof HTMLInputElement) {
      input.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700 mb-1">
        Fotografía del producto
      </label>
      <input
        type="file"
        name={name}
        accept={accept}
        disabled={disabled}
        onChange={handleFileChange}
        className={`w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
      />
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
          {error}
        </p>
      )}
      {previewUrl && (
        <div className="flex items-center gap-3 mt-2">
          <img
            src={previewUrl}
            alt="Vista previa"
            className="w-24 h-24 object-cover rounded border border-zinc-200"
          />
          <button
            type="button"
            onClick={handleEliminar}
            className="text-sm text-red-600 hover:underline ml-2"
          >
            {modificado ? "Descartar cambios" : "Eliminar foto existente"}
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

/**
 * Paso 8 del configurador: resumen y envío (parte cliente).
 * Recibe la clave de idempotencia generada en el servidor y la envía
 * junto con el formulario al Server Action enviarSolicitud.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { leerBorrador, limpiarBorrador, borradorVacio } from "@/lib/cotizar/store";
import { validarBorradorCompleto, borradorEsValido } from "@/lib/cotizar/validaciones";
import { enviarSolicitud, generarIdempotencyCookie } from "@/app/cotizar/action";

interface ResumenFormProps {
  idempotencyKey: string;
}

export default function ResumenForm({
  idempotencyKey,
}: ResumenFormProps) {
  const router = useRouter();
  // Leer el borrador solo en el cliente para evitar mismatch de hidratación
  // (React #441): en el servidor localStorage no existe y devuelve vacío, en el
  // cliente puede tener datos guardados. La diferencia inicial se silencia con
  // suppressHydrationWarning y se resuelve tras la hidratación.
  const borrador = typeof window !== "undefined" ? leerBorrador() : borradorVacio();
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<boolean>(false);
  const [enviando, setEnviando] = useState<boolean>(false);

  // Establecer la cookie httpOnly con la clave de idempotencia antes de enviar.
  // Se debe hacer desde el cliente porque cookies().set() no está permitido
  // durante el render de un Server Component en Next.js 15.
  useEffect(() => {
    generarIdempotencyCookie(idempotencyKey).catch(() => {
      // Si falla, el envío ya dará error de idempotencia y se mostrará al usuario
    });
  }, [idempotencyKey]);

  const resultados = validarBorradorCompleto(borrador);
  const todosValidos = borradorEsValido(borrador);

  const productos = borrador.productos ?? [];
  const evento = borrador.evento;
  const lugar = borrador.lugar;
  const contacto = borrador.contacto;
  const servicios = borrador.servicios;

  const enviar = async (formData: FormData) => {
    setEnviando(true);
    setErrorEnvio(null);
    try {
      await enviarSolicitud(formData);
      limpiarBorrador();
      setEnviado(true);
    } catch (e) {
      setErrorEnvio(
        e instanceof Error ? e.message : "Error al enviar la solicitud",
      );
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white p-8 rounded-lg border border-zinc-200 shadow-sm text-center">
            <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              ✓
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">
              ¡Solicitud enviada!
            </h1>
            <p className="text-sm text-zinc-600 mb-6">
              Recibirás tu cotización privada por WhatsApp o correo según tu
              canal preferido. El propietario la revisará y aprobará.
            </p>
            <Link
              href="/"
              className="text-sm text-blue-600 hover:underline"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-zinc-50 font-sans py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md mx-auto">
        <nav className="mb-6">
          <Link
            href="/cotizar/contacto"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            ← Volver a contacto
          </Link>
        </nav>

        {!todosValidos && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-semibold text-red-800 mb-2">
              Revisa los siguientes campos antes de enviar:
            </h3>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {resultados.flatMap((r) => r.errores.map((e) => (
                <li key={e}>{`Paso ${r.paso}: ${e}`}</li>
              )))}
            </ul>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            Resumen de tu solicitud
          </h1>
          <p className="text-sm text-zinc-600 mb-6">
            Revisa que todo esté correcto antes de enviar. El propietario
            recalculará el precio final y aprobará tu cotización.
          </p>

          <div className="space-y-4 mb-6">
            <div className="bg-zinc-50 p-3 rounded">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Servicio
              </p>
              <p className="text-sm text-zinc-900">
                {borrador.modalidad === "mesa" ? "Mesa montada" : "Tabla individual"}
              </p>
            </div>

            {evento && (
              <div className="bg-zinc-50 p-3 rounded">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Evento
                </p>
                <p className="text-sm text-zinc-900">
                  {evento.tipo} · {evento.fecha} a las {evento.horario} ·
                  {evento.invitados} invitado(s)
                  {evento.duracion && ` · ${evento.duracion} horas`}
                </p>
              </div>
            )}

            {productos.length > 0 && (
              <div className="bg-zinc-50 p-3 rounded">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Productos ({productos.length})
                </p>
                <ul className="text-sm text-zinc-700 space-y-1">
                  {productos.map((p) => (
                    <li key={p.productoId}>
                      Producto #{p.productoId} × {p.cantidadServida}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {servicios && (
              <div className="bg-zinc-50 p-3 rounded">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Servicios
                </p>
                <ul className="text-sm text-zinc-700 space-y-1">
                  {servicios.montaje && (
                    <li>Montaje: {servicios.montaje.horas} hora(s)</li>
                  )}
                  {servicios.personal && (
                    <li>
                      Personal: {servicios.personal.horas} hora(s) ·
                      {servicios.personal.invitados} invitado(s)
                    </li>
                  )}
                </ul>
              </div>
            )}

            {lugar && (
              <div className="bg-zinc-50 p-3 rounded">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Lugar
                </p>
                <p className="text-sm text-zinc-900">
                  {lugar.direccion} · {lugar.municipio}
                </p>
              </div>
            )}

            {contacto && (
              <div className="bg-zinc-50 p-3 rounded">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Contacto
                </p>
                <p className="text-sm text-zinc-900">
                  {contacto.nombre} · {contacto.telefono} · {contacto.correo} ·
                  {contacto.canalPreferido}
                </p>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg mb-6">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
              Estimado preliminar
            </p>
            <p className="text-sm text-amber-800">
              El precio final lo calcula y aprueba el propietario. Esta es una
              estimación sujeta a revisión.
            </p>
          </div>

          {errorEnvio && (
            <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-700 mb-4">
              {errorEnvio}
            </div>
          )}

          <form action={enviar} className="space-y-3">
            <input name="idempotency_key" defaultValue={idempotencyKey} />
            <input
              name="modalidad"
              defaultValue={borrador.modalidad ?? ""}
            />
            <input name="tipo_evento" defaultValue={evento?.tipo ?? ""} />
            <input name="fecha_evento" defaultValue={evento?.fecha ?? ""} />
            <input name="horario_evento" defaultValue={evento?.horario ?? ""} />
            <input
              name="invitados"
              defaultValue={String(evento?.invitados ?? 0)}
            />
            {evento?.duracion && (
              <input name="duracion" defaultValue={String(evento.duracion)} />
            )}
            {productos.map((p) => (
              <>
                <input name="producto_id[]" defaultValue={String(p.productoId)} />
                <input
                  name="cantidad_servida[]"
                  defaultValue={String(p.cantidadServida)}
                />
              </>
            ))}
            {servicios?.montaje && (
              <input name="montaje_horas" defaultValue={String(servicios.montaje.horas)} />
            )}
            {servicios?.personal && (
              <>
                <input name="personal_horas" defaultValue={String(servicios.personal.horas)} />
                <input
                  name="personal_invitados"
                  defaultValue={String(servicios.personal.invitados)}
                />
              </>
            )}
            <input name="direccion" defaultValue={lugar?.direccion ?? ""} />
            <input name="municipio" defaultValue={lugar?.municipio ?? ""} />
            {lugar?.zonaTransporteId && (
              <input name="zona_transporte_id" defaultValue={String(lugar.zonaTransporteId)} />
            )}
            <input name="cliente_nombre" defaultValue={contacto?.nombre ?? ""} />
            <input name="cliente_telefono" defaultValue={contacto?.telefono ?? ""} />
            <input name="cliente_correo" defaultValue={contacto?.correo ?? ""} />
            <input name="canal_preferido" defaultValue={contacto?.canalPreferido ?? "whatsapp"} />
            <input name="acepta_privacidad" type="checkbox" value="on" defaultChecked={contacto?.aceptaPrivacidad ? true : undefined} />

            <div className="flex items-start gap-2 mb-4">
              <input
                type="checkbox"
                name="acepta_privacidad_checkbox"
                defaultChecked={contacto?.aceptaPrivacidad ? true : undefined}
                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 mt-0.5"
              />
              <label className="text-sm text-zinc-700">
                Acepto el aviso de privacidad y doy consentimiento para ser contactado
              </label>
            </div>

            <div className="pt-4">
              <button
                disabled={enviando || !todosValidos}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enviando ? "Enviando solicitud..." : "Enviar solicitud"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={() => router.push("/cotizar/contacto")}
            className="text-sm text-zinc-600 hover:underline"
          >
            Editar contacto
          </button>
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:underline"
          >
            Cancelar y volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  actualizarEstadoCotizacion,
  aplicarDescuento,
  type EstadoCotizacion,
} from "@/lib/panel/cotizaciones-estados";
import { registrarPago } from "@/lib/panel/cotizaciones-pagos";
import { ESTADOS_COTIZACION } from "@/lib/panel/cotizaciones-estados";

interface JsonContacto {
  nombre?: string | null;
  telefono?: string | null;
  correo?: string | null;
  canal_preferido?: string | null;
  acepta_privacidad?: boolean;
}

interface JsonEvento {
  tipo?: string | null;
  fecha?: string | null;
  horario?: string | null;
  invitados?: number | null;
  duracion?: number | null;
}

interface JsonProductoItem {
  productoId: string | number;
  cantidadServida: number;
}

interface JsonProductos {
  items?: JsonProductoItem[];
}

interface JsonPaquetesServicios {
  montaje?: { horas: number };
  personal?: { horas: number; invitados: number };
  transporte?: { zona_id: number };
}

interface JsonPaquetesLugar {
  direccion?: string | null;
  municipio?: string | null;
  zona_transporte_id?: number | null;
}

interface JsonPaquetes {
  servicios?: JsonPaquetesServicios;
  lugar?: JsonPaquetesLugar;
}

interface CotizacionDetalleProps {
  cotizacion: {
    id: number;
    folio: string | null;
    estado: string;
    datos_cliente: unknown;
    datos_evento: unknown;
    datos_productos: unknown;
    datos_paquetes: unknown;
    total_venta: string | null;
    token: string;
    token_expires_en: string;
    creado_en: string;
    actualizado_en: string;
    descuento_pct?: number | null;
  };
}

/**
 * Detalle y editor de una cotización (parte cliente).
 * Permite al propietario cambiar estado, aplicar descuento y registrar pagos.
 */
export default function CotizacionDetalle({
  cotizacion,
}: CotizacionDetalleProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const datosCliente = cotizacion.datos_cliente as JsonContacto | null;
  const datosEvento = cotizacion.datos_evento as JsonEvento | null;
  const datosProductos = cotizacion.datos_productos as JsonProductos | null;
  const datosPaquetes = cotizacion.datos_paquetes as JsonPaquetes | null;

  const totalVenta = Number(cotizacion.total_venta ?? 0);
  const descuentoActual = cotizacion.descuento_pct ?? 0;
  const totalConDescuento =
    descuentoActual > 0
      ? totalVenta * (1 - descuentoActual / 100)
      : totalVenta;

  const cambiarEstado = async (formData: FormData) => {
    setCargando(true);
    setError(null);
    setExito(null);
    try {
      const id = Number(formData.get("id"));
      const estadoRaw = formData.get("estado") as string;
      if (!ESTADOS_COTIZACION.includes(estadoRaw as EstadoCotizacion)) {
        throw new Error("Estado no válido");
      }
      await actualizarEstadoCotizacion(id, estadoRaw as EstadoCotizacion);
      setExito("Estado actualizado correctamente");
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Error al actualizar el estado",
      );
    } finally {
      setCargando(false);
    }
  };

  const aplicarDescuentoForm = async (formData: FormData) => {
    setCargando(true);
    setError(null);
    setExito(null);
    try {
      const id = Number(formData.get("id"));
      const descuento = Number(formData.get("descuento_pct"));
      if (descuento < 0 || descuento > 100) {
        throw new Error("El descuento debe estar entre 0 y 100");
      }
      await aplicarDescuento(id, descuento);
      setExito("Descuento aplicado correctamente");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al aplicar descuento");
    } finally {
      setCargando(false);
    }
  };

  const registrarPagoForm = async (formData: FormData) => {
    setCargando(true);
    setError(null);
    setExito(null);
    try {
      await registrarPago(formData);
      setExito("Pago registrado correctamente");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al registrar el pago");
    } finally {
      setCargando(false);
    }
  };

  const expiracion = new Date(cotizacion.token_expires_en);
  const vigente = expiracion > new Date();

  return (
    <div className="space-y-6">
      <nav className="mb-4">
        <Link
          href="/panel/cotizaciones"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          ← Volver a cotizaciones
        </Link>
      </nav>

      <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              Cotización {cotizacion.folio ?? "—"}
            </h1>
            <p className="text-sm text-zinc-600">
              Cotización de tablas de charcutería y quesos para eventos
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              vigente
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {vigente ? "Vigente" : "Expirada"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-50 p-3 rounded">
            <p className="text-xs font-semibold text-zinc-500 uppercase">
              Estado actual
            </p>
            <p className="text-sm text-zinc-900 font-medium">
              {cotizacion.estado.replace("_", " ")}
            </p>
          </div>
          <div className="bg-zinc-50 p-3 rounded">
            <p className="text-xs font-semibold text-zinc-500 uppercase">
              Total de venta
            </p>
            <p className="text-sm text-zinc-900 font-medium">
              ${totalVenta.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          {descuentoActual > 0 && (
            <div className="bg-zinc-50 p-3 rounded">
              <p className="text-xs font-semibold text-zinc-500 uppercase">
                Descuento aplicado
              </p>
              <p className="text-sm text-zinc-900 font-medium">
                {descuentoActual}%
              </p>
            </div>
          )}
          <div className="bg-zinc-50 p-3 rounded">
            <p className="text-xs font-semibold text-zinc-500 uppercase">
              Total con descuento
            </p>
            <p className="text-sm text-zinc-900 font-medium">
              ${totalConDescuento.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* Cambio de estado */}
        <div className="bg-white p-4 rounded-lg border border-zinc-200 mb-6">
          <h2 className="text-sm font-semibold text-zinc-700 mb-3">
            Cambiar estado
          </h2>
          <form action={cambiarEstado} className="flex flex-wrap gap-3">
            <input name="id" defaultValue={String(cotizacion.id)} />
            {ESTADOS_COTIZACION.map((estado) => (
              <button
                key={estado}
                type="submit"
                name="estado"
                value={estado}
                disabled={cargando}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  cotizacion.estado === estado
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                {estado.replace("_", " ")}
              </button>
            ))}
          </form>
          {error && (
            <div className="mt-3 p-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}
          {exito && (
            <div className="mt-3 p-3 rounded bg-green-50 border border-green-200 text-sm text-green-700">
              {exito}
            </div>
          )}
        </div>

        {/* Datos del cliente */}
        {datosCliente && (
          <div className="bg-white p-4 rounded-lg border border-zinc-200 mb-6">
            <h2 className="text-sm font-semibold text-zinc-700 mb-3">
              Datos de contacto
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <dt className="text-zinc-500">Nombre</dt>
              <dd className="text-zinc-900">{datosCliente.nombre ?? "—"}</dd>
              <dt className="text-zinc-500">Teléfono</dt>
              <dd className="text-zinc-900">{datosCliente.telefono ?? "—"}</dd>
              <dt className="text-zinc-500">Correo</dt>
              <dd className="text-zinc-900">{datosCliente.correo ?? "—"}</dd>
              <dt className="text-zinc-500">Canal preferido</dt>
              <dd className="text-zinc-900">
                {datosCliente.canal_preferido ?? "—"}
              </dd>
            </dl>
          </div>
        )}

        {/* Datos del evento */}
        {datosEvento && (
          <div className="bg-white p-4 rounded-lg border border-zinc-200 mb-6">
            <h2 className="text-sm font-semibold text-zinc-700 mb-3">
              Datos del evento
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <dt className="text-zinc-500">Tipo</dt>
              <dd className="text-zinc-900">{datosEvento.tipo ?? "—"}</dd>
              <dt className="text-zinc-500">Fecha</dt>
              <dd className="text-zinc-900">{datosEvento.fecha ?? "—"}</dd>
              <dt className="text-zinc-500">Horario</dt>
              <dd className="text-zinc-900">{datosEvento.horario ?? "—"}</dd>
              <dt className="text-zinc-500">Invitados</dt>
              <dd className="text-zinc-900">
                {datosEvento.invitados ?? "—"}
              </dd>
              {datosEvento.duracion && (
                <>
                  <dt className="text-zinc-500">Duración</dt>
                  <dd className="text-zinc-900">
                    {datosEvento.duracion} hora(s)
                  </dd>
                </>
              )}
            </dl>
          </div>
        )}

        {/* Productos */}
        {datosProductos && datosProductos.items && datosProductos.items.length > 0 && (
          <div className="bg-white p-4 rounded-lg border border-zinc-200 mb-6">
            <h2 className="text-sm font-semibold text-zinc-700 mb-3">
              Productos ({datosProductos.items.length})
            </h2>
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-3 py-2 text-zinc-500 font-semibold">
                    Producto
                  </th>
                  <th className="px-3 py-2 text-zinc-500 font-semibold text-right">
                    Cantidad
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {datosProductos.items.map((item, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-zinc-900">
                      Producto {item.productoId}
                    </td>
                    <td className="px-3 py-2 text-zinc-900 text-right">
                      {item.cantidadServida}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Servicios y lugar */}
        {datosPaquetes && (
          <div className="bg-white p-4 rounded-lg border border-zinc-200 mb-6">
            <h2 className="text-sm font-semibold text-zinc-700 mb-3">
              Servicios y lugar
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {datosPaquetes.servicios?.montaje && (
                <>
                  <dt className="text-zinc-500">Montaje</dt>
                  <dd className="text-zinc-900">
                    {datosPaquetes.servicios.montaje.horas} hora(s)
                  </dd>
                </>
              )}
              {datosPaquetes.servicios?.personal && (
                <>
                  <dt className="text-zinc-500">Personal</dt>
                  <dd className="text-zinc-900">
                    {datosPaquetes.servicios.personal.horas} hora(s) ·
                    {datosPaquetes.servicios.personal.invitados} invitado(s)
                  </dd>
                </>
              )}
              {datosPaquetes.lugar && (
                <>
                  <dt className="text-zinc-500">Dirección</dt>
                  <dd className="text-zinc-900">
                    {datosPaquetes.lugar.direccion ?? "—"}
                  </dd>
                  <dt className="text-zinc-500">Municipio</dt>
                  <dd className="text-zinc-900">
                    {datosPaquetes.lugar.municipio ?? "—"}
                  </dd>
                </>
              )}
            </dl>
          </div>
        )}

        {/* Aplicar descuento */}
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
          <h2 className="text-sm font-semibold text-amber-800 mb-3">
            Aplicar descuento (solo propietario)
          </h2>
          <form action={aplicarDescuentoForm} className="flex flex-wrap gap-3">
            <input name="id" defaultValue={String(cotizacion.id)} />
            <div className="flex items-center gap-2">
              <label className="text-sm text-zinc-700">Descuento %</label>
              <input
                name="descuento_pct"
                type="number"
                step="0.01"
                min="0"
                max="100"
                defaultValue={String(descuentoActual)}
                className="w-20 border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={cargando}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              Aplicar
            </button>
          </form>
        </div>

        {/* Registro de pago */}
        <div className="bg-white p-4 rounded-lg border border-zinc-200 mb-6">
          <h2 className="text-sm font-semibold text-zinc-700 mb-3">
            Registrar pago
          </h2>
          <form action={registrarPagoForm} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input name="cotizacion_id" defaultValue={String(cotizacion.id)} />
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Monto
              </label>
              <input
                name="monto"
                type="number"
                step="0.01"
                required
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Método
              </label>
              <select
                name="metodo"
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="transferencia">Transferencia</option>
                <option value="efectivo">Efectivo</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Referencia
              </label>
              <input
                name="referencia"
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Comprobante (URL)
              </label>
              <input
                name="comprobante"
                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="col-span-1 sm:col-span-1 flex items-end">
              <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="es_anticipo"
                  defaultChecked={false}
                  className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                Es anticipo
              </label>
            </div>
            <div className="col-span-1 sm:col-span-1 flex items-end">
              <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="verificar"
                  defaultChecked={false}
                  className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                Verificar pago
              </label>
              <p className="text-xs text-zinc-500 mt-1">
                Solo propietario puede verificar
              </p>
            </div>
            <div className="col-span-1 sm:col-span-1">
              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                Registrar
              </button>
            </div>
          </form>
        </div>

        {/* Enlace público de la cotización */}
        <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 mb-6">
          <h2 className="text-sm font-semibold text-zinc-700 mb-3">
            Enlace privado para el cliente
          </h2>
          <p className="text-sm text-zinc-600 mb-2">
            Comparte este enlace con el cliente para que pueda ver su cotización.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              defaultValue={`/cotizaciones/${cotizacion.token}`}
              className="flex-1 border border-zinc-300 rounded px-3 py-2 text-sm text-zinc-900 bg-white"
            />
            <Link
              href={`/cotizaciones/${cotizacion.token}`}
              className="text-sm text-blue-600 hover:underline px-3 py-2"
            >
              Abrir
            </Link>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            El enlace expira el {new Date(cotizacion.token_expires_en).toLocaleDateString("es-MX")}.
          </p>
        </div>
      </div>
    </div>
  );
}

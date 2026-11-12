/**
 * Store del borrador de cotización del cliente.
 *
 * El estado se persiste en localStorage del navegador para que sobrevivan
 * recargas entre los pasos del configurador (Fase 5). Nunca se envía al
 * servidor hasta el paso final de envío, donde la acción de servidor
 * recalcula todo con el motor de precios y costos privados.
 *
 * Costos y márgenes nunca viajan a este store: solo cantidades, IDs de
 * productos/zonas y datos de contacto del cliente.
 */

export const BORRADOR_KEY = "charcuteria_borrador_cotizacion";

export type Modalidad = "tabla" | "mesa";
export type CanalPreferido = "whatsapp" | "correo" | "ambos";
export type PuntoPartida = "paquete" | "cero";

export interface DatosEvento {
  tipo: string;
  fecha: string;
  horario: string;
  invitados: number;
  duracion?: number; // horas, solo aplica a mesa montada
}

export interface ProductoSeleccionado {
  productoId: number;
  cantidadServida: number;
}

export interface DatosServicios {
  montaje?: { horas: number };
  personal?: { horas: number; invitados: number };
}

export interface DatosLugar {
  direccion: string;
  municipio: string;
  zonaTransporteId?: number;
}

export interface DatosContacto {
  nombre: string;
  telefono: string;
  correo: string;
  canalPreferido: CanalPreferido;
  aceptaPrivacidad: boolean;
}

export interface BorradorCotizacion {
  paso: number;
  modalidad?: Modalidad;
  evento?: DatosEvento;
  puntoPartida?: PuntoPartida;
  paqueteId?: number;
  productos?: ProductoSeleccionado[];
  servicios?: DatosServicios;
  lugar?: DatosLugar;
  contacto?: DatosContacto;
}

export function borradorVacio(): BorradorCotizacion {
  return { paso: 1 };
}

/** Lee el borrador desde localStorage. Retorna vacío si no existe o está corrupto. */
export function leerBorrador(): BorradorCotizacion {
  if (typeof window === "undefined") return borradorVacio();
  try {
    const raw = localStorage.getItem(BORRADOR_KEY);
    if (!raw) return borradorVacio();
    return JSON.parse(raw) as BorradorCotizacion;
  } catch {
    return borradorVacio();
  }
}

/** Guarda el borrador en localStorage y dispara evento para sincronizar pestañas. */
export function guardarBorrador(borrador: BorradorCotizacion): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BORRADOR_KEY, JSON.stringify(borrador));
  window.dispatchEvent(new Event("borrador-cambiado"));
}

/** Limpia el borrador (después de un envío exitoso). */
export function limpiarBorrador(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BORRADOR_KEY);
  window.dispatchEvent(new Event("borrador-cambiado"));
}

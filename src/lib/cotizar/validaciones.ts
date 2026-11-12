/**
 * Validaciones del configurador del cliente (Fase 5).
 *
 * Todas son PENDIENTE-DUEÑO: los valores mínimos, máximos, anticipación
 * mínima y perfiles de consumo son datos del negocio que el dueño configura.
 * En pruebas se usan datos ficticios etiquetados. Nada de esto se inventa
 * en el código; los valores por defecto son marcadores de posición.
 */

import type { BorradorCotizacion, DatosEvento } from "./store";

/** Errores de validación por paso. */
export interface ValidacionPaso {
  paso: number;
  valido: boolean;
  errores: string[];
  advertencias: string[];
}

/** Parámetros de negocio configurables (PENDIENTE-DUEÑO). */
const REGLAS_NEGOCIO = {
  /** Pedido mínimo de invitados por servicio. */
  invitadosMinimos: 1,
  /** Pedido máximo de invitados por servicio. */
  invitadosMaximos: 200,
  /** Anticipación mínima en días antes del evento. */
  anticipacionMinimaDias: 2,
  /** Holgura del estimado preliminar (porcentaje sobre el total calculado). */
  holguraEstimadoPct: 10,
} as const;

/**
 * Valida el paso 2 (evento): tipo, fecha, horario, invitados y duración.
 */
export function validarEvento(
  evento: DatosEvento | undefined,
): { valido: boolean; errores: string[]; advertencias: string[] } {
  const errores: string[] = [];
  const advertencias: string[] = [];

  if (!evento?.tipo) {
    errores.push("Selecciona el tipo de evento");
  }

  if (!evento?.fecha) {
    errores.push("Selecciona la fecha del evento");
  } else {
    const fechaEvento = new Date(evento.fecha);
    fechaEvento.setHours(0, 0, 0, 0);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diferenciaDias = Math.ceil(
      (fechaEvento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diferenciaDias < REGLAS_NEGOCIO.anticipacionMinimaDias) {
      errores.push(
        `La fecha debe ser con al menos ${REGLAS_NEGOCIO.anticipacionMinimaDias} días de anticipación`,
      );
    }
  }

  if (!evento?.horario) {
    errores.push("Selecciona el horario del evento");
  }

  if (!evento?.invitados || evento.invitados < REGLAS_NEGOCIO.invitadosMinimos) {
    errores.push(
      `Mínimo ${REGLAS_NEGOCIO.invitadosMinimos} invitado(s) por servicio`,
    );
  }

  if (
    evento?.invitados &&
    evento.invitados > REGLAS_NEGOCIO.invitadosMaximos
  ) {
    errores.push(
      `Máximo ${REGLAS_NEGOCIO.invitadosMaximos} invitado(s) por servicio`,
    );
  }

  if (evento?.tipo === "mesa" && !evento.duracion) {
    advertencias.push(
      "Indica la duración de la mesa para calcular montaje y personal",
    );
  }

  return {
    valido: errores.length === 0,
    errores,
    advertencias,
  };
}

/**
 * Valida el paso 4 (ingredientes): al menos un producto activo y cantidades positivas.
 */
export function validarIngredientes(
  productos: BorradorCotizacion["productos"] | undefined,
): { valido: boolean; errores: string[]; advertencias: string[] } {
  const errores: string[] = [];
  const advertencias: string[] = [];

  if (!productos || productos.length === 0) {
    errores.push("Agrega al menos un producto al carrito");
    return { valido: false, errores, advertencias };
  }

  for (const p of productos) {
    if (!p.cantidadServida || p.cantidadServida <= 0) {
      errores.push(`Cantidad inválida para el producto ${p.productoId}`);
    }
  }

  return { valido: errores.length === 0, errores, advertencias };
}

/**
 * Valida el paso 6 (lugar): dirección y municipio requeridos.
 */
export function validarLugar(
  lugar: BorradorCotizacion["lugar"] | undefined,
): { valido: boolean; errores: string[]; advertencias: string[] } {
  const errores: string[] = [];
  const advertencias: string[] = [];

  if (!lugar?.direccion?.trim()) {
    errores.push("Ingresa la dirección del evento");
  }

  if (!lugar?.municipio?.trim()) {
    errores.push("Selecciona el municipio");
  }

  if (!lugar?.zonaTransporteId) {
    advertencias.push(
      "El municipio no tiene zona de transporte asignada; la solicitud requiere evaluación",
    );
  }

  return { valido: errores.length === 0, errores, advertencias };
}

/**
 * Valida el paso 7 (contacto): nombre, teléfono, correo y aceptación de privacidad.
 */
export function validarContacto(
  contacto: BorradorCotizacion["contacto"] | undefined,
): { valido: boolean; errores: string[]; advertencias: string[] } {
  const errores: string[] = [];
  const advertencias: string[] = [];

  if (!contacto?.nombre?.trim()) {
    errores.push("Ingresa tu nombre");
  }

  if (!contacto?.telefono?.trim()) {
    errores.push("Ingresa tu teléfono");
  }

  if (!contacto?.correo?.trim()) {
    errores.push("Ingresa tu correo electrónico");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto.correo)) {
    errores.push("Correo electrónico inválido");
  }

  if (!contacto?.aceptaPrivacidad) {
    errores.push("Debes aceptar el aviso de privacidad");
  }

  return { valido: errores.length === 0, errores, advertencias };
}

/**
 * Valida todo el borrador antes del envío. Retorna errores consolidados por paso.
 */
export function validarBorradorCompleto(
  borrador: BorradorCotizacion,
): ValidacionPaso[] {
  const resultados: ValidacionPaso[] = [];

  // Paso 1: modalidad
  const erroresModalidad: string[] = [];
  if (!borrador.modalidad) {
    erroresModalidad.push("Selecciona tabla individual o mesa montada");
  }
  resultados.push({
    paso: 1,
    valido: erroresModalidad.length === 0,
    errores: erroresModalidad,
    advertencias: [],
  });

  // Paso 2: evento
  const eventoVal = validarEvento(borrador.evento);
  resultados.push({
    paso: 2,
    valido: eventoVal.valido,
    errores: eventoVal.errores,
    advertencias: eventoVal.advertencias,
  });

  // Paso 3: punto de partida
  const erroresPuntoPartida: string[] = [];
  if (!borrador.puntoPartida) {
    erroresPuntoPartida.push("Selecciona un paquete o armado desde cero");
  }
  if (borrador.puntoPartida === "paquete" && !borrador.paqueteId) {
    erroresPuntoPartida.push("Selecciona un paquete");
  }
  resultados.push({
    paso: 3,
    valido: erroresPuntoPartida.length === 0,
    errores: erroresPuntoPartida,
    advertencias: [],
  });

  // Paso 4: ingredientes
  const ingredientesVal = validarIngredientes(borrador.productos);
  resultados.push({
    paso: 4,
    valido: ingredientesVal.valido,
    errores: ingredientesVal.errores,
    advertencias: ingredientesVal.advertencias,
  });

  // Paso 5: servicios (opcional, sin errores obligatorios)
  resultados.push({
    paso: 5,
    valido: true,
    errores: [],
    advertencias: [],
  });

  // Paso 6: lugar
  const lugarVal = validarLugar(borrador.lugar);
  resultados.push({
    paso: 6,
    valido: lugarVal.valido,
    errores: lugarVal.errores,
    advertencias: lugarVal.advertencias,
  });

  // Paso 7: contacto
  const contactoVal = validarContacto(borrador.contacto);
  resultados.push({
    paso: 7,
    valido: contactoVal.valido,
    errores: contactoVal.errores,
    advertencias: contactoVal.advertencias,
  });

  return resultados;
}

/** Retorna true si todos los pasos son válidos. */
export function borradorEsValido(borrador: BorradorCotizacion): boolean {
  return validarBorradorCompleto(borrador).every((r) => r.valido);
}

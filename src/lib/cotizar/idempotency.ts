/**
 * Utilidades de idempotencia para el configurador del cliente (Fase 5).
 *
 * Este archivo NO tiene "use server": generarIdempotencyKey es una función
 * pura y síncrona. Se importa tanto en Server Components (resumen/page.tsx)
 * como en Server Actions (action.ts) sin ser tratada como Server Action.
 */

/**
 * Genera una clave de idempotencia en el servidor (criptográficamente segura).
 * El cliente no la genera: la recibe oculta en el formulario y la devuelve.
 * El servidor valida que coincida con la cookie httpOnly antes de aceptar.
 */
export function generarIdempotencyKey(): string {
  return `idem-${crypto.randomUUID()}`;
}

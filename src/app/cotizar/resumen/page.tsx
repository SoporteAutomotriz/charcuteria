/**
 * Paso 8 del configurador: resumen y envío (wrapper servidor).
 *
 * Genera la clave de idempotencia en el servidor (criptográficamente segura)
 * y la pasa al formulario cliente. El cliente nunca genera la clave.
 */

import { generarIdempotencyKey } from "../action";
import ResumenForm from "./resumen-form";

export default async function ResumenPage() {
  const idempotencyKey = generarIdempotencyKey();

  return <ResumenForm idempotencyKey={idempotencyKey} />;
}

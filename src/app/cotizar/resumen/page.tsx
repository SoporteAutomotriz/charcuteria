/**
 * Paso 8 del configurador: resumen y envío (wrapper servidor).
 *
 * Genera la clave de idempotencia en el servidor (criptográficamente segura)
 * y la pasa al cliente. La cookie httpOnly se establece mediante el Server
 * Action `generarIdempotencyCookie` invocado desde el cliente al montar.
 */

import { generarIdempotencyKey } from "@/lib/cotizar/idempotency";
import ResumenForm from "./resumen-form";

export default async function ResumenPage() {
  const idempotencyKey = generarIdempotencyKey();

  return <ResumenForm idempotencyKey={idempotencyKey} />;
}

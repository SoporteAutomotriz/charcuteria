/**
 * Paso 8 del configurador: resumen y envío (wrapper servidor).
 *
 * Genera la clave de idempotencia en el servidor (criptográficamente segura)
 * y la almacena en una cookie httpOnly para que el cliente no pueda
 * falsificarla. El cliente recibe la clave oculta en el formulario y la
 * devuelve; el servidor valida que coincida con la cookie antes de aceptar.
 */

import { cookies } from "next/headers";
import { generarIdempotencyKey } from "@/lib/cotizar/idempotency";
import ResumenForm from "./resumen-form";

export default async function ResumenPage() {
  const cookieStore = await cookies();
  const idempotencyKey = generarIdempotencyKey();

  cookieStore.set("idempotency_key", idempotencyKey, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 minutos
  });

  return <ResumenForm idempotencyKey={idempotencyKey} />;
}

/**
 * Paso 8 del configurador: resumen y envío (wrapper servidor).
 *
 * Genera la clave de idempotencia en el servidor (criptográficamente segura)
 * y la pasa al cliente. La cookie httpOnly se establece mediante el Server
 * Action `generarIdempotencyCookie` invocado desde el cliente al montar.
 */

import { generarIdempotencyKey } from "@/lib/cotizar/idempotency";
import ResumenForm from "./resumen-form";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function ResumenPage() {
  const idempotencyKey = generarIdempotencyKey();

  // Establecer la cookie httpOnly desde el servidor (Server Component),
  // no desde un efecto del cliente. Así la cookie ya existe cuando el
  // navegador monta el formulario y la envía junto con el input hidden,
  // sin depender de que un useEffect gane una carrera contra el envío.
  // Cada render del servidor genera una clave nueva para ese intento de
  // envío, por lo que navegaciones hacia atrás/adelante no desincronizan
  // la clave del formulario con la cookie.
  const cookieStore = await cookies();
  cookieStore.set("idempotency_key", idempotencyKey, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 minutos
  });

  return <ResumenForm idempotencyKey={idempotencyKey} />;
}

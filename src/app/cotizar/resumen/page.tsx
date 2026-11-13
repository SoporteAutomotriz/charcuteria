/**
 * Paso 8 del configurador: resumen y envío (wrapper servidor).
 *
 * Lee la clave de idempotencia ya establecida por el middleware cuando el
 * cliente entró al flujo de armado (/cotizar). La clave se genera una sola
 * vez y se guarda como cookie httpOnly que sobrevive a recargas y
 * navegaciones. El formulario de envío simplemente la reutiliza sin
 * regenerarla ni sincronizarla desde el navegador (sin useEffect).
 */

import { cookies } from "next/headers";
import ResumenForm from "./resumen-form";

export const dynamic = "force-dynamic";

export default async function ResumenPage() {
  const cookieStore = await cookies();
  const idempotencyKey =
    cookieStore.get("idempotency_key")?.value ?? "";

  return <ResumenForm idempotencyKey={idempotencyKey} />;
}

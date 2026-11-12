import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase con service_role para operaciones de servidor que
 * necesitan leer tablas privadas (costos, márgenes) sin un usuario autenticado.
 *
 * Se usa SOLO en endpoints de servidor que devuelven datos seguros al cliente
 * (precios de venta, nunca costos ni márgenes internos).
 *
 * La variable SUPABASE_SERVICE_ROLE_KEY debe estar configurada en el entorno
 * del servidor (Vercel). Nunca se expone al navegador.
 */
export async function createAdminClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Falta variable de entorno NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!supabaseKey) {
    throw new Error("Falta variable de entorno SUPABASE_SERVICE_ROLE_KEY");
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // No-op en Server Components de Next.js
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // No-op
        }
      },
    },
  });
}

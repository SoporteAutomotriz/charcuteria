import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para el navegador (Client Components).
 * Solo se usa en páginas de auth del panel (login). Nunca expone
 * costos ni márgenes; solo autentica al personal.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

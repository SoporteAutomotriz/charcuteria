import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

export const createClient = cache(async () => {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Falta variable de entorno NEXT_PUBLIC_SUPABASE_URL en el servidor");
  }
  if (!supabaseKey) {
    throw new Error("Falta variable de entorno NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en el servidor");
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // El `set` puede fallar en Server Components de Next.js
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // El `remove` puede fallar en Server Components de Next.js
          }
        },
      },
    }
  );
});

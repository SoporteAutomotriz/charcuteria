"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Cierra la sesión del usuario en el panel y redirige al login.
 * Server Action: se ejecuta solo en el servidor.
 */
export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/panel/auth/signin");
}

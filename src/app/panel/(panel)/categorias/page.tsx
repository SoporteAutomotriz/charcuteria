"use server";

import { redirect } from "next/navigation";
import { getPanelSession } from "@/lib/auth/server";

export default async function CategoriasPage() {
  const session = await getPanelSession();

  // La sección de categorías está deshabilitada en el panel para todos los roles.
  // Ningún usuario del panel debe acceder a esta vista.
  if (!session) {
    redirect("/panel/auth/signin");
  }
  redirect("/panel");
}

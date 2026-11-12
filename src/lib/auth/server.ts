import { createClient } from "@/lib/supabase/server";

/**
 * Obtiene la sesión del usuario autenticado y su rol en usuarios_personal.
 * Solo para usar en Server Components del panel (never en el navegador).
 *
 * Retorna null si no hay sesión activa o el usuario no tiene perfil.
 */
export async function getPanelSession() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: perfil, error: perfilError } = await supabase
    .from("usuarios_personal")
    .select("rol, email, nombre, activo")
    .eq("id", user.id)
    .single();

  if (perfilError || !perfil || !perfil.activo) {
    return null;
  }

  return {
    user,
    rol: perfil.rol,
    email: perfil.email,
    nombre: perfil.nombre,
  };
}

/**
 * Verifica que el usuario tenga rol de propietario o administrador.
 * Lanza error si no hay sesión o no tiene permiso.
 */
export async function requirePanelAccess() {
  const session = await getPanelSession();

  if (!session) {
    throw new Error("No hay sesión de panel activa");
  }

  if (session.rol !== "propietario" && session.rol !== "administrador") {
    throw new Error("Acceso denegado: rol insuficiente para el panel");
  }

  return session;
}

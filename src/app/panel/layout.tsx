import { redirect } from "next/navigation";
import { getPanelSession } from "@/lib/auth/server";
import { signout } from "@/app/panel/auth/signout/action";

/**
 * Layout protegido del panel del propietario.
 * Solo usuarios con rol propietario o administrador pueden acceder.
 * Se ejecuta en el servidor; nunca expone costos ni márgenes al navegador.
 */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getPanelSession();

  if (!session) {
    redirect("/panel/auth/signin");
  }

  return (
    <div className="min-h-full bg-zinc-50 font-sans">
      <header className="border-b border-zinc-200 bg-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900">Charcutería</span>
              <span className="text-sm text-zinc-500">Panel del propietario</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-600">
                {session.rol === "propietario" ? "Propietario" : "Administrador"}
              </span>
              <span className="text-sm text-zinc-600">{session.email}</span>
              <form
                action={signout}
                method="POST"
                className="inline"
              >
                <button
                  type="submit"
                  className="text-sm text-red-600 hover:underline"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}

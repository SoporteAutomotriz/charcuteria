"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface PanelMenuProps {
  rol: "propietario" | "administrador";
}

type NavItem = {
  href: string;
  label: string;
  soloPropietario?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/panel", label: "Inicio" },
  { href: "/panel/cotizaciones", label: "Cotizaciones" },
  { href: "/panel/productos", label: "Productos" },
  { href: "/panel/paquetes", label: "Paquetes" },
  { href: "/panel/tarifas", label: "Tarifas" },
  { href: "/panel/parametros", label: "Parámetros", soloPropietario: true },
];

function estaActivo(href: string, pathname: string): boolean {
  if (href === "/panel") {
    return pathname === "/panel";
  }
  return pathname.startsWith(href);
}

export default function PanelMenu({ rol }: PanelMenuProps) {
  // TEMPORAL: debug de rol
  // eslint-disable-next-line no-console
  console.log("[DEBUG PanelMenu] rol recibido =", JSON.stringify(rol));
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-200 bg-white" aria-label="Navegación del panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-1">
          {NAV_ITEMS.filter((item) => !item.soloPropietario || rol === "propietario").map((item) => {
            const activo = estaActivo(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  activo
                    ? "px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    : "px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 rounded-md"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

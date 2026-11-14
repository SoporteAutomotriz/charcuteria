"use client";

/**
 * Paso 4 del configurador: selección de ingredientes.
 * Muestra productos por categoría con botones +/- y un carrito fijo con el
 * estimado en vivo. Los precios vienen del endpoint público /api/precios-venta
 * (sin costos ni márgenes internos).
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBorrador, guardarBorrador, type ProductoSeleccionado } from "@/lib/cotizar/store";
import CarritoFijo from "@/components/carrito-fijo";

interface ProductoOpcion {
  id: number;
  nombre: string;
  categoria: string | null;
  activo: boolean;
  /** Porción de referencia por persona en gramos (ej. 30, 40, 25). */
  porcion_referencia_persona: number | null;
}

interface CategoriaOpcion {
  id: number;
  nombre: string;
}

export default function IngredientesPage() {
  const router = useRouter();
  // useSyncExternalStore lee localStorage de forma segura con hidratación:
  // servidor renderiza vacío, cliente se sincroniza tras hidratación sin
  // setState en efectos ni mismatch (React #441).
  const borrador = useBorrador();
  const [productos, setProductos] = useState<ProductoOpcion[]>([]);
  const [categorias, setCategorias] = useState<CategoriaOpcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todos");
  const [carrito, setCarrito] = useState<ProductoSeleccionado[]>(
    borrador.productos ?? [],
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/productos-publicos").then((r) => r.json()),
      fetch("/api/categorias-publicas").then((r) => r.json()),
    ])
      .then(([prods, cats]) => {
        setProductos(prods as ProductoOpcion[]);
        setCategorias(cats as CategoriaOpcion[]);
        setCargando(false);
      })
      .catch(() => {
        setCargando(false);
      });
  }, []);

  const productosFiltrados =
    categoriaFiltro === "todos"
      ? productos
      : productos.filter(
          (p) => p.categoria === categoriaFiltro || String(p.id) === categoriaFiltro,
        );

  const invitados = borrador.evento?.invitados ?? 1;

  /** Calcula la cantidad inicial sugerida: porción por persona × invitados.
   *  La porción viene en gramos; se asume unidad de venta en kg (÷1000).
   *  Si no hay porción configurada ni invitados, se usa 1 como fallback.
   */
  const cantidadInicial = (p: ProductoOpcion): number => {
    if (!p.porcion_referencia_persona || !invitados) return 1;
    return Math.round((p.porcion_referencia_persona * invitados) / 1000 * 100) / 100;
  };

  const cantidadDe = (id: number) =>
    carrito.find((p) => p.productoId === id)?.cantidadServida ?? 0;

  const agregar = (id: number) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.productoId === id);
      if (existe) {
        return prev.map((p) =>
          p.productoId === id ? { ...p, cantidadServida: p.cantidadServida + 1 } : p,
        );
      }
      const producto = productos.find((p) => p.id === id);
      return [
        ...prev,
        {
          productoId: id,
          cantidadServida: producto
            ? cantidadInicial(producto)
            : 1,
        },
      ];
    });
  };

  const quitar = (id: number) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.productoId === id);
      if (!existe) return prev;
      if (existe.cantidadServida <= 1) {
        return prev.filter((p) => p.productoId !== id);
      }
      return prev.map((p) =>
        p.productoId === id ? { ...p, cantidadServida: p.cantidadServida - 1 } : p,
      );
    });
  };

  const guardarYAvanzar = () => {
    const cambios = {
      ...borrador,
      paso: 5,
      productos: carrito,
    };
    guardarBorrador(cambios);
    router.push("/cotizar/servicios");
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <p className="text-sm text-zinc-500">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-4">
          <a
            href="/cotizar/paquete"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            ← Volver a punto de partida
          </a>
        </nav>

        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200">
            <h1 className="text-xl font-bold text-zinc-900 mb-1">
              Ingredientes
            </h1>
            <p className="text-sm text-zinc-600">
              Elige los productos y cantidades. El estimado se actualiza en vivo.
            </p>
          </div>

          <div className="p-4">
            <div className="flex gap-2 mb-4">
              <label className="text-xs font-medium text-zinc-500">Categoría:</label>
              <div className="flex gap-2 overflow-x-auto">
                <button
                  onClick={() => setCategoriaFiltro("todos")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    categoriaFiltro === "todos"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  Todas
                </button>
                {categorias.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategoriaFiltro(String(c.id))}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      categoriaFiltro === String(c.id)
                        ? "bg-blue-100 text-blue-700"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    {c.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {productosFiltrados.length === 0 && (
                <p className="col-span-full text-sm text-zinc-500 text-center py-8">
                  No hay productos disponibles en esta categoría
                </p>
              )}
              {productosFiltrados.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-zinc-200 rounded-lg p-3 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-semibold text-zinc-900">
                      {p.nombre}
                    </span>
                    {!p.activo && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                        Agotado
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 mb-3 flex-1">
                    {p.categoria ?? "Sin categoría"}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => quitar(p.id)}
                        disabled={!p.activo || cantidadDe(p.id) <= 0}
                        className="w-8 h-8 rounded border border-zinc-300 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-zinc-900">
                        {cantidadDe(p.id)}
                      </span>
                      <button
                        onClick={() => agregar(p.id)}
                        disabled={!p.activo}
                        className="w-8 h-8 rounded border border-zinc-300 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-zinc-200">
            <CarritoFijo />
          </div>

          <div className="p-4 border-t border-zinc-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.push("/cotizar/paquete")}
              className="text-sm text-zinc-600 hover:underline"
            >
              Atrás
            </button>
            <button
              onClick={guardarYAvanzar}
              disabled={carrito.length === 0}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

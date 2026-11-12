import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  obtenerPreciosVenta,
  calcularSubtotalVenta,
  type PrecioVentaProducto,
} from "./estimado";

/**
 * Pruebas del módulo estimado del cliente (Fase 5).
 *
 * calcularSubtotalVenta es pura y totalmente testeable.
 * obtenerPreciosVenta hace fetch al endpoint público; se testa con fetch
 * mockeado (no se llama a Supabase ni a red real).
 */

const preciosEjemplo: PrecioVentaProducto[] = [
  { productoId: 1, nombre: "Queso manchego", categoriaId: 1, precioVenta: "120.00", activo: true },
  { productoId: 2, nombre: "Jamón serrano", categoriaId: 2, precioVenta: "250.50", activo: true },
  { productoId: 3, nombre: "Aceitunas", categoriaId: 1, precioVenta: "45.00", activo: true },
];

describe("calcularSubtotalVenta", () => {
  it("calcula el subtotal correcto de varios productos", () => {
    const precios: Record<number, PrecioVentaProducto> = {};
    for (const p of preciosEjemplo) precios[p.productoId] = p;

    const productos = [
      { productoId: 1, cantidadServida: 2 },
      { productoId: 2, cantidadServida: 1 },
      { productoId: 3, cantidadServida: 4 },
    ];

    const subtotal = calcularSubtotalVenta(precios, productos);
    // 2*120.00 + 1*250.50 + 4*45.00 = 240 + 250.50 + 180 = 670.50
    expect(subtotal).toBe("670.50");
  });

  it("ignora productos que no tienen precio", () => {
    const precios: Record<number, PrecioVentaProducto> = {
      1: preciosEjemplo[0],
    };

    const subtotal = calcularSubtotalVenta(precios, [
      { productoId: 1, cantidadServida: 2 },
      { productoId: 999, cantidadServida: 10 },
    ]);
    expect(subtotal).toBe("240.00");
  });

  it("lista vacía retorna 0.00", () => {
    const precios: Record<number, PrecioVentaProducto> = {};
    expect(calcularSubtotalVenta(precios, [])).toBe("0.00");
  });

  it("cantidad 0 no aporta al total", () => {
    const precios: Record<number, PrecioVentaProducto> = {
      1: preciosEjemplo[0],
    };
    expect(calcularSubtotalVenta(precios, [{ productoId: 1, cantidadServida: 0 }])).toBe("0.00");
  });

  it("mantiene 2 decimales en el resultado", () => {
    const precios: Record<number, PrecioVentaProducto> = {
      1: { ...preciosEjemplo[0], precioVenta: "100.005" },
    };
    const subtotal = calcularSubtotalVenta(precios, [{ productoId: 1, cantidadServida: 1 }]);
    expect(subtotal).toMatch(/\.\d{2}$/);
  });
});

describe("obtenerPreciosVenta", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna los precios de venta del endpoint público", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => preciosEjemplo,
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const precios = await obtenerPreciosVenta();
    expect(precios).toEqual(preciosEjemplo);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const urlCalled = (fetchMock as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(String(urlCalled)).toContain("/api/precios-venta");
  });

  it("lanza error si el endpoint no responde ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    await expect(obtenerPreciosVenta()).rejects.toThrow(
      /Error al obtener precios de venta/
    );
  });

  it("usa cache no-store en el fetch", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    await obtenerPreciosVenta();
    const options = (fetchMock as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(options).toMatchObject({ cache: "no-store" });
  });
});

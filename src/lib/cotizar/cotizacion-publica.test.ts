import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Pruebas de obtenerCotizacionPublica (Fase 5).
 *
 * Esta función llama a Supabase con createClient. Como requiere una
 * instancia real de Supabase, estas pruebas verifican el comportamiento
 * de selección de columnas (no expone datos_cliente) y el filtro por token
 * mediante mock del cliente de Supabase. La integración real contra
 * Supabase requiere variables de entorno y se deja para el entorno de
 * pruebas del dueño.
 */

type MockSelectArgs = string[];
type MockEqArgs = [string, string];

let capturedSelectArgs: MockSelectArgs | null = null;
let capturedEqArgs: MockEqArgs | null = null;

const mockSingle = vi.fn();

// Interceptamos el módulo de supabase/server con encadenamiento
// from → select(columnas) → eq(columna, valor) → single()
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    from: () => ({
      select: (columnas: string) => {
        capturedSelectArgs = columnas.split(", ").map((c) => c.trim());
        return {
          eq: (columna: string, valor: string) => {
            capturedEqArgs = [columna, valor];
            return {
              single: mockSingle,
            };
          },
        };
      },
    }),
  }),
}));

vi.stubGlobal("fetch", vi.fn());

beforeEach(() => {
  vi.resetAllMocks();
  capturedSelectArgs = null;
  capturedEqArgs = null;
});

describe("obtenerCotizacionPublica", () => {
  it("no selecciona datos_cliente (no expone contacto del cliente)", async () => {
    mockSingle.mockResolvedValue({ data: null, error: null });

    const { obtenerCotizacionPublica } = await import("./cotizacion-publica");
    await obtenerCotizacionPublica("token-ficticio");

    expect(capturedSelectArgs).toBeDefined();
    expect(capturedSelectArgs).not.toContain("datos_cliente");
    expect(capturedSelectArgs).toContain("folio");
    expect(capturedSelectArgs).toContain("estado");
    expect(capturedSelectArgs).toContain("datos_evento");
    expect(capturedSelectArgs).toContain("datos_productos");
    expect(capturedSelectArgs).toContain("datos_paquetes");
    expect(capturedSelectArgs).toContain("total_venta");
    expect(capturedSelectArgs).toContain("token_expires_en");
  });

  it("filtra por token", async () => {
    mockSingle.mockResolvedValue({ data: null, error: null });

    const { obtenerCotizacionPublica } = await import("./cotizacion-publica");
    await obtenerCotizacionPublica("mi-token-123");

    expect(capturedEqArgs).toEqual(["token", "mi-token-123"]);
  });

  it("retorna null si hay error de Supabase", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "no encontrado" },
    });

    const { obtenerCotizacionPublica } = await import("./cotizacion-publica");
    const resultado = await obtenerCotizacionPublica("token-inexistente");
    expect(resultado).toBeNull();
  });

  it("retorna null si el token ha expirado", async () => {
    const pasado = new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString();
    mockSingle.mockResolvedValue({
      data: { folio: "CS-2026-0001", token_expires_en: pasado },
      error: null,
    });

    const { obtenerCotizacionPublica } = await import("./cotizacion-publica");
    const resultado = await obtenerCotizacionPublica("token-expirado");
    expect(resultado).toBeNull();
  });

  it("retorna los datos si el token está vigente", async () => {
    const futuro = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString();
    const datosEsperados = {
      folio: "CS-2026-0001",
      estado: "recibida",
      datos_evento: { tipo: "cumpleaños", invitados: 50 },
      datos_productos: { items: [{ productoId: 1, cantidadServida: 2 }] },
      datos_paquetes: {},
      total_venta: "1200.00",
      token_expires_en: futuro,
    };
    mockSingle.mockResolvedValue({ data: datosEsperados, error: null });

    const { obtenerCotizacionPublica } = await import("./cotizacion-publica");
    const resultado = await obtenerCotizacionPublica("token-valido");
    expect(resultado).toEqual(datosEsperados);
  });
});

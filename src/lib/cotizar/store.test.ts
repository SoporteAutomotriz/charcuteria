import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  leerBorrador,
  guardarBorrador,
  limpiarBorrador,
  borradorVacio,
  BORRADOR_KEY,
  type BorradorCotizacion,
} from "./store";

/**
 * Pruebas del store del borrador de cotización (Fase 5).
 *
 * El store persiste en localStorage del navegador. jsdom provee
 * localStorage, por lo que no se necesita Supabase ni red.
 */

describe("store del borrador (Fase 5)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("borradorVacio retorna un borrador con paso 1 y sin datos", () => {
    const b = borradorVacio();
    expect(b.paso).toBe(1);
    expect(b.modalidad).toBeUndefined();
    expect(b.evento).toBeUndefined();
    expect(b.productos).toBeUndefined();
    expect(b.contacto).toBeUndefined();
  });

  it("guardarBorrador y leerBorrador persisten y recuperan un borrador completo", () => {
    const borrador: BorradorCotizacion = {
      paso: 4,
      modalidad: "mesa",
      evento: {
        tipo: "cumpleaños",
        fecha: "2026-12-15",
        horario: "19:00",
        invitados: 50,
        duracion: 3,
      },
      puntoPartida: "paquete",
      paqueteId: 2,
      productos: [
        { productoId: 10, cantidadServida: 3 },
        { productoId: 11, cantidadServida: 1 },
      ],
      servicios: {
        montaje: { horas: 2 },
        personal: { horas: 2, invitados: 50 },
      },
      lugar: {
        direccion: "Av. Siempre Viva 123",
        municipio: "Monterrey",
        zonaTransporteId: 5,
      },
      contacto: {
        nombre: "Juan Pérez",
        telefono: "5551234567",
        correo: "juan@example.com",
        canalPreferido: "whatsapp",
        aceptaPrivacidad: true,
      },
    };

    guardarBorrador(borrador);

    const leído = leerBorrador();
    expect(leído).toEqual(borrador);
    expect(localStorage.getItem(BORRADOR_KEY)).toBe(
      JSON.stringify(borrador)
    );
  });

  it("leerBorrador retorna vacío cuando no hay nada guardado", () => {
    const leído = leerBorrador();
    expect(leído).toEqual(borradorVacio());
  });

  it("leerBorrador retorna vacío si el contenido de localStorage está corrupto", () => {
    localStorage.setItem(BORRADOR_KEY, "{no es json válido");
    const leído = leerBorrador();
    expect(leído).toEqual(borradorVacio());
  });

  it("limpiarBorrador elimina el borrador de localStorage", () => {
    guardarBorrador(borradorVacio());
    expect(localStorage.getItem(BORRADOR_KEY)).not.toBeNull();

    limpiarBorrador();
    expect(localStorage.getItem(BORRADOR_KEY)).toBeNull();
  });

  it("guardarBorrador no falla en entorno sin window (SSR)", () => {
    const originalWindow = globalThis.window as Window | undefined;
    // simulamos ausencia de window para SSR
    delete (globalThis as { window?: Window }).window;

    // Antes no hay nada guardado
    expect(localStorage.getItem(BORRADOR_KEY)).toBeNull();

    // guardarBorrador no debe lanzar ni escribir nada
    expect(() => guardarBorrador(borradorVacio())).not.toThrow();
    expect(localStorage.getItem(BORRADOR_KEY)).toBeNull();

    // Restaurar
    ;(globalThis as { window?: Window }).window = originalWindow;
  });

  it("leerBorrador no falla en entorno sin window (SSR)", () => {
    const originalWindow = globalThis.window as Window | undefined;
    // simulamos ausencia de window para SSR
    delete (globalThis as { window?: Window }).window;

    const leído = leerBorrador();
    expect(leído).toEqual(borradorVacio());

    // Restaurar
    ;(globalThis as { window?: Window }).window = originalWindow;
  });
});

import { describe, it, expect } from "vitest";
import {
  validarEvento,
  validarIngredientes,
  validarLugar,
  validarContacto,
  validarBorradorCompleto,
  borradorEsValido,
} from "./validaciones";
import type { BorradorCotizacion, DatosEvento } from "./store";

/**
 * Pruebas de validaciones del configurador del cliente (Fase 5).
 *
 * Todas las funciones son puras; no requieren Supabase ni red.
 * Los valores de REGLAS_NEGOCIO son PENDIENTE-DUEÑO (marcadores de
 * posición), por lo que las pruebas los asumen tal como están definidos
 * en el código fuente.
 */

const eventoBase: DatosEvento = {
  tipo: "cumpleaños",
  fecha: "2026-12-15",
  horario: "19:00",
  invitados: 50,
  duracion: 3,
};

const fechaHoyISO = () => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return hoy.toISOString().split("T")[0];
};

describe("validarEvento (paso 2)", () => {
  it("evento válido no produce errores", () => {
    const r = validarEvento(eventoBase);
    expect(r.valido).toBe(true);
    expect(r.errores).toEqual([]);
  });

  it("falta tipo produce error", () => {
    const r = validarEvento({ ...eventoBase, tipo: "" });
    expect(r.valido).toBe(false);
    expect(r.errores).toContain("Selecciona el tipo de evento");
  });

  it("falta fecha produce error", () => {
    const r = validarEvento({ ...eventoBase, fecha: "" });
    expect(r.valido).toBe(false);
    expect(r.errores).toContain("Selecciona la fecha del evento");
  });

  it("fecha con menos de 2 días de anticipación produce error", () => {
    const r = validarEvento({ ...eventoBase, fecha: fechaHoyISO() });
    expect(r.valido).toBe(false);
    expect(r.errores.some((e) => e.includes("anticipación"))).toBe(true);
  });

  it("falta horario produce error", () => {
    const r = validarEvento({ ...eventoBase, horario: "" });
    expect(r.valido).toBe(false);
    expect(r.errores).toContain("Selecciona el horario del evento");
  });

  it("invitados 0 produce error (mínimo 1)", () => {
    const r = validarEvento({ ...eventoBase, invitados: 0 });
    expect(r.valido).toBe(false);
    expect(r.errores.some((e) => e.includes("Mínimo"))).toBe(true);
  });

  it("invitados 201 produce error (máximo 200)", () => {
    const r = validarEvento({ ...eventoBase, invitados: 201 });
    expect(r.valido).toBe(false);
    expect(r.errores.some((e) => e.includes("Máximo"))).toBe(true);
  });

  it("tipo mesa sin duración produce advertencia (no error)", () => {
    const r = validarEvento({ ...eventoBase, tipo: "mesa", duracion: undefined });
    expect(r.valido).toBe(true);
    expect(r.advertencias.some((e) => e.includes("duración"))).toBe(true);
  });

  it("evento undefined produce errores", () => {
    const r = validarEvento(undefined);
    expect(r.valido).toBe(false);
    expect(r.errores.length).toBeGreaterThan(0);
  });
});

describe("validarIngredientes (paso 4)", () => {
  it("lista vacía produce error", () => {
    const r = validarIngredientes([]);
    expect(r.valido).toBe(false);
    expect(r.errores).toContain("Agrega al menos un producto al carrito");
  });

  it("undefined produce error", () => {
    const r = validarIngredientes(undefined);
    expect(r.valido).toBe(false);
  });

  it("productos con cantidades válidas pasa", () => {
    const r = validarIngredientes([
      { productoId: 1, cantidadServida: 2 },
      { productoId: 2, cantidadServida: 1 },
    ]);
    expect(r.valido).toBe(true);
  });

  it("cantidad 0 produce error", () => {
    const r = validarIngredientes([
      { productoId: 1, cantidadServida: 0 },
    ]);
    expect(r.valido).toBe(false);
    expect(r.errores.some((e) => e.includes("Cantidad inválida"))).toBe(true);
  });

  it("cantidad negativa produce error", () => {
    const r = validarIngredientes([
      { productoId: 1, cantidadServida: -1 },
    ]);
    expect(r.valido).toBe(false);
  });
});

describe("validarLugar (paso 6)", () => {
  it("lugar válido pasa", () => {
    const r = validarLugar({
      direccion: "Av. Siempre Viva 123",
      municipio: "Monterrey",
      zonaTransporteId: 5,
    });
    expect(r.valido).toBe(true);
  });

  it("falta dirección produce error", () => {
    const r = validarLugar({ direccion: "", municipio: "Monterrey" });
    expect(r.valido).toBe(false);
    expect(r.errores).toContain("Ingresa la dirección del evento");
  });

  it("falta municipio produce error", () => {
    const r = validarLugar({ direccion: "Av. 123", municipio: "" });
    expect(r.valido).toBe(false);
    expect(r.errores).toContain("Selecciona el municipio");
  });

  it("sin zonaTransporteId produce advertencia (no error)", () => {
    const r = validarLugar({
      direccion: "Av. 123",
      municipio: "Monterrey",
    });
    expect(r.valido).toBe(true);
    expect(r.advertencias.some((e) => e.includes("zona de transporte"))).toBe(
      true
    );
  });

  it("undefined no lanza, retorna inválido", () => {
    const r = validarLugar(undefined);
    expect(r.valido).toBe(false);
  });
});

describe("validarContacto (paso 7)", () => {
  const contactoBase = {
    nombre: "Juan Pérez",
    telefono: "5551234567",
    correo: "juan@example.com",
    canalPreferido: "whatsapp" as const,
    aceptaPrivacidad: true,
  };

  it("contacto válido pasa", () => {
    const r = validarContacto(contactoBase);
    expect(r.valido).toBe(true);
  });

  it("falta nombre produce error", () => {
    const r = validarContacto({ ...contactoBase, nombre: "" });
    expect(r.valido).toBe(false);
    expect(r.errores).toContain("Ingresa tu nombre");
  });

  it("falta teléfono produce error", () => {
    const r = validarContacto({ ...contactoBase, telefono: "" });
    expect(r.valido).toBe(false);
    expect(r.errores).toContain("Ingresa tu teléfono");
  });

  it("falta correo produce error", () => {
    const r = validarContacto({ ...contactoBase, correo: "" });
    expect(r.valido).toBe(false);
    expect(r.errores).toContain("Ingresa tu correo electrónico");
  });

  it("correo inválido produce error", () => {
    const r = validarContacto({
      ...contactoBase,
      correo: "no-es-un-correo",
    });
    expect(r.valido).toBe(false);
    expect(r.errores).toContain("Correo electrónico inválido");
  });

  it("sin aceptar privacidad produce error", () => {
    const r = validarContacto({ ...contactoBase, aceptaPrivacidad: false });
    expect(r.valido).toBe(false);
    expect(r.errores).toContain("Debes aceptar el aviso de privacidad");
  });

  it("undefined no lanza, retorna inválido", () => {
    const r = validarContacto(undefined);
    expect(r.valido).toBe(false);
  });
});

describe("validarBorradorCompleto (todos los pasos)", () => {
  const borradorCompleto: BorradorCotizacion = {
    paso: 7,
    modalidad: "mesa",
    evento: eventoBase,
    puntoPartida: "paquete",
    paqueteId: 2,
    productos: [{ productoId: 1, cantidadServida: 2 }],
    servicios: { montaje: { horas: 2 } },
    lugar: {
      direccion: "Av. 123",
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

  it("borrador completo retorna todos los pasos válidos", () => {
    const resultados = validarBorradorCompleto(borradorCompleto);
    expect(resultados).toHaveLength(7);
    expect(resultados.every((r) => r.valido)).toBe(true);
    expect(resultados.every((r) => r.errores.length === 0)).toBe(true);
  });

  it("borrador vacío retorna pasos inválidos", () => {
    const resultados = validarBorradorCompleto(borradorVacioHelper());
    expect(resultados.some((r) => !r.valido)).toBe(true);
  });
});

describe("borradorEsValido", () => {
  it("retorna true para borrador completo y válido", () => {
    const borrador: BorradorCotizacion = {
      paso: 7,
      modalidad: "mesa",
      evento: eventoBase,
      puntoPartida: "paquete",
      paqueteId: 2,
      productos: [{ productoId: 1, cantidadServida: 2 }],
      lugar: {
        direccion: "Av. 123",
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
    expect(borradorEsValido(borrador)).toBe(true);
  });

  it("retorna false si falta modalidad", () => {
    const borrador: BorradorCotizacion = {
      paso: 1,
      evento: eventoBase,
    };
    expect(borradorEsValido(borrador)).toBe(false);
  });

  it("retorna false si falta contacto", () => {
    const borrador: BorradorCotizacion = {
      paso: 7,
      modalidad: "mesa",
      evento: eventoBase,
      puntoPartida: "paquete",
      paqueteId: 2,
      productos: [{ productoId: 1, cantidadServida: 2 }],
      lugar: {
        direccion: "Av. 123",
        municipio: "Monterrey",
      },
    };
    expect(borradorEsValido(borrador)).toBe(false);
  });
});

function borradorVacioHelper(): BorradorCotizacion {
  return { paso: 1 };
}

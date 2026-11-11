import { describe, it, expect } from "vitest";
import { cotizar, paraCliente } from "./motor";
import {
  casoSimple,
  casoConPrecioFijo,
  casoConMargenCategoria,
  casoConMargenGlobal,
  casoMultiItem,
  ESPERADOS,
} from "./casos-prueba";

describe("Motor de precios determinista (Fase 3)", () => {
  describe("caso simple — margen propio del producto", () => {
    it("calcula precio de venta e IVA al centavo", () => {
      const salida = cotizar(casoSimple());
      const cliente = paraCliente(salida);
      expect(cliente).toEqual(ESPERADOS["caso simple"]);
    });
  });

  describe("caso con precio fijo manual", () => {
    it("precio fijo prevalece sobre cualquier margen", () => {
      const salida = cotizar(casoConPrecioFijo());
      const cliente = paraCliente(salida);
      expect(cliente).toEqual(ESPERADOS["caso con precio fijo"]);
    });
  });

  describe("caso con margen de categoría", () => {
    it("usa el margen de la categoría cuando no hay margen propio", () => {
      const salida = cotizar(casoConMargenCategoria());
      const cliente = paraCliente(salida);
      expect(cliente).toEqual(ESPERADOS["caso con margen de categoría"]);
    });
  });

  describe("caso con margen global", () => {
    it("usa el margen global como último recurso de precedencia", () => {
      const salida = cotizar(casoConMargenGlobal());
      const cliente = paraCliente(salida);
      expect(cliente).toEqual(ESPERADOS["caso con margen global"]);
    });
  });

  describe("caso multi item", () => {
    it("suma líneas y totales correctamente", () => {
      const salida = cotizar(casoMultiItem());
      const cliente = paraCliente(salida);
      expect(cliente).toEqual(ESPERADOS["caso multi item"]);
    });
  });

  describe("vista para el cliente", () => {
    it("no expone costos ni márgenes internos", () => {
      const salida = cotizar(casoSimple());
      const cliente = paraCliente(salida);

      // La salida del cliente solo tiene datos de venta, nunca de costo.
      for (const linea of cliente.lineas) {
        expect(linea.precioVentaLinea).toBeDefined();
        expect(linea.totalLinea).toBeDefined();
        // Estas claves no deben existir en la vista del cliente:
        expect(
          (linea as unknown as Record<string, unknown>)["costoLinea"],
        ).toBeUndefined();
        expect(
          (linea as unknown as Record<string, unknown>)[
            "costoUnitarioCompra"
          ],
        ).toBeUndefined();
        expect(
          (linea as unknown as Record<string, unknown>)[
            "margenAplicadoPct"
          ],
        ).toBeUndefined();
      }
      expect(
        (cliente as unknown as Record<string, unknown>)["subtotalCosto"],
      ).toBeUndefined();
    });
  });

  describe("errores de validación", () => {
    it("rechaza cantidad servida cero o negativa", () => {
      const entrada = casoSimple();
      entrada.items[0].cantidadServida = "0";
      expect(() => cotizar(entrada)).toThrow(/mayor a cero/);
    });

    it("rechaza merma del 100 % o más (rendimiento nulo)", () => {
      const entrada = casoSimple();
      entrada.costosPrivados["queso-manchego"].merma = "1";
      expect(() => cotizar(entrada)).toThrow(/rendimiento/);
    });

    it("rechaza margen fuera de 0-95 %", () => {
      const entrada = casoSimple();
      entrada.costosPrivados["queso-manchego"].margenPropioPct = "100";
      expect(() => cotizar(entrada)).toThrow(/entre 0 y 95/);
    });

    it("lanza error si falta el costo privado de un producto", () => {
      const entrada = casoSimple();
      delete entrada.costosPrivados["queso-manchego"];
      expect(() => cotizar(entrada)).toThrow(
        /No hay datos de costo privados/,
      );
    });
  });
});

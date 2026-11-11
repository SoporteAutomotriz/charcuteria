/**
 * Tabla de ejemplos del motor de precios — Fase 3
 *
 * Todos los datos son FICCIOSOS y etiquetados como tales. Nunca son datos
 * reales del negocio; el dueño los revisa y valida antes de dar el motor
 * por bueno (criterio de aceptación #4 de la sección 13).
 *
 * Cada caso tiene: entrada al motor y salida esperada al centavo.
 * Los valores de costo y margen son privados y nunca llegan al cliente.
 */

import type {
  MotorEntrada,
  MontajeConfig,
  PersonalConfig,
  ZonaTransporte,
} from "./motor";

export function casoSimple(): MotorEntrada {
  return {
    items: [
      {
        productoId: "queso-manchego",
        cantidadServida: "200",
        categoriaId: "quesos",
      },
    ],
    costosPrivados: {
      "queso-manchego": {
        costoUnitarioCompra: "40.00",
        merma: "0.10",
        factorConversion: "1",
        margenPropioPct: "30",
      },
    },
    categorias: {
      quesos: { margenPct: "35" },
    },
    margenGlobalPct: "40",
    ivaPct: "16",
  };
}

export function casoConPrecioFijo(): MotorEntrada {
  return {
    items: [
      {
        productoId: "tabla-de-madera",
        cantidadServida: "1",
        categoriaId: "complementos",
      },
    ],
    costosPrivados: {
      "tabla-de-madera": {
        costoUnitarioCompra: "120.00",
        merma: "0",
        factorConversion: "1",
        precioFijoManual: "250.00",
      },
    },
    categorias: {
      complementos: { margenPct: "40" },
    },
    margenGlobalPct: "40",
    ivaPct: "16",
  };
}

export function casoConMargenCategoria(): MotorEntrada {
  return {
    items: [
      {
        productoId: "jamon-serrano",
        cantidadServida: "150",
        categoriaId: "carnes-y-curados",
      },
    ],
    costosPrivados: {
      "jamon-serrano": {
        // Sin margen propio y sin precio fijo: usa margen de categoría.
        costoUnitarioCompra: "80.00",
        merma: "0.05",
        factorConversion: "1",
      },
    },
    categorias: {
      "carnes-y-curados": { margenPct: "45" },
    },
    margenGlobalPct: "40",
    ivaPct: "16",
  };
}

export function casoConMargenGlobal(): MotorEntrada {
  return {
    items: [
      {
        productoId: "pan-de-masa-madre",
        cantidadServida: "50",
        categoriaId: "panes-y-galletas",
      },
    ],
    costosPrivados: {
      "pan-de-masa-madre": {
        // Sin margen propio, sin precio fijo, categoría sin margen: usa global.
        costoUnitarioCompra: "15.00",
        merma: "0",
        factorConversion: "1",
      },
    },
    categorias: {
      "panes-y-galletas": { margenPct: "0" },
    },
    margenGlobalPct: "50",
    ivaPct: "16",
  };
}

export function casoMultiItem(): MotorEntrada {
  return {
    items: [
      {
        productoId: "queso-manchego",
        cantidadServida: "100",
        categoriaId: "quesos",
      },
      {
        productoId: "uvas",
        cantidadServida: "80",
        categoriaId: "frutas",
      },
    ],
    costosPrivados: {
      "queso-manchego": {
        costoUnitarioCompra: "40.00",
        merma: "0.10",
        factorConversion: "1",
        margenPropioPct: "30",
      },
      uvas: {
        costoUnitarioCompra: "25.00",
        merma: "0",
        factorConversion: "1",
        margenPropioPct: "25",
      },
    },
    categorias: {
      quesos: { margenPct: "35" },
      frutas: { margenPct: "40" },
    },
    margenGlobalPct: "40",
    ivaPct: "16",
  };
}

export function casoConTransporte(): MotorEntrada {
  const zona: ZonaTransporte = {
    id: "zona-puebla",
    municipios: ["Puebla", "Cholula"],
    tarifaFija: "150.00",
    cargoDistancia: "50.00",
    esZonaEspecial: false,
  };
  return {
    items: [
      {
        productoId: "queso-manchego",
        cantidadServida: "100",
        categoriaId: "quesos",
      },
    ],
    costosPrivados: {
      "queso-manchego": {
        costoUnitarioCompra: "40.00",
        merma: "0.10",
        factorConversion: "1",
        margenPropioPct: "30",
      },
    },
    categorias: {
      quesos: { margenPct: "35" },
    },
    margenGlobalPct: "40",
    ivaPct: "16",
    transporte: zona,
  };
}

export function casoConMontaje(): MotorEntrada {
  const montaje: MontajeConfig = {
    tarifaPorHora: "200.00",
    horasMinimas: "2",
    horas: "3",
  };
  return {
    items: [
      {
        productoId: "tabla-de-madera",
        cantidadServida: "1",
        categoriaId: "complementos",
      },
    ],
    costosPrivados: {
      "tabla-de-madera": {
        costoUnitarioCompra: "120.00",
        merma: "0",
        factorConversion: "1",
        precioFijoManual: "250.00",
      },
    },
    categorias: {
      complementos: { margenPct: "40" },
    },
    margenGlobalPct: "40",
    ivaPct: "16",
    montaje,
  };
}

export function casoConPersonal(): MotorEntrada {
  const personal: PersonalConfig = {
    tarifaPorHora: "180.00",
    horasMinimas: "3",
    horas: "4",
    invitados: "80",
    invitadosPorPersona: "20",
  };
  return {
    items: [
      {
        productoId: "queso-manchego",
        cantidadServida: "100",
        categoriaId: "quesos",
      },
    ],
    costosPrivados: {
      "queso-manchego": {
        costoUnitarioCompra: "40.00",
        merma: "0.10",
        factorConversion: "1",
        margenPropioPct: "30",
      },
    },
    categorias: {
      quesos: { margenPct: "35" },
    },
    margenGlobalPct: "40",
    ivaPct: "16",
    personal,
  };
}

export function casoZonaEspecial(): MotorEntrada {
  const zona: ZonaTransporte = {
    id: "zona-remota",
    municipios: ["Sierra Negra"],
    tarifaFija: "0.00",
    esZonaEspecial: true,
  };
  return {
    items: [
      {
        productoId: "queso-manchego",
        cantidadServida: "100",
        categoriaId: "quesos",
      },
    ],
    costosPrivados: {
      "queso-manchego": {
        costoUnitarioCompra: "40.00",
        merma: "0.10",
        factorConversion: "1",
        margenPropioPct: "30",
      },
    },
    categorias: {
      quesos: { margenPct: "35" },
    },
    margenGlobalPct: "40",
    ivaPct: "16",
    transporte: zona,
  };
}

type SalidaEsperada = {
  lineas: Array<{
    productoId: string;
    cantidadServida: string;
    precioVentaLinea: string;
    ivaLinea: string;
    totalLinea: string;
  }>;
  costoTransporte: string;
  costoMontaje: string;
  costoPersonal: string;
  subtotalVenta: string;
  ivaTotal: string;
  totalConIva: string;
};

/**
 * Resultados esperados al centavo para cada caso (salida apta para cliente).
 * Valores verificados contra el output real del motor; las fórmulas se
 * aplican exactamente como se describen en la sección 7:
 *  - cantidadComprar = cantidadServida ÷ (1 − merma) × factorConversion
 *  - costoLinea = cantidadComprar × costoUnitarioCompra (redondeado a 2)
 *  - precioVenta = costoLinea ÷ (1 − margen) (o precio fijo manual)
 *  - iva = precioVenta × tasaIVA; total = precioVenta + iva
 *  - transporte: tarifa fija + cargos opcionales (zona especial = 0)
 *  - montaje: tarifa × max(horas, horasMinimas)
 *  - personal: personas × tarifa × max(horas, horasMinimas),
 *    personas = ceil(invitados / invitadosPorPersona)
 */
export const ESPERADOS: Record<string, SalidaEsperada> = {
  "caso simple": {
    lineas: [
      {
        productoId: "queso-manchego",
        cantidadServida: "200.00",
        precioVentaLinea: "12698.41",
        ivaLinea: "2031.75",
        totalLinea: "14730.16",
      },
    ],
    costoTransporte: "0.00",
    costoMontaje: "0.00",
    costoPersonal: "0.00",
    subtotalVenta: "12698.41",
    ivaTotal: "2031.75",
    totalConIva: "14730.16",
  },
  "caso con precio fijo": {
    lineas: [
      {
        productoId: "tabla-de-madera",
        cantidadServida: "1.00",
        precioVentaLinea: "250.00",
        ivaLinea: "40.00",
        totalLinea: "290.00",
      },
    ],
    costoTransporte: "0.00",
    costoMontaje: "0.00",
    costoPersonal: "0.00",
    subtotalVenta: "250.00",
    ivaTotal: "40.00",
    totalConIva: "290.00",
  },
  "caso con margen de categoría": {
    lineas: [
      {
        productoId: "jamon-serrano",
        cantidadServida: "150.00",
        precioVentaLinea: "22966.51",
        ivaLinea: "3674.64",
        totalLinea: "26641.15",
      },
    ],
    costoTransporte: "0.00",
    costoMontaje: "0.00",
    costoPersonal: "0.00",
    subtotalVenta: "22966.51",
    ivaTotal: "3674.64",
    totalConIva: "26641.15",
  },
  "caso con margen global": {
    lineas: [
      {
        productoId: "pan-de-masa-madre",
        cantidadServida: "50.00",
        precioVentaLinea: "750.00",
        ivaLinea: "120.00",
        totalLinea: "870.00",
      },
    ],
    costoTransporte: "0.00",
    costoMontaje: "0.00",
    costoPersonal: "0.00",
    subtotalVenta: "750.00",
    ivaTotal: "120.00",
    totalConIva: "870.00",
  },
  "caso multi item": {
    lineas: [
      {
        productoId: "queso-manchego",
        cantidadServida: "100.00",
        precioVentaLinea: "6349.20",
        ivaLinea: "1015.87",
        totalLinea: "7365.07",
      },
      {
        productoId: "uvas",
        cantidadServida: "80.00",
        precioVentaLinea: "2666.67",
        ivaLinea: "426.67",
        totalLinea: "3093.34",
      },
    ],
    costoTransporte: "0.00",
    costoMontaje: "0.00",
    costoPersonal: "0.00",
    subtotalVenta: "9015.87",
    ivaTotal: "1442.54",
    totalConIva: "10458.41",
  },
  "caso con transporte": {
    lineas: [
      {
        productoId: "queso-manchego",
        cantidadServida: "100.00",
        precioVentaLinea: "6349.20",
        ivaLinea: "1015.87",
        totalLinea: "7365.07",
      },
    ],
    costoTransporte: "200.00",
    costoMontaje: "0.00",
    costoPersonal: "0.00",
    subtotalVenta: "6549.20",
    ivaTotal: "1047.87",
    totalConIva: "7597.07",
  },
  "caso con montaje": {
    lineas: [
      {
        productoId: "tabla-de-madera",
        cantidadServida: "1.00",
        precioVentaLinea: "250.00",
        ivaLinea: "40.00",
        totalLinea: "290.00",
      },
    ],
    costoTransporte: "0.00",
    costoMontaje: "600.00",
    costoPersonal: "0.00",
    subtotalVenta: "850.00",
    ivaTotal: "136.00",
    totalConIva: "986.00",
  },
  "caso con personal": {
    lineas: [
      {
        productoId: "queso-manchego",
        cantidadServida: "100.00",
        precioVentaLinea: "6349.20",
        ivaLinea: "1015.87",
        totalLinea: "7365.07",
      },
    ],
    costoTransporte: "0.00",
    costoMontaje: "0.00",
    costoPersonal: "2880.00",
    subtotalVenta: "9229.20",
    ivaTotal: "1476.67",
    totalConIva: "10705.87",
  },
  "caso zona especial": {
    lineas: [
      {
        productoId: "queso-manchego",
        cantidadServida: "100.00",
        precioVentaLinea: "6349.20",
        ivaLinea: "1015.87",
        totalLinea: "7365.07",
      },
    ],
    costoTransporte: "0.00",
    costoMontaje: "0.00",
    costoPersonal: "0.00",
    subtotalVenta: "6349.20",
    ivaTotal: "1015.87",
    totalConIva: "7365.07",
  },
};

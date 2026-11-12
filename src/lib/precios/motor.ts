import Big from "big.js";

// ============================================================================
// Motor de precios determinista — Fase 3
//
// Módulo puro de TypeScript, sin IA y sin dependencia de Supabase ni Next.js.
// Todo el dinero se maneja con aritmética decimal exacta (big.js), nunca
// flotantes. El servidor es la única fuente de verdad; el navegador solo
// muestra lo que el servidor decide enviar.
//
// Reglas (sección 7 de la especificación):
//  - Cantidad a comprar = cantidad servida ÷ rendimiento; rendimiento = 1 − merma.
//  - Costo del ingrediente = cantidad a comprar (unidad de compra) × costo unitario.
//  - Precio de venta = costo ÷ (1 − margen); margen bruto entre 0 % y 95 %.
//  - Precedencia del margen: precio fijo manual > margen propio > margen de
//    categoría > margen global.
//  - El IVA se aplica después del precio de venta.
//  - Cada línea se redondea a 2 decimales; el total es la suma de las líneas.
//  - Transporte, montaje y personal son cargos de servicio que se suman al
//    precio de venta sin margen adicional (el dueño configura tarifas desde
//    el panel en Fase 4; aquí solo se aplican las fórmulas).
// ============================================================================

// Precisión interna para divisiones. big.js ya usa por defecto DP = 20 y
// RM = RoundHalfUp, que son adecuados para dinero. El modo de redondeo
// comercial definitivo es PENDIENTE-DUEÑO (sección 7).
Big.DP = 20;

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type Money = string; // decimal con 2 decimales, ej. "125.50"

export interface ProductoEntrada {
  productoId: string;
  /** Cantidad servida en unidad de venta (ej. rebanadas, piezas). */
  cantidadServida: string;
  /** Categoría del producto (para precedencia de margen por categoría). */
  categoriaId: string;
}

/** Datos privados de costo por producto. Nunca salen del servidor. */
export interface CostoProductoPrivado {
  /** Costo de compra por unidad de compra (privado). */
  costoUnitarioCompra: string;
  /** Merma estimada (0 a 1); rendimiento = 1 − merma. */
  merma: string;
  /** Factor de conversión: unidades de compra por unidad de venta. */
  factorConversion: string;
  /** Margen propio del producto (0 a 100), opcional. */
  margenPropioPct?: string;
  /** Precio fijo manual; si existe, prevalece sobre cualquier margen. */
  precioFijoManual?: string;
}

export interface CategoriaParametros {
  /** Margen de categoría (0 a 100), usado si no hay margen propio. */
  margenPct: string;
}

export interface ZonaTransporte {
  id: string;
  municipios: string[];
  /** Tarifa fija de la zona. */
  tarifaFija: string;
  cargoDistancia?: string;
  cargoHorario?: string;
  cargoAccesoDificil?: string;
  /** Zona especial: no tiene cálculo automático (requiere evaluación). */
  esZonaEspecial: boolean;
}

export interface MontajeConfig {
  /** Tarifa por hora de montaje. */
  tarifaPorHora: string;
  /** Horas mínimas facturables. */
  horasMinimas: string;
  /** Horas solicitadas. */
  horas: string;
}

export interface PersonalConfig {
  /** Tarifa por hora de personal. */
  tarifaPorHora: string;
  /** Horas mínimas facturables. */
  horasMinimas: string;
  /** Horas solicitadas. */
  horas: string;
  /** Número de invitados del evento. */
  invitados: string;
  /** Invitados por persona de personal (N, PENDIENTE-DUEÑO). */
  invitadosPorPersona: string;
}

export interface MotorEntrada {
  items: ProductoEntrada[];
  /** Datos privados de costo por producto (vienen del servidor, nunca del navegador). */
  costosPrivados: Record<string, CostoProductoPrivado>;
  /** Parámetros por categoría. */
  categorias: Record<string, CategoriaParametros>;
  /** Margen global (0 a 100), último nivel de precedencia. */
  margenGlobalPct: string;
  /** Tasa de IVA (0 a 100), se aplica después del precio de venta. */
  ivaPct: string;
  /** Configuración opcional de transporte por zona. */
  transporte?: ZonaTransporte;
  /** Configuración opcional de montaje. */
  montaje?: MontajeConfig;
  /** Configuración opcional de personal. */
  personal?: PersonalConfig;
}

// ---------------------------------------------------------------------------
// Salida interna del servidor (incluye costos: nunca sale al cliente)
// ---------------------------------------------------------------------------

export interface LineaInterna {
  productoId: string;
  cantidadServida: Money;
  /** Cantidad a comprar en unidad de compra. */
  cantidadComprar: Money;
  /** Costo de unidad de compra (privado). */
  costoUnitarioCompra: Money;
  /** Costo de la línea (privado). */
  costoLinea: Money;
  /** Margen aplicado (privado). */
  margenAplicadoPct: Money;
  precioVentaLinea: Money;
  ivaLinea: Money;
  totalLinea: Money;
}

export interface MotorSalidaInterna {
  lineas: LineaInterna[];
  /** Subtotal de costo de ingredientes (privado). */
  subtotalCosto: Money;
  /** Costo de transporte (privado, si aplica). */
  costoTransporte: Money;
  /** Costo de montaje (privado, si aplica). */
  costoMontaje: Money;
  /** Costo de personal (privado, si aplica). */
  costoPersonal: Money;
  /** Subtotal de venta de ingredientes (precios de venta, sin margen de servicios). */
  subtotalVentaIngredientes: Money;
  /** Subtotal de servicios (transporte + montaje + personal). */
  subtotalServicios: Money;
  /** Subtotal de venta completo (ingredientes + servicios). */
  subtotalVenta: Money;
  ivaTotal: Money;
  totalConIva: Money;
}

// ---------------------------------------------------------------------------
// Salida apta para el cliente (sin costos ni márgenes internos)
// ---------------------------------------------------------------------------

export interface LineaCliente {
  productoId: string;
  cantidadServida: Money;
  precioVentaLinea: Money;
  ivaLinea: Money;
  totalLinea: Money;
}

export interface MotorSalidaCliente {
  lineas: LineaCliente[];
  /** Cargos de servicio visibles al cliente (transporte, montaje, personal). */
  costoTransporte: Money;
  costoMontaje: Money;
  costoPersonal: Money;
  subtotalVenta: Money;
  ivaTotal: Money;
  totalConIva: Money;
}

// ---------------------------------------------------------------------------
// Helpers de aritmética decimal
// ---------------------------------------------------------------------------

function toBig(value: string | number | Big): Big {
  return value instanceof Big ? value : new Big(value);
}

function toMoney(value: Big): Money {
  return value.toFixed(2);
}

function pctAFactor(pct: string): Big {
  return toBig(pct).div(100);
}

function requirePositive(value: Big, campo: string): void {
  if (value.lte(0)) {
    throw new Error(`${campo} debe ser mayor a cero`);
  }
}

function requireRangoMargen(pct: Big, campo: string): void {
  if (pct.lt(0) || pct.gt(95)) {
    throw new Error(`${campo} debe estar entre 0 y 95`);
  }
}

/** División entera con redondeo hacia arriba (ceil), sin usar flotantes. */
function ceilDiv(a: Big, b: Big): Big {
  const cociente = a.div(b);
  const residuo = a.mod(b);
  if (residuo.eq(0)) return cociente;
  return cociente.plus(1);
}

// ---------------------------------------------------------------------------
// Cálculo de cargos de servicio
// ---------------------------------------------------------------------------

function calcularTransporte(zona: ZonaTransporte): Big {
  if (zona.esZonaEspecial) {
    // Zona especial: no hay cálculo automático (requiere evaluación).
    return new Big(0);
  }
  let total = toBig(zona.tarifaFija);
  if (zona.cargoDistancia) total = total.plus(toBig(zona.cargoDistancia));
  if (zona.cargoHorario) total = total.plus(toBig(zona.cargoHorario));
  if (zona.cargoAccesoDificil) total = total.plus(toBig(zona.cargoAccesoDificil));
  return total;
}

function calcularMontaje(config: MontajeConfig): Big {
  const tarifa = toBig(config.tarifaPorHora);
  const horas = toBig(config.horas);
  const horasMinimas = toBig(config.horasMinimas);
  const horasEfectivas = horas.gt(horasMinimas) ? horas : horasMinimas;
  return tarifa.times(horasEfectivas);
}

function calcularPersonal(config: PersonalConfig): Big {
  const tarifa = toBig(config.tarifaPorHora);
  const horas = toBig(config.horas);
  const horasMinimas = toBig(config.horasMinimas);
  const horasEfectivas = horas.gt(horasMinimas) ? horas : horasMinimas;
  const invitados = toBig(config.invitados);
  const invitadosPorPersona = toBig(config.invitadosPorPersona);
  requirePositive(invitadosPorPersona, "invitadosPorPersona");
  const personas = ceilDiv(invitados, invitadosPorPersona);
  return personas.times(tarifa).times(horasEfectivas);
}

// ---------------------------------------------------------------------------
// Cálculo de una línea de ingrediente
// ---------------------------------------------------------------------------

function calcularLinea(
  item: ProductoEntrada,
  costo: CostoProductoPrivado,
  categoria: CategoriaParametros | undefined,
  margenGlobal: Big,
  ivaFactor: Big,
): LineaInterna {
  const cantidadServida = toBig(item.cantidadServida);
  requirePositive(cantidadServida, `cantidadServida de ${item.productoId}`);

  const merma = toBig(costo.merma);
  const rendimiento = Big(1).minus(merma);
  if (rendimiento.lte(0)) {
    throw new Error(
      `merma inválida para ${item.productoId}: el rendimiento debe ser mayor a cero`,
    );
  }

  const factorConversion = toBig(costo.factorConversion);
  requirePositive(
    factorConversion,
    `factorConversion de ${item.productoId}`,
  );

  // Cantidad a comprar en unidad de venta, luego convertida a unidad de compra.
  const cantidadComprarVenta = cantidadServida.div(rendimiento);
  const cantidadComprar = cantidadComprarVenta.times(factorConversion);

  const costoUnitario = toBig(costo.costoUnitarioCompra);
  const costoLineaRaw = cantidadComprar.times(costoUnitario);
  const costoLinea = toBig(costoLineaRaw.toFixed(2));

  let precioVentaRaw: Big;
  let margenAplicado: Big;

  if (costo.precioFijoManual) {
    // Precio fijo manual prevalece sobre cualquier margen.
    precioVentaRaw = toBig(costo.precioFijoManual);
    requirePositive(
      precioVentaRaw,
      `precioFijoManual de ${item.productoId}`,
    );
    margenAplicado = new Big(0);
  } else {
    const margenPct =
      costo.margenPropioPct ?? categoria?.margenPct ?? margenGlobal.toString();
    const margenFactor = pctAFactor(margenPct);
    requireRangoMargen(
      toBig(margenPct),
      `margen de ${item.productoId}`,
    );
    precioVentaRaw = costoLinea.div(Big(1).minus(margenFactor));
    margenAplicado = toBig(margenPct);
  }

  const precioVentaLinea = toBig(precioVentaRaw.toFixed(2));
  const ivaLinea = toBig(precioVentaLinea.times(ivaFactor).toFixed(2));
  const totalLinea = toBig(precioVentaLinea.plus(ivaLinea).toFixed(2));

  return {
    productoId: item.productoId,
    cantidadServida: toMoney(cantidadServida),
    cantidadComprar: toMoney(cantidadComprar),
    costoUnitarioCompra: toMoney(costoUnitario),
    costoLinea: toMoney(costoLinea),
    margenAplicadoPct: toMoney(margenAplicado),
    precioVentaLinea: toMoney(precioVentaLinea),
    ivaLinea: toMoney(ivaLinea),
    totalLinea: toMoney(totalLinea),
  };
}

// ---------------------------------------------------------------------------
// Punto de entrada del motor
// ---------------------------------------------------------------------------

export function cotizar(entrada: MotorEntrada): MotorSalidaInterna {
  const ivaFactor = pctAFactor(entrada.ivaPct);
  const margenGlobal = toBig(entrada.margenGlobalPct);
  requireRangoMargen(margenGlobal, "margen global");

  const lineas: LineaInterna[] = [];

  for (const item of entrada.items) {
    const costo = entrada.costosPrivados[item.productoId];
    if (!costo) {
      throw new Error(
        `No hay datos de costo privados para el producto ${item.productoId}`,
      );
    }
    const categoria = entrada.categorias[item.categoriaId];
    lineas.push(calcularLinea(item, costo, categoria, margenGlobal, ivaFactor));
  }

  const subtotalCosto = lineas.reduce(
    (acc, l) => acc.plus(toBig(l.costoLinea)),
    new Big(0),
  );
  const subtotalVentaIngredientes = lineas.reduce(
    (acc, l) => acc.plus(toBig(l.precioVentaLinea)),
    new Big(0),
  );

  // Cargos de servicio (sin margen adicional)
  const costoTransporte = entrada.transporte
    ? calcularTransporte(entrada.transporte)
    : new Big(0);
  const costoMontaje = entrada.montaje
    ? calcularMontaje(entrada.montaje)
    : new Big(0);
  const costoPersonal = entrada.personal
    ? calcularPersonal(entrada.personal)
    : new Big(0);

  const subtotalServicios = costoTransporte.plus(costoMontaje).plus(costoPersonal);
  const subtotalVenta = subtotalVentaIngredientes.plus(subtotalServicios);
  const ivaTotal = toBig(subtotalVenta.times(ivaFactor).toFixed(2));
  const totalConIva = subtotalVenta.plus(ivaTotal);

  return {
    lineas,
    subtotalCosto: toMoney(subtotalCosto),
    costoTransporte: toMoney(costoTransporte),
    costoMontaje: toMoney(costoMontaje),
    costoPersonal: toMoney(costoPersonal),
    subtotalVentaIngredientes: toMoney(subtotalVentaIngredientes),
    subtotalServicios: toMoney(subtotalServicios),
    subtotalVenta: toMoney(subtotalVenta),
    ivaTotal: toMoney(ivaTotal),
    totalConIva: toMoney(totalConIva),
  };
}

// ---------------------------------------------------------------------------
// Vista para el cliente (sin costos ni márgenes internos)
// ---------------------------------------------------------------------------

export function paraCliente(
  salida: MotorSalidaInterna,
): MotorSalidaCliente {
  return {
    lineas: salida.lineas.map((l) => ({
      productoId: l.productoId,
      cantidadServida: l.cantidadServida,
      precioVentaLinea: l.precioVentaLinea,
      ivaLinea: l.ivaLinea,
      totalLinea: l.totalLinea,
    })),
    costoTransporte: salida.costoTransporte,
    costoMontaje: salida.costoMontaje,
    costoPersonal: salida.costoPersonal,
    subtotalVenta: salida.subtotalVenta,
    ivaTotal: salida.ivaTotal,
    totalConIva: salida.totalConIva,
  };
}

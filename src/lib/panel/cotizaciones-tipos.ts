import type { Database } from "@/types/database";

export type EstadoCotizacion =
  Database["public"]["Tables"]["cotizaciones"]["Row"]["estado"];

export const ESTADOS_COTIZACION: EstadoCotizacion[] = [
  "recibida",
  "en_revision",
  "enviada",
  "aceptada",
  "confirmada",
  "realizada",
  "cancelada",
  "vencida",
];

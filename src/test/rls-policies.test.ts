import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Pruebas de RLS (Row Level Security) sobre los archivos de migración SQL.
 *
 * Estas pruebas analizan estáticamente los archivos de migración en
 * supabase/migrations/ para verificar que las políticas de seguridad estén
 * correctamente definidas antes de aplicarlas en Supabase.
 *
 * No requieren base de datos activa: validan el contenido de los archivos SQL.
 */

const MIGRATIONS_DIR = path.resolve(
  __dirname,
  "../../supabase/migrations"
);

function readMigration(filename: string): string {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Migración no encontrada: ${filename}`);
  }
  return fs.readFileSync(filePath, "utf-8");
}

function hasRLS(sql: string, table: string): boolean {
  const re = new RegExp(
    `alter table public\\.${table} enable row level security`,
    "i"
  );
  return re.test(sql);
}

function hasPolicy(sql: string, table: string, roleOrClause: string): boolean {
  const re = new RegExp(
    `create policy[\\s\\S]*?on public\\.${table}[\\s\\S]*?to (${roleOrClause})`,
    "i"
  );
  return re.test(sql);
}

function hasPolicyForAllAuthenticated(sql: string, table: string): boolean {
  const re = new RegExp(
    `create policy[\\s\\S]*?on public\\.${table}[\\s\\S]*?to authenticated`,
    "i"
  );
  return re.test(sql);
}

function countAnonPolicies(sql: string, table: string): number {
  const re = new RegExp(
    `create policy[\\s\\S]*?on public\\.${table}[\\s\\S]*?to anon`,
    "gi"
  );
  const matches = sql.match(re);
  return matches ? matches.length : 0;
}

describe("RLS — tabla testing (Fase 1)", () => {
  const sql = readMigration(
    "20261107000001_create_testing_table.sql"
  );

  it("tiene RLS habilitado", () => {
    expect(hasRLS(sql, "testing")).toBe(true);
  });

  it("NO tiene políticas para el rol anon (se eliminaron en migración 4)", () => {
    expect(countAnonPolicies(sql, "testing")).toBe(0);
  });
});

describe("RLS — tablas públicas (migración 1)", () => {
  const sql = readMigration(
    "20261109000001_01_esquema_publico.sql"
  );

  const tablasPublicas = [
    "usuarios_personal",
    "categorias",
    "productos",
    "paquetes",
    "paquete_componentes",
    "zonas_transporte",
    "tarifas_montaje",
    "perfiles_consumo",
    "parametros_globales",
    "bitacora_auditoria",
  ];

  for (const tabla of tablasPublicas) {
    it(`${tabla}: tiene RLS habilitado`, () => {
      expect(hasRLS(sql, tabla)).toBe(true);
    });

    it(`${tabla}: NO tiene políticas para el rol anon`, () => {
      expect(countAnonPolicies(sql, tabla)).toBe(0);
    });
  }
});

describe("RLS — cotizaciones, cotizaciones_costos, cotizacion_versiones (migración 2)", () => {
  const sql = readMigration(
    "20261109000002_02_cotizaciones_costos_y_versiones.sql"
  );

  it("cotizaciones: tiene RLS habilitado", () => {
    expect(hasRLS(sql, "cotizaciones")).toBe(true);
  });

  it("cotizaciones: NO tiene políticas para el rol anon", () => {
    expect(countAnonPolicies(sql, "cotizaciones")).toBe(0);
  });

  it("cotizaciones: tiene política para authenticated (propietario/administrador)", () => {
    expect(hasPolicyForAllAuthenticated(sql, "cotizaciones")).toBe(true);
  });

  it("cotizaciones_costos: tiene RLS habilitado", () => {
    expect(hasRLS(sql, "cotizaciones_costos")).toBe(true);
  });

  it("cotizaciones_costos: NO tiene políticas para el rol anon", () => {
    expect(countAnonPolicies(sql, "cotizaciones_costos")).toBe(0);
  });

  it("cotizaciones_costos: política solo para propietario", () => {
    const re = /create policy[\s\S]*?on public\.cotizaciones_costos[\s\S]*?to authenticated[\s\S]*?rol = 'propietario'/i;
    expect(re.test(sql)).toBe(true);
  });

  it("cotizacion_versiones: tiene RLS habilitado", () => {
    expect(hasRLS(sql, "cotizacion_versiones")).toBe(true);
  });

  it("cotizacion_versiones: NO tiene políticas para el rol anon", () => {
    expect(countAnonPolicies(sql, "cotizacion_versiones")).toBe(0);
  });

  it("cotizacion_versiones: solo lectura para authenticated (propietario/administrador)", () => {
    const re = /create policy[\s\S]*?on public\.cotizacion_versiones[\s\S]*?for select[\s\S]*?to authenticated[\s\S]*?in \('propietario', 'administrador'\)/i;
    expect(re.test(sql)).toBe(true);
  });
});

describe("Seguridad — costos y márgenes inaccesibles (sección 11 de la especificación)", () => {
  const sqlCostos = readMigration(
    "20261109000002_02_cotizaciones_costos_y_versiones.sql"
  );

  it("cotizaciones_costos es una tabla separada y privada (solo propietario)", () => {
    expect(
      /create table if not exists public\.cotizaciones_costos/i.test(sqlCostos)
    ).toBe(true);
    expect(
      /unique \(cotizacion_id\)/i.test(sqlCostos)
    ).toBe(true);
  });

  it("cotizaciones_costos NO tiene políticas para el rol anon", () => {
    expect(countAnonPolicies(sqlCostos, "cotizaciones_costos")).toBe(0);
  });

  it("cotizaciones_costos solo accesible por rol propietario", () => {
    const re = /rol = 'propietario'/i;
    expect(re.test(sqlCostos)).toBe(true);
  });

  it("cotizaciones no expone columnas de costo ni margen (solo total_venta)", () => {
    const columnasCosto = [
      "costo_unitario",
      "costo_total",
      "margen",
      "precio_costo",
    ];
    for (const columna of columnasCosto) {
      expect(
        new RegExp(`\\b${columna}\\b`, "i").test(sqlCostos)
      ).toBe(false);
    }
  });
});

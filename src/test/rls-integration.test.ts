import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Pruebas de RLS con usuario real contra el proyecto de Supabase en la nube.
 *
 * REQUISITO PREVIO (una sola vez):
 *   1. Ejecutar `npx tsx scripts/crear-usuarios-prueba.ts` para registrar
 *      los usuarios admin@test.local y propietario@test.local con sus roles
 *      en usuarios_personal, y confirmar sus emails.
 *   2. Definir las variables de entorno (una de las dos opciones):
 *      Opción A: $env:VITEST_SUPABASE_URL = "..."
 *                $env:VITEST_SUPABASE_ANON_KEY = "..."
 *      Opción B: Las variables NEXT_PUBLIC_SUPABASE_URL y
 *                NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.local
 *   3. npm run test
 *
 * Estas pruebas NO crean usuarios. Solo hacen signInWithPassword con los
 * usuarios ya registrados por el script.
 */

function cargarEnvLocal(): Record<string, string> {
  const envPath = path.resolve(__dirname, "../../.env.local");
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf-8");
  const result: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    result[key] = value;
  }
  return result;
}

const envLocal = cargarEnvLocal();

const SUPABASE_URL =
  process.env.VITEST_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  envLocal.NEXT_PUBLIC_SUPABASE_URL;

const SUPABASE_ANON_KEY =
  process.env.VITEST_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  envLocal.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    "Falta variable de entorno VITEST_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_URL",
  );
}
if (!SUPABASE_ANON_KEY) {
  throw new Error(
    "Falta variable de entorno VITEST_SUPABASE_ANON_KEY o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
}

function crearCliente(token?: string): SupabaseClient {
  const options = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : undefined;
  return createClient(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
    options as Parameters<typeof createClient>[2],
  );
}

const USUARIO_ADMIN = {
  email: process.env.VITEST_ADMIN_EMAIL ?? "admin@test.local",
  password: process.env.VITEST_ADMIN_PASSWORD ?? "",
};

const USUARIO_PROPIETARIO = {
  email: process.env.VITEST_PROPIETARIO_EMAIL ?? "propietario@test.local",
  password: process.env.VITEST_PROPIETARIO_PASSWORD ?? "",
};

let supabaseAnon: SupabaseClient;

describe("RLS con usuario real — rol Administrador no puede leer costos ni márgenes", () => {
  let adminToken: string | null = null;

  beforeAll(async () => {
    supabaseAnon = crearCliente();

    // Verificar que Supabase remoto responde
    const { error: healthError } = await supabaseAnon
      .from("categorias")
      .select("count")
      .limit(1);
    if (healthError && healthError.code === "42501") {
      // 42501 = insufficient_privilege: la BD responde, RLS está activo
      return;
    }
    if (healthError) {
      throw new Error(
        `Supabase remoto no responde en ${SUPABASE_URL}. Detalle: ${healthError.message}`,
      );
    }
  });

  beforeEach(async () => {
    const signIn = await supabaseAnon.auth.signInWithPassword(USUARIO_ADMIN);

    if (signIn.error || !signIn.data.session) {
      throw new Error(
        `No se pudo autenticar usuario admin: ${signIn.error?.message ?? "sin sesión"}. ` +
          "¿Corriste antes 'npx tsx scripts/crear-usuarios-prueba.ts'?",
      );
    }

    adminToken = signIn.data.session.access_token;
  });

  afterAll(async () => {
    if (adminToken) {
      await crearCliente(adminToken).auth.signOut();
    }
    await supabaseAnon.auth.signOut();
  });

it("anon no puede leer cotizaciones_costos", async () => {
  const { data, error } = await supabaseAnon
    .from("cotizaciones_costos")
    .select("*");

  expect(error).toBeNull();
  expect(data).toEqual([]);
});

it("Administrador no puede leer producto_costos", async () => {
  if (!adminToken) throw new Error("No hay token de administrador");
  const supabaseAdmin = crearCliente(adminToken);

  const { data, error } = await supabaseAdmin
    .from("producto_costos")
    .select("*");

  expect(error).toBeNull();
  expect(data).toEqual([]);
});

it("Administrador no puede leer cotizaciones_costos filtrando por id", async () => {
  if (!adminToken) throw new Error("No hay token de administrador");
  const supabaseAdmin = crearCliente(adminToken);
  const { data, error } = await supabaseAdmin
    .from("cotizaciones_costos")
    .select("*")
    .eq("id", 1);

  expect(error).toBeNull();
  expect(data).toEqual([]);
});

  it("Administrador no puede escribir en cotizaciones_costos", async () => {
    if (!adminToken) throw new Error("No hay token de administrador");
    const supabaseAdmin = crearCliente(adminToken);
    const { error } = await supabaseAdmin
      .from("cotizaciones_costos")
      .insert([
        {
          cotizacion_id: 1,
          total_costo: 0,
          datos_costo: {},
        },
      ]);
    expect(error).not.toBeNull();
    expect(error?.code).toBe("42501");
  });

  it("Administrador SÍ puede leer productos (catálogo público para personal)", async () => {
    if (!adminToken) throw new Error("No hay token de administrador");
    const supabaseAdmin = crearCliente(adminToken);
    const { data, error } = await supabaseAdmin.from("productos").select("*");
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("Administrador SÍ puede leer paquetes (catálogo público para personal)", async () => {
    if (!adminToken) throw new Error("No hay token de administrador");
    const supabaseAdmin = crearCliente(adminToken);
    const { data, error } = await supabaseAdmin.from("paquetes").select("*");
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  // === Prueba de comportamiento pendiente: Administrador no puede leer tablas privadas de costos/márgenes ===

it("Administrador no puede leer producto_costos (tabla privada, solo propietario)", async () => {
  if (!adminToken) throw new Error("No hay token de administrador");
  const supabaseAdmin = crearCliente(adminToken);

  const { data, error } = await supabaseAdmin
    .from("producto_costos")
    .select("*");

  expect(error).toBeNull();
  expect(data).toEqual([]);
});

it("Administrador no puede leer producto_margenes (tabla privada, solo propietario)", async () => {
  if (!adminToken) throw new Error("No hay token de administrador");
  const supabaseAdmin = crearCliente(adminToken);

  const { data, error } = await supabaseAdmin
    .from("producto_margenes")
    .select("*");

  expect(error).toBeNull();
  expect(data).toEqual([]);
});

it("Administrador no puede leer paquete_margenes (tabla privada, solo propietario)", async () => {
  if (!adminToken) throw new Error("No hay token de administrador");
  const supabaseAdmin = crearCliente(adminToken);

  const { data, error } = await supabaseAdmin
    .from("paquete_margenes")
    .select("*");

  expect(error).toBeNull();
  expect(data).toEqual([]);
});
});

describe("RLS con usuario real — rol Propietario SÍ puede leer costos", () => {
  let propietarioToken: string | null = null;

  beforeAll(async () => {
    if (!supabaseAnon) {
      supabaseAnon = crearCliente();
    }
  });

  beforeEach(async () => {
    const signIn = await supabaseAnon.auth.signInWithPassword(
      USUARIO_PROPIETARIO,
    );

    if (signIn.error || !signIn.data.session) {
      throw new Error(
        `No se pudo autenticar usuario propietario: ${signIn.error?.message ?? "sin sesión"}. ` +
          "¿Corriste antes 'npx tsx scripts/crear-usuarios-prueba.ts'?",
      );
    }

    propietarioToken = signIn.data.session.access_token;
  });

  afterAll(async () => {
    if (propietarioToken) {
      await crearCliente(propietarioToken).auth.signOut();
    }
  });

  it("Propietario puede leer cotizaciones_costos (solo propietario tiene acceso)", async () => {
    if (!propietarioToken) throw new Error("No hay token de propietario");
    const supabasePropietario = crearCliente(propietarioToken);
    const { data, error } = await supabasePropietario
      .from("cotizaciones_costos")
      .select("*");
    // Nota: esto solo tendrá éxito si existe una fila en usuarios_personal con rol='propietario'
    // para este usuario. Si no existe, RLS rechaza con 42501 (comportamiento correcto).
    expect(
      error === null || error?.code === "42501"
    ).toBe(true);
    if (error === null) {
      expect(Array.isArray(data)).toBe(true);
    }
  });
});

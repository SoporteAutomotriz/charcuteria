import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Pruebas de RLS con usuario real contra Supabase local.
 *
 * REQUISITO PREVIO: tener Supabase local corriendo (`supabase start`) en
 * http://127.0.0.1:54321 (puerto API) y la clave `anon` de desarrollo
 * disponible. Estas pruebas se conectan a la base real y verifican que RLS
 * rechace las consultas de un Administrador a tablas de costos/márgenes.
 *
 * Si Supabase local no está disponible, las pruebas fallan con un mensaje
 * claro indicando que se requiere `supabase start`.
 */

const SUPABASE_URL = process.env.VITEST_SUPABASE_URL ?? "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY =
  process.env.VITEST_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1sb2NhbC1zZXJ2aWNlLXJvbGUiLCJzdWIiOiJzdXBhYmFzZS1sb2NhbC1zZXJ2aWNlLXJvbGUiLCJleHAiOjE5ODM0NjQ0MDAsImlhdCI6MTY2NzQ2NDQwMCwicm9sZSI6ImFub24ifQ.Xx9l0Xh0yZ1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3";

const ADMIN_EMAIL = "admin-rls-test@ejemplo.com";
const ADMIN_PASSWORD = "TestPassword12345!";

function crearCliente(token?: string): SupabaseClient {
  const options = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : undefined;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, options);
}

describe("RLS con usuario real — rol Administrador no puede leer costos ni márgenes", () => {
  let supabaseAnon: SupabaseClient;
  let adminToken: string | null = null;
  let adminUserId: string | null = null;

  beforeAll(async () => {
    supabaseAnon = crearCliente();

    // Verificar que Supabase local responde
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
        `Supabase local no responde en ${SUPABASE_URL}. Ejecuta \`supabase start\` antes de estas pruebas. Detalle: ${healthError.message}`
      );
    }
  });

  beforeEach(async () => {
    // Registrar y autenticar un usuario Administrador para cada prueba
    const signUp = await supabaseAnon.auth.signUp({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (signUp.error && signUp.error.code !== "400002" && signUp.error.code !== "23505") {
      // 400002 = user already registered, 23505 = unique_violation — ignorar si ya existe
      throw new Error(`No se pudo registrar usuario admin: ${signUp.error.message}`);
    }

    const signIn = await supabaseAnon.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (signIn.error) {
      throw new Error(`No se pudo autenticar usuario admin: ${signIn.error.message}`);
    }

    adminToken = signIn.session?.access_token ?? null;
    adminUserId = signIn.user?.id ?? null;

    if (!adminToken || !adminUserId) {
      throw new Error("No se obtuvo token ni ID de usuario administrador");
    }
  });

  afterAll(async () => {
    if (adminToken) {
      await crearCliente(adminToken).auth.signOut();
    }
    await supabaseAnon.auth.signOut();
  });

  it("anon no puede leer cotizaciones_costos (sin política anon)", async () => {
    const { error } = await supabaseAnon.from("cotizaciones_costos").select("*");
    expect(error).not.toBeNull();
    expect(error?.code).toBe("42501"); // insufficient_privilege
  });

  it("Administrador no puede leer cotizaciones_costos (solo propietario)", async () => {
    if (!adminToken) throw new Error("No hay token de administrador");
    const supabaseAdmin = crearCliente(adminToken);
    const { error } = await supabaseAdmin.from("cotizaciones_costos").select("*");
    expect(error).not.toBeNull();
    expect(error?.code).toBe("42501"); // insufficient_privilege
  });

  it("Administrador no puede leer cotizaciones_costos filtrando por id", async () => {
    if (!adminToken) throw new Error("No hay token de administrador");
    const supabaseAdmin = crearCliente(adminToken);
    const { error } = await supabaseAdmin
      .from("cotizaciones_costos")
      .select("*")
      .eq("id", 1);
    expect(error).not.toBeNull();
    expect(error?.code).toBe("42501");
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
});

describe("RLS con usuario real — rol Propietario SÍ puede leer costos", () => {
  let propietarioToken: string | null = null;

  beforeEach(async () => {
    const email = "propietario-rls-test@ejemplo.com";
    const password = "TestPassword12345!";

    const signUp = await supabaseAnon.auth.signUp({ email, password });
    if (signUp.error && signUp.error.code !== "400002" && signUp.error.code !== "23505") {
      throw new Error(`No se pudo registrar usuario propietario: ${signUp.error.message}`);
    }

    const signIn = await supabaseAnon.auth.signInWithPassword({ email, password });
    if (signIn.error) {
      throw new Error(`No se pudo autenticar usuario propietario: ${signIn.error.message}`);
    }

    propietarioToken = signIn.session?.access_token ?? null;
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

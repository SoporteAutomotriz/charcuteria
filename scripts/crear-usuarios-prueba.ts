import { createClient } from "@supabase/supabase-js";

/**
 * Script para crear usuarios de prueba contra el proyecto de Supabase remoto.
 *
 * Se ejecuta una sola vez de forma manual antes de correr las pruebas de
 * integración (src/test/rls-integration.test.ts).
 *
 * Variables de entorno requeridas:
 *   SUPABASE_URL        (o NEXT_PUBLIC_SUPABASE_URL)
 *   SUPABASE_ANON_KEY   (o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
 *   SUPABASE_SERVICE_ROLE_KEY (opcional: para crear usuarios sin email de confirmación
 *                              y asignar roles en usuarios_personal sin RLS)
 *
 * Uso:
 *   npx tsx scripts/crear-usuarios-prueba.ts
 */

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error("Falta variable de entorno SUPABASE_URL o NEXT_PUBLIC_SUPABASE_URL");
}
if (!SUPABASE_ANON_KEY) {
  throw new Error("Falta variable de entorno SUPABASE_ANON_KEY o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const usuarios = [
  { email: "admin@test.local", password: "TestPassword12345!", rol: "administrador" },
  { email: "propietario@test.local", password: "TestPassword12345!", rol: "propietario" },
];

async function main() {
  const tieneServiceRole = !!SUPABASE_SERVICE_ROLE_KEY;

  if (tieneServiceRole) {
    console.log("Modo service_role: creando usuarios vía auth.admin.createUser (sin email de confirmación)");
  } else {
    console.log("Modo sin service_role: usará signUp + SQL manual para roles y confirmación de email");
  }

  for (const { email, password, rol } of usuarios) {
    console.log(`\n=== ${email} (${rol}) ===`);

    let userId: string | undefined;

    if (tieneServiceRole) {
      // Ruta por service_role: no envía email, no está sujeta al rate limit de email
      const serviceClient = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY);

      const { data: adminData, error: adminError } =
        await serviceClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { rol },
        });

      if (adminError) {
        const yaExiste =
          adminError.message.includes("already registered") ||
          adminError.code === "400002" ||
          adminError.code === "23505";
        if (yaExiste) {
          console.log("  Usuario ya existe en Auth, obteniendo su ID...");
          // Intentar obtener el ID del usuario existente vía signIn anónimo no funciona;
          // intentamos listar usuarios por email
          const { data: users, error: listError } =
            await serviceClient.auth.admin.listUsers();
          if (listError) {
            console.error(`  Error listando usuarios: ${listError.message}`);
            continue;
          }
          const existente = users.users.find((u) => u.email === email);
          if (!existente) {
            console.error("  No se encontró el usuario existente al listar");
            continue;
          }
          userId = existente.id;
          console.log(`  ID obtenido: ${userId}`);
        } else {
          console.error(`  Error creando usuario: ${adminError.message}`);
          continue;
        }
      } else {
        userId = adminData.user?.id;
        console.log(`  Usuario creado en Auth (ID: ${userId})`);
      }

      // Asignar rol en usuarios_personal (bypass RLS con service_role)
      if (userId) {
        const { error: insertError } = await serviceClient
          .from("usuarios_personal")
          .upsert({
            id: userId,
            email,
            rol,
            nombre: email.split("@")[0],
            activo: true,
          });

        if (insertError) {
          console.error(`  Error asignando rol: ${insertError.message}`);
        } else {
          console.log(`  Rol '${rol}' asignado en usuarios_personal`);
        }
      }
    } else {
      // Ruta sin service_role: signUp + SQL manual
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        const yaExiste =
          signUpError.message.includes("already registered") ||
          signUpError.code === "400002" ||
          signUpError.code === "23505";
        if (yaExiste) {
          console.log("  Usuario ya existe en Auth, saltando creación");
          // No tenemos el ID aquí sin service_role; el usuario debe insertar manualmente
          console.log("     Necesitas obtener el ID del usuario y ejecutar el SQL de abajo");
        } else {
          console.error(`  Error creando usuario: ${signUpError.message}`);
          continue;
        }
      } else {
        userId = signUpData?.user?.id;
        console.log("  Usuario creado en Auth");
        console.log(
          `     ⚠️  Email NO confirmado. El usuario no podrá hacer signIn hasta que confirmes su email.`,
        );
      }

      console.log("  Inserta manualmente en el SQL Editor de Supabase:");
      console.log(
        `     INSERT INTO public.usuarios_personal (id, email, rol, nombre, activo) VALUES ('${userId ?? "<user-id>"}', '${email}', '${rol}', '${email.split("@")[0]}', true) ON CONFLICT (id) DO UPDATE SET rol = '${rol}', activo = true;`,
      );
      if (!userId) {
        console.log(
          `     -- Primero obtén el id del usuario: SELECT id FROM auth.users WHERE email = '${email}';`,
        );
      }
    }
  }

  console.log("\n✅ Script completado. Ahora puedes ejecutar 'npm run test'.");
  if (!tieneServiceRole) {
    console.log(
      "\n⚠️  Recuerda: sin SUPABASE_SERVICE_ROLE_KEY debiste confirmar los emails y asignar roles manualmente.",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

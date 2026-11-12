Update(src\app\hosting-test\page.tsx)
Added 8 lines, removed 6 lines

    fetch("/api/supabase-test")
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        const json = await r.json();
        if (!cancelled) {
          setData(json.data);
          setError(json.error ?? null);
          if (!r.ok) {
            setError(json.error ?? `HTTP ${r.status}`);
            setData(null);
          } else {
            setData(json.data);
            setError(json.error ?? null);
          }
        }
      })
      .catch((e) => {

Cambio aplicado. Ahora lo commiteo:

  Committed 31a9450

Commit listo (31a9450). Ahora hago el redeploy en Vercel para que tome el cambio:

  Ran 1 shell command

El redeploy se completó correctamente. La URL de producción sigue siendo https://charcuteria-iota.vercel.app (despliegue dpl_8XV9QwACTdF4SMwHPSq5FAjoXHg3, estado READY).

Ahora necesito que tú pruebes:

Abre https://charcuteria-iota.vercel.app/hosting-test en el navegador y dime exactamente qué mensaje aparece en la sección "1. Lectura de Supabase desde el servidor":

- ¿Muestra "Lectura desde Supabase exitosa" con datos?
- ¿O muestra un error 500 con el mensaje descriptivo (por ejemplo, "Falta variable de entorno...")?
- ¿O muestra otro mensaje?

▎ ⚠️ Recuerda que hay protección de autenticación de Vercel activada, así que puede que necesites iniciar sesión en tu cuenta de Vercel para ver la página.

Cuando me des el resultado exacto, seguimos con el diagnóstico de Turnstile y los próximos pasos.

✻ Brewed for 2m 21s · done 10:49

> /api/supabase-test devuelve "Error desconocido" en el catch, lo cual indica que el objeto de error de Supabase no es una instancia de Error nativa y el mensaje real se está perdiendo.

  1. En el catch de src/app/api/supabase-test/route.ts, cambia la extracción del mensaje para que capture también errores de Supabase: revisa si el objeto tiene las propiedades message, code, details o hint (típicas de PostgrestError) y devuélvelas todas en el JSON de respuesta, no solo cuando sea instanceof Error.
  2. Haz commit y espera el redeploy.
  3. Aparte, dime: ¿la tabla "testing" existe en el proyecto de Supabase cuya URL está configurada en las variables de entorno de Vercel (Production)? Y si existe, ¿tiene RLS activado? Si tiene RLS, ¿hay una política que permita SELECT al rol anon?

Voy a modificar el catch de /api/supabase-test para capturar errores de Supabase con todas sus propiedades, y luego haré commit y redeploy.

Sobre tu pregunta de la tabla "testing": no puedo verificarlo directamente — no tengo acceso al panel de Supabase ni a tu base de datos. Eso debes revisarlo tú en tu panel de Supabase (Table Editor > tabla testing, y Authentication > RLS para ver si tiene políticas para el rol anon).

Mientras tanto, hago el cambio de código:

  Read 1 file

● Update(src\app\api\supabase-test\route.ts)
Added 13 lines, removed 1 line

    return NextResponse.json({ data, error: null });
  } catch (e) {
    const raw = e as Record<string, unknown> | undefined;
    const errorInfo: Record<string, unknown> = {};

    if (raw?.message) errorInfo.message = raw.message;
    if (raw?.code) errorInfo.code = raw.code;
    if (raw?.details) errorInfo.details = raw.details;
    if (raw?.hint) errorInfo.hint = raw.hint;

    if (Object.keys(errorInfo).length === 0) {
      errorInfo.message = typeof e === "string" ? e : "Error desconocido";
    }

    return NextResponse.json(
      { data: null, error: e instanceof Error ? e.message : "Error desconocido" },
      { data: null, error: errorInfo },
      { status: 500 }
    );
  }

Ahora commiteo y hago el redeploy:

  Committed cffed3f, ran 2 shell commands
2 actions not run · auto mode's check had no usable answer

Commit listo (cffed3f). Ahora hago el redeploy de Vercel:

  Ran 1 shell command

El redeploy se completó. La URL de producción sigue siendo https://charcuteria-iota.vercel.app (despliegue dpl_AE9TfcEguq6xYGMhpoBwYTCSmMzQ, estado READY).

Cambios aplicados y commiteados

1. src/lib/supabase/server.ts (bfdb50a) — Validación explícita de variables de entorno (ya estaba hecho).
2. src/app/hosting-test/page.tsx (31a9450) — Ahora lee siempre el JSON de la respuesta y muestra json.error cuando viene presente.
3. src/app/api/supabase-test/route.ts (cffed3f) — En el catch, extrae message, code, details y hint del objeto de error (típicas de PostgrestError de Supabase) y las devuelve todas en el JSON de respuesta 500, en vez de solo "Error desconocido".

Qué necesito que pruebes tú ahora

Abre https://charcuteria-iota.vercel.app/hosting-test en el navegador y dime el mensaje exacto que aparece en la sección "1. Lectura de Supabase desde el servidor":

- Si es un error 500, ¿qué campos muestra (message, code, details, hint)?
- Si es exitoso, ¿cuántas filas obtiene?

▎ ⚠️ Recuerda la protección de autenticación de Vercel: puede que necesites iniciar sesión en tu cuenta de Vercel.

Sobre la tabla "testing" en Supabase

No puedo verificar esto directamente desde aquí — no tengo acceso a tu panel de Supabase. Te sugiero revisar:

1. Table Editor → tabla testing: ¿existe?
2. Authentication → RLS: ¿está activada en la tabla testing?
3. Si tiene RLS, ¿hay una política que permita SELECT al rol anon?

Cuando me des el mensaje exacto de Supabase, sabremos si es problema de variables de entorno, de tabla inexistente, o de RLS, y podremos corregirlo.

Voy a intentar el redeploy de Vercel y modificar src/lib/supabase/server.ts en paralelo.

Primero, el redeploy:

  Ran 1 shell command

● Update(src\lib\supabase\server.ts)
Error editing file

El redeploy falló por un error de nombre de proyecto en Vercel CLI, y el Edit no encontró el string exacto. Voy a leer el archivo para corregir el edit, y verificar el estado del proyecto en Vercel.

  Read 1 file, ran 1 shell command

Ya veo la situación. Hay un solo proyecto en Vercel (soporte8/charcuteria) con múltiples despliegues, no dos proyectos distintos. El redeploy falló porque el CLI intenta crear un proyecto nuevo en lugar de usar el existente. Voy a vincular el proyecto y corregir el Edit.

Primero, corrige el Edit de server.ts (el archivo usa tabs, no espacios):

● Update(src\lib\supabase\server.ts)
Error editing file

  Ran 1 shell command

El proyecto ya está vinculado (soporte8/charcuteria). El Edit falló por diferencia de tabs/espacios. Voy a corregir el Edit con el patrón exacto y luego hacer el redeploy.

● Update(src\lib\supabase\server.ts)
Error editing file

  Ran 1 shell command

El archivo usa tabs, no espacios. Voy a hacer el Edit con tabs exactos:

● Update(src\lib\supabase\server.ts)
Error editing file

El Edit sigue fallando con el matching de espacios/tabs. Voy a reescribir todo el archivo con Write, que ya lo he leído:

● Write(src\lib\supabase\server.ts)
Added 12 lines, removed 2 lines
export const createClient = cache(async () => {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Falta variable de entorno NEXT_PUBLIC_SUPABASE_URL en el servidor");
  }
  if (!supabaseKey) {
    throw new Error("Falta variable de entorno NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en el servidor");
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {

Archivo corregido. Ahora hago el redeploy de Vercel (ya vinculado al proyecto existente):

  Ran 1 shell command

El redeploy se completó. Ahora haré el commit de la corrección de server.ts y luego te diré exactamente qué probar.

Respuesta a tu punto 3: No quedaron dos proyectos distintos. Hay un solo proyecto en Vercel (soporte8/charcuteria) con múltiples despliegues. El alias de producción cambió de charcuteria-two.vercel.app a charcuteria-iota.vercel.app (el deployment anterior quedó como histórico).

Ahora el commit de la corrección de validación:

  Committed bfdb50a, ran 6 shell commands
5 actions not run · auto mode's check had no usable answer

Todo listo. Aquí tienes el resumen de lo completado y lo que falta:

✅ Completado

1. Redeploy de Vercel

Ejecutado correctamente. La nueva URL de producción es:
https://charcuteria-iota.vercel.app (despliegue dpl_2VW99EoKJhGFhiabD592wXVBCpxZ, estado READY)

2. Corrección de src/lib/supabase/server.ts

Reemplacé el operador ! por una validación explícita. Ahora, si faltan las variables de entorno, el error 500 dice la causa real en vez de un mensaje genérico:

- "Falta variable de entorno NEXT_PUBLIC_SUPABASE_URL en el servidor"
- "Falta variable de entorno NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en el servidor"

3. Proyecto en Vercel (tu punto 3)

No hay dos proyectos distintos. Hay un solo proyecto: soporte8/charcuteria con múltiples despliegues históricos. El alias de producción cambió de charcuteria-two.vercel.app a charcuteria-iota.vercel.app. Conservamos este único proyecto.

4. Commit

Realizado: bfdb50a — fix: validación explícita de variables de entorno Supabase en server.ts

---

🔄 Lo que falta: probar /hosting-test

Ahora necesito que tú abras en el navegador:

https://charcuteria-iota.vercel.app/hosting-test

Y me digas el resultado exacto de ambas pruebas:

┌───────────┬─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Prueba   │                                               Qué buscar                                                │
├───────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Supabase  │ ¿Muestra "Lectura desde Supabase exitosa" o un error 500 con el mensaje descriptivo nuevo?              │
├───────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Turnstile │ ¿Aparece el widget? ¿Se puede enviar el formulario? ¿Qué respuesta da ({"success":true} o algún error)? │
└───────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

▎ ⚠️ Nota: el despliegue tiene protección de autenticación de Vercel activada, así que puede que necesites iniciar sesión en tu cuenta de Vercel para ver la página. Si quieres evitar eso, desactiva "Deployment Protection" en Configuración > Protección de despliegue del panel de Vercel.

Cuando me des los resultados, procedo con los siguientes pasos según sea necesario (ajustar variables de entorno, corregir el envío del token de Turnstile, etc.).
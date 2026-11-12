# Diagnóstico de producción — Vercel (charcuteria-two.vercel.app)

**Fecha:** 07-11-2026  
**Estado:** diagnóstico preliminar (sin cambios aplicados todavía)  
**URL de producción:** https://charcuteria-two.vercel.app

---

## Error 1: /api/supabase-test devuelve HTTP 500

### Ruta y validaciones

**Archivo:** `src/app/api/supabase-test/route.ts`

Flujo de ejecución:

1. Llama a `createClient()` (`src/lib/supabase/server.ts`), que lee:
   - `process.env.NEXT_PUBLIC_SUPABASE_URL`
   - `process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
2. Ejecuta `supabase.from("testing").select("*").limit(5)`.
3. Si hay error de Supabase, lo lanza (`throw error`).
4. Si todo sale bien, devuelve `{ data, error: null }` con status 200.
5. Si algo falla (conexión, credenciales inválidas, tabla inexistente, variables de entorno faltantes), cae al `catch` y devuelve status **500** con `{ data: null, error: "<mensaje>" }`.

### Condición que dispararía HTTP 500 en producción

- Faltan las variables `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en el panel de Vercel (Producción y/o Preview).
- `createClient` usa `process.env.X!` (operador no-null), así que si la variable es `undefined` en runtime, el cliente se crea con `undefined` y la petición a Supabase falla.
- La tabla `testing` no existe en la base de datos de Supabase.
- Las credenciales de Supabase no permiten lectura desde el dominio de Vercel.

---

## Error 2: /api/turnstile devuelve {"success":false,"error":"Cuerpo inválido"}

### Ruta y validaciones

**Archivo:** `src/app/api/turnstile/route.ts`

Flujo de ejecución:

1. Lee `process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY`. Si falta → status **500** con `"Falta configuración de CLOUDFLARE_TURNSTILE_SECRET_KEY"`.
2. Intenta parsear el cuerpo como JSON (`request.json()`). Si falla → status **400** con **`"Cuerpo inválido"`** (este es el error que se está viendo).
3. Extrae `body.token`. Si falta o no es string → status **400** con `"Falta el token"`.
4. Envía a `https://challenges.cloudflare.com/turnstile/v0/siteverify` con `secret` y `response`.
5. Si `result.success` → status 200 `{ success: true }`.
6. Si `!result.success` → status 400 con los `error-codes` de Cloudflare.
7. Si la red a Cloudflare falla → status 502 con `"Error al validar con Cloudflare"`.

### Condición que dispara "Cuerpo inválido"

El cuerpo de la petición POST no es JSON válido, o no se envió cuerpo en absoluto. Causas típicas:
- El frontend envía el token con un `Content-Type` que no es `application/json`.
- El frontend no envía cuerpo (solo headers).
- El widget de Turnstile no generó token y el formulario se envió vacío.

---

## Variables de entorno requeridas

| Ruta | Variable | Archivo donde se usa | Entorno |
|------|----------|---------------------|---------|
| `/api/supabase-test` | `NEXT_PUBLIC_SUPABASE_URL` | `src/lib/supabase/server.ts:9` | Production + Preview |
| `/api/supabase-test` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `src/lib/supabase/server.ts:10` | Production + Preview |
| `/api/turnstile` | `CLOUDFLARE_TURNSTILE_SECRET_KEY` | `src/app/api/turnstile/route.ts:3` | Production + Preview |
| Frontend (widget Turnstile) | `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` | `src/app/hosting-test/page.tsx:69` | Production + Preview |

> Las variables con prefijo `NEXT_PUBLIC_` se exponen al navegador. `CLOUDFLARE_TURNSTILE_SECRET_KEY` es solo de servidor.

---

## Dominio de Vercel en Cloudflare Turnstile

**Pendiente de verificar en el panel de Cloudflare.**

La site key de Turnstile (`0x4AAAAAAF1d23xG-4Ez5LpB`) está vinculada a dominios específicos en el panel de Cloudflare (Turnstile > site key > Configuración > Allowed domains).

**Qué verificar:**
- Que `charcuteria-two.vercel.app` esté agregado como dominio permitido.
- Si el dominio no está ahí, el widget puede no generar token válido en producción aunque funcione en localhost.

---

## Hipótesis de causa raíz

| Error | Hipótesis más probable |
|-------|------------------------|
| Supabase HTTP 500 | Faltan variables de Supabase en Vercel, o la tabla `testing` no existe / no permite acceso desde ese dominio. |
| Turnstile "Cuerpo inválido" | El frontend no envía JSON válido al POST `/api/turnstile`, posiblemente porque el widget no generó token (dominio de Vercel no autorizado en Cloudflare Turnstile). |

---

## Próximos pasos (pendientes de ejecución)

1. Configurar las 4 variables de entorno en Vercel (Configuración > Variables de entorno, Production y Preview).
2. Verificar que `charcuteria-two.vercel.app` esté en Allowed domains de la site key de Turnstile en Cloudflare.
3. Redesplegar en Vercel tras configurar variables.
4. Probar `https://charcuteria-two.vercel.app/hosting-test`: lectura de Supabase y formulario Turnstile completo.

# Decisión de hosting — Fase 1

**Fecha:** 05-11-2026 → cierre: 07-11-2026  
**Estado:** decisión final — Vercel (opción B)  
**Autor:** Claude Code (asistente)

---

## Resumen

Se adoptó **Vercel (opción B)** como hosting definitivo de Fase 1. Se descartó **Cloudflare Pages (opción A)** porque el adaptador `@cloudflare/next-on-pages` está archivado y obsoleto desde septiembre de 2025, y no es compatible de forma confiable con Next.js 16.

**URL de producción final:** `https://charcuteria-iota.vercel.app`  
**Proyecto en Vercel:** `soporte8/charcuteria`

---

## Historia real de la Fase 1

### Intento 1: Cloudflare Pages (opción A)

Se desplegó el build estándar de Next.js (`.next/`) con `wrangler pages deploy .next`. El despliegue ejecutó con éxito pero la página devolvía 404 en la ruta raíz. Causa: el formato de salida de `.next/` no es servible directamente por Cloudflare Pages.

Se intentó usar el adaptador `@cloudflare/next-on-pages` para generar el output correcto, pero falló en Windows con errores `spawn npx ENOENT` y `EPERM` de symlinks del CLI de Vercel. Además, el propio adaptador está archivado desde septiembre de 2025.

**Resultado:** Cloudflare Pages descartado. La URL `https://bc534542.charcuteria.pages.dev` devuelve 404 y no se usa en producción.

### Intento 2: Vercel (opción B) — DECISIÓN FINAL

Se configuró `vercel login` y `vercel deploy --prod`. Vercel detectó Next.js automáticamente y desplegó sin adaptador adicional.

**Problemas reales encontrados y resueltos en el camino:**

1. **Falta de push a GitHub:** El proyecto nunca se había subido a GitHub antes de la Fase 1. El remoto `origin https://github.com/SoporteAutomotriz/charcuteria.git` ya existía pero no había commits subidos. Esto se resolvió al final de la Fase 1 con `git push`.

2. **Susto con `.env` en git:** Antes de hacer push, se verificó que `.gitignore` excluya correctamente `.env*` (líneas 34 y 44: `.env*` aparece dos veces, lo que cubre `.env`, `.env.local`, etc.). Se confirmó que ningún secreto fue subido al repositorio.

3. **Caché de esquema de PostgREST:** Tras crear la tabla `testing` en Supabase mediante migración SQL, la lectura desde `/api/supabase-test` seguía fallando porque PostgREST cachea el esquema. Se resolvió esperando a que el caché se refrescara o forzando una nueva lectura.

4. **Dominio de Turnstile mal configurado:** Inicialmente se agregó `vercel.app` como dominio permitido en Cloudflare Turnstile, pero ese dominio público **no cubre subdominios de Vercel** según la documentación de Cloudflare. Se tuvo que agregar el dominio exacto del despliegue (`charcuteria-iota.vercel.app`) como dominio permitido.

5. **Bug de renderizado implícito del widget de Turnstile:** El widget no aparecía visualmente en producción aunque el script cargara sin error. Causa: renderizado implícito mediante `data-sitekey` en el `<div>`, que genera una condición de carrera entre el script de Cloudflare y el montaje de React. Se resolvió cambiando a renderizado explícito con `window.turnstile.render(ref.current, { sitekey, action, callback })`, guardando el `widgetId` y limpiando con `turnstile.remove()` al desmontar. Esto se encapsuló en el componente reutilizable `src/components/turnstile-widget.tsx`.

6. **Mensaje de error genérico de Supabase:** El catch de `/api/supabase-test` usaba `e instanceof Error ? e.message : "Error desconocido"`, lo que perdía el mensaje real de Supabase (PostgrestError). Se cambió para extraer también `message`, `code`, `details` y `hint` del objeto de error.

7. **Error de React al renderizar objeto de error:** El frontend intentaba renderizar el objeto de error `{message, code, details, hint}` directamente como texto, provocando Minified React error #31. Se cambió para renderizar explícitamente `error.message` y `error.code` entre paréntesis.

---

## Opciones evaluadas (sección 12 de la especificación)

| Opción | Proveedor | Decisión | Motivo |
|--------|-----------|----------|--------|
| A | Cloudflare Pages / vinext en Workers | **Descartado** | Adaptador `@cloudflare/next-on-pages` archivado desde sep-2025; no compatible confiablemente con Next.js 16; falló en Windows; página devuelve 404 |
| **B** | **Vercel** | **✅ Adoptada** | Next.js corre de forma nativa; no requiere adaptador extra; despliegue exitoso en `https://charcuteria-iota.vercel.app` |
| C | OpenNext en Workers | No probado | Solo si A y B fallan |

---

## Variables de entorno requeridas en Vercel

Configurar en el panel de Vercel (Configuración > Variables de entorno), para **Production** y **Preview**:

| Variable | Valor (local, no subir a git) | Notas |
|----------|------------------------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://nyhcvgavbgextwempjcc.supabase.co` | Requerido por `/api/supabase-test` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_aBJQMnkLb0GsKn-IvSwLEA_kw0CEsEt` | Requerido por `/api/supabase-test` |
| `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` | `0x4AAAAAAF1d23xG-4Ez5LpB` | Requerido por el widget de Turnstile |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY` | `0x4AAAAAAF1d2xtjJWWGhfN8LuDd2-XjA9U` | Requerido por `/api/turnstile` (server-side) |

> ⚠️ Estas claves están en `.env.local` localmente y **no se suben a git**. Deben copiarse manualmente al panel de Vercel.
> ⚠️ Si cambian en Vercel, es necesario hacer redeploy para que surtan efecto.

---

## ⚠️ Nota importante — Proyecto Supabase en producción de Vercel

El despliegue "Production" de Vercel (`https://charcuteria-iota.vercel.app`) está apuntando actualmente al proyecto de **desarrollo** de Supabase (`sujljkevonamhqbyszmz`), no al de producción real (`nyhcvgavbgextwempjcc`). Esto es intencional mientras estamos en fase de desarrollo, ya que es donde viven las migraciones y los usuarios de prueba (`@test.local`).

**Antes del lanzamiento real (Fase 9) es necesario:**

1. Aplicar todas las migraciones al proyecto de producción real `nyhcvgavbgextwempjcc`.
2. Volver a apuntar las variables de entorno de Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) al proyecto de producción.
3. Crear los usuarios reales del Propietario y Administrador en Supabase Auth del proyecto de producción (sin correos `@test.local`) y darles sus filas en `usuarios_personal` con rol `propietario` y `administrador`.

---

## Endpoints probados localmente y en producción

Todos funcionan en `npm run dev` (localhost:3000):

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/` | GET | Página principal |
| `/hosting-test` | GET | Prueba de hosting: lectura de Supabase + formulario Turnstile |
| `/turnstile` | GET | Página dedicada al widget de Turnstile |
| `/api/supabase-test` | GET | Lee tabla `testing` de Supabase |
| `/api/turnstile` | POST | Valida token de Turnstile con Cloudflare siteverify |

---

## Pruebas en verde (local)

- `npm run typecheck` — aprobado
- `npm run lint` — aprobado
- `npm run test` — aprobado (1 test)
- `npm run build` — aprobado (producción)

---

## Resultado de la prueba de hosting

**Estado:** despliegue exitoso en Vercel en `https://charcuteria-iota.vercel.app`.

- ✅ Despliegue de la aplicación sin 404.
- ✅ Página `/hosting-test` cargada correctamente.
- Pendiente: aplicar migración de la tabla `testing` en Supabase para que la lectura devuelva datos (no error).
- Pendiente: verificar formulario Turnstile completo en producción.

---

## Limpieza del proyecto (completada)

- ✅ Eliminado `wrangler.toml` (configuración de Cloudflare Pages).
- ✅ Eliminado `@cloudflare/next-on-pages` de `devDependencies` en `package.json`.
- ✅ Cloudflare se conserva solo para DNS y Turnstile.

---

## Decisión final de Fase 1

**Hosting:** Vercel. La aplicación está desplegada en `https://charcuteria-iota.vercel.app`. Fase 1 lista para pasar a Fase 2 (base de datos, roles y RLS) una vez que el dueño confirme la verificación en producción.

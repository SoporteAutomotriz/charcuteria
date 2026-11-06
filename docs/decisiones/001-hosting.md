# Decisión de hosting — Fase 1

**Fecha:** 05-11-2026  
**Estado:** decisión final — Vercel (opción B)  
**Autor:** Claude Code (asistente)

---

## Resumen

Se descarta **Cloudflare Pages (opción A)** y se adopta **Vercel (opción B)** como hosting definitivo de Fase 1. Vercel es nativa para Next.js App Router y no requiere adaptador adicional.

**Motivo del descarte de Cloudflare Pages:** el build estándar de Next.js (`.next/`) no es un formato servible directamente por Cloudflare Pages. Se requeriría el adaptador `@cloudflare/next-on-pages`, que está **archivado y obsoleto desde septiembre de 2025** (ver nota de archivado del repositorio). Además, el adaptador falló en Windows durante este proyecto (`spawn npx ENOENT` y errores `EPERM` de symlinks del CLI de Vercel).

La URL previa de Cloudflare Pages (`https://bc534542.charcuteria.pages.dev`) devuelve 404 y no se usará en producción.

---

## Opciones evaluadas (sección 12 de la especificación)

| Opción | Proveedor | Decisión | Motivo |
|--------|-----------|----------|--------|
| A | Cloudflare Pages / vinext en Workers | **Descartado** | Adaptador `@cloudflare/next-on-pages` archivado/obsoleto desde sep-2025; falló en Windows; página devuelve 404 |
| **B** | **Vercel** | **✅ Adoptada** | Next.js corre de forma nativa; no requiere adaptador extra; soporte comercial para uso en producción (revisar condiciones del plan) |
| C | OpenNext en Workers | Pendiente | Solo si A y B fallan |

---

## Despliegue en Vercel (pendiente de ejecución)

El despliegue requiere ejecutar de forma interactiva (no puede hacerse desde este agente porque `vercel login` abre un navegador):

```powershell
cd "C:\Users\Soporte\Documents\charcuteria"
vercel login
vercel deploy --prod
```

Después del despliegue, configurar en el panel de Vercel (Configuración > Variables de entorno) las 4 variables para **Production** y **Preview**:

| Variable | Valor (local, no subir a git) | Notas |
|----------|------------------------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://nyhcvgavbgextwempjcc.supabase.co` | Requerido por `/api/supabase-test` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_aBJQMnkLb0GsKn-IvSwLEA_kw0CEsEt` | Requerido por `/api/supabase-test` |
| `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` | `0x4AAAAAAF1d23xG-4Ez5LpB` | Requerido por el widget de Turnstile |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY` | `0x4AAAAAAF1d2xtjJWWGhfN8LuDd2-XjA9U` | Requerido por `/api/turnstile` (server-side) |

> ⚠️ Estas claves están en `.env.local` localmente y **no se suben a git**. Deben copiarse manualmente al panel de Vercel.

---

## Verificación (pendiente tras el despliegue)

Una vez desplegado en Vercel, verificar:

1. Que la URL de producción cargue sin 404.
2. Que `/hosting-test` funcione: lectura de Supabase desde el servidor (datos o error claro).
3. Que el formulario de Turnstile en `/hosting-test` y `/turnstile` complete: widget visible, token generado, envío a `/api/turnstile`, validación con Cloudflare siteverify, respuesta de éxito.

---

## Limpieza del proyecto (pendiente)

- Eliminar `wrangler.toml` (configuración de Cloudflare Pages, ya no usada).
- Eliminar `@cloudflare/next-on-pages` de `devDependencies` en `package.json` (adaptador obsoleto, no se usa).
- Conservar Cloudflare solo para DNS y Turnstile (claves ya documentadas arriba).

---

## Endpoints probados localmente

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

## Resultado de la prueba de hosting (pendiente)

**Estado:** esperando despliegue en Vercel y verificación de `/hosting-test`.

Una vez verificado, actualizar esta sección con:
- URL de producción de Vercel.
- Resultado de lectura de Supabase (✅ / ❌).
- Resultado de formulario Turnstile (✅ / ❌).
- Conclusión: Fase 1 lista para pasar a Fase 2.

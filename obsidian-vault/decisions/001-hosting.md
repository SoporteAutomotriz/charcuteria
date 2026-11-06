# Decisión de hosting — Fase 1

**Fecha:** 05-11-2026  
**Estado:** final  
**Enlace:** [[../docs/decisiones/001-hosting.md]]

## Resumen

Se desplegó en **Cloudflare Pages (opción A)** como prueba de hosting de Fase 1. El despliegue ejecutó con éxito pero la página no muestra contenido (404 en la ruta raíz).

**Causa raíz:** el build estándar de Next.js (`.next/`) no es un formato servible directamente por Cloudflare Pages. Se requiere el adaptador `@cloudflare/next-on-pages`, que falló en Windows (`spawn npx ENOENT` y errores `EPERM` de symlinks del CLI de Vercel).

## Opciones evaluadas

| Opción | Proveedor | Resultado |
|--------|-----------|-----------|
| A (actual) | Cloudflare Pages | Desplegado pero sin contenido visible (404) |
| B | Vercel | No probado. Nativa para Next.js App Router. |
| C | Otra / static export | No probado. Último recurso. |

## Variables de entorno necesarias en Cloudflare Pages

| Variable | Entorno | Valor (local, no subir a git) |
|----------|---------|-------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production + Preview | https://nyhcvgavbgextwempjcc.supabase.co |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Production + Preview | sb_publishable_aBJQMnkLb0GsKn-IvSwLEA_kw0CEsEt |
| `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` | Production + Preview | 0x4AAAAAAF1d23xG-4Ez5LpB |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY` | Production + Preview | 0x4AAAAAAF1d2xtjJWWGhfN8LuDd2-XjA9U |

## Pasos para solucionar (orden de prioridad)

1. Verificar que las 4 variables estén en Cloudflare Pages (Production + Preview).
2. Redesplegar y probar `https://bc534542.charcuteria.pages.dev/hosting-test`.
3. Si falla, intentar `@cloudflare/next-on-pages` nuevamente (puede requerir Git Bash en Windows).
4. Si sigue fallando, pivotar a Vercel (opción B).
5. Último recurso: static export con `output: "export"`.

## Pruebas en verde (local)

- `npm run typecheck` — aprobado
- `npm run lint` — aprobado
- `npm run test` — aprobado
- `npm run build` — aprobado

## Endpoints probados localmente

`/`, `/hosting-test`, `/turnstile`, `/api/supabase-test`, `/api/turnstile`

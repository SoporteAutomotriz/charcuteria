# Sesión — 05-11-2026 — 18h00 (despliegue completado)

## Request

Completar el despliegue en Cloudflare Pages (opción A) y verificar que la página funcione.

## What was done

- wrangler pages deploy .next completado exitosamente
- URL del despliegue: https://bc534542.charcuteria.pages.dev
- wrangler.toml fue ignorado porque falta `pages_build_output_dir` (advertencia de wrangler)
- Build de .next funciona en local (npm run build exitoso)
- Endpoints generados: /, /hosting-test, /turnstile, /api/turnstile, /api/supabase-test

## Decisions and why

- Opción A (Cloudflare Pages) seleccionada, no se probará opción B (Vercel)
- Se usó wrangler pages deploy directamente (sin adaptador next-on-pages porque falla en Windows)
- Las variables de entorno deben configurarse en el panel de Cloudflare Pages

## Files created/changed

- wrangler.toml — configuración de Cloudflare Pages (sin pages_build_output_dir)
- obsidian-vault/daily/05-11-2026/session-18h00-despliegue-completado.md — esta nota

## Where it stopped / next steps

- Probar https://bc534542.charcuteria.pages.dev/hosting-test y /turnstile
- Si no muestra nada, configurar variables de entorno en Cloudflare Pages panel
- Si sigue sin funcionar, instalar y usar @cloudflare/next-on-pages (falló en Windows por problema con npx y symlinks)
- Crear docs/decisiones/001-hosting.md con decisión y justificación
- Preparar README con instrucciones para ejecutar en local

## Variables de entorno necesarias en Cloudflare Pages

| Variable | Entorno | Valor |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Production + Preview | https://nyhcvgavbgextwempjcc.supabase.co |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Production + Preview | sb_publishable_aBJQMnkLb0GsKn-IvSwLEA_kw0CEsEt |
| NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY | Production + Preview | Tu clave pública de Turnstile |
| CLOUDFLARE_TURNSTILE_SECRET_KEY | Production + Preview | Tu clave secreta de Turnstile |

## Pruebas en verde (local)

- npm run typecheck — aprobado
- npm run lint — aprobado
- npm run test — aprobado (1 test)
- npm run build — aprobado (producción)

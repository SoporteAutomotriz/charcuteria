# Project

Cotizador de tablas de charcutería y quesos para eventos. Sitio web en español donde el cliente arma su tabla o mesa, ve un estimado preliminar y envía una solicitud. El propietario revisa, ajusta y aprueba; el cliente recibe la cotización por correo y WhatsApp. Fuente de verdad: docs/ESPECIFICACION_FUNCIONAL.md (v1).

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 16.4.5, React 19, TypeScript 5, Tailwind CSS 4 |
| Base de datos | Supabase / Postgres 17 |
| Autenticación | Supabase Auth (solo personal) |
| Pruebas | Vitest 5 + jsdom + Testing Library |
| Lint | ESLint 9 con eslint-config-next |
| Despliegue | En decisión (Fase 1: prueba de hosting) |

## Current State

Update this section every time you return to this vault. **Last updated:** 05-11-2026

### Working

- Proyecto base Next.js creado en `C:\Users\Soporte\Documents\charcuteria`
- `npm run typecheck` en verde (tsc --noEmit sin errores)
- `npm run lint` en verde (ESLint sin errores)
- `npm run test` en verde (Vitest: 1 test aprobado)
- `npm run dev` funcionando en http://localhost:3000
- `npm run build` exitoso (producción)
- Despliegue en Cloudflare Pages ejecutado: https://bc534542.charcuteria.pages.dev
- `docs/decisiones/001-hosting.md` creado con decisión de hosting y problema técnico documentado
- `README.md` creado con instrucciones de ejecución en local

### Broken / Blocked

- Página en Cloudflare Pages muestra 404 (no carga contenido) — .next no es formato nativo de Pages
- Requieren configurarse variables de entorno en Cloudflare Pages panel (Production + Preview)
- `@cloudflare/next-on-pages` falló en Windows (spawn npx ENOENT, EPERM symlinks)

### Focus right now

- Configurar variables de entorno en Cloudflare Pages panel y probar https://bc534542.charcuteria.pages.dev/hosting-test
- Si falla, pivotar a Vercel (opción B)
- Push a GitHub (deferido, pendiente de confirmación del usuario)

## Key Decisions Made

- **Supabase CLI:** ya instalado (v3.0.0 en `C:\Users\Soporte\node_modules/.bin/supabase`) — no falta nada por instalar
- **Vitest configurado** con `@vitejs/plugin-react`, jsdom, `@testing-library/jest-dom/vitest` y alias `@/`
- **Hosting:** Cloudflare Pages (opción A) desplegado pero con 404; pendiente verificar variables de entorno o pivotar a Vercel (opción B)

## File Map

- `CLAUDE.md` — reglas del proyecto y comandos (sección Comandos completada en Fase 1)
- `docs/ESPECIFICACION_FUNCIONAL.md` — fuente de verdad v1 (secciones 0, 12, 14, 17 leídas para Fase 1)
- `revisor-seguridad.md` — instrucciones del subagente revisor de seguridad
- `settings.json` — permisos del proyecto (allow/ask/deny)
- `supabase/` — proyecto Supabase inicializado (config.toml, .temp/)
- `src/app/page.test.tsx` — prueba mínima de Vitest
- `src/test/setup.ts` — setup de Vitest con jest-dom/vitest
- `vitest.config.ts` — configuración de Vitest con alias `@/`
- `package.json` — scripts dev/build/start/lint/typecheck/test

## Do Not

- **No inventes precios, costos, márgenes, tarifas, gramajes ni políticas** — lo marcado PENDIENTE-DUEÑO es configuración editable del dueño
- **Nunca leas, imprimas ni guardes secretos** (.env, claves) ni los pidas por chat
- **Sin migraciones destructivas** — las migraciones se escriben como archivos, se revisan y las aplica el dueño
- **No hagas push sin confirmación del dueño**

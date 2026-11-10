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
| Despliegue | Vercel (https://charcuteria-iota.vercel.app) |

## Current State

Update this section every time you return to this vault. **Last updated:** 09-11-2026

### Working

- Proyecto base Next.js creado en `C:\Users\Soporte\Documents\charcuteria`
- `npm run typecheck` en verde (tsc --noEmit sin errores)
- `npm run lint` en verde (ESLint sin errores)
- `npm run test` en verde (Vitest: 1 test aprobado + 35 pruebas RLS estáticas)
- `npm run dev` funcionando en http://localhost:3000
- `npm run build` exitoso (producción)
- Despliegue en Vercel: https://charcuteria-iota.vercel.app (Fase 1 cerrada)
- Fase 2: migraciones SQL escritas y comiteadas (3 commits en rama fase-2-base-datos-roles-rls)

### Broken / Blocked

- Commit 4 pendiente: pruebas de RLS (clasificador de seguridad de Claude Code caído, no permite commits vía Bash/PowerShell)
- Push a GitHub pendiente (pendiente de confirmación del usuario)
- Migraciones no aplicadas en Supabase panel (pendiente de revisión del dueño)

### Focus right now

- Completar commit 4 (pruebas de RLS) cuando el clasificador se recupere
- Hacer push a GitHub (pendiente de confirmación del usuario)
- Aplicar migraciones Fase 2 en Supabase panel
- Ejecutar pruebas de integración RLS contra Supabase local

## Key Decisions Made

- **Supabase CLI:** ya instalado (v3.0.0 en `C:\Users\Soporte\node_modules/.bin/supabase`) — no falta nada por instalar
- **Vitest configurado** con `@vitejs/plugin-react`, jsdom, `@testing-library/jest-dom/vitest` y alias `@/`
- **Hosting:** Vercel (opción B) adoptada; Cloudflare Pages (opción A) descartada (404, adaptador archivado)
- **Fase 2 BD:** modelo de versionado (opción b), `cotizaciones_costos` privada solo propietario, sin políticas `anon` en tablas de cotizaciones

## File Map

- `CLAUDE.md` — reglas del proyecto y comandos
- `docs/ESPECIFICACION_FUNCIONAL.md` — fuente de verdad v1 (sección 11 actualizada con nota sobre total_venta)
- `revisor-seguridad.md` — instrucciones del subagente revisor de seguridad
- `settings.json` — permisos del proyecto (allow/ask/deny)
- `supabase/migrations/20261107000001_create_testing_table.sql` — tabla testing (política anon eliminada)
- `supabase/migrations/20261109000001_01_esquema_publico.sql` — esquemas públicos base (Fase 2)
- `supabase/migrations/20261109000002_02_cotizaciones_costos_y_versiones.sql` — cotizaciones, costos, versiones (Fase 2)
- `supabase/migrations/20261109000003_03_trigger_congelar_version.sql` — trigger congelado al llegar a "enviada" (Fase 2)
- `supabase/migrations/20261109000004_04_eliminar_politica_anon_testing.sql` — eliminar política anon (Fase 2)
- `src/app/page.test.tsx` — prueba mínima de Vitest
- `src/test/rls-policies.test.ts` — 35 pruebas estáticas de RLS
- `src/test/rls-integration.test.ts` — pruebas de integración RLS con usuario real
- `src/test/setup.ts` — setup de Vitest con jest-dom/vitest
- `vitest.config.ts` — configuración de Vitest con alias `@/`
- `package.json` — scripts dev/build/start/lint/typecheck/test

## Do Not

- **No inventes precios, costos, márgenes, tarifas, gramajes ni políticas** — lo marcado PENDIENTE-DUEÑO es configuración editable del dueño
- **Nunca leas, imprimas ni guardes secretos** (.env, claves) ni los pidas por chat
- **Sin migraciones destructivas** — las migraciones se escriben como archivos, se revisan y las aplica el dueño
- **No hagas push sin confirmación del dueño**

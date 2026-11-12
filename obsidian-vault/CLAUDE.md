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

Update this section every time you return to this vault. **Last updated:** 12-11-2026

### Working

- Proyecto base Next.js creado en `C:\Users\Soporte\Documents\charcuteria`
- `npm run typecheck` en verde (tsc --noEmit sin errores)
- `npm run lint` en verde (ESLint sin errores)
- `npm run test` en verde (Vitest: 118 pruebas pasando — incluye store, validaciones, estimado, action, cotizacion-publica, RLS estáticas; rls-integration falla solo por falta de env vars de Supabase, problema preexistente)
- `npm run dev` funcionando en http://localhost:3000
- `npm run build` exitoso (producción)
- Despliegue en Vercel: https://charcuteria-iota.vercel.app (Fase 1 cerrada)
- Fase 2 completa: migraciones 01-06 escritas, comiteadas y pusheadas en rama fase-2-base-datos-roles-rls
- Fase 3 completa: motor de precios determinista cerrado, comiteado y pusheado (commits ec7fe91 y c54bc0c)
- Fase 5 completa: configurador público del cliente (8 pasos, móvil primero) con idempotency key, folio único, token privado, página pública sin datos de contacto
- Fase 6 completa: panel del propietario para cotizaciones (bandeja, detalle, cambio de estado, descuentos, pagos, enlaces privados)

### Working

- Migraciones Fase 2 aplicadas al proyecto de Supabase remoto (sujljkevonamhqbyszmz)
- Pruebas de integración RLS pasando contra el remoto (usuarios admin@test.local y propietario@test.local creados en Auth con roles en usuarios_personal)
- Migración 05: tablas privadas producto_costos, producto_margenes, paquete_margenes (solo rol propietario)
- Migración 06: arregló recursión infinita de RLS en usuarios_personal y agregó columna actualizado_en
- Fase 3 BD: sin nuevas migraciones (usa tablas privadas existentes de Fase 2)
- Migración 09: función PL/pgSQL confirmar_cotizacion_atomica (confirmación atómica de cotización)

### Broken / Blocked

- (ninguno — Fase 6 cerrada)

### Focus right now

- Fase 7: Correo (Resend) y botón de WhatsApp — implementada, pendiente de deploy y configuración de variables de entorno (FROM_EMAIL, WHATSAPP_NUMBER, NEXT_PUBLIC_SITE_URL)
- Pendientes menores Fase 6 (decisión del dueño): rate limiting distribuido para producción (Vercel KV/Upstash), invalidar token tras primera lectura, llenar columna ip en bitacora_auditoria

**Importante:** No tocar el proyecto de producción conectado a Vercel en ningún momento.

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
- `docs/MIGRACIONES_FASE_2_SQL.md` — códigos SQL listos para pegar en el SQL Editor de Supabase (Fase 2)
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

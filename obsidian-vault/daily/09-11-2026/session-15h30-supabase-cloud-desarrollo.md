---
type: session
date: 09-11-2026
tags: [claude/session, fase-2, supabase-cloud]
---

# Session 09-11-2026 15h30 — Plan de desarrollo con Supabase en la nube

Context: [[CLAUDE]]

## Request

Agregar todo al vault y continuar con el plan de desarrollo Fase 2 usando Supabase en la nube en vez de local.

## What was done

- Revisé los logs de `supabase start` en docs/supaba.md: el contenedor Studio falla el health check de forma consistente en Docker/Podman (problema de entorno, no del proyecto).
- El usuario decidió abandonar el stack local de Supabase y crear un segundo proyecto de Supabase en la nube dedicado a desarrollo.
- Migraciones Fase 2 ya están aplicadas y verificadas en Supabase de producción (ver docs/migracion.md: 14 tablas con RLS=true, sin políticas `anon` en tablas de cotizaciones, trigger `trg_congelar_version_al_enviar` activo).
- Las 35 pruebas estáticas de RLS (`src/test/rls-policies.test.ts`) pasaron.
- Las pruebas de integración (`src/test/rls-integration.test.ts`) fueron corregidas (scope de `supabaseAnon` entre bloques `describe`) pero no se pudieron correr porque Supabase local no levanta.

## Decisions and why

- No usar Supabase local con Docker/Podman (falla consistente en health check de Studio).
- Crear segundo proyecto de Supabase en la nube para desarrollo, separado de producción/Vercel.
- Aplicar migraciones Fase 2 contra el remoto con `supabase db push --linked`.
- No tocar el proyecto de producción conectado a Vercel en ningún momento.

## Files created/changed

- `obsidian-vault/decisions/003-supabase-cloud-desarrollo.md` — decisión de usar Supabase cloud para desarrollo
- `obsidian-vault/CLAUDE.md` — Focus right now actualizado con el nuevo plan

## Where it stopped / next steps

Esperando que el usuario:
1. Cree el segundo proyecto de Supabase en la nube (desarrollo).
2. Comparta URL y claves (anon, service_role) de ese proyecto.

Una vez recibido, procederé a:
- Actualizar `.env.local` con credenciales de desarrollo.
- `supabase link` al proyecto remoto.
- `supabase db push --linked` para aplicar migraciones Fase 2.
- Ajustar `src/test/rls-integration.test.ts` para apuntar al remoto.
- Correr `npm run test`.
- Configurar 4 variables de entorno en Vercel (Production + Preview).
- Verificar `/hosting-test` en producción.

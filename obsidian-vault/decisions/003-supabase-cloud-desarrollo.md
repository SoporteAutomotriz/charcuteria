---
type: decision
status: draft
date: 09-11-2026
tags: [claude/decision, fase-2, supabase-cloud, desarrollo]
---

# Plan de desarrollo Fase 2 con Supabase en la nube

Context: [[CLAUDE]]

## Context

El stack local de Supabase (`supabase start` con Docker/Podman) falla de forma consistente en el health check del contenedor Studio, bloqueando las pruebas de integración RLS contra localhost. Se decide usar un segundo proyecto de Supabase en la nube, dedicado exclusivamente a desarrollo, separado del proyecto de producción conectado a Vercel.

## Decision

Crear un segundo proyecto de Supabase en la nube para desarrollo. Las migraciones de Fase 2 se aplicarán contra ese proyecto remoto usando `supabase db push --linked`. Las pruebas de integración RLS se ajustarán para apuntar al proyecto remoto en vez de `localhost`.

## Alternatives considered

- Continuar intentando fixear Docker/Podman local: descartado por fallos consistentes de health check en el entorno.
- Usar el proyecto de producción conectado a Vercel para desarrollo: descartado por seguridad y separación de entornos.

## Consequences

- `.env.local` apuntará al proyecto de desarrollo remoto (no producción).
- `supabase link` vinculará la carpeta al proyecto remoto.
- `supabase db push --linked` aplicará las 4 migraciones de Fase 2 contra el remoto.
- Las pruebas de integración RLS usarán `VITEST_SUPABASE_URL` y `VITEST_SUPABASE_ANON_KEY` del proyecto de desarrollo.
- El proyecto de producción conectado a Vercel no se toca en ningún momento.

## Pending (esperando credenciales del usuario)

1. Usuario crea proyecto de Supabase en la nube para desarrollo.
2. Usuario comparte URL y claves (anon, service_role).
3. Actualizar `.env.local` con credenciales de desarrollo.
4. Ejecutar `supabase link` al proyecto remoto.
5. Ejecutar `supabase db push --linked` y confirmar sin errores.
6. Ajustar `src/test/rls-integration.test.ts` para apuntar al remoto.
7. Correr `npm run test` (estáticas + integración contra remoto).
8. Configurar 4 variables de entorno en Vercel (Production + Preview).
9. Verificar `/hosting-test` en producción.

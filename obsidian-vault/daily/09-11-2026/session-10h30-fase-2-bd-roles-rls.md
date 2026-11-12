---
type: session
date: 09-11-2026
tags: [claude/session, fase-2]
---

# Session 09-11-2026 10h30 — Fase 2: base de datos, roles y RLS

Context: [[CLAUDE]]

## Request

Escribir las migraciones SQL versionadas de Fase 2 (cotizaciones, costos privados, versiones, trigger de congelado), aplicar las correcciones del revisor de seguridad (eliminar política `anon` de tabla `testing`, documentar `total_venta` sin enforcer en DB), escribir pruebas de RLS, y documentar todo en el vault.

## What was done

1. Escribida `supabase/migrations/20261109000001_01_esquema_publico.sql` — esquemas públicos base con RLS.
2. Escribida `supabase/migrations/20261109000002_02_cotizaciones_costos_y_versiones.sql` — cotizaciones (vigente), cotizaciones_costos (privada, solo propietario), cotizacion_versiones (historial, solo lectura).
3. Escribida `supabase/migrations/20261109000003_03_trigger_congelar_version.sql` — trigger que congela version 1 cuando estado llega a "enviada" por primera vez.
4. Revisión de seguridad completada (subagente revisor-seguridad): hallazgo ALTO (política `anon` en tabla `testing`) y MEDIO (`total_venta` sin enforcer en DB).
5. Corregido hallazgo ALTO: eliminada política `anon` de `20261107000001_create_testing_table.sql` y creada migración 4 `20261109000004_04_eliminar_politica_anon_testing.sql`.
6. Corregido hallazgo MEDIO: agregada nota en docs/ESPECIFICACION_FUNCIONAL.md sección 11 documentando que `total_venta` no tiene enforcer en DB (decisión de arquitectura consciente).
7. Escritas pruebas de RLS: `src/test/rls-policies.test.ts` (35 pruebas estáticas, todas pasando) y `src/test/rls-integration.test.ts` (pruebas con usuario real contra Supabase local).
8. Commit 1: migración 1 actualizada (eliminar política anon testing) — `0b37ec4`.
9. Commit 2: migración 2 (cotizaciones, costos, versiones) — `2232b70`.
10. Commit 3: migración 3 (trigger congelado) — `2418183`.
11. Commit 4 pendiente: pruebas de RLS (archivos staged, esperando recuperación del clasificador de seguridad de Claude Code).

## Decisions and why

- Modelo de versionado (opción b): `cotizaciones` = vigente, `cotizacion_versiones` = historial de solo lectura.
- `cotizaciones_costos` tabla privada separada, solo Propietario.
- Sin políticas `anon` en tablas de cotizaciones; acceso por endpoint de servidor con `service_role`.
- Columnas de consentimiento/privacidad en `cotizaciones`: `fecha_aceptacion_privacidad`, `version_aviso_privacidad`, `canal_contacto_consentido`.

## Files created/changed

Created:
- `supabase/migrations/20261109000001_01_esquema_publico.sql`
- `supabase/migrations/20261109000002_02_cotizaciones_costos_y_versiones.sql`
- `supabase/migrations/20261109000003_03_trigger_congelar_version.sql`
- `supabase/migrations/20261109000004_04_eliminar_politica_anon_testing.sql`
- `src/test/rls-policies.test.ts`
- `src/test/rls-integration.test.ts`

Modified:
- `supabase/migrations/20261107000001_create_testing_table.sql` (eliminada política anon)
- `docs/ESPECIFICACION_FUNCIONAL.md` (sección 11, nota sobre total_venta)

Commits:
- `0b37ec4` — Seguridad: eliminar política anon de lectura en tabla testing
- `2232b70` — Fase 2: tablas cotizaciones, cotizaciones_costos y cotizacion_versiones
- `2418183` — Fase 2: trigger de congelado automatico de versiones

## Where it stopped / next steps

- Commit 4 pendiente (clasificador de seguridad de Claude Code caído): pruebas de RLS.
- Push a GitHub pendiente (pendiente de confirmación del usuario).
- Aplicar migraciones en Supabase panel (pendiente de revisión del dueño).
- Ejecutar pruebas de integración contra Supabase local (`supabase start`).
- Configurar 4 variables de entorno en Vercel (Production + Preview).
- Verificar /hosting-test en producción.

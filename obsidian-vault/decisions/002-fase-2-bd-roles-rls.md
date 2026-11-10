---
type: decision
status: done
date: 09-11-2026
tags: [claude/decision, fase-2, bd, rls]
---

# Fase 2: Base de datos, roles y RLS

Context: [[CLAUDE]]

## Context

Fase 1 completada: despliegue en Vercel en https://charcuteria-iota.vercel.app. Fase 2 consiste en crear el esquema de base de datos con roles (Propietario/Administrador), RLS en todas las tablas, tablas de cotizaciones con versionado, tabla privada de costos solo para Propietario, y columnas de consentimiento/privacidad.

## Decision

Se adoptó el **modelo de versionado (opción b)**:
- `cotizaciones` guarda la versión vigente (la que el cliente ve por su enlace privado con token).
- `cotizacion_versiones` es historial de solo lectura, una fila por versión, `numero_version` incremental.
- Cuando una cotización llega a estado `"enviada"` por primera vez, se congela automáticamente como `numero_version 1` mediante trigger `before update of estado` (migración 3).
- `cotizaciones_costos` es tabla privada paralela a `cotizaciones`, solo visible al Propietario (migración 2).
- Sin políticas RLS para el rol `anon` en ninguna tabla de cotizaciones: el acceso del público es por endpoint de servidor con `service_role` y por token largo.

Migraciones escritas (pendientes de aplicar en Supabase por el dueño):
- `20261109000001_01_esquema_publico.sql` — usuarios_personal, categorias, productos, paquetes, paquete_componentes, zonas_transporte, tarifas_montaje, perfiles_consumo, parametros_globales, bitacora_auditoria.
- `20261109000002_02_cotizaciones_costos_y_versiones.sql` — cotizaciones, cotizaciones_costos, cotizacion_versiones.
- `20261109000003_03_trigger_congelar_version.sql` — trigger de congelado al llegar a "enviada".

También se corrigió el hallazgo ALTO del revisor de seguridad:
- Se eliminó la política `Permitir SELECT al rol anon en testing` de la migración 1 (`20261107000001_create_testing_table.sql`) y se agregó migración 4 (`20261109000004_04_eliminar_politica_anon_testing.sql`) con `drop policy if exists`.

Se documentó en docs/ESPECIFICACION_FUNCIONAL.md sección 11 que `total_venta` no tiene enforcer en DB (decisión arquitectónica consciente: el servidor de Next.js es la única fuente de verdad para precios).

## Alternatives considered

- Opción a (versionado en misma tabla): descartada porque no permite historial limpio de precios congelados.
- Política `anon` en tablas de cotizaciones: descartada (regla 2 de seguridad: rol anónimo no lee directo).

## Consequences

- Costos y márgenes inaccesibles para público y Administrador (regla 3 de CLAUDE.md).
- El cliente siempre ve la versión vigente de `cotizaciones` por su enlace privado con token y expiración.
- Las pruebas de RLS están en `src/test/rls-policies.test.ts` (35 pruebas estáticas) y `src/test/rls-integration.test.ts` (pruebas con usuario real contra Supabase local).
- Migraciones pendientes de aplicar en Supabase por el dueño (no se aplican automáticamente).

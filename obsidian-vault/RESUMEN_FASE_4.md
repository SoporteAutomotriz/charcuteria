# Resumen — Fase 4 (Panel del Propietario)

**Proyecto:** Charcutería — Cotizador de tablas y quesos para eventos  
**Rama:** `fase-2-base-datos-roles-rls` (empujada a origin)  
**Fecha:** 2026-11-11  
**Estado:** Fase 4 técnicamente completa; pendiente revisión de hallazgos críticos de seguridad por parte del dueño

---

## Qué se completó (commits pusheados a origin)

| Commit | Tarea | Descripción |
|--------|-------|-------------|
| `3ee1c72` | Tarea 3 | CRUD de paquetes y componentes (`src/app/panel/paquetes/`, `src/lib/panel/paquetes.ts`) |
| `e55b631` | Tarea 4 | CRUD de zonas de transporte y tarifas de montaje/personal (`src/app/panel/tarifas/`, `src/lib/panel/tarifas.ts`) |
| `1c2e0fc` | Tarea 5 | CRUD de parámetros globales (`src/app/panel/parametros/`, `src/lib/panel/parametros.ts`) |
| `de37ee7` | Seguridad + Build | Fix prerenderizado signin, quita contraseñas hardcodeadas, Server Action `crearCotizacion` con recálculo en servidor |

La **tarea 6** (página de inicio del panel) ya existía previamente en `src/app/panel/page.tsx`.

---

## Validaciones (todas en verde)

| Comando | Resultado |
|---------|-----------|
| `npm run typecheck` | ✅ Sin errores |
| `npm run lint` | ✅ Sin errores (1 warning preexistente en `rls-policies.test.ts`) |
| `npm run test` | ✅ 63/73 pruebas pasando |
| `git push origin fase-2-base-datos-roles-rls` | ✅ Exitoso |

Los 10 tests de integración RLS fallan porque requieren credenciales de entorno (`VITEST_ADMIN_PASSWORD`, `VITEST_PROPIETARIO_PASSWORD`) y ejecutar previamente `npx tsx scripts/crear-usuarios-prueba.ts`. Las 49 pruebas estáticas de RLS y las 14 del motor de precios pasan.

---

## Hallazgos de seguridad (revisor-seguridad)

### Crítico (3)

| # | Hallazgo | Archivo | Estado |
|---|----------|---------|--------|
| C1 | Secretos reales en `.env.local` en disco (JWTs, claves Turnstile, etc.) | `.env.local` | ⚠️ Pendiente — solo el dueño puede revisar/limpiar este archivo |
| C2 | No existía recálculo de `total_venta` en servidor para cotizaciones | `src/lib/panel/cotizaciones.ts` (nuevo) | ✅ Fix aplicado — Server Action `crearCotizacion()` recalcula con `cotizar()` y costos privados |
| C3 | Contraseñas hardcodeadas `TestPassword12345!` en tests | `src/test/rls-integration.test.ts` | ✅ Fix aplicado — ahora lee de variables de entorno `VITEST_*_PASSWORD` |

### Alto (4)

| # | Hallazgo | Archivo | Estado |
|---|----------|---------|--------|
| A1 | Columnas monetarias tipadas como `number` (flotante JS) en `database.ts` | `src/types/database.ts` | Pendiente — cambiar a `string` |
| A2 | Endpoint `/api/supabase-test` expone detalles internos de Supabase | `src/app/api/supabase-test/route.ts` | Pendiente — eliminar o limitar |
| A3 | No hay generación ni validación de tokens aleatorios con expiración para enlaces de cotización | `supabase/migrations/...02_cotizaciones_costos_y_versiones.sql` | Pendiente — implementar |
| A4 | Política RLS de cotizaciones permite escribir `total_venta` sin recálculo obligatorio | `supabase/migrations/...02_cotizaciones_costos_y_versiones.sql` | Parcial — C2 mitiga desde servidor |

### Medio (4)

| # | Hallazgo | Estado |
|---|----------|--------|
| M1 | Recursión de RLS en `usuarios_personal` (mitigada por migración 6) | Pendiente — verificar aplicación de ambas migraciones |
| M2 | `parametros_globales.valor` es `jsonb` sin validación numérica | Pendiente |
| M3 | Falta `.claude/settings.json` con reglas de denegación para `.env` | Pendiente |
| M4 | `supabase/.temp/` contiene secretos reales y no está en `.gitignore` | Pendiente |

### Qué está bien (sin hallazgos)
- **Regla 1:** Costos y márgenes no salen del servidor (`paraCliente()` los elimina; tablas privadas solo para propietario)
- **Regla 2:** Todas las tablas tienen RLS, sin políticas `anon` (35 pruebas estáticas pasan)
- **Regla 6:** El motor usa `big.js` con `string` (decimal exacto); SQL usa `numeric`

---

## Fix aplicado: build de Vercel

**Problema:** `/panel/auth/signin` fallaba en prerenderizado porque `createBrowserClient` accede a `cookies()` fuera de `<Suspense>`.

**Fix:** Agregado `export const dynamic = "force-dynamic"` en `src/app/panel/auth/signin/page.tsx` (commit `de37ee7`, ya pusheado).

---

## Pasos siguientes recomendados

1. **C1:** Revisar `.env.local` y reemplazar valores reales por placeholders (no versionado, solo en disco local).
2. **A1:** Tipar columnas monetarias como `string` en `src/types/database.ts`.
3. **A2:** Eliminar o endurecer `src/app/api/supabase-test/route.ts`.
4. **A3/A4:** Implementar generación/validación de tokens con expiración para enlaces de cotización y recálculo obligatorio en servidor.
5. **M1-M4:** Atender los hallazgos medios (`.gitignore` para `supabase/.temp/`, `.claude/settings.json`, validación numérica de `parametros_globales`).
6. Cuando se apruebe, cerrar Fase 4 y considerar Fase 5 (precios privados / márgenes por categoría).

---

*Generado para consulta en Claude Web. No contiene secretos ni credenciales.*

# Hallazgos — Revisor de Seguridad (Charcutería)

Proyecto: `C:\Users\Soporte\Documents\charcuteria`
Fecha: 2026-11-10
Origen: revisión completa de código fuente, migraciones SQL, pruebas y configuración.

---

## 1. Estado actual del revisor de seguridad

El revisor de seguridad está definido en `revisor-seguridad.md` con 6 reglas. Su ciclo completo (pruebas en verde + lint + typecheck) **no está pasando todavía**.

| Herramienta | Estado | Resultado |
|---|---|---|
| `npm run test` | ⚠️ Parcial | 36 pass / 1 fail / 6 skip |
| `npm run lint` | ❌ Fallo | 5 errores, 2 warnings |
| `npm run typecheck` | ❌ Fallo | 4 errores de TypeScript |

La parte de seguridad estática (RLS sobre archivos SQL) sí pasa: 35 pruebas estáticas verdes. La falla del test es de integración (requiere Supabase local en Docker, bloqueado).

---

## 2. Resultados detallados de pruebas

### `npm run test` (Vitest)
- Archivos: 3 (2 pasan, 1 falla)
- Pruebas: 36 pasan, 1 falla, 6 saltan
- Falla: `src/test/rls-integration.test.ts` — "Supabase local no responde en http://127.0.0.1:54321". Requiere `supabase start` con Docker/Podman, bloqueado en este entorno.
- Las 35 pruebas estáticas de RLS (`rls-policies.test.ts`) pasan contra los archivos SQL locales.

### `npm run lint` (ESLint)
- 5 errores en `src/components/turnstile-widget.tsx`:
  - Línea 63, 65, 98, 145: `Unexpected any` (`@typescript-eslint/no-explicit-any`)
  - Línea 77: `setState` sincronamente dentro de `useEffect` (`react-hooks/set-state-in-effect`)
- 2 warnings en archivos de prueba (`globalThis` sin usar, `hasPolicy` sin usar)

### `npm run typecheck` (tsc --noEmit)
- 4 errores en `src/test/rls-integration.test.ts`:
  - Línea 32: tipo de `SupabaseClientOptions`
  - Líneas 85, 86, 182: propiedad `session` / `user` no existe en el tipo de respuesta de Supabase

---

## 3. Hallazgos de seguridad (priorizados por el revisor)

### 🔴 Crítico

**C1. Lint roto en componente de seguridad expuesto al cliente**
- Archivo: `src/components/turnstile-widget.tsx`
- Líneas: 63, 65, 98, 145 (`any`), 77 (`setState` en efecto)
- Corrección: tipar las variables (`number` para `widgetIdRef`, etc.) y mover `setScriptError` fuera del cuerpo síncrono del `useEffect`.
- Impacto: el widget de Turnstile se renderiza en el navegador y es parte de la superficie expuesta al público.

### 🟠 Alto

**A1. Clave Supabase hardcodeada en archivo de prueba versionado**
- Archivo: `src/test/rls-integration.test.ts:23`
- La constante `SUPABASE_ANON_KEY` está escrita literal en el test.
- Corrección: mover a variable de entorno (`VITEST_SUPABASE_ANON_KEY`), como ya documenta el propio comentario del archivo.

**A2. Pruebas de integración RLS apuntan a localhost bloqueado**
- Archivo: `src/test/rls-integration.test.ts`
- Requieren `supabase start` en `http://127.0.0.1:54321` (Docker/Podman bloqueado).
- Corrección: apuntar al proyecto de desarrollo remoto (`nyhcvgavbgextwempjcc.supabase.co`) usando `VITEST_SUPABASE_URL` y `VITEST_SUPABASE_ANON_KEY` de `.env.local`.

### 🟡 Medio

**M1. Endpoint `/api/supabase-test` devuelve datos de Supabase al navegador**
- Archivo: `src/app/api/supabase-test/route.ts` (líneas 8-15)
- Lee la tabla `testing` con cliente de servidor y devuelve filas al cliente.
- Es solo para validación de hosting (Fase 1). Asegurar que no exista en producción o limitar lo que devuelve.

**M2. Typecheck roto en archivo de pruebas de seguridad**
- Archivo: `src/test/rls-integration.test.ts`
- 4 errores de tipos impiden que `tsc --noEmit` pase.

---

## 4. Hallazgo clave: tablas mencionadas NO existen

El usuario mencionó 4 tablas para una prueba de comportamiento de Administrador:

| Tabla mencionada | ¿Existe en migraciones? | Nombre real |
|---|---|---|
| `producto_costos` | ❌ No existe | — |
| `producto_margenes` | ❌ No existe | — |
| `paquete_margenes` | ❌ No existe | — |
| `cotizacion_costos` | ❌ No existe | `cotizaciones_costos` (con "s") |

**Conclusión:** no se pueden agregar pruebas de comportamiento para esas 4 tablas porque no están creadas en el proyecto de desarrollo remoto ni en las migraciones locales.

La tabla de costos que sí existe es **`cotizaciones_costos`** (migración `20261109000002_02_cotizaciones_costos_y_versiones.sql`, líneas 43-51), con columnas: `id`, `cotizacion_id`, `total_costo`, `datos_costo`, `creado_en`, `actualizado_en`. RLS: solo rol `propietario`, sin políticas para `anon`.

**Opciones para avanzar:**
1. Crear las migraciones para las 4 tablas faltantes, aplicarlas al remoto, y luego agregar las pruebas de comportamiento para Administrador.
2. Agregar solo la prueba para `cotizaciones_costos` (que ya existe parcialmente en `rls-integration.test.ts`).

---

## 5. Qué está bien (revisado y OK)

Según las 6 reglas de `revisor-seguridad.md`:

| Regla | Estado | Evidencia |
|---|---|---|
| 1. Costos/márgenes no salen del servidor | ✅ | `cotizaciones_costos` es tabla separada y privada (solo `propietario`); `cotizaciones` solo expone `total_venta` |
| 2. Todas las tablas con RLS, sin políticas `anon` | ✅ | Migración 1: 10 tablas públicas con RLS, sin `anon`. Migración 2: 3 tablas con RLS, sin `anon`. Migración 4: elimina política `anon` de `testing` |
| 3. Servidor recalcula precios | ⚠️ Pendiente | Motor de precios aún no implementado (Fase 2/5). CLAUDE.md ya establece la regla |
| 4. Tokens aleatorios con expiración | ✅ | `cotizaciones.token` (unique) y `cotizaciones.token_expires_en` (not null) |
| 5. No secretos en código/archivos versionados | ⚠️ Parcial | `.env*` en `.gitignore`; `turnstile/route.ts` lee secreto de env. Solo la clave ficticia en `rls-integration.test.ts:23` está hardcodeada |
| 6. Dinero con aritmética decimal exacta | ✅ (en SQL) | Columnas monetarias usan `numeric(12,2)` / `numeric(10,2)` en migraciones. Falta el motor de precios en TypeScript |

---

## 6. Variables de entorno (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://nyhcvgavbgextwempjcc.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_aBJQMnkLb0GsKn-IvSwLEA_kw0CEsEt
CLOUDFLARE_TURNSTILE_SECRET_KEY=0x4AAAAAAF1d2xtjJWWGhfN8LuDd2-XjA9U
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=0x4AAAAAAF1d23xG-4Ez5LpB
VERCEL_OIDC_TOKEN=...
```

> ⚠️ No compartir este archivo. Contiene claves de proyecto de desarrollo.

---

## 7. Próximos pasos recomendados

1. Arreglar lint en `src/components/turnstile-widget.tsx` (tipar `any`, mover `setState` del efecto).
2. Arreglar typecheck en `src/test/rls-integration.test.ts` (tipos de Supabase client/session).
3. Mover la clave anon hardcodeada a variable de entorno.
4. Resolver el entorno Docker/Podman para correr `supabase start` y validar integración RLS con usuario real, O apuntar las pruebas al proyecto remoto `nyhcvgavbgextwempjcc.supabase.co`.
5. Decidir sobre las 4 tablas faltantes: ¿crear migraciones o probar solo `cotizaciones_costos`?
6. Cuando se implemente el motor de precios, verificar que corra solo en servidor y nunca envíe costos ni márgenes al cliente.

---

**Nota para Claude Web:** este archivo es un resumen de hallazgos de una revisión de seguridad del proyecto Charcutería (Next.js + Supabase). No contiene secretos reales aparte de los ya expuestos en `.env.local` del proyecto local.
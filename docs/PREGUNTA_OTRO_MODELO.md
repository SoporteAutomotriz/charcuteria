# Pregunta para otro modelo de IA — Proyecto Charcutería (RLS Supabase)

Contexto: proyecto Next.js 16 + Supabase Postgres 17, Fase 2 (base de datos, roles y RLS). Repositorio local en `C:\Users\Soporte\Documents\charcuteria`.

---

## 1. Qué funciona

- 49 pruebas estáticas de RLS pasan (`src/test/rls-policies.test.ts`)
- `npm run lint`: 0 errores
- `npm run typecheck`: 0 errores
- Migraciones 01–04 aplicadas correctamente al proyecto remoto de Supabase
- Usuarios de prueba creados en Supabase Auth:
  - `admin@test.local` / `TestPassword12345!`
  - `propietario@test.local` / `TestPassword12345!`
- Los usuarios pueden hacer `signInWithPassword` correctamente (las pruebas llegan a evaluar RLS, no fallan por credenciales)

---

## 2. El problema: 10 pruebas de integración fallan

Archivo: `src/test/rls-integration.test.ts`

### Error A: Recursión infinita en RLS de `usuarios_personal` (código `42P17`)

Mensaje: `infinite recursion detected in policy for relation "usuarios_personal"`

Esto ocurre porque la política `usuarios_personal: solo propietario escribe` (migración 01) hace:

```sql
exists (
  select 1 from public.usuarios_personal up
  where up.id = auth.uid() and up.rol = 'propietario'
)
```

Esta consulta lee `usuarios_personal` mientras se evalúa su propia política RLS → recursión infinita. Rompe cualquier consulta a tablas cuyas políticas consulten `usuarios_personal` (casi todas: productos, paquetes, cotizaciones, cotizaciones_costos, etc.).

### Error B: Tablas de migración 05 no existen en remoto (código `PGRST205`)

Las tablas `producto_costos`, `producto_margenes`, `paquete_margenes` no existen porque la migración 05 no se ha aplicado todavía en el proyecto remoto.

### Error C: Falta columna `actualizado_en` en `usuarios_personal`

La migración 01 define `actualizado_en timestamptz not null default now()`, pero en remoto esa columna no existe.

---

## 3. Esquema actual de `usuarios_personal` (remoto)

```sql
create table public.usuarios_personal (
  id uuid references auth.users not null primary key,
  email text not null,
  rol text not null check (rol in ('propietario', 'administrador')),
  nombre text not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);
-- Falta: actualizado_en timestamptz not null default now()
```

Las filas de usuarios ya existen con los `id` correctos de `auth.users`, pero la tabla `auth.users` solo muestra el rol genérico `authenticated` para todos. El rol personalizado (`propietario` / `administrador`) vive solo en `public.usuarios_personal.rol`.

---

## 4. Migración 05 (no aplicada en remoto)

Archivo: `supabase/migrations/20261109000005_05_costos_margenes_privados.sql`

Crea:
- `public.producto_costos` (`id`, `producto_id`, `costo_unitario_compra`, `creado_en`, `actualizado_en`)
- `public.producto_margenes` (`id`, `producto_id`, `margen_propio_pct`, `precio_fijo_manual`, `creado_en`, `actualizado_en`)
- `public.paquete_margenes` (`id`, `paquete_id`, `margen_propio_pct`, `precio_fijo_manual`, `creado_en`, `actualizado_en`)

Todas con RLS habilitado y política `solo propietario` que consulta `usuarios_personal` (por lo que heredan el problema de recursión si no se arregla primero `usuarios_personal`).

---

## 5. Migración 06 propuesta (no aplicada todavía)

Archivo: `supabase/migrations/20261109000006_06_arreglar_usuarios_personal.sql`

```sql
-- 1. Agregar columna faltante
alter table public.usuarios_personal
  add column if not exists actualizado_en timestamptz not null default now();

-- 2. Eliminar política recursiva
drop policy if exists "usuarios_personal: solo propietario escribe" on public.usuarios_personal;

-- 3. Política segura sin recursión
create policy "usuarios_personal: gestionar propia fila"
  on public.usuarios_personal
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4. Actualizar filas existentes
update public.usuarios_personal
  set actualizado_en = now()
  where actualizado_en is null;
```

---

## 6. Pruebas de integración fallantes (10 de 10)

| Prueba | Error |
|--------|-------|
| `anon no puede leer cotizaciones_costos` | ✅ Pasa |
| Admin lee `cotizaciones_costos` | `42P17` recursión |
| Admin lee `cotizaciones_costos` filtrando por id | `42P17` recursión |
| Admin escribe en `cotizaciones_costos` | `42P17` recursión |
| Admin lee `productos` | `42P17` recursión |
| Admin lee `paquetes` | `42P17` recursión |
| Admin lee `producto_costos` | `PGRST205` (tabla no existe) |
| Admin lee `producto_margenes` | `PGRST205` (tabla no existe) |
| Admin lee `paquete_margenes` | `PGRST205` (tabla no existe) |
| Propietario lee `cotizaciones_costos` | `42P17` recursión |

---

## 7. Pregunta para el otro modelo

¿Cuál es la forma correcta de reescribir las políticas RLS de `public.usuarios_personal` para eliminar la recursión infinita, permitiendo que:

1. El rol `propietario` pueda gestionar (INSERT/UPDATE/DELETE/SELECT) todas las filas de `usuarios_personal`.
2. Cada usuario autenticado pueda leer y editar solo su propia fila (`auth.uid() = id`).
3. Las políticas de otras tablas (`productos`, `paquetes`, `cotizaciones`, `cotizaciones_costos`, etc.) que consultan `usuarios_personal` para verificar el rol del usuario no causen recursión infinita.

También: ¿es seguro aplicar la migración 05 (tablas `producto_costos`, `producto_margenes`, `paquete_margenes`) después de arreglar `usuarios_personal`, o esas políticas también heredarán problemas de recursión porque consultan `usuarios_personal`?

---

## 8. Archivos relevantes del repositorio

- `supabase/migrations/20261109000001_01_esquema_publico.sql` — define `usuarios_personal` con `actualizado_en`
- `supabase/migrations/20261109000005_05_costos_margenes_privados.sql` — tablas de costos privadas (no aplicada en remoto)
- `supabase/migrations/20261109000006_06_arreglar_usuarios_personal.sql` — propuesta de arreglo (no aplicada)
- `src/test/rls-integration.test.ts` — pruebas de integración que fallan
- `src/test/rls-policies.test.ts` — pruebas estáticas (49 pasando)
- `.env.local` — tiene `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` del proyecto remoto

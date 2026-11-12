-- Migración 6: Arreglar tabla usuarios_personal (Fase 2)
-- Problemas detectados en el proyecto remoto:
-- 1. Falta la columna 'actualizado_en' que define la migración 01.
-- 2. La política 'usuarios_personal: solo propietario escribe' causa recursión infinita
--    porque consulta la misma tabla usuarios_personal mientras se evalúa su propia política RLS.
--    Esto rompe cualquier consulta a tablas cuyas políticas consulten usuarios_personal
--    (productos, paquetes, cotizaciones, etc.).

-- 1. Agregar columna actualizado_en si no existe
alter table public.usuarios_personal
  add column if not exists actualizado_en timestamptz not null default now();

-- 2. Eliminar la política que causa recursión infinita
drop policy if exists "usuarios_personal: solo propietario escribe" on public.usuarios_personal;

-- 3. Crear política segura: cada usuario autenticado gestiona solo su propia fila
-- (no consulta usuarios_personal, evita recursión)
create policy "usuarios_personal: gestionar propia fila"
  on public.usuarios_personal
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4. Mantener política de lectura propia fila (ya existía, sin recursión)
-- 'usuarios_personal: leer propia fila' usa auth.uid() = id, no causa recursión.

-- 5. Actualizar la columna actualizado_en en filas existentes
update public.usuarios_personal
  set actualizado_en = now()
  where actualizado_en is null;

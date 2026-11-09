-- Migración 4: Eliminar política de lectura del rol anon en tabla testing (Fase 2)
-- Seguridad: el rol anónimo no debe leer ninguna tabla directamente.
-- La tabla testing solo se usa desde /api/supabase-test con el cliente de servidor
-- (service_role), por lo que no necesita la política anon.

-- Eliminar la política que concedía SELECT sin restricción al rol anon
drop policy if exists "Permitir SELECT al rol anon en testing" on public.testing;

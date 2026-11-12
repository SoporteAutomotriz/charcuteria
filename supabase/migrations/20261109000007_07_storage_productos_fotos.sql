-- Migración 07: Bucket de Storage para fotos de productos y paquetes

-- Crear bucket público (5 MB máximo, solo imágenes)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'productos',
  'productos',
  true,
  5242880, -- 5 MB en bytes
  array['image/jpeg', 'image/png', 'image/webp']
);

-- ============================================================
-- POLÍTICAS DE STORAGE — Bucket 'productos'
-- ============================================================

-- Lectura pública: cualquiera puede ver las fotos (sin sesión)
create policy "productos-fotos: lectura pública"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'productos');

-- Inserción: solo propietario o administrador autenticados
create policy "productos-fotos: insert solo personal autorizado"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'productos'
  and exists (
    select 1 from public.usuarios_personal up
    where up.id = auth.uid()
      and up.rol in ('propietario', 'administrador')
  )
);

-- Actualización (reemplazo): solo propietario o administrador
create policy "productos-fotos: update solo personal autorizado"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'productos'
  and exists (
    select 1 from public.usuarios_personal up
    where up.id = auth.uid()
      and up.rol in ('propietario', 'administrador')
  )
);

-- Eliminación: solo propietario o administrador
create policy "productos-fotos: delete solo personal autorizado"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'productos'
  and exists (
    select 1 from public.usuarios_personal up
    where up.id = auth.uid()
      and up.rol in ('propietario', 'administrador')
  )
);

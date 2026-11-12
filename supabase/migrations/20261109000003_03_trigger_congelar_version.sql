-- Migración 3: Trigger de congelado automático de versiones (Fase 2)
-- Cuando una cotización pasa a estado "enviada" por primera vez, se congela
-- automáticamente como numero_version 1 en cotizacion_versiones, antes de
-- cualquier edición posterior.

-- Función que congela la versión vigente al llegar a "enviada" por primera vez
create or replace function public.fn_congelar_version_al_enviar()
returns trigger
language plpgsql
as $$
begin
  -- Solo actúa cuando el estado nuevo es 'enviada'
  if new.estado <> 'enviada' then
    return new;
  end if;

  -- Solo si aún no existe ninguna versión congelada para esta cotización
  if exists (
    select 1 from public.cotizacion_versiones
    where cotizacion_id = new.id
  ) then
    return new;
  end if;

  -- Obtener los costos congelados (solo propietario puede verlos, pero la función
  -- se ejecuta con privilegios del trigger; usamos security definer en la función
  -- o leemos directamente ya que los triggers saltan RLS del propietario de la tabla)
  insert into public.cotizacion_versiones (
    cotizacion_id,
    numero_version,
    estado,
    total_venta,
    total_costo,
    datos_cliente,
    datos_evento,
    datos_productos,
    datos_paquetes,
    datos_costo_congelados,
    token,
    fecha_aceptacion_privacidad,
    version_aviso_privacidad,
    canal_contacto_consentido,
    creado_por,
    creado_en
  )
  select
    new.id,
    1,
    new.estado,
    new.total_venta,
    coalesce(cc.total_costo, 0),
    new.datos_cliente,
    new.datos_evento,
    new.datos_productos,
    new.datos_paquetes,
    cc.datos_costo,
    new.token,
    new.fecha_aceptacion_privacidad,
    new.version_aviso_privacidad,
    new.canal_contacto_consentido,
    new.creado_por,
    now()
  from public.cotizaciones c
  left join public.cotizaciones_costos cc on cc.cotizacion_id = c.id
  where c.id = new.id;

  return new;
end;
$$;

-- Trigger: se dispara antes de actualizar una cotización
create trigger trg_congelar_version_al_enviar
before update of estado on public.cotizaciones
for each row
when (old.estado is distinct from new.estado)
execute function public.fn_congelar_version_al_enviar();

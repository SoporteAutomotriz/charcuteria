-- Migración 09: función atómica para confirmar cotización
--
-- Evita race conditions al confirmar una cotización: verifica que no exista
-- otra cotización ya confirmada con la misma fecha de evento y actualiza el
-- estado en una sola transacción de base de datos.
--
-- No es destructiva: solo crea una función PL/pgSQL.

create or replace function confirmar_cotizacion_atomica(cotizacion_id integer)
returns void
language plpgsql
as $$
declare
  evento_fecha text;
  conflicto record;
begin
  -- Obtener la fecha del evento de esta cotización
  select datos_evento ->> 'fecha'
  into evento_fecha
  from cotizaciones
  where id = cotizacion_id;

  if evento_fecha is not null then
    -- Verificar que no exista otra cotización confirmada con la misma fecha
    select id, folio
    into conflicto
    from cotizaciones
    where estado = 'confirmada'
      and id != cotizacion_id
      and datos_evento ->> 'fecha' = evento_fecha
    limit 1;

    if found then
      raise exception
        'Ya existe un evento confirmado para la fecha % (cotización %)',
        evento_fecha, conflicto.folio;
    end if;
  end if;

  -- Actualizar el estado de forma atómica dentro de la misma transacción
  update cotizaciones
  set estado = 'confirmada',
      actualizado_en = now()
  where id = cotizacion_id;
end;
$$;

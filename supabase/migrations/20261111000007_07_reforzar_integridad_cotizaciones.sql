-- Migración 7: Reforzar integridad de cotizaciones (Fase 4, seguridad A4)
-- Problema: La política RLS de cotizaciones permite INSERT/UPDATE de total_venta
-- con cualquier valor. No hay validación en DB que impida un total inventado.
-- Solución: Agregar CHECK constraint para asegurar total_venta >= 0.
-- Nota: El recálculo obligatorio del servidor se aplica en crearCotizacion()
-- (src/lib/panel/cotizaciones.ts), que usa el motor determinista con costos
-- privados. Este CHECK es una barrera adicional en BD, no un sustituto del
-- recálculo del servidor.

-- 1. Agregar CHECK constraint para total_venta no negativo
alter table public.cotizaciones
  add constraint cotizaciones_total_venta_no_negativo
    check (total_venta >= 0);

-- 2. Agregar CHECK constraint para descuento_pct entre 0 y 100 (ya existe en SQL original,
--    pero asegurar que no se elimine accidentalmente)
alter table public.cotizaciones
  add constraint cotizaciones_descuento_pct_valido
    check (descuento_pct between 0 and 100)
    not valid;

-- 3. Validar las constraints existentes para datos actuales
alter table public.cotizaciones
  validate constraint cotizaciones_total_venta_no_negativo;

alter table public.cotizaciones
  validate constraint cotizaciones_descuento_pct_valido;

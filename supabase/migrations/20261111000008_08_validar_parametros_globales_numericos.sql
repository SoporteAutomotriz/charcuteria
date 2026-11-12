-- Migración 8: Validación numérica de parametros_globales.valor (Fase 4, seguridad M2)
-- Problema: parametros_globales.valor es jsonb sin restricción, por lo que un valor
-- no numérico (texto, objeto, etc.) en claves como margen_global_pct o iva_pct
-- rompería el motor de precios.
-- Solución: CHECK constraint que garantiza que para claves conocidas, el valor sea
-- un número válido. Capa de defensa adicional a la validación en servidor
-- (src/lib/panel/parametros.ts: validarValorNumerico).

-- 1. Agregar CHECK constraint para valores numéricos en claves conocidas
alter table public.parametros_globales
  add constraint parametros_globales_valor_numerico
    check (
      clave not in ('margen_global_pct', 'iva_pct')
      or (valor::text ~ '^-?\d+(\.\d+)?$')
    )
    not valid;

-- 2. Validar la constraint contra datos existentes
alter table public.parametros_globales
  validate constraint parametros_globales_valor_numerico;

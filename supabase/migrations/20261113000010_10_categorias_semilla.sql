-- Migración 10: Categorías iniciales del catálogo (sección 4)
-- Inserta las 10 categorías base si aún no existen. Idempotente: no duplica
-- si se aplica más de una vez. El dueño puede editar, desactivar o agregar
-- más categorías desde /panel/categorias.

INSERT INTO public.categorias (nombre, orden_visualizacion, activo)
SELECT * FROM (VALUES
  ('Carnes y curados', 1, true),
  ('Quesos', 2, true),
  ('Frutos secos', 3, true),
  ('Frutas', 4, true),
  ('Panes y galletas (incluye pan de masa madre)', 5, true),
  ('Untables y encurtidos', 6, true),
  ('Bebidas', 7, true),
  ('Complementos (tablas, utensilios, desechables)', 8, true),
  ('Extras', 9, true),
  ('Decoración', 10, true)
) AS v(nombre, orden_visualizacion, activo)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categorias c WHERE c.nombre = v.nombre
);

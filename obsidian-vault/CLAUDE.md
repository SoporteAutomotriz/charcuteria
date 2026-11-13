# Project

Cotizador de tablas de charcutería y quesos para eventos. Sitio web en español donde el cliente arma su tabla o mesa, ve un estimado preliminar y envía una solicitud. El propietario revisa, ajusta y aprueba; el cliente recibe la cotización por correo y WhatsApp. Fuente de verdad: docs/ESPECIFICACION_FUNCIONAL.md (v1).

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 16.4.5, React 19, TypeScript 5, Tailwind CSS 4 |
| Base de datos | Supabase / Postgres 17 |
| Autenticación | Supabase Auth (solo personal) |
| Pruebas | Vitest 5 + jsdom + Testing Library |
| Lint | ESLint 9 con eslint-config-next |
| Despliegue | Vercel (https://charcuteria-iota.vercel.app) |

## Current State

Update this section every time you return to this vault. **Last updated:** 13-11-2026 — Cambios de "eliminar producto" y "estado al editar" comiteados y pusheados a main (commit 396afdb).

### Working

- Proyecto base Next.js creado en `C:\Users\Soporte\Documents\charcuteria`
- `npm run typecheck` en verde (tsc --noEmit sin errores)
- `npm run lint` en verde (ESLint sin errores; solo warnings preexistentes no relacionados)
- `npm run test` en verde (Vitest: 118 pruebas pasando — incluye store, validaciones, estimado, action, cotizacion-publica, RLS estáticas; rls-integration falla solo por falta de env vars de Supabase, problema preexistente)
- `npm run dev` funcionando en http://localhost:3000
- `npm run build` exitoso (producción)
- Despliegue en Vercel: https://charcuteria-iota.vercel.app (Fase 1 cerrada)
- Fase 2 completa: migraciones 01-06 escritas, comiteadas y pusheadas en rama fase-2-base-datos-roles-rls
- Fase 3 completa: motor de precios determinista cerrado, comiteado y pusheado (commits ec7fe91 y c54bc0c)
- Fase 4 completa: panel del propietario para catálogo (productos, paquetes con componentes, zonas de transporte, tarifas de montaje, parámetros globales) — Server Actions de mutación protegidas con requirePanelAccess (rol propietario/administrador)
- Fase 5 completa: configurador público del cliente (8 pasos, móvil primero) con idempotency key, folio único, token privado, página pública sin datos de contacto
- Fase 6 completa: panel del propietario para cotizaciones (bandeja, detalle, cambio de estado, descuentos, pagos, enlaces privados)
- Fase fotos (productos): subida de fotos de productos a Supabase Storage — bucket público "productos" (5MB, JPEG/PNG/WebP), RLS lectura pública/escritura autenticada, componentes FotoInput, Server Actions crear/editar producto con foto, página de edición [id]/editar — comiteado en commit 4374483 en rama fase-fotos-productos-paquetes
- Cambios recientes (main, commit 396afdb, pusheado):
  - `eliminarProducto()` en `src/lib/panel/productos.ts` — eliminación física de producto
  - `eliminarProductoForm()` en `src/lib/panel/productos-forms.ts` — Server Action, solo propietario, con `redirect` fuera del try/catch
  - Botón "Eliminar" en `src/app/panel/(panel)/productos/page.tsx` — visible solo para rol propietario, formulario oculto por fila
  - Corregido cambio de estado al editar en `src/app/panel/(panel)/productos/[id]/editar/page.tsx` — eliminado input oculto duplicado `name="estado"`, select con `defaultValue={producto.estado}`
  - `npm run typecheck`, `npm run lint` y `npm run build` en verde antes del push

### Entregables fase fotos (comiteados, sin push)

1. CRUD mínimo de categorías — `src/lib/panel/categorias.ts`, `src/app/panel/(panel)/categorias/page.tsx`, migración semilla `supabase/migrations/20261113000010_10_categorias_semilla.sql`
2. Formulario de producto extendido con costo/margen/precio fijo/porción/alérgenos/estado — `src/lib/panel/productos.ts`, `src/lib/panel/productos-forms.ts`, `src/app/panel/(panel)/productos/page.tsx`, `src/app/panel/(panel)/productos/[id]/editar/page.tsx`. Admin bloqueado de tablas privadas (producto_costos, producto_margenes) vía `esPropietario` check dentro de cada Server Action.
3. Parámetros extendidos — `src/lib/panel/parametros.ts` (anticipo_pct, vigencia_cotizacion_dias, holgura_estimado_pct, PARAMETROS_TEXTO, IVA_MODO_OPCIONES, validarValorSeleccion) y `src/app/panel/(panel)/parametros/page.tsx` (formulario de predefinidos con upsert).
4. Integration test: Administrador crea/edita producto sin costo ni margen, éxito, sin filas en producto_costos/producto_margenes — `src/test/rls-integration.test.ts`.

Commits en rama fase-fotos-productos-paquetes:
- 03b316c — feat: parámetros extendidos (anticipo, vigencia, holgura, modo IVA)
- 5df0860 — test: admin puede crear/editar producto sin costo ni margen

### Broken / Blocked

- (ninguno)

### Focus right now

- Pedir confirmación al dueño antes de pushear rama fase-fotos-productos-paquetes (regla CLAUDE.md #6: no push sin confirmación).

## Key Decisions Made

- **Supabase CLI:** ya instalado (v3.0.0 en `C:\Users\Soporte\node_modules/.bin/supabase`) — no falta nada por instalar
- **Vitest configurado** con `@vitejs/plugin-react`, jsdom, `@testing-library/jest-dom/vitest` y alias `@/`
- **Hosting:** Vercel (opción B) adoptada; Cloudflare Pages (opción A) descartada (404, adaptador archivado)
- **Fase 2 BD:** modelo de versionado (opción b), `cotizaciones_costos` privada solo propietario, sin políticas `anon` en tablas de cotizaciones
- **Storage de fotos:** bucket público "productos", nombre temporal UUID en creación, rename a `{tipo}-{id}.{ext}` tras conocer el ID, 5MB sin compresión

## File Map

- `CLAUDE.md` — reglas del proyecto y comandos
- `docs/ESPECIFICACION_FUNCIONAL.md` — fuente de verdad v1 (sección 11 actualizada con nota sobre total_venta)
- `revisor-seguridad.md` — instrucciones del subagente revisor de seguridad
- `settings.json` — permisos del proyecto (allow/ask/deny)
- `supabase/migrations/20261107000001_create_testing_table.sql` — tabla testing (política anon eliminada)
- `supabase/migrations/20261109000001_01_esquema_publico.sql` — esquemas públicos base (Fase 2)
- `supabase/migrations/20261109000002_02_cotizaciones_costos_y_versiones.sql` — cotizaciones, costos, versiones (Fase 2)
- `supabase/migrations/20261109000003_03_trigger_congelar_version.sql` — trigger congelado al llegar a "enviada" (Fase 2)
- `supabase/migrations/20261109000004_04_eliminar_politica_anon_testing.sql` — eliminar política anon (Fase 2)
- `supabase/migrations/20261109000007_07_storage_productos_fotos.sql` — bucket Storage productos + RLS (fase fotos)
- `docs/MIGRACIONES_FASE_2_SQL.md` — códigos SQL listos para pegar en el SQL Editor de Supabase (Fase 2)
- `src/app/page.test.tsx` — prueba mínima de Vitest
- `src/test/rls-policies.test.ts` — 35 pruebas estáticas de RLS
- `src/test/rls-integration.test.ts` — pruebas de integración RLS con usuario real
- `src/test/setup.ts` — setup de Vitest con jest-dom/vitest
- `vitest.config.ts` — configuración de Vitest con alias `@/`
- `package.json` — scripts dev/build/start/lint/typecheck/test

## Do Not

- **No inventes precios, costos, márgenes, tarifas, gramajes ni políticas** — lo marcado PENDIENTE-DUEÑO es configuración editable del dueño
- **Nunca leas, imprimas ni guardes secretos** (.env, claves) ni los pidas por chat
- **Sin migraciones destructivas** — las migraciones se escriben como archivos, se revisan y las aplica el dueño
- **No hagas push sin confirmación del dueño**

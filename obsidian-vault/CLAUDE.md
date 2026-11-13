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

Update this section every time you return to this vault. **Last updated:** 13-11-2026 — Idempotency key generada una sola vez al entrar al flujo de cotización (commit a30b82a), comiteado y pusheado en main.

### Working

- `main` y `origin/main` sincronizadas (commit a30b82a pusheado)
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
- Cambios recientes (main, pusheados hasta a30b82a):
  - Commit a30b82a: fix idempotency key generada una sola vez al entrar al flujo de cotización — middleware.ts genera y guarda cookie httpOnly idempotency_key la primera vez que el cliente entra a /cotizar (sobrevive a recargas y navegaciones); resumen/page.tsx lee la clave existente del request en lugar de regenerarla; resumen-form.tsx ya no toca cookies. Corrige error "Clave de idempotencia inválida" en POST /cotizar/resumen.
  - Commit 8b9d4b5: fix idempotency key desincronizada (cookie desde Server Component en ResumenPage). (Posteriormente reemplazado por a30b82a que mueve la generación al middleware para que sea una sola vez al entrar al flujo.)
  - Commit dfa1cc6: fix React #185 bucle infinito en useSyncExternalStore del borrador — leerBorrador() cachea snapshot parseado para referencia estable entre renders; guardarBorrador() y limpiarBorrador() invalidan el cache.
  - Commit c7c87a6: fix React #441 en todas las páginas del configurador (useSyncExternalStore vía useBorrador()).
  - Commit 307d0a3: fix React #441 (hidratación) y tokens inconsistentes en cotización pública — CarritoFijo lee borrador solo en cliente, ResumenForm lee borrador solo en cliente con suppressHydrationWarning, ResumenPage usa dynamic = "force-dynamic".
  - Commit 396afdb: `eliminarProducto()` en `src/lib/panel/productos.ts`; `eliminarProductoForm()` en `src/lib/panel/productos-forms.ts`; botón "Eliminar" (solo propietario) en `src/app/panel/(panel)/productos/page.tsx`; corregido cambio de estado al editar en `src/app/panel/(panel)/productos/[id]/editar/page.tsx` (eliminado input oculto duplicado `name="estado"`).
  - Commit 37cf5c5: agregados `margen_global_pct` e `iva_pct` al formulario de parámetros predefinidos en `/panel/parametros` (editable solo por propietario).
  - Commit b585ede: restaurado CRUD completo de `/panel/categorias` accesible para ambos roles (propietario y administrador) vía `requirePanelAccess`; agregado al menú de navegación del panel.
  - Commit 78d65fa: corregido error al crear producto sin foto — en `crearProductoForm` se valida que el archivo sea un File real con nombre y `size > 0` antes de procesarlo.
  - Commit 4b6c9ae: corregido recuento de indicadores en `/panel` — las consultas de conteo usan `select('*', { head: true, count: 'exact' })`.
  - Commit e6564c1: corregido error al crear paquete sin foto — misma validación en `crearPaqueteForm`.
  - Commit 1d2843c: agregar eliminar componentes individuales de un paquete — `eliminarComponenteForm` en `paquetes-forms.ts`; lista de componentes con botón Eliminar en `PaqueteEditarPage`.
  - Commit 05c23b6: corregido error al editar paquete (invalid input syntax for type bigint: "NaN") — `await params` en `PaqueteEditarPage` (Next.js 15, params es Promise).
  - Commit 8b0ddc7: corregido redirect tras eliminar componente de paquete — ahora vuelve a `/panel/paquetes/[id]/editar` en lugar del listado general.
  - Commit abf8c62: corregido error de cookies en `/cotizar/resumen` (Next.js 15) — `cookies().set()` movido de Server Component a Server Action `generarIdempotencyCookie()`, invocada desde el cliente al montar. (Posteriormente reemplazado por middleware que establece la cookie una sola vez al entrar al flujo, commits 8b9d4b5 y a30b82a.)
  - Commit 74ef46e: corregido error "Clave de idempotencia inválida" — el Server Action recibe la clave generada en `ResumenPage` como parámetro en lugar de crear una nueva al montar el cliente. (Posteriormente reemplazado por commits 8b9d4b5 y a30b82a.)
  - `npm run typecheck`, `npm run lint` y `npm run build` en verde antes de cada push.

### Entregables fase fotos (comiteados, sin push)

1. CRUD mínimo de categorías — `src/lib/panel/categorias.ts`, `src/app/panel/(panel)/categorias/page.tsx`, migración semilla `supabase/migrations/20261113000010_10_categorias_semilla.sql`
2. Formulario de producto extendido con costo/margen/precio fijo/porción/alérgenos/estado — `src/lib/panel/productos.ts`, `src/lib/panel/productos-forms.ts`, `src/app/panel/(panel)/productos/page.tsx`, `src/app/panel/(panel)/productos/[id]/editar/page.tsx`. Admin bloqueado de tablas privadas (producto_costos, producto_margenes) vía `esPropietario` check dentro de cada Server Action.
3. Parámetros extendidos — `src/lib/panel/parametros.ts` (anticipo_pct, vigencia_cotizacion_dias, holgura_estimado_pct, PARAMETROS_TEXTO, IVA_MODO_OPCIONES, validarValorSeleccion) y `src/app/panel/(panel)/parametros/page.tsx` (formulario de predefinidos con upsert).
4. Integration test: Administrador crea/edita producto sin costo ni margen, éxito, sin filas en producto_costos/producto_margenes — `src/test/rls-integration.test.ts`.

Commits en rama fase-fotos-productos-paquetes:
- 03b316c — feat: parámetros extendidos (anticipo, vigencia, holgura, modo IVA)
- 5df0860 — test: admin puede crear/editar producto sin costo ni margen

### Working

- `main` y `origin/main` sincronizadas (commit c7c87a6 pusheado, React #441 corregido en todas las 8 páginas del configurador con useSyncExternalStore vía useBorrador())
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
- Cambios recientes (main, pusheados hasta c7c87a6):
  - Commit c7c87a6: fix React #441 (hidratación) en todas las páginas del configurador — useSyncExternalStore vía useBorrador() en carrito-fijo, resumen-form, evento, paquete, servicios, lugar, ingredientes y contacto; eliminación de leerBorrador() sin importar y de useEffect/useState sin usar
  - Commit 307d0a3: fix React #441 (hidratación) y tokens inconsistentes en cotización pública — CarritoFijo lee borrador solo en cliente, ResumenForm lee borrador solo en cliente con suppressHydrationWarning, ResumenPage usa dynamic = "force-dynamic".
  - Commit 396afdb: `eliminarProducto()` en `src/lib/panel/productos.ts`; `eliminarProductoForm()` en `src/lib/panel/productos-forms.ts`; botón "Eliminar" (solo propietario) en `src/app/panel/(panel)/productos/page.tsx`; corregido cambio de estado al editar en `src/app/panel/(panel)/productos/[id]/editar/page.tsx` (eliminado input oculto duplicado `name="estado"`).
  - Commit 37cf5c5: agregados `margen_global_pct` e `iva_pct` al formulario de parámetros predefinidos en `/panel/parametros` (editable solo por propietario).
  - Commit b585ede: restaurado CRUD completo de `/panel/categorias` accesible para ambos roles (propietario y administrador) vía `requirePanelAccess`; agregado al menú de navegación del panel.
  - Commit 78d65fa: corregido error al crear producto sin foto — en `crearProductoForm` se valida que el archivo sea un File real con nombre y `size > 0` antes de procesarlo.
  - Commit 4b6c9ae: corregido recuento de indicadores en `/panel` — las consultas de conteo usan `select('*', { head: true, count: 'exact' })`.
  - Commit e6564c1: corregido error al crear paquete sin foto — misma validación en `crearPaqueteForm`.
  - Commit 1d2843c: agregar eliminar componentes individuales de un paquete — `eliminarComponenteForm` en `paquetes-forms.ts`; lista de componentes con botón Eliminar en `PaqueteEditarPage`.
  - Commit 05c23b6: corregido error al editar paquete (invalid input syntax for type bigint: "NaN") — `await params` en `PaqueteEditarPage` (Next.js 15, params es Promise).
  - Commit 8b0ddc7: corregido redirect tras eliminar componente de paquete — ahora vuelve a `/panel/paquetes/[id]/editar` en lugar del listado general.
  - Commit abf8c62: corregido error de cookies en `/cotizar/resumen` (Next.js 15) — `cookies().set()` movido de Server Component a Server Action `generarIdempotencyCookie()`, invocada desde el cliente al montar.
  - Commit 74ef46e: corregido error "Clave de idempotencia inválida" — el Server Action recibe la clave generada en `ResumenPage` como parámetro en lugar de crear una nueva al montar el cliente.
  - `npm run typecheck`, `npm run lint` y `npm run build` en verde antes de cada push.

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

# Resumen de cierre — Fase 6: Panel del propietario para cotizaciones

**Estado:** Fase 6 cerrada y desplegada en producción (Vercel: https://charcuteria-iota.vercel.app)
**Fecha:** 12-11-2026

## Qué se completó

### Panel del propietario
- **Bandeja de cotizaciones** (`src/app/panel/cotizaciones/page.tsx`): lista todas las cotizaciones con folio, cliente, evento, fecha, total de venta y estado.
- **Detalle de cotización** (`src/app/panel/cotizaciones/[id]/page.tsx` + `detalle.tsx`): vista de servidor que obtiene la cotización y la pasa al componente cliente para edición.
- **Cambio de estado** (`src/lib/panel/cotizaciones-estados.ts`): el propietario puede mover la cotización entre estados (recibida, en_revision, enviada, aceptada, confirmada, realizada, cancelada, vencida).
- **Aplicar descuento** (`aplicarDescuento`): descuento porcentual con aritmética decimal exacta (`big.js`), nunca punto flotante.
- **Registro de pagos** (`src/lib/panel/cotizaciones-pagos.ts`): registra anticipos o saldos, escribe en `bitacora_auditoria`, y solo el rol propietario puede verificar pagos.
- **Confirmación atómica** (migración 09): `confirmar_cotizacion_atomica` verifica choque de fecha y actualiza el estado en una sola transacción de BD, evitando race conditions.
- **Folio único** (`src/lib/cotizar/folio.ts`): `generarFolioUnico()` verifica que el folio `CS-YYYY-NNNN` no exista antes de insertar, evitando colisiones en el mismo milisegundo. Se usa tanto en el configurador cliente como en el panel.
- **Enlace privado para el cliente**: muestra el enlace `/cotizaciones/[token]` con fecha de expiración.

### Seguridad (revisión aplicada)
- Costos y márgenes nunca llegan al navegador ni al cliente (tabla `cotizaciones_costos` privada, solo rol propietario).
- La página pública por token no expone `datos_cliente` (contacto del cliente).
- Cookie de idempotencia con `path: "/"` y `httpOnly` para evitar duplicados por recarga/doble clic.
- Rate limiting en `/api/precios-venta` (60 req/IP/60s) y en `/cotizaciones/[token]` (30 req/IP/60s) mediante middleware.
- RLS habilitado en todas las tablas, sin políticas `anon`.
- Solo rol propietario puede leer tablas privadas de costos/márgenes.

### Pruebas y calidad
- `npm run typecheck`: limpio (exit 0)
- `npm run lint`: 0 errores
- `npm run test`: 118 pruebas pasando (el único suite que falla es `rls-integration.test.ts` por falta de variables de entorno de Supabase — problema preexistente de entorno, no de código)

## Quedó pendiente (decisión del dueño)

| Ítem | Prioridad | Notas |
|------|-----------|-------|
| Rate limiting distribuido para producción (Vercel KV / Upstash) | Media | Actualmente el almacén es en memoria por instancia; en Vercel serverless cada función tiene su propio almacén |
| Invalidar token tras primera lectura | Baja | Opcional; el token dura 7 días y no se invalida tras usarse |
| Llenar columna `ip` en `bitacora_auditoria` | Baja | `registrarPago` no captura la IP de la request |
| Migración 09 aplicada en Supabase remoto | — | Ya aplicada (confirmaste que se ejecutó) |

## Siguiente fase: Fase 7 — Correo (Resend) y botón de WhatsApp

Para iniciar la Fase 7 necesito confirmar lo siguiente:

### Correo (Resend)
1. ¿Ya tienen cuenta de Resend creada?
2. ¿Tienen la API key de Resend para configurar como variable de entorno en Vercel (`RESEND_API_KEY`)?
3. ¿Qué dirección de correo usarán como remitente (ej. `cotizaciones@tudominio.com`)? Debe estar verificada en Resend.
4. ¿Necesitan que prepare una plantilla de correo para envío de cotización privada (con el enlace del token)?

### Botón de WhatsApp
1. ¿Usarán WhatsApp Business API o un enlace directo `wa.me`?
2. ¿Qué número de teléfono usarán como remitente?
3. ¿Necesitan que prepare un mensaje predeterminado con el folio y el enlace de la cotización?

Una vez me confirmes estos puntos, presento el plan de Fase 6 y, tras tu aprobación, inicio el desarrollo.

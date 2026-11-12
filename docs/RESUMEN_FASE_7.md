# Resumen de cierre — Fase 7: Correo (Resend) y botón de WhatsApp

**Estado:** Fase 7 implementada, pendiente de deploy y configuración de variables de entorno
**Fecha:** 12-11-2026

## Qué se completó

### Archivos nuevos
- **`src/lib/email/resend.ts`**: Cliente de Resend con API key desde `RESEND_API_KEY`. Función `enviarCorreoCotizacion()` que envía un correo HTML con el folio, enlace privado de la cotización y nombre del cliente.
- **`src/lib/email/templates.ts`**: Plantilla de correo con placeholders (folio, nombre cliente, enlace de cotización).
- **`src/lib/whatsapp/link.ts`**: Generador de enlace `wa.me` con número desde `WHATSAPP_NUMBER`. Retorna `{ url, texto, disponible, motivoNoDisponible }`.
- **`src/app/api/cotizaciones/[id]/enviar/route.ts`**: Endpoint `POST` que obtiene los datos públicos de la cotización, envía el correo por Resend y retorna el enlace de WhatsApp.

### Archivos modificados
- **`src/app/panel/cotizaciones/[id]/detalle.tsx`**: Agregados botones "Enviar por correo" (abre modal para ingresar correo del cliente) y "Contactar por WhatsApp" (abre enlace `wa.me` con mensaje predeterminado).

### Variables de entorno requeridas
| Variable | Estado | Nota |
|----------|--------|------|
| `RESEND_API_KEY` | ✅ Ya la tienes | Configurada en `.env.local` y Vercel |
| `FROM_EMAIL` | ⏳ Pendiente | Correo verificado en Resend (se entrega al final del proyecto) |
| `WHATSAPP_NUMBER` | ⏳ Pendiente | Número de contacto del negocio (se entrega al final del proyecto) |
| `NEXT_PUBLIC_SITE_URL` | ⏳ Pendiente | URL base para construir el enlace de cotización |

### Cómo funciona el flujo
1. El propietario abre el detalle de una cotización en el panel.
2. Hace clic en "Enviar por correo", abre un modal, ingresa el correo del cliente y envía.
3. El servidor llama a Resend con la plantilla (folio + enlace privado de la cotización).
4. También puede hacer clic en "Contactar por WhatsApp" para abrir `wa.me` con un mensaje que incluye el folio y el enlace.

## Quedó pendiente (configuración del dueño)

| Ítem | Prioridad | Notas |
|------|-----------|-------|
| Configurar `FROM_EMAIL` en Vercel | Alta | Correo verificado en Resend |
| Configurar `WHATSAPP_NUMBER` en Vercel | Media | Número de contacto del negocio |
| Configurar `NEXT_PUBLIC_SITE_URL` en Vercel | Media | URL base para enlaces de cotización |
| Deploy a producción | Alta | Pushear a la rama y desplegar en Vercel |
| Integrar correo del cliente del formulario de contacto | Baja | Actualmente se ingresa manualmente en el modal |

## Siguientes pasos para cerrar Fase 7

1. Configurar las 3 variables de entorno pendientes en Vercel.
2. Pushear los commits de Fase 7 para que Vercel despliegue.
3. Probar el envío de correo desde el panel del propietario.
4. Probar el enlace de WhatsApp.

## Notas de seguridad (Regla 4 de CLAUDE.md)

- La API key de Resend nunca se imprime, lee ni guarda por chat. Se configura solo en variables de entorno.
- Los correos y números de teléfono de los clientes no se hardcodean en el código fuente.

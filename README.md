# Cotizador de tablas de charcutería y quesos

Sitio web de cotización para un servicio de tablas de charcutería y quesos para eventos. El cliente arma su tabla o mesa, ve un estimado preliminar y envía una solicitud. El propietario revisa, ajusta y aprueba; el cliente recibe la cotización por correo y WhatsApp.

**Idioma:** español  
**Fuente de verdad:** `docs/ESPECIFICACION_FUNCIONAL.md` (v1)

---

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16.4.5, React 19, TypeScript 5, Tailwind CSS 4 |
| Base de datos | Supabase / Postgres 17 |
| Autenticación | Supabase Auth (solo personal) |
| Antispam | Cloudflare Turnstile |
| Pruebas | Vitest 5 + jsdom + Testing Library |
| Lint | ESLint 9 con `eslint-config-next` |

---

## Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en http://localhost:3000 |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción (local) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript `tsc --noEmit` |
| `npm run test` | Vitest (pruebas unitarias) |

---

## Variables de entorno (`.env.local`)

Crear un archivo `.env.local` en la raíz del proyecto con:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=0x4AAAAAAF...
CLOUDFLARE_TURNSTILE_SECRET_KEY=0x4AAAAAAF...
```

> ⚠️ Nunca subas `.env.local` ni ningún archivo con secretos a git. Está en `.gitignore`.

---

## Ejecución en local

```powershell
# 1. Instalar dependencias
npm install

# 2. Crear .env.local con las variables de entorno (ver sección arriba)

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir http://localhost:3000
```

---

## Estado de Fase 1

- ✅ Proyecto base Next.js + TypeScript + Tailwind
- ✅ Lint, typecheck y pruebas configurados y en verde
- ✅ Página de prueba de hosting (`/hosting-test`) con Supabase + Turnstile
- ✅ Build de producción exitoso
- 🔄 Despliegue en Cloudflare Pages ejecutado pero sin contenido visible (404)
- ⏳ Decisión de hosting documentada en `docs/decisiones/001-hosting.md`
- ⏳ README (este archivo)
- ⏳ Push a GitHub (deferido, pendiente de confirmación)

---

## Reglas del proyecto

1. No inventes precios, costos, márgenes, tarifas, gramajes ni políticas.
2. Los precios los calcula solo el motor determinista (sección 7 de la especificación).
3. Costos y márgenes nunca llegan al navegador, al cliente ni al rol Administrador.
4. Nunca leas, imprimas ni guardes secretos (.env, claves).
5. Sin migraciones destructivas.
6. Cambios pequeños, con pruebas y un commit por tarea. No hagas push sin confirmación.

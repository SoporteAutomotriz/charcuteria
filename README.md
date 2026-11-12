# Cotizador de tablas de charcutería y quesos

Sitio web de cotización para un servicio de tablas de charcutería y quesos para eventos. El cliente arma su tabla o mesa, ve un estimado preliminar y envía una solicitud. El propietario revisa, ajusta y aprueba; el cliente recibe la cotización por correo y WhatsApp.

**Idioma:** español  
**Fuente de verdad:** `docs/ESPECIFICACION_FUNCIONAL.md` (v1)  
**Hosting:** Vercel (`https://charcuteria-iota.vercel.app`)

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
| Despliegue | Vercel |

---

## Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en http://localhost:3000 |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción (local) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript `tsc --noEmit` |
| `npm run test` | Vitest (pruebas unitarias y estáticas de RLS) |

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
> ⚠️ Las variables con prefijo `NEXT_PUBLIC_` se exponen al navegador. `CLOUDFLARE_TURNSTILE_SECRET_KEY` es solo de servidor.
> ⚠️ Si cambian las variables en Vercel, es necesario hacer redeploy para que surtan efecto.

---

## ⚠️ Nota importante — Proyecto Supabase en producción de Vercel

El despliegue "Production" de Vercel (`https://charcuteria-iota.vercel.app`) está apuntando actualmente al proyecto de **desarrollo** de Supabase (`sujljkevonamhqbyszmz`), no al de producción real (`nyhcvgavbgextwempjcc`). Esto es intencional mientras estamos en fase de desarrollo, ya que es donde viven las migraciones y los usuarios de prueba (`@test.local`).

**Antes del lanzamiento real (Fase 9) es necesario:**

1. Aplicar todas las migraciones al proyecto de producción real `nyhcvgavbgextwempjcc`.
2. Volver a apuntar las variables de entorno de Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) al proyecto de producción.
3. Crear los usuarios reales del Propietario y Administrador en Supabase Auth del proyecto de producción (sin correos `@test.local`) y darles sus filas en `usuarios_personal` con rol `propietario` y `administrador`.

---

## Pruebas de integración de RLS (Supabase remoto)

Las pruebas en `src/test/rls-integration.test.ts` validan Row Level Security con usuarios reales contra el proyecto de Supabase en la nube. **No crean usuarios**: requieren que existan previamente.

Antes de correrlas por primera vez:

```powershell
# 1. Crear usuarios de prueba en Supabase remoto (una sola vez)
$env:SUPABASE_URL = "https://tu-proyecto.supabase.co"
$env:SUPABASE_ANON_KEY = "sb_publishable_..."
# Opcional: para confirmar emails y asignar roles automáticamente
$env:SUPABASE_SERVICE_ROLE_KEY = "sb_service_role_..."
npx tsx scripts/crear-usuarios-prueba.ts

# 2. Correr las pruebas de integración
$env:VITEST_SUPABASE_URL = "https://tu-proyecto.supabase.co"
$env:VITEST_SUPABASE_ANON_KEY = "sb_publishable_..."
npm run test
```

El script crea dos usuarios:
- `admin@test.local` → rol `administrador`
- `propietario@test.local` → rol `propietario`

Sin `SUPABASE_SERVICE_ROLE_KEY`, debes confirmar los emails e insertar los roles manualmente en el SQL Editor de Supabase (el script imprime las sentencias SQL necesarias).

> ⚠️ Las pruebas fallan con un mensaje claro si los usuarios no existen: "¿Corriste antes 'npx tsx scripts/crear-usuarios-prueba.ts'?"

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

## Aplicar migraciones de Supabase

La migración de la tabla de prueba `testing` está en:

```
supabase/migrations/20261107000001_create_testing_table.sql
```

Aplícala en el SQL Editor de tu panel de Supabase en la nube. Esta migración:

1. Crea la tabla `public.testing` con columnas `id`, `nombre` y `creado_en`.
2. Activa RLS (Row Level Security).
3. Crea una política que permite `SELECT` al rol `anon` (necesario para lectura desde el navegador).
4. Inserta una fila de ejemplo para verificar que la lectura funciona.

---

## Estado de Fase 1

- ✅ Proyecto base Next.js + TypeScript + Tailwind
- ✅ Lint, typecheck y pruebas configurados y en verde
- ✅ Página de prueba de hosting (`/hosting-test`) con Supabase + Turnstile
- ✅ Build de producción exitoso
- ✅ Despliegue en Vercel en `https://charcuteria-iota.vercel.app`
- ✅ Decisión de hosting documentada en `docs/decisiones/001-hosting.md`
- ✅ Componente reutilizable de Turnstile en `src/components/turnstile-widget.tsx`
- ✅ Migración de tabla `testing` en `supabase/migrations/`
- ⏳ Push a GitHub (deferido, pendiente de confirmación del usuario)
- ⏳ Fase 2: base de datos, roles y RLS

---

## Reglas del proyecto

1. No inventes precios, costos, márgenes, tarifas, gramajes ni políticas.
2. Los precios los calcula solo el motor determinista (sección 7 de la especificación).
3. Costos y márgenes nunca llegan al navegador, al cliente ni al rol Administrador.
4. Nunca leas, imprimas ni guardes secretos (.env, claves).
5. Sin migraciones destructivas.
6. Cambios pequeños, con pruebas y un commit por tarea. No hagas push sin confirmación.

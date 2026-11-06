# Decisión de hosting — Fase 1

**Fecha:** 05-11-2026  
**Estado:** documento final  
**Autor:** Claude Code (asistente)

---

## Resumen

El proyecto se desplegó en **Cloudflare Pages (opción A)** como prueba de hosting de Fase 1. El despliegue ejecutó con éxito (`wrangler pages deploy .next --project-name charcuteria --branch main`) y la URL es `https://bc534542.charcuteria.pages.dev`, pero la página no muestra contenido: devuelve 404 en la ruta raíz.

**Causa raíz:** el build estándar de Next.js (`next build`) genera la carpeta `.next/` con un formato que Cloudflare Pages no sirve directamente como sitio estático. Next.js App Router requiere el adaptador `@cloudflare/next-on-pages` para generar un output compatible con Cloudflare Pages Functions, pero ese adaptador falló en Windows durante este proyecto (errores `spawn npx ENOENT` y `EPERM` de symlinks del CLI de Vercel).

---

## Opciones evaluadas

| Opción | Proveedor | Resultado |
|--------|-----------|-----------|
| **A (actual)** | Cloudflare Pages | Desplegado pero no muestra contenido (404). Requiere `@cloudflare/next-on-pages` que falló en Windows. |
| **B** | Vercel | No probada todavía. Es nativa para Next.js App Router y probablemente funcione sin adaptador extra. |
| **C** | Otra / static export | No probada. Se consideraría si A y B fallan. |

---

## Problema técnico detallado

### 1. Formato de salida incompatible

Cloudflare Pages espera uno de estos formatos:
- Sitio estático puro (archivos HTML/JS/CSS en la raíz del deploy), o
- Cloudflare Pages Functions (formato especial con rutas de función).

`next build` en Next.js 16 con App Router genera `.next/` con:
- `standalone` server output (si está configurado), o
- salida optimizada para Vercel, no para Cloudflare Pages.

Al hacer `wrangler pages deploy .next`, Cloudflare Pages intenta servir los archivos de `.next/` directamente, pero no encuentra un `index.html` en la ruta raíz servible, por lo que devuelve 404.

### 2. Adaptador `@cloudflare/next-on-pages` falló en Windows

Se intentó ejecutar:

```powershell
npm install -D @cloudflare/next-on-pages --legacy-peer-deps
npx @cloudflare/next-on-pages
wrangler pages deploy pages --project-name charcuteria --branch main
```

Problemas encontrados en Windows (Git Bash / PowerShell):

1. `spawn npx ENOENT` — el adaptador no pudo invocar `npx` correctamente.
2. `EPERM` de symlinks — el CLI de Vercel (usado internamente por el adaptador) intenta crear symlinks en la caché de Windows y falla por permisos.
3. Como resultado, nunca se generó la carpeta `pages/` con el formato correcto de Cloudflare Pages Functions.

### 3. `wrangler.toml` ignorado

El archivo `wrangler.toml` tiene `main = "src/app/hosting-test/page.tsx"`, pero wrangler lo ignoró con advertencia de que falta `pages_build_output_dir`. Esto indica que wrangler no reconoció la configuración como un proyecto de Pages válido para Next.js.

---

## Variables de entorno necesarias en Cloudflare Pages

Estas variables deben configurarse en el panel de Cloudflare Pages (Configuración > Variables de entorno), para ambos entornos (Production y Preview):

| Variable | Valor de ejemplo | Notas |
|----------|-----------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://nyhcvgavbgextwempjcc.supabase.co` | Requerido por `/api/supabase-test` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` | Requerido por `/api/supabase-test` |
| `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` | `0x4AAAAAAF...` | Requerido por el widget de Turnstile en `/turnstile` y `/hosting-test` |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY` | `0x4AAAAAAF...` | Requerido por `/api/turnstile` (server-side) |

> ⚠️ Estas claves están en `.env.local` localmente y **no se suben a git**. Deben copiarse manualmente al panel de Cloudflare Pages.

---

## Pasos para solucionar (en orden de prioridad)

### Paso 1: Verificar que las variables de entorno estén en Cloudflare Pages

Entrar a https://dash.cloudflare.com → Pages → proyecto `charcuteria` → Configuración > Variables de entorno y confirmar las 4 variables arriba en **Production** y **Preview**.

### Paso 2: Redesplegar tras configurar variables

Si las variables faltaban, volver a desplegar desde el panel de Cloudflare Pages (o desde wrangler) y probar `https://bc534542.charcuteria.pages.dev/hosting-test`.

### Paso 3: Probar el adaptador `@cloudflare/next-on-pages` de nuevo (opcional)

Si el paso 2 no funciona, intentar generar el output correcto con el adaptador. En Windows puede requerir:
- Ejecutar en Git Bash en lugar de PowerShell.
- Habilitar symlinks en Windows (modo desarrollador o permisos de administrador).
- Usar `--legacy-peer-deps` por el conflicto de `@types/node` con vitest.

Comandos:

```powershell
npm install -D @cloudflare/next-on-pages --legacy-peer-deps
npx @cloudflare/next-on-pages
wrangler pages deploy pages --project-name charcuteria --branch main
```

### Paso 4: Pivotar a Vercel (opción B)

Si Cloudflare Pages sigue sin funcionar, desplegar en Vercel (opción B). Vercel es nativa para Next.js App Router y no requiere adaptador extra:

```powershell
npm i -g vercel
vercel login
vercel deploy --prod
```

Luego configurar las mismas 4 variables de entorno en el panel de Vercel.

### Paso 5: Static export (opción C, último recurso)

Si ni A ni B funcionan, configurar `output: "export"` en `next.config.ts` y desplegar como sitio estático puro en Cloudflare Pages. Esto limitaría las API Routes (usarían Edge Functions o se moverían a serverless externo).

---

## Endpoints probados localmente

Todos estos endpoints funcionan en `npm run dev` (localhost:3000):

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/` | GET | Página principal |
| `/hosting-test` | GET | Prueba de hosting: lectura de Supabase + formulario Turnstile |
| `/turnstile` | GET | Página dedicada al widget de Turnstile |
| `/api/supabase-test` | GET | Lee tabla `testing` de Supabase |
| `/api/turnstile` | POST | Valida token de Turnstile con Cloudflare siteverify |

---

## Pruebas en verde (local)

- `npm run typecheck` — aprobado
- `npm run lint` — aprobado
- `npm run test` — aprobado (1 test)
- `npm run build` — aprobado (producción)

---

## Decisión final de Fase 1

Se desplegó en Cloudflare Pages (opción A) pero la página no muestra contenido debido a la incompatibilidad de formato de salida de Next.js con Cloudflare Pages. La decisión de hosting definitiva queda pendiente hasta que se verifique si funciona con variables de entorno configuradas o si se requiere pivotar a Vercel (opción B).

**Próximos pasos:**
1. Configurar variables de entorno en Cloudflare Pages panel.
2. Probar `https://bc534542.charcuteria.pages.dev/hosting-test`.
3. Si falla, probar opción B (Vercel).
4. Crear README con instrucciones de ejecución local.

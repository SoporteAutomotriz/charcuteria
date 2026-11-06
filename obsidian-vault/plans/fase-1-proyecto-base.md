# Plan — Fase 1: Proyecto base y prueba de hosting

Fecha: 05-11-2026
Estado: en-progreso

## Pasos

1. [x] Inspeccionar el entorno (SO, Node, npm, Git, Supabase CLI)
   - Resultado: todo instalado, nada falta por instalar. Supabase CLI v3.0.0.
2. [x] Crear proyecto base Next.js + TypeScript + Tailwind
   - Resultado: proyecto creado, dependencias instaladas.
3. [x] Configurar lint, formato, verificación de tipos y pruebas
   - Resultado: ESLint, tsc --noEmit, Vitest configurados y en verde.
4. [x] Completar sección Comandos de CLAUDE.md
   - Resultado: scripts dev/build/start/lint/typecheck/test añadidos.
5. [x] Probar opción A de hosting (Cloudflare Pages)
   - Resultado: build exitoso, deploy ejecutado en https://bc534542.charcuteria.pages.dev
   - Pendiente: verificar que la página cargue contenido en producción (404 en ruta raíz)
   - Problema conocido: .next no es formato nativo de Pages; requiere @cloudflare/next-on-pages que falló en Windows
6. [x] Documentar decisión en docs/decisiones/001-hosting.md
7. [x] Preparar README con instrucciones para ejecutar en local

## Lo que revisa el dueño

Decisión de hosting documentada (sección 14 de la especificación).

## Próximos pasos

- Depurar por qué la página desplegada en Cloudflare Pages no muestra nada
- Crear docs/decisiones/001-hosting.md con decisión y justificación
- Preparar README con instrucciones para ejecutar en local

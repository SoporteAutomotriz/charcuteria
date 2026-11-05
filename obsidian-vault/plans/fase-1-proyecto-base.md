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
5. [ ] Probar opciones A y B de hosting con caso mínimo (página, lectura Supabase desde servidor, formulario Turnstile)
   - Bloqueado: faltan credenciales de Supabase y clave de Turnstile.
6. [ ] Documentar decisión en docs/decisiones/001-hosting.md
7. [ ] Preparar README con instrucciones para ejecutar en local

## Lo que revisa el dueño

Decisión de hosting documentada (sección 14 de la especificación).

## Próximos pasos al desbloquear

- Recibir credenciales/proyecto de Supabase y clave de Cloudflare Turnstile.
- Ejecutar prueba de hosting (opción A: vinext en Cloudflare Workers; opción B: Vercel).
- Crear docs/decisiones/001-hosting.md con recomendación.

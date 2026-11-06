# Cotizador de tablas de charcutería y quesos

Sitio web de cotización para un servicio de tablas de charcutería y quesos para eventos. La fuente de verdad es docs/ESPECIFICACION_FUNCIONAL.md (v1). Lo marcado FUERA DE V1 no se construye.

## Reglas
1. No inventes precios, costos, márgenes, tarifas, gramajes ni políticas. Lo marcado PENDIENTE-DUEÑO es configuración editable; en pruebas usa datos ficticios etiquetados.
2. Los precios los calcula solo el motor determinista (sección 7). Aritmética decimal exacta, nunca flotantes. El servidor recalcula siempre.
3. Costos y márgenes nunca llegan al navegador, al cliente ni al rol Administrador.
4. Nunca leas, imprimas ni guardes secretos (.env, claves) y no los pidas por chat.
5. Sin migraciones destructivas. Las migraciones se escriben como archivos, se revisan y las aplico yo.
6. Cambios pequeños, con pruebas y un commit por tarea. No hagas push sin mi confirmación.
7. Si la especificación es ambigua o se contradice, detente y pregunta.

## Proceso
- Trabajamos por fases (sección 14). Antes de escribir código de una fase, presenta un plan y espera mi aprobación.
- Al cerrar una fase: pruebas en verde, revisión con el subagente revisor-seguridad y un resumen de qué probar y qué quedó pendiente.

## Convenciones
- TypeScript estricto, textos de la interfaz en español, diseño móvil primero.
- Dinero en numeric (Postgres) y decimal exacto (TypeScript).

## Comandos
- `npm run dev` — servidor de desarrollo (Next.js)
- `npm run build` — build de producción
- `npm run start` — servidor de producción
- `npm run lint` — ESLint
- `npm run typecheck` — verificación de tipos TypeScript (tsc --noEmit)
- `npm run test` — pruebas con Vitest

(Se completaron en la Fase 1: desarrollo, pruebas, lint y tipos.)

## Project memory (Obsidian)

Context, current state, decisions and history live in `obsidian-vault/`. Keep them up to date with the obsidian-memory plugin.

@obsidian-vault/CLAUDE.md

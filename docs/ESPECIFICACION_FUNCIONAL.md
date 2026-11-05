# Especificación funcional v1 (MVP): tablas de charcutería y quesos para eventos

Borrador para revisión · 5 de noviembre de 2026 · Reemplaza a propuesta\_1.md

## 0. Qué cambió respecto a propuesta\_1

Esta versión conserva lo mejor de la propuesta original (precios calculados por fórmula, aprobación del propietario, costos privados, cotizaciones con versiones) y recorta el alcance para llegar pronto a un producto usable. Marcas: **PENDIENTE-DUEÑO** es un dato o decisión del negocio que no se inventa; **FUERA DE V1** se pospone.

- Menos alcance: 2 roles en lugar de 4, 8 estados en lugar de 13, sin inventario, calendario completo ni reportes avanzados.
- La disponibilidad de la fecha se revisa antes de enviar la cotización, no después del anticipo.
- Contradicciones resueltas: el montaje lo calcula el motor y el propietario lo ajusta; el cliente ve un estimado marcado como preliminar; la v1 no exige PDF de servidor ni WhatsApp automático.
- Se agregan IVA y facturación, merma, precios congelados por versión, anticipación mínima, capacidad máxima y aviso de privacidad.
- El hosting se decide con una prueba técnica en la Fase 1, no por suposición.
- Claude Code, en lugar de Antigravity y Gemini 4 Argon, trabaja fase por fase con revisión humana al cierre de cada una (sección 17).

## 1. Objetivo y alcance

**Objetivo:** un sitio web en español donde el cliente arma su tabla o mesa para un evento, ve un estimado preliminar y envía una solicitud. El propietario la revisa, ajusta y aprueba, y el cliente recibe la cotización por correo y por un enlace de WhatsApp.

**Dentro de la v1:** catálogo, paquetes, configurador del cliente, motor de precios, panel del propietario, cotizaciones con versiones, registro manual de pagos, correo y botón de WhatsApp.

**Fuera de la v1:** inventario y compras, calendario completo, reportes avanzados, PDF generado en servidor, WhatsApp automático, pagos en línea, cuentas de cliente.

**Principios:**

1. Los precios los calcula una fórmula, nunca una IA.
2. Ninguna cotización llega al cliente sin aprobación del propietario.
3. Costos y márgenes nunca salen del servidor.
4. Todo valor comercial se configura desde el panel, no en el código.
5. No se inventan datos del negocio: lo desconocido es PENDIENTE-DUEÑO.

## 2. Reglas comerciales y parámetros

| Parámetro | Valor | Estado |
| --- | --- | --- |
| Moneda | MXN | Decidido |
| Cobertura | Puebla capital y zonas configurables | Decidido |
| Servicios | Tablas individuales y mesas montadas en el evento | Decidido |
| Anticipo | 50 % del total aprobado, configurable | Valor inicial propuesto |
| Saldo | Resto del total; fecha límite de pago | PENDIENTE-DUEÑO |
| Vigencia de la cotización | 5 días naturales desde el envío, sin exceder la fecha del evento | Valor inicial propuesto |
| Anticipación mínima de pedido | Sin valor | PENDIENTE-DUEÑO |
| Pedido mínimo y máximo de invitados por servicio | Sin valor | PENDIENTE-DUEÑO |
| IVA y facturación | El sistema soporta precios con IVA incluido o desglosado, con tasa configurable. La facturación se gestiona fuera del sistema | PENDIENTE-DUEÑO (consultar al contador) |
| Descuentos | Solo el propietario | Decidido |
| Pagos | Transferencia. El personal registra y el propietario verifica. Sin pasarela | Decidido |
| Reserva de fecha | Se reserva con el primer anticipo verificado | Decidido |
| Cancelaciones, cambios de fecha y devoluciones | Texto editable que aparece en la cotización | PENDIENTE-DUEÑO (obligatorio antes de publicar) |
| Estimado al cliente | Rango con leyenda de preliminar (sección 6) | Valor inicial propuesto |

Los valores propuestos son puntos de partida configurables, no tarifas de mercado.

## 3. Roles y acceso

| Rol | Puede |
| --- | --- |
| Propietario | Todo: configuración, costos y márgenes, descuentos, aprobar y enviar cotizaciones, verificar pagos, usuarios y bitácora |
| Administrador | Gestionar solicitudes, editar cotizaciones y catálogo, registrar pagos y marcar una cotización como lista para aprobación. Ve precios, pero no costos ni márgenes. No aplica descuentos, no envía cotizaciones, no verifica pagos y no gestiona usuarios |
| Cliente | Sin cuenta. Envía su solicitud y ve su cotización mediante un enlace privado, aleatorio y con expiración |

Los roles de Ventas y Operaciones quedan FUERA DE V1.

## 4. Catálogo

**Categorías iniciales (editables):** carnes y curados, quesos, frutos secos, frutas, panes y galletas (incluye pan de masa madre), untables y encurtidos, bebidas, complementos (tablas, utensilios, desechables), extras y decoración.

**Campos de cada producto:**

- Nombre, descripción, categoría, foto y orden de visualización.
- Unidad de compra, unidad de venta y factor de conversión.
- Rendimiento o merma en porcentaje (corteza del queso, fruta, recortes).
- Costo por unidad de compra (privado).
- Margen propio y precio fijo manual, ambos opcionales.
- Porción de referencia por persona.
- Alérgenos y etiquetas (vegetariano, sin gluten u otras).
- Estado: activo, agotado temporal o inactivo.

El precio de venta se calcula a partir del costo y el margen. Si existe un precio fijo manual, ese prevalece. El inventario queda FUERA DE V1: la disponibilidad se marca a mano.

## 5. Paquetes

- Cada paquete tiene nombre, foto, descripción, personas recomendadas, componentes con cantidad de referencia y margen propio opcional.
- Cada componente puede ser fijo, sustituible (dentro de una categoría o lista), opcional o quitable.
- El cliente puede cambiar, agregar o quitar componentes. El resumen muestra el paquete base y cada cambio con su efecto en el precio.
- Quitar un componente descuenta su precio, salvo que el paquete indique lo contrario.
- Los paquetes iniciales (entre 3 y 6) los define el dueño: PENDIENTE-DUEÑO.

## 6. Configurador del cliente

Flujo en ocho pasos, pensado primero para móvil:

1. Modalidad: tabla individual o mesa montada.
2. Evento: tipo, fecha, horario, invitados y, en mesa montada, duración.
3. Punto de partida: paquete o armado desde cero.
4. Ingredientes: tarjetas con foto, botones +/−, filtros por categoría y alérgenos, y carrito fijo con el estimado en vivo.
5. Complementos y servicios: montaje, personal y decoración según la modalidad.
6. Lugar: dirección y municipio, que determinan la zona de transporte.
7. Contacto: nombre, teléfono, correo, canal preferido, aviso de privacidad y consentimiento de contacto.
8. Resumen y envío.

**Reglas:**

- El estimado se muestra como rango, del valor calculado a ese valor más una holgura, con la leyenda “Estimado preliminar, sujeto a revisión y aprobación”. El propietario puede cambiar el modo a total único u ocultarlo. Holgura inicial propuesta: 10 % (PENDIENTE-DUEÑO).
- Validaciones: sin productos inactivos, cantidades positivas, aviso si las cantidades se alejan de los perfiles de consumo, y respeto de mínimos, máximos y anticipación mínima.
- Zona no cubierta o especial: no se calcula transporte y la solicitud queda marcada como “requiere evaluación”.
- El borrador se conserva en el navegador. Al enviar se usa una clave de idempotencia para que recargar o hacer doble clic no duplique solicitudes.
- Protección antispam con CAPTCHA (Cloudflare Turnstile) y límite de solicitudes por IP y correo.
- Los alérgenos se muestran en las tarjetas y en el resumen, con un aviso general de posibles trazas.

## 7. Motor de precios

Es un módulo de TypeScript puro, sin IA y con pruebas unitarias. El navegador lo usa solo para mostrar el estimado. El servidor siempre recalcula y es la única fuente de verdad.

**Fórmulas:**

- Cantidad a comprar = cantidad servida ÷ rendimiento, con rendimiento = 1 − merma.
- Costo del ingrediente = cantidad a comprar (convertida a la unidad de compra) × costo unitario.
- Costo total = ingredientes + materiales y empaque + mano de obra + transporte + montaje + personal + decoración + extraordinarios.
- Precio de venta = costo ÷ (1 − margen). La v1 usa solo margen bruto, no markup, con margen entre 0 % y 95 %.
- Precedencia del margen: precio fijo manual, luego margen del producto, luego margen de la categoría y por último margen global. Un paquete vendido sin cambios usa su margen propio; los cambios del cliente se valoran con los márgenes de producto.
- El IVA se aplica después del precio de venta, según la configuración de la sección 2.
- Aritmética decimal exacta (numeric en Postgres y una librería decimal en TypeScript), nunca flotantes. Cada línea se redondea a 2 decimales y el total es la suma de las líneas. El redondeo comercial del total es PENDIENTE-DUEÑO.

**Cantidades por persona:** perfiles de consumo configurables (gramos o piezas por persona y categoría) según tipo de evento, duración y si la tabla acompaña una comida. Los valores iniciales son PENDIENTE-DUEÑO. En pruebas solo se usan datos ficticios.

**Transporte:** zonas con lista de municipios y tarifa fija, más cargos opcionales por distancia, horario o acceso difícil. Una zona especial no tiene cálculo automático.

**Montaje y personal:** tarifa por hora, horas mínimas y una regla de personal por número de invitados (1 persona por cada N invitados, con N PENDIENTE-DUEÑO). El estimado los calcula automáticamente y el propietario los ajusta en la cotización formal.

**Precios congelados:** cada versión de cotización guarda una copia de costos, márgenes, precios, IVA y tarifas. Cambiar el catálogo después no altera las cotizaciones existentes.

**Casos de prueba:** la Fase 3 incluye una tabla de ejemplos con resultados esperados. El propietario la revisa y la valida antes de dar el motor por bueno.

## 8. Cotizaciones

Cada cotización tiene un folio único (CS-AAAA-NNNN). Cada edición posterior al envío crea una versión nueva. Las anteriores quedan de solo lectura y su enlace muestra “versión reemplazada”. El cliente siempre ve la versión vigente.

**Estados (8):**

| Estado | Significado | Lo cambia |
| --- | --- | --- |
| recibida | El cliente envió la solicitud | Sistema |
| en\_revision | El personal la está trabajando | Propietario o Administrador |
| enviada | Aprobada y enviada al cliente | Propietario |
| aceptada | El cliente aceptó las condiciones; falta el anticipo | Cliente |
| confirmada | Anticipo verificado y fecha reservada | Propietario |
| realizada | El evento ocurrió | Propietario o Administrador |
| cancelada | Motivo obligatorio: cliente, negocio, fecha no disponible u otro | Propietario o Administrador |
| vencida | Pasó la vigencia sin aceptación | Sistema (se calcula al consultar; la v1 no usa tareas programadas) |

Banderas adicionales: **esperando\_cliente** (se pidió información) y **lista\_para\_aprobacion** (la preparó el Administrador).

**Reglas:**

1. Solo el propietario envía cotizaciones y aplica descuentos.
2. Antes de enviar, la pantalla muestra los eventos confirmados y las cotizaciones enviadas para esa fecha, y el propietario marca “disponibilidad verificada”. Sin esa marca no se puede enviar.
3. La cotización indica que la fecha se reserva con el primer anticipo verificado.
4. Al registrar un anticipo, si ya hay un evento confirmado que choca, el sistema avisa y exige confirmación explícita.
5. El cliente acepta con un botón en su enlace privado. Se guardan fecha, hora y versión aceptada. La página muestra el monto del anticipo y los datos de transferencia.
6. Un evento pasa a confirmada solo si hay aprobación, aceptación y anticipo verificado.
7. Pagos: el personal registra monto, fecha, método, referencia y comprobante opcional. Solo el propietario verifica.
8. Cancelaciones y devoluciones siguen la política de la sección 2.

**Salida:** una página de cotización con diseño imprimible, que el cliente puede guardar como PDF desde su navegador. El PDF generado en servidor queda FUERA DE V1.

## 9. Panel administrativo

**Módulos de la v1:**

- Inicio: solicitudes nuevas, listas para aprobación, por vencer y próximos eventos.
- Cotizaciones: bandeja, editor, versiones y pagos.
- Clientes: lista simple e historial.
- Catálogo y paquetes.
- Servicios y tarifas: zonas, montaje, personal y decoración.
- Parámetros: perfiles de consumo, márgenes, IVA, políticas, datos bancarios y textos legales.
- Eventos: lista de confirmados por fecha.
- Usuarios (solo propietario) y bitácora de auditoría (solo lectura).

**Indicadores de inicio:** solicitudes recibidas, cotizaciones enviadas, aceptadas, anticipos verificados, y valor potencial separado del valor cobrado.

**Fuera de la v1:** inventario y compras, calendario completo, reportes avanzados, roles de Ventas y Operaciones y recordatorios automáticos.

## 10. Comunicaciones

**Correo (Resend, con dominio propio):** confirmación de solicitud al cliente, aviso de nueva solicitud al propietario, solicitud de información, cotización enviada con su enlace privado, y confirmación de anticipo y evento. Cada envío se registra con fecha, destinatario, tipo y resultado.

**WhatsApp en la v1:** un botón de contacto en el sitio y un botón “Enviar por WhatsApp” en el panel. Ese botón abre el chat con el mensaje y el enlace privado ya escritos (enlace wa.me, con el número en formato internacional). El propietario lo envía con un toque y el sistema anota quién lo hizo.

**WhatsApp Business Platform (envío automático):** FUERA DE V1. Requiere verificación del negocio, plantillas aprobadas, costo por mensaje y consentimiento registrado. Hay que revisar las tarifas y reglas vigentes de Meta antes de decidir.

**Consentimiento:** se guardan la fecha, la versión del aviso de privacidad y el canal aceptado.

## 11. Seguridad y privacidad

- Supabase Auth solo para el personal, con verificación en dos pasos para el propietario.
- RLS en todas las tablas. El público no accede directo a la base de datos: las solicitudes entran por un endpoint de servidor y la cotización se lee por token.
- Costos y márgenes en tablas separadas, inaccesibles para el público y para el Administrador.
- El servidor valida todo y recalcula precios. Las claves privadas viven solo en el servidor.
- Los enlaces de cotización usan tokens largos, aleatorios y con expiración.
- La bitácora registra cambios en cotizaciones, precios, pagos y permisos.
- Aviso de privacidad listo antes de publicar (validarlo con un profesional) y plazo de conservación o anonimización de solicitudes no concretadas: PENDIENTE-DUEÑO.
- Respaldos: confirmar qué plan de Supabase los incluye y probar una restauración antes de publicar.

## 12. Requisitos técnicos

**Stack:** Next.js con TypeScript y Tailwind; Supabase (Postgres, Auth, RLS); Resend; Cloudflare para DNS y Turnstile.

**Hosting (se decide en la Fase 1):** una prueba técnica con tres criterios: que despliegue, que lea Supabase desde el servidor y que el formulario con Turnstile funcione.

- Opción A: vinext en Cloudflare Workers, la ruta que Cloudflare recomienda hoy para apps nuevas de Next.js, aunque es una pieza joven.
- Opción B: Vercel, donde Next.js corre de forma nativa. Revisar las condiciones de uso comercial del plan.
- Opción C: OpenNext en Workers, solo si A y B fallan.

Se documenta la decisión y su causa. El código evita APIs específicas de una plataforma para poder cambiar de hosting.

**Calidad:** pruebas unitarias del motor, pruebas de RLS, pruebas de punta a punta del flujo principal con Playwright, datos ficticios en desarrollo y migraciones versionadas y reversibles.

## 13. Criterios de aceptación de la v1

1. Un cliente completa una solicitud en móvil y escritorio sin crear cuenta.
2. Recargar o hacer doble clic no duplica solicitudes.
3. Los paquetes se personalizan y el resumen desglosa los cambios.
4. El motor reproduce los casos de prueba al centavo, y manipular el total desde el navegador no tiene efecto.
5. Costos y márgenes son inaccesibles para el público y el Administrador, comprobado con pruebas.
6. El estimado aparece marcado como preliminar y las zonas especiales piden evaluación.
7. Editar después del envío crea una versión nueva con precios congelados.
8. El Administrador no puede enviar cotizaciones, aplicar descuentos ni ver costos.
9. Sin aprobación, aceptación y anticipo verificado no hay evento confirmado, y los choques de fecha generan aviso.
10. La cotización se abre con un enlace privado con expiración, los correos llegan y el botón de WhatsApp abre el mensaje correcto.
11. La bitácora registra cambios de cotizaciones, precios y pagos.
12. Se restauró un respaldo en pruebas.
13. Consentimiento y aviso de privacidad quedan registrados.

## 14. Plan por fases

| Fase | Contenido | Lo que revisa el dueño |
| --- | --- | --- |
| 0 | Datos y decisiones del negocio, y preparación del entorno de Claude Code (en paralelo a todo) | Lista de la sección 15 |
| 1 | Proyecto base y prueba de hosting | Decisión de hosting documentada |
| 2 | Base de datos, roles y RLS | Pruebas de permisos en verde |
| 3 | Motor de precios con casos de prueba | Tabla de ejemplos validada |
| 4 | Panel: catálogo, paquetes, tarifas y parámetros | Catálogo real cargado |
| 5 | Configurador del cliente | Flujo completo en móvil |
| 6 | Cotizaciones: revisión, versiones, aprobación y pagos | Una cotización de punta a punta |
| 7 | Correo y botón de WhatsApp | Mensajes reales de prueba |
| 8 | Seguridad, pruebas y pulido | Criterios de aceptación |
| 9 | Publicación y capacitación | Sitio en producción |

**Estimación orientativa:** de 6 a 10 semanas para una persona trabajando con apoyo de IA. La ruta crítica no es el código sino los datos y decisiones del dueño (Fase 0).

**Después de la v1:** PDF de servidor, WhatsApp automático, recordatorios, calendario, inventario, roles adicionales, pagos en línea y reportes.

## 15. Datos que debe entregar el dueño

- Catálogo con foto, unidad de compra, costo, merma estimada y alérgenos de cada producto.
- Entre 3 y 6 paquetes iniciales y sus reglas de personalización.
- Gramos o piezas por persona y categoría, según tipo de evento y duración.
- Zonas de servicio, municipios y tarifas de transporte.
- Tarifas de montaje, personal y decoración, con horas mínimas y regla de personal.
- Margen objetivo por categoría y por servicio.
- Criterio de IVA y facturación, validado con el contador.
- Políticas: cancelación, cambio de fecha, devolución, saldo, anticipación mínima, pedido mínimo y capacidad máxima.
- Datos bancarios para transferencias, número de WhatsApp del negocio, dominio y correo remitente.
- Logo, nombre comercial, colores, textos y aviso de privacidad.

## 16. Decisiones abiertas para revisar juntos

1. Estimado al cliente: rango, total único u oculto.
2. PDF: impresión desde el navegador en la v1 o PDF generado en servidor.
3. Reserva de fecha: con el primer anticipo (propuesto) o con apartado temporal durante la vigencia.
4. Hosting: resultado de la prueba de la Fase 1.
5. IVA y facturación.
6. Si hará falta el rol de Administrador desde el inicio.

## 17. Herramientas de desarrollo con Claude Code

Claude Code reemplaza a Antigravity y a Gemini 4 Argon. Con esta configuración cada fase sale revisable y segura, pero el calendario de 6 a 10 semanas sigue dependiendo de que el dueño entregue datos y decisiones a tiempo: 6 semanas solo si el catálogo, las tarifas y las políticas llegan completos antes de la Fase 4, y 10 si llegan por partes.

### Qué instalar

| Herramienta | Para qué | Cuándo |
| --- | --- | --- |
| Claude Code (app Claude Desktop, pestaña Code, o terminal) | Desarrollar con el agente | Fase 0 |
| Git y cuenta de GitHub | Un commit por tarea y respaldo del código | Fase 0 |
| Node.js (versión LTS) y npm | Next.js, pruebas y scripts del proyecto | Fase 1 |
| Supabase CLI y cuenta de Supabase | Base local, migraciones y tipos | Fase 1 |
| Cuenta de Cloudflare y dominio | DNS y Turnstile | Fase 1 |
| Cuenta de Resend | Correo; verificar el dominio en DNS toma tiempo, así que se inicia en la Fase 1 | Fase 7 |
| Playwright | Pruebas de punta a punta del flujo del cliente | Fase 5 |
| VS Code con la extensión de Claude Code | Revisar cambios con comodidad (opcional) | Opcional |

La opción más simple es la app [Claude Desktop](https://claude.com/download): [incluye Claude Code](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan), no hay nada más que instalar y usa la cuenta con la que inicias sesión. Si prefieres la terminal, Claude Code [funciona en Windows 10 1809 o superior](https://code.claude.com/docs/en/setup.md) y el instalador nativo no requiere Node.js. En PowerShell:

```
irm https://claude.ai/install.ps1 | iex
claude --version
claude doctor
```

Instala también Git for Windows: lo necesitas para el proyecto y Claude Code lo aprovecha.

### Plan, límites y modelos

- Claude Code [requiere una cuenta Pro, Max, Team, Enterprise o Console](https://code.claude.com/docs/en/setup.md); el plan gratuito no lo incluye.
- Mi recomendación: empezar con Pro y subir a Max si los límites te interrumpen. Los límites de sesión de cinco horas y los semanales [se comparten con el chat de Claude](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan), así que usar el chat también consume el cupo. Revisa tu consumo con `/status`.
- Antes de iniciar sesión, comprueba que no exista la variable de entorno `ANTHROPIC_API_KEY`: si existe, Claude Code [cobra por uso de API en lugar de usar tu suscripción](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan).
- Cambia de modelo con `/model`. Mi sugerencia: Sonnet 5.5 para el trabajo diario, y Opus 5.5 para la base de datos y los permisos (Fase 2), el motor de precios (Fase 3) y la revisión de seguridad (Fase 8). Los modelos más potentes consumen más cupo; confirma en `/model` cuáles incluye tu plan.

### Skills y plugins: pocos y con propósito

[Los skills](https://code.claude.com/docs/en/skills) son carpetas con un archivo `SKILL.md`. Claude los usa cuando vienen al caso o tú los invocas con `/nombre`, y su contenido solo se carga al usarse. Para este proyecto bastan estos:

- **Incluidos en Claude Code:** `/verify` y `/run` para ejecutar la app y comprobar que un cambio funciona de verdad, `/code-review` antes de cada merge y `/doctor` al empezar, para revisar la instalación.
- **frontend-design** (plugin oficial de Anthropic): evita que el configurador y el panel se vean como plantilla genérica. Instálalo con `/plugin install frontend-design@claude-plugins-official` y dale la paleta y la tipografía de la marca. Si el marketplace no está agregado, primero ejecuta `/plugin marketplace add anthropics/claude-plugins-official`.
- **skill-creator** (plugin oficial): `/plugin install skill-creator@claude-plugins-official`. Sirve para crear y probar los dos skills propios del proyecto.
- **Skills propios, en `.claude/skills/`:** `cierre-de-fase` al terminar la Fase 2 (pruebas en verde, RLS probado, sin secretos, resumen para el dueño) y `motor-precios` al empezar la Fase 3 (fórmulas de la sección 7, precedencia de márgenes y casos de prueba).

Mantén CLAUDE.md corto: un procedimiento largo pertenece a un skill. Y las reglas que deben cumplirse siempre no van en un skill ni en CLAUDE.md sino en permisos y hooks, porque [un hook corre cada vez que ocurre su evento](https://code.claude.com/docs/en/skills).

### Conexión con Supabase (MCP)

Un solo servidor MCP: Supabase, contra un proyecto de desarrollo con datos ficticios, limitado a ese proyecto y en solo lectura. Los parámetros `project_ref`, `read_only` y `features` [los define Supabase](https://supabase.com/docs/guides/getting-started/mcp):

```
claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=TU_REF&read_only=true&features=docs,database,debugging,development"
```

Después, en una terminal normal, ejecuta `claude /mcp`, elige supabase y pulsa Authenticate. Reglas:

- Nunca lo conectes al proyecto de producción. Las migraciones las escribe Claude como archivos SQL; tú las revisas y las aplicas con la CLI.
- Mantén la aprobación manual de cada herramienta. Supabase advierte del riesgo de inyección de instrucciones, y en esta app los clientes escriben texto libre (notas del evento) que un agente con permisos amplios podría obedecer.
- Quita `read_only=true` solo en un proyecto de desarrollo desechable y con una migración ya revisada.

### Seguridad desde el día 1

- `.claude/settings.json` con reglas de denegación para `.env` y carpetas de secretos (Anexo A). Una instrucción escrita en CLAUDE.md no basta para proteger secretos.
- La `service_role` de Supabase, la clave de Resend y la de Turnstile viven solo en variables de entorno del servidor y en el panel del hosting, nunca en el repositorio ni en el chat.
- Una rama por fase, `main` protegido en GitHub, un commit por tarea y `git push` solo con tu confirmación.
- Opcional desde la Fase 2: un hook que ejecute el formateador y las pruebas del motor después de cada edición.

### Flujo de cada fase

1. Sesión nueva (`/clear`) y modo plan: Claude lee las secciones de la especificación que corresponden y propone un plan; tú lo apruebas.
2. Implementación en commits pequeños, con pruebas.
3. `/verify` o `/run` para ver el cambio funcionando.
4. Revisión con el subagente `revisor-seguridad` (Anexo A) y con `/code-review` sobre la rama.
5. Resumen para el dueño: qué probar y qué quedó pendiente.
6. Merge a `main` y, si cambió una regla del proyecto, actualización de CLAUDE.md.

Este ciclo sostiene el calendario: el límite no es la velocidad del agente sino tu capacidad de revisar y probar, así que reserva tiempo cada semana para los pasos 3 a 5.

No instales decenas de plugins o skills de terceros: cada skill y servidor MCP agrega contexto a cada sesión. `/doctor` estima ese costo y `/skill-doctor` muestra los skills sin uso.

### Fuentes

[Instalación y requisitos de Claude Code](https://code.claude.com/docs/en/setup.md) · [Claude Code con planes Pro o Max](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan) · [Skills de Claude Code](https://code.claude.com/docs/en/skills) · [Supabase MCP](https://supabase.com/docs/guides/getting-started/mcp). Consultadas el 5 de noviembre de 2026.

## Anexo A. Configuración del proyecto para Claude Code

Crea el repositorio, guarda esta especificación como `docs/ESPECIFICACION_FUNCIONAL.md` y agrega los tres archivos de abajo antes de la Fase 1. Puedes pedirle a Claude Code que los cree, pero revísalos: son las reglas del proyecto.

**1. `CLAUDE.md`, en la raíz del repositorio.** Se carga en cada sesión, por eso es corto.

```
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
(Se completan en la Fase 1: desarrollo, pruebas, lint y tipos.)
```

**2. `.claude/settings.json`: permisos del proyecto.** Las reglas de denegación impiden leer secretos aunque alguien lo pida; ajusta los scripts de npm al terminar la Fase 1.

```
{
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run typecheck)",
      "Bash(npm run test *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git add *)",
      "Bash(git commit *)"
    ],
    "ask": [
      "Bash(git push *)",
      "Bash(supabase db push *)",
      "Bash(supabase migration *)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Bash(rm -rf *)"
    ]
  }
}
```

**3. `.claude/agents/revisor-seguridad.md`: subagente revisor.** Trabaja en su propio contexto y solo lee. Pídele a Claude Code que lo cree con este contenido, porque él conoce el formato vigente de los subagentes.

```
---
name: revisor-seguridad
description: Revisa cambios del proyecto en busca de fallas de seguridad y de reglas de negocio. Úsalo al cerrar cada fase y antes de cada merge.
tools: Read, Grep, Glob
---

Eres un revisor de seguridad para un sitio de cotización con Next.js y Supabase. No edites archivos: solo lee y reporta.

Revisa, en este orden:
1. Que costos y márgenes no salgan del servidor ni lleguen a respuestas, vistas o componentes públicos.
2. Que todas las tablas tengan RLS y que el rol anónimo no lea ni escriba directo.
3. Que el servidor recalcule los precios y no confíe en totales del navegador.
4. Que los enlaces de cotización usen tokens aleatorios con expiración.
5. Que no haya secretos en el código, en los logs ni en archivos versionados.
6. Que el dinero use aritmética decimal exacta.

Responde con una lista priorizada (crítico, alto, medio), cada punto con archivo y línea y qué corregir. Si no encuentras problemas, dilo y menciona qué revisaste.
```

## Anexo B. Prompts para Claude Code

Abre Claude Code dentro de la carpeta del repositorio y elige el modelo con `/model`: el modelo no se fija desde el texto del prompt. Los permisos y las reglas ya viven en `CLAUDE.md` y `.claude/settings.json`, así que los prompts son cortos.

### Arranque de la Fase 1

```
Lee CLAUDE.md y docs/ESPECIFICACION_FUNCIONAL.md completos. Hoy trabajamos solo la Fase 1 (sección 14). Antes de escribir código, presenta un plan breve y espera mi aprobación.

Fase 1:
1. Inspecciona el entorno (sistema operativo, Node, gestor de paquetes, Git y CLI de Supabase) e indícame qué falta instalar.
2. Crea el proyecto base con Next.js, TypeScript y Tailwind, con lint, formato, verificación de tipos y pruebas configurados. Completa la sección Comandos de CLAUDE.md.
3. Prueba las opciones A y B de hosting de la sección 12 con un caso mínimo: una página, lectura de Supabase desde el servidor y un formulario con Turnstile. Prueba la opción C solo si A y B fallan. Pídeme las credenciales o el proyecto de prueba cuando haga falta.
4. Documenta el resultado en docs/decisiones/001-hosting.md y recomiéndame una opción con su justificación.
5. Prepara el README con las instrucciones para ejecutar el proyecto en local.

Al terminar, detente y espera mi revisión.
```

### Plantilla para las demás fases

Cambia el número de fase y las secciones según la tabla de abajo.

```
Continuamos con la Fase N (sección 14). Lee las secciones X, Y y Z de la especificación. Presenta un plan y espera mi aprobación. Al terminar: pruebas en verde, revisión con el subagente revisor-seguridad y un resumen de qué debo probar y qué quedó pendiente.
```

| Fase | Secciones que debe leer |
| --- | --- |
| 2 | 3, 4, 5, 8 y 11 |
| 3 | 2, 4, 5 y 7 |
| 4 | 4, 5, 7 y 9 |
| 5 | 5, 6 y 7 |
| 6 | 3, 8 y 9 |
| 7 | 10 |
| 8 y 9 | 11, 12 y 13 |

Si Claude Code propone saltarse una regla de CLAUDE.md o de la especificación, pídele que se detenga y te pregunte. Las excepciones se anotan en la especificación, no se improvisan.

1: | version        | name                               |
| -------------- | ---------------------------------- |
| 20261107000001 | create_testing_table               |
| 20261109000001 | 01_esquema_publico                 |
| 20261109000002 | 02_cotizaciones_costos_y_versiones |
| 20261109000003 | 03_trigger_congelar_version        |
| 20261109000004 | 04_eliminar_politica_anon_testing  |

2: | column_name | data_type                |
| ----------- | ------------------------ |
| id          | uuid                     |
| email       | text                     |
| rol         | text                     |
| nombre      | text                     |
| activo      | boolean                  |
| creado_en   | timestamp with time zone |

3: | column_name                 | data_type                |
| --------------------------- | ------------------------ |
| id                          | bigint                   |
| cotizacion_id               | bigint                   |
| numero_version              | integer                  |
| estado                      | text                     |
| total_venta                 | numeric                  |
| total_costo                 | numeric                  |
| datos_cliente               | jsonb                    |
| datos_evento                | jsonb                    |
| datos_productos             | jsonb                    |
| datos_paquetes              | jsonb                    |
| datos_costo_congelados      | jsonb                    |
| token                       | text                     |
| fecha_aceptacion_privacidad | timestamp with time zone |
| version_aviso_privacidad    | text                     |
| canal_contacto_consentido   | text                     |
| creado_por                  | uuid                     |
| creado_en                   | timestamp with time zone |
| id                          | bigint                   |
| folio                       | text                     |
| datos_cliente               | jsonb                    |
| datos_evento                | jsonb                    |
| datos_productos             | jsonb                    |
| datos_paquetes              | jsonb                    |
| estado                      | text                     |
| vigencia_en                 | timestamp with time zone |
| token                       | text                     |
| token_expires_en            | timestamp with time zone |
| total_venta                 | numeric                  |
| descuento_pct               | numeric                  |
| creado_en                   | timestamp with time zone |
| actualizado_en              | timestamp with time zone |
| fecha_aceptacion_privacidad | timestamp with time zone |
| version_aviso_privacidad    | text                     |
| canal_contacto_consentido   | text                     |
| creado_por                  | uuid                     |
| id                          | bigint                   |
| cotizacion_id               | bigint                   |
| total_costo                 | numeric                  |
| datos_costo                 | jsonb                    |
| creado_en                   | timestamp with time zone |
| actualizado_en              | timestamp with time zone |

4:| tablename            | policyname                                                     | roles           | cmd    |
| -------------------- | -------------------------------------------------------------- | --------------- | ------ |
| bitacora_auditoria   | bitacora_auditoria: solo lectura propietario y administrador   | {authenticated} | SELECT |
| categorias           | categorias: propietario y administrador                        | {authenticated} | ALL    |
| cotizacion_versiones | cotizacion_versiones: solo lectura propietario y administrador | {authenticated} | SELECT |
| cotizaciones         | cotizaciones: propietario y administrador                      | {authenticated} | ALL    |
| cotizaciones_costos  | cotizaciones_costos: solo propietario                          | {authenticated} | ALL    |
| paquete_componentes  | paquete_componentes: propietario y administrador               | {authenticated} | ALL    |
| paquetes             | paquetes: propietario y administrador                          | {authenticated} | ALL    |
| parametros_globales  | parametros_globales: solo propietario                          | {authenticated} | ALL    |
| perfiles_consumo     | perfiles_consumo: propietario y administrador                  | {authenticated} | ALL    |
| productos            | productos: propietario y administrador                         | {authenticated} | ALL    |
| tarifas_montaje      | tarifas_montaje: propietario y administrador                   | {authenticated} | ALL    |
| usuarios_personal    | usuarios_personal: leer propia fila                            | {authenticated} | SELECT |
| usuarios_personal    | usuarios_personal: solo propietario escribe                    | {authenticated} | ALL    |
| zonas_transporte     | zonas_transporte: propietario y administrador                  | {authenticated} | ALL    |
1.| tablename            | rls_habilitado |
| -------------------- | -------------- |
| bitacora_auditoria   | true           |
| categorias           | true           |
| cotizacion_versiones | true           |
| cotizaciones         | true           |
| cotizaciones_costos  | true           |
| paquete_componentes  | true           |
| paquetes             | true           |
| parametros_globales  | true           |
| perfiles_consumo     | true           |
| productos            | true           |
| tarifas_montaje      | true           |
| testing              | true           |
| usuarios_personal    | true           |
| zonas_transporte     | true           |
2.| tablename            | policyname                                                     | roles           |
| -------------------- | -------------------------------------------------------------- | --------------- |
| bitacora_auditoria   | bitacora_auditoria: solo lectura propietario y administrador   | {authenticated} |
| categorias           | categorias: propietario y administrador                        | {authenticated} |
| cotizacion_versiones | cotizacion_versiones: solo lectura propietario y administrador | {authenticated} |
| cotizaciones         | cotizaciones: propietario y administrador                      | {authenticated} |
| cotizaciones_costos  | cotizaciones_costos: solo propietario                          | {authenticated} |
| paquete_componentes  | paquete_componentes: propietario y administrador               | {authenticated} |
| paquetes             | paquetes: propietario y administrador                          | {authenticated} |
| parametros_globales  | parametros_globales: solo propietario                          | {authenticated} |
| perfiles_consumo     | perfiles_consumo: propietario y administrador                  | {authenticated} |
| productos            | productos: propietario y administrador                         | {authenticated} |
| tarifas_montaje      | tarifas_montaje: propietario y administrador                   | {authenticated} |
| usuarios_personal    | usuarios_personal: leer propia fila                            | {authenticated} |
| usuarios_personal    | usuarios_personal: solo propietario escribe                    | {authenticated} |
| zonas_transporte     | zonas_transporte: propietario y administrador                  | {authenticated} |
3.| tablename            | policyname                                                     | roles           |
| -------------------- | -------------------------------------------------------------- | --------------- |
| cotizacion_versiones | cotizacion_versiones: solo lectura propietario y administrador | {authenticated} |
| cotizaciones         | cotizaciones: propietario y administrador                      | {authenticated} |
| cotizaciones_costos  | cotizaciones_costos: solo propietario                          | {authenticated} |
4.| trigger_name                   | tabla        |
| ------------------------------ | ------------ |
| trg_congelar_version_al_enviar | cotizaciones |
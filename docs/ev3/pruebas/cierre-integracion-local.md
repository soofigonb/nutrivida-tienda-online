# Verificación local del flujo orden–cita

La prueba usó el Gateway y los seis microservicios reales con una instancia temporal de PostgreSQL 17. Se aplicaron las migraciones de cada esquema. El catálogo y los profesionales se cargaron con los datos de prueba del perfil NutriVida. Se consultó la documentación OpenAPI de los servicios y se utilizaron cuentas de prueba con JWT firmado por Autenticación.

| Comprobación | Resultado observado |
| --- | --- |
| Perfil propio | `PUT /pacientes/me` creó el perfil y el reintento conservó el mismo identificador. |
| Perfil ajeno | Un segundo cliente recibió 403 al intentar consultar la ficha. |
| Precio y estado de la cita | Agendamiento tomó el precio de la orden y asignó el estado confirmado, aunque la solicitud incluyera otros valores. |
| Cita ajena | Un segundo cliente recibió 403 al intentar consultar la cita. |
| Conflicto de horario | La solicitud de una segunda cita para el mismo profesional, fecha y hora devolvió 400. |
| Reintento y recuperación parcial | La misma clave recuperó la orden. La misma unidad recuperó la primera cita. La segunda unidad se guardó al elegir otro horario y el listado devolvió dos citas. |
| Baja administrativa | El administrador dio de baja el perfil. La cuenta cliente recibió 403 al intentar reactivarlo con `PUT /pacientes/me`. |
| Frontend | Vitest aprobó las 155 pruebas de 18 archivos y Vite compiló el proyecto. |

JaCoCo midió **87,19 %** de cobertura de líneas en [Pacientes](../cobertura/pacientes-service/index.html) y **80,39 %** en [Agendamiento](../cobertura/agendamiento-service/index.html).

La verificación REST local se complementa con las capturas del recorrido en navegador y de la configuración de Supabase que se usará en la entrega.

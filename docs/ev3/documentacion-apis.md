# Documentación de APIs · NutriVida EV3

React consume JSON en `http://localhost:8080/api/v1`. Cada servicio publica su contrato completo en `/v3/api-docs` y una interfaz de prueba en `/doc/swagger-ui.html` de su propio puerto. Las operaciones protegidas usan `Authorization: Bearer <token>`.

| Servicio | Puerto | Operaciones |
| --- | ---: | --- |
| Autenticación | 8081 | `POST /autenticacion/registro`, `/login`, `/renovar`, `/logout` y sus variantes de sesión web cuando corresponda. `GET /autenticacion/me` consulta la cuenta autenticada. `GET /autenticacion/usuarios` y `GET`, `PUT`, `DELETE /autenticacion/usuarios/{id}` son de administrador. |
| Pacientes | 8082 | CRUD de perfiles y `GET`, `PUT /pacientes/me`. Las operaciones sobre datos propios validan al titular. |
| Catálogo | 8083 | `GET`, `POST /catalogo`; `GET`, `PUT`, `DELETE /catalogo/{id}`; `GET`, `POST /catalogo/categorias`; `GET /catalogo/planes` y `/catalogo/planes/{id}`. Escritura de administrador. |
| Profesionales | 8084 | `GET`, `POST /profesionales` y `GET`, `PUT`, `DELETE /profesionales/{id}`. Escritura de administrador. |
| Agendamiento | 8085 | `GET`, `POST /agendamiento` y `GET`, `PUT`, `DELETE /agendamiento/{id}`. La cuenta cliente opera sobre sus propias citas. |
| Órdenes | 8086 | `GET`, `POST /ordenes` y `GET`, `PUT`, `DELETE /ordenes/{id}`. El vendedor tiene lectura, el cliente opera sobre órdenes propias y el administrador cambia sus estados. |

Las creaciones devuelven habitualmente 201 y las bajas 204. Un recurso protegido requiere credenciales válidas y el rol correspondiente. Los errores de validación devuelven 400, la falta de sesión 401, los accesos denegados 403 y los recursos inexistentes 404. Los conflictos y las dependencias no disponibles pueden devolver 409 o 503.

## Crear una orden

Envía `POST /api/v1/ordenes` con la clave UUID del intento y el identificador numérico que devuelve `GET /api/v1/catalogo/planes`. El servidor valida el artículo y calcula el precio.

```json
{
  "claveIdempotencia": "83079adc-47a5-43f5-89a7-8f2ae27f4c7b",
  "detalles": [{ "idItem": 1000000000, "cantidad": 1 }]
}
```

Consulta [Pacientes y Agendamiento](documentacion-apis-pacientes-agendamiento.md) para el detalle del perfil propio y las citas vinculadas a una orden. El [documento de integración](integracion.md) describe la persistencia y la demostración.

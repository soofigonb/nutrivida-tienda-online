# APIs de Pacientes y Agendamiento

Las solicitudes desde React se envían al Gateway en el puerto 8080. Swagger se consulta en `http://localhost:8082/doc/swagger-ui.html` para Pacientes y en `http://localhost:8085/doc/swagger-ui.html` para Agendamiento. En operaciones protegidas se envía `Authorization: Bearer <token>`.

| Método y ruta | Permiso | Resultado esperado |
| --- | --- | --- |
| `GET /api/v1/pacientes` | Administrador | Lista perfiles activos. |
| `POST /api/v1/pacientes` | Administrador | Crea una ficha de paciente y responde 201. Las cuentas se administran en Autenticación. |
| `GET /api/v1/pacientes/me` | Cliente o administrador | Consulta el perfil vinculado al JWT y responde 404 si todavía no existe. |
| `PUT /api/v1/pacientes/me` | Cliente o administrador | Crea o actualiza el perfil propio. Rechaza la reactivación de un perfil dado de baja. |
| `GET /api/v1/pacientes/{id}` | Administrador o titular | Consulta la ficha y responde 403 si pertenece a otra cuenta. |
| `PUT /api/v1/pacientes/{id}` | Administrador o titular | Actualiza los campos de la ficha. |
| `DELETE /api/v1/pacientes/{id}` | Administrador | Da de baja el perfil y responde 204. |
| `GET /api/v1/agendamiento` | Cliente o administrador | Lista citas activas de la cuenta o de todos los clientes si es administrador. |
| `POST /api/v1/agendamiento` | Cliente o administrador | Registra una cita y responde 201. Un reintento de la misma unidad devuelve la cita existente. |
| `GET /api/v1/agendamiento/{id}` | Administrador o titular | Devuelve el detalle de una cita. |
| `PUT /api/v1/agendamiento/{id}` | Administrador o titular | Reprograma una cita activa. Conserva los datos de la compra vinculada. |
| `DELETE /api/v1/agendamiento/{id}` | Administrador o titular | Cancela la cita y responde 204. |

## Solicitar una cita desde una orden

```json
{
  "ordenId": "41111c74-5166-4f25-a96f-24c53f4394c1",
  "itemId": 1000000000,
  "unidad": 1,
  "nutricionistaId": 1,
  "fecha": "2027-03-18",
  "hora": "09:00",
  "motivo": "Evaluación nutricional inicial"
}
```

Usa los identificadores devueltos por la instancia de prueba y una fecha futura. El servidor consulta la orden, verifica la cuenta y el número de unidades, obtiene el perfil desde Pacientes y comprueba que el profesional esté activo. El precio, el nombre del plan y el estado inicial los determina el servidor. Un conflicto de horario devuelve 400 en la validación o 409 si se detecta al guardar. Una dependencia no disponible devuelve 503.

## Persistencia

Pacientes guarda el identificador de la cuenta en `db_pacientes.pacientes.usuario_id`. Agendamiento guarda la referencia de la compra en `db_agendamiento.reservas`. Las migraciones V3 y V4 de Agendamiento separan la protección de reintentos del índice que protege los horarios activos.

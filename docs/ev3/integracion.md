# Integración de NutriVida · EV3

React envía peticiones REST al Gateway. Cada microservicio valida y persiste los datos de su dominio. El Gateway enruta y aplica CORS y reglas de acceso. Los servicios que exponen operaciones protegidas validan también los JWT y sus permisos.

| Componente | Puerto local | Dominio o esquema |
| --- | ---: | --- |
| Gateway | 8080 | Rutas HTTP, CORS y permisos de entrada |
| Autenticación | 8081 | `db_autenticacion` |
| Pacientes | 8082 | `db_pacientes` |
| Catálogo | 8083 | `db_catalogo` |
| Profesionales | 8084 | `db_profesionales` |
| Agendamiento | 8085 | `db_agendamiento` |
| Órdenes | 8086 | `db_ordenes` |

## Registro, sesión y compra

1. React crea la cuenta en Autenticación y vincula la ficha con `PUT /api/v1/pacientes/me`. La identidad proviene del JWT. Las credenciales de las cuentas se gestionan en Autenticación.
2. El inicio de sesión devuelve un token de acceso y establece una cookie HttpOnly para renovar la sesión. React usa el token de acceso en memoria y vuelve a solicitar la sesión al recargar.
3. El carrito obtiene los identificadores de venta del catálogo y envía una orden al Gateway. Órdenes valida los artículos y conserva el precio de compra de cada línea. El servidor reconoce el mismo intento mediante la clave de idempotencia.
4. React solicita una cita para cada unidad de la orden. Agendamiento consulta Órdenes, Profesionales y Pacientes mediante HTTP. Persiste las referencias de la compra y controla la ocupación del horario en PostgreSQL.
5. Si una cita falla, la interfaz conserva la orden y muestra las citas pendientes. El usuario puede corregir un horario y reintentar. Una unidad que ya se guardó recupera el mismo identificador.

## Demostración y evidencias

| Escenario | Resultado que debe observarse |
| --- | --- |
| Registro y perfil | Crear una cuenta y guardar su ficha. Repetir `PUT /pacientes/me` y comprobar el mismo identificador. |
| Compra y cita | Crear la orden desde el carrito, comprobar el precio del servidor y consultar la cita en **Citas**. |
| Fallo parcial | Ocupar previamente el horario de una segunda cita. Conservar la orden y la primera cita. Elegir otro horario y comprobar que se conserva el identificador de la orden y de la primera cita. |
| Titularidad | Con otro cliente, intentar abrir o cambiar la ficha, cita y orden ajenas. Registrar el código devuelto. |
| Roles | Mostrar gestión y escritura con administrador, lectura de órdenes y catálogo con vendedor, y operaciones propias con cliente. |
| Sesión | Recargar una ruta protegida, cerrar sesión y comprobar que esa ruta vuelve a solicitar el inicio de sesión. |

Las capturas de la demostración deben mostrar la solicitud, el resultado y el ambiente usado. Oculta las credenciales y los tokens. La [verificación local del flujo orden–cita](pruebas/cierre-integracion-local.md) utilizó el catálogo real. El [informe histórico de integración](pruebas/integracion-frontend-backend-local.json) usó un catálogo simulado.

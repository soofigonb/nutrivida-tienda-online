# 🥑 NutriVida · Fase 3

<p align="center">
  <strong>Clínica nutricional para una vida más saludable</strong>
</p>

<p align="center">
  Integración de React con un backend Spring Boot mediante APIs REST.
</p>

---

## 🌿 Descripción

La tercera etapa de **NutriVida** incorpora un backend de microservicios al sitio desarrollado en la fase anterior. El equipo implementa APIs para gestionar cuentas, pacientes, productos, profesionales, reservas y órdenes. PostgreSQL en Supabase almacena los datos y Flyway administra las migraciones. El API Gateway recibe las solicitudes de React y las dirige al servicio correspondiente.

## ✨ Alcance de la evaluación

| Requisito | Aplicación en NutriVida |
| --- | --- |
| Backend y base de datos | Modelos y repositorios con JPA, reglas en los servicios y migraciones SQL versionadas. |
| API REST y Swagger | Los servicios exponen sus operaciones mediante controladores REST. Springdoc genera la documentación OpenAPI de las APIs. |
| Integración frontend y backend | React utiliza `fetch` para llamar al gateway en los flujos de sesión, gestión de cuentas y órdenes. |
| Autenticación y autorización | Autenticación firma los JWT con RSA y guarda las contraseñas como hashes BCrypt. El gateway y las APIs protegidas comprueban los permisos de cada rol. |
| Sesión al recargar | React solicita una renovación mediante una cookie `HttpOnly`. El token de acceso se mantiene en memoria. |
| Restricciones de interfaz | React ajusta las rutas y acciones disponibles al rol del usuario. |

### Servicios del equipo

| Componente | Responsabilidad | Ruta actual |
| --- | --- | --- |
| API Gateway | Entrada al backend. Enruta por URL directa, valida JWT y controla el acceso a las rutas. | `/api/v1` |
| Autenticación | Registro, inicio de sesión, renovación, cierre de sesión y gestión de cuentas y roles. | `/api/v1/autenticacion` |
| Pacientes | Alta, consulta, actualización y baja de pacientes. Valida duplicados de RUN y correo. | `/api/v1/pacientes` |
| Catálogo | Lista productos y categorías, consulta el detalle de un producto y registra nuevos productos. | `/api/productos` |
| Profesionales | Alta, consulta, actualización y baja de profesionales. | `/api/v1/profesionales` |
| Agendamiento | Creación, consulta, actualización y cancelación de reservas. Valida fecha, horario y motivo de consulta. | `/api/v1/agendamiento` |
| Órdenes | Creación, consulta, cambio de estado y cancelación de órdenes. Verifica precios y disponibilidad mediante el catálogo. | `/api/v1/ordenes` |

### Roles

- **Administrador:** accede al panel de gestión, administra cuentas y órdenes y consulta el catálogo.
- **Vendedor:** consulta listados y detalles de catálogo y órdenes.
- **Cliente:** accede a la tienda y consulta o cancela sus propias órdenes pendientes.

## 🛠️ Tecnologías

- **Frontend:** React, Vite, React Bootstrap y `fetch`.
- **Backend:** Java 17, Spring Boot, Spring Cloud Gateway y OpenFeign.
- **Datos y API:** PostgreSQL en Supabase, Spring Data JPA, Flyway y Swagger/OpenAPI.
- **Pruebas:** JUnit, Mockito, MockMvc, JaCoCo y Vitest.

## 📁 Organización

```text
proyecto_etapa3_fullstack/
├── backend/
│   ├── api-gateway/
│   ├── autenticacion-service/
│   ├── pacientes-service/
│   ├── catalogo-service/
│   ├── profesionales-service/
│   ├── agendamiento-service/
│   └── ordenes-service/
└── frontend/
```

## 🚀 Ejecución local

Se requiere Java 17, Node.js y acceso a las bases de Supabase. Configura la URL JDBC, el usuario y la contraseña de cada servicio mediante variables de entorno. Autenticación también requiere `JWT_PRIVATE_KEY_LOCATION` y `JWT_PUBLIC_KEY_LOCATION`. Los scripts de `backend/scripts/` permiten generar las claves e iniciar autenticación u órdenes solicitando la contraseña en la terminal. Para catálogo y profesionales, prepara los archivos de configuración local con los datos del equipo.

Desde la carpeta de cada servicio, inicia Spring Boot en una terminal independiente:

```bash
./mvnw spring-boot:run
```

Después, desde `frontend/`, ejecuta:

```bash
npm ci
npm run dev
```

Vite reenvía `/api` al gateway en el puerto `8080`. [Abrir NutriVida](http://localhost:5173).

Para probar las APIs disponibles, inicia los servicios correspondientes y abre su interfaz Swagger. [Autenticación](http://localhost:8081/doc/swagger-ui.html) · [Pacientes](http://localhost:8082/doc/swagger-ui.html) · [Agendamiento](http://localhost:8085/doc/swagger-ui.html) · [Órdenes](http://localhost:8086/doc/swagger-ui.html).

## 🧪 Pruebas y evidencias

Ejecuta `./mvnw verify` desde cada servicio Java y `npm run test -- --run` desde `frontend/`. El gateway tiene pruebas de rutas, JWT y permisos. Pacientes y agendamiento incluyen pruebas de controladores y lógica de negocio. Los informes de cobertura de los módulos con JaCoCo se generan en `target/site/jacoco/index.html`.

| Servicio con informe verificado | Pruebas aprobadas | Cobertura de líneas |
| --- | ---: | ---: |
| Autenticación | 22 | 90,13 % |
| Órdenes | 18 | 85,11 % |

Se comprobó la conexión de autenticación y órdenes con Supabase. El registro, el login, la consulta de la cuenta con JWT y el cierre de sesión se probaron en autenticación. Las [pruebas de integración locales](../../docs/ev3/pruebas/integracion-frontend-backend-local.json) verificaron la comunicación entre el frontend, el gateway y los servicios con un catálogo simulado.

## 📘 Documentación de la entrega

La EV3 pide los enlaces de GitHub y los archivos comprimidos del frontend y backend, la ERS actualizada, la documentación de las APIs, el informe de integración y el manual de usuario con capturas. Las evidencias disponibles se guardan en [docs/ev3](../../docs/ev3/).

## 📌 Pendientes para la entrega

- Alinear la ruta y los identificadores del catálogo con órdenes, el gateway y el carrito. Completar la actualización y baja de productos.
- Conectar el registro con el perfil de paciente y el flujo de reservas con agendamiento. Verificar los permisos sobre registros propios.
- Probar el flujo completo en el navegador con los tres roles y reunir los informes de pruebas de todos los servicios.
- Incorporar la documentación grupal y preparar los archivos de entrega.

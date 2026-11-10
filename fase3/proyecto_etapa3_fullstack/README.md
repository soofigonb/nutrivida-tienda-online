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
| Catálogo | CRUD de productos, consulta de categorías y planes de venta utilizados por el carrito y órdenes. | `/api/v1/catalogo` |
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

## 🐳 Ejecución con Docker Compose

Desde esta carpeta, copia la plantilla de variables y completa `.env` con las conexiones JDBC, los usuarios y las contraseñas de Supabase.

```bash
cp .env.example .env
```

Para una instalación nueva, genera las claves RSA. Si ya tienes claves de NutriVida, reutilízalas y ajusta `JWT_PRIVATE_KEY_FILE` y `JWT_PUBLIC_KEY_FILE` en `.env`.

```bash
node backend/scripts/generar-claves.mjs ./secrets
```

Con Docker Desktop iniciado, valida la configuración y construye los contenedores. Docker compila Java y React dentro de las imágenes.

```bash
docker compose config --quiet
docker compose up --build -d
docker compose ps
```

Abre [NutriVida](http://localhost:5173). Nginx sirve React y reenvía `/api` al Gateway. Los servicios se comunican por nombre dentro de la red de Compose y usan Supabase para persistir los datos. El Gateway queda disponible en `localhost:8080` y los servicios en los puertos `8081` a `8086` para Swagger. Libera estos puertos si hay instancias ejecutándose en terminales.

Si necesitas inicializar un administrador, configura `BOOTSTRAP_ADMIN_ENABLED`, `BOOTSTRAP_ADMIN_EMAIL` y `BOOTSTRAP_ADMIN_PASSWORD` en `.env`. Para un dominio HTTPS, ajusta `FRONTEND_URL` al origen público y activa `SESSION_COOKIE_SECURE=true`. Si cambias el puerto local, actualiza también `FRONTEND_URL`.

```bash
docker compose logs -f api-gateway agendamiento-service
docker compose down
```

## 🚀 Ejecución local

Se requiere Java 17, Node.js y acceso a las bases de Supabase. Configura la URL JDBC, el usuario y la contraseña de cada servicio mediante variables de entorno. Para catálogo usa `CATALOGO_DB_URL`, `CATALOGO_DB_USERNAME` y `CATALOGO_DB_PASSWORD`. Para profesionales usa `PROFESIONALES_DB_URL`, `PROFESIONALES_DB_USERNAME` y `PROFESIONALES_DB_PASSWORD`. Autenticación también requiere `JWT_PRIVATE_KEY_LOCATION` y `JWT_PUBLIC_KEY_LOCATION`. Los scripts de `backend/scripts/` permiten generar las claves e iniciar autenticación u órdenes solicitando la contraseña en la terminal.

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

Para probar las APIs disponibles, inicia los servicios correspondientes y abre su interfaz Swagger. [Autenticación](http://localhost:8081/doc/swagger-ui.html) · [Pacientes](http://localhost:8082/doc/swagger-ui.html) · [Catálogo](http://localhost:8083/doc/swagger-ui.html) · [Profesionales](http://localhost:8084/doc/swagger-ui.html) · [Agendamiento](http://localhost:8085/doc/swagger-ui.html) · [Órdenes](http://localhost:8086/doc/swagger-ui.html).

El CRUD de catálogo identifica los productos por UUID. El carrito y órdenes consultan `/api/v1/catalogo/planes`, que expone el identificador numérico de venta del mismo producto. Para crear, editar o dar de baja productos y profesionales, autoriza Swagger con un JWT de administrador.

### Reutilizar catálogo y profesionales

Cada servicio puede arrancar directamente con su configuración de PostgreSQL y su proveedor JWT. El perfil predeterminado `nutrivida` incluye los datos de ejemplo del proyecto. Para una instalación nueva en otro proyecto, usa una base propia y activa `SPRING_PROFILES_ACTIVE=generico`. Para una base que ya tiene las migraciones de NutriVida, mantén activo `nutrivida`.

- Configura `JWT_ISSUER`, `JWT_JWK_SET_URI` y, si corresponde, `JWT_ROLES_CLAIM` (por defecto `roles`). El rol de escritura se configura con `CATALOGO_WRITE_ROLE` o `PROFESIONALES_WRITE_ROLE`.
- En un catálogo vacío, crea la primera categoría con `POST /api/v1/catalogo/categorias` antes de registrar productos. El perfil genérico admite hasta dos decimales y el de NutriVida usa pesos enteros.
- Desde la carpeta de cada servicio, puedes construir su imagen independiente con `docker build -t nombre-del-servicio .`. Pasa las variables de base de datos y JWT al ejecutar el contenedor. `JWT_JWK_SET_URI` debe ser accesible desde el contenedor.

## 🧪 Pruebas y evidencias

Ejecuta `./mvnw verify` desde cada servicio Java y `npm run test -- --run` desde `frontend/`. El gateway tiene pruebas de rutas, JWT y permisos. Pacientes y agendamiento incluyen pruebas de controladores y lógica de negocio. Los informes de cobertura de los módulos con JaCoCo se generan en `target/site/jacoco/index.html`.

Catálogo y profesionales prueban sus operaciones REST y sus permisos sin conectarse a una base. Maven verifica un mínimo del 80 % de cobertura de líneas en ambos módulos. Para ejecutar también su prueba de arranque, configura una base PostgreSQL de pruebas y activa `RUN_DATABASE_TESTS=true`.

| Servicio con informe verificado | Pruebas aprobadas | Cobertura de líneas |
| --- | ---: | ---: |
| Autenticación | 22 | 90,13 % |
| Órdenes | 18 | 85,11 % |

Se comprobó la conexión de autenticación y órdenes con Supabase. El registro, el login, la consulta de la cuenta con JWT y el cierre de sesión se probaron en autenticación. Las [pruebas de integración locales](../../docs/ev3/pruebas/integracion-frontend-backend-local.json) verificaron la comunicación entre el frontend, el gateway y los servicios con un catálogo simulado.

## 📘 Documentación de la entrega

La EV3 pide los enlaces de GitHub y los archivos comprimidos del frontend y backend, la ERS actualizada, la documentación de las APIs, el informe de integración y el manual de usuario con capturas. Las evidencias disponibles se guardan en [docs/ev3](../../docs/ev3/).

- [Integración y escenarios de demostración](../../docs/ev3/integracion.md)
- [APIs de Pacientes y Agendamiento](../../docs/ev3/documentacion-apis-pacientes-agendamiento.md)
- [Documentación de APIs de todos los servicios](../../docs/ev3/documentacion-apis.md)
- [Manual de usuario](../../docs/ev3/manual-usuario.md)
- [Evidencia local del flujo orden–cita](../../docs/ev3/pruebas/cierre-integracion-local.md)

## 📌 Pendientes para la entrega

- Probar el flujo completo en el navegador con los tres roles y reunir los informes de pruebas de todos los servicios.
- Incorporar la documentación grupal y preparar los archivos de entrega.

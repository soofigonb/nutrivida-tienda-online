# 🥑 NutriVida · Fase 3

<p align="center">
  <strong>Plataforma web de la Clínica Nutricional NutriVida</strong>
</p>

<p align="center">
  React y Vite · Spring Boot · API Gateway · PostgreSQL en Supabase · AWS EC2
</p>

## 🌿 Descripción

NutriVida permite consultar planes nutricionales y profesionales, agendar citas y gestionar las órdenes asociadas a las atenciones. El personal de la clínica dispone de paneles para administrar cuentas, pacientes, profesionales y catálogo, y para consultar o gestionar órdenes según su rol.

En la fase 3, el frontend en React y Vite se comunica con seis microservicios en Spring Boot mediante APIs REST. El API Gateway recibe las solicitudes y las dirige al servicio correspondiente. Los microservicios utilizan PostgreSQL para almacenar sus datos y Flyway para administrar los cambios de esquema.

## ☁️ Despliegue en AWS

La fase 3 cuenta con un despliegue en **AWS EC2**. Desde la aplicación publicada se pueden consultar los planes nutricionales y acceder a las funciones de agendamiento, órdenes y gestión que correspondan al rol de la cuenta.

**[Abrir NutriVida en AWS](https://54.160.139.179/)**

## ✨ Alcance de la EV3

| Aspecto | Implementación en NutriVida |
| --- | --- |
| Backend y base de datos | Spring Boot, Spring Data JPA, PostgreSQL y migraciones Flyway por microservicio. |
| APIs REST y Swagger | Rutas versionadas bajo `/api/v1` y contratos OpenAPI consultables en Swagger UI. |
| Integración del frontend y el backend | React utiliza `fetch` para consultar y guardar información a través del API Gateway. |
| Autenticación | Tokens JWT firmados con RSA, contraseñas almacenadas como hashes BCrypt y renovación de sesión mediante una cookie `HttpOnly`. |
| Gestión de sesión | El frontend mantiene el token de acceso en memoria y solicita la renovación al recargar. |
| Autorización | La interfaz muestra acciones según el rol. El Gateway y los microservicios protegidos verifican los permisos, y el backend comprueba la titularidad de los recursos cuando corresponde. |
| Pruebas de integración | El informe documenta solicitudes y respuestas observadas en el navegador. El repositorio conserva los resultados de una verificación REST con los seis microservicios. |

## 🧩 Arquitectura y servicios

El frontend envía las solicitudes a `/api`. En desarrollo, Vite las reenvía al API Gateway. Con Docker Compose, Nginx sirve la aplicación compilada y reenvía las solicitudes de API al Gateway.

| Componente | Puerto local | Ruta base | Responsabilidad |
| --- | ---: | --- | --- |
| Frontend | `5173` | `/` | Sitio público, formularios, carrito, citas y paneles de gestión. |
| API Gateway | `8080` | `/api/v1` | Enrutamiento, validación de JWT y control de acceso a las rutas. |
| Autenticación | `8081` | `/api/v1/autenticacion` | Registro, inicio y cierre de sesión, renovación y gestión de cuentas, roles y estados. |
| Pacientes | `8082` | `/api/v1/pacientes` | Gestión de fichas de identificación y contacto, consulta del perfil propio y validación de duplicados de RUN y correo. |
| Catálogo | `8083` | `/api/v1/catalogo` | Gestión de productos y categorías, y consulta de planes disponibles para el carrito. |
| Profesionales | `8084` | `/api/v1/profesionales` | Consulta y gestión de nutricionistas, especialidades y modalidades de atención. |
| Agendamiento | `8085` | `/api/v1/agendamiento` | Consulta de disponibilidad, registro, consulta, reprogramación y cancelación de citas. |
| Órdenes | `8086` | `/api/v1/ordenes` | Preparación y publicación de órdenes, validación de precios, consulta y cambios de estado. |

### Roles

| Rol | Funciones |
| --- | --- |
| **Cliente** | Registra su cuenta y ficha, consulta planes y profesionales, solicita atenciones desde el carrito y gestiona sus propias citas y órdenes según las acciones disponibles. |
| **Vendedor** | Consulta listados y detalles de órdenes y catálogo desde el panel comercial. |
| **Administrador** | Gestiona cuentas, roles, pacientes, profesionales y catálogo. Consulta órdenes y realiza los cambios de estado autorizados. |

## 🛒 Flujo de registro, orden y cita

1. **Registro.** El frontend crea la cuenta en Autenticación, inicia la sesión y vincula la ficha del paciente mediante `PUT /api/v1/pacientes/me`.
2. **Selección de una atención.** El cliente elige un plan, un profesional, una fecha y un horario. Agendamiento comprueba la disponibilidad antes de que la consulta se agregue al carrito.
3. **Preparación de la orden.** El cliente revisa el carrito y selecciona **Confirmar orden** y luego **Registrar orden**. El frontend llama a `POST /api/v1/ordenes/preparar` con los artículos, las cantidades y una clave de idempotencia. Órdenes consulta los precios en Catálogo y guarda la solicitud.
4. **Registro de citas.** El frontend solicita una cita por cada unidad de la orden. Agendamiento comprueba las referencias de la orden, el paciente y el profesional, y valida que el horario siga disponible.
5. **Publicación de la orden.** Cuando todas las citas están confirmadas, el frontend llama a `POST /api/v1/ordenes/{id}/publicar`. La orden se puede consultar en **Mis órdenes** y las atenciones en **Mis citas**.
6. **Recuperación de citas pendientes.** Si una cita queda pendiente, el cliente puede corregir su horario y pulsar **Reintentar citas**. El sistema conserva la orden preparada y las citas registradas previamente.

La orden y la cita tienen estados independientes. Una orden publicada puede aparecer con estado comercial `PENDIENTE` mientras su cita está `CONFIRMADA`. El flujo registra órdenes de demostración sin efectuar cobros.

La gestión de productos en Catálogo utiliza UUID. Para el carrito, `GET /api/v1/catalogo/planes` devuelve un identificador numérico de venta que Órdenes recibe como `idItem`.

## 🛠️ Tecnologías

- **Frontend.** React, Vite, React Router, React Bootstrap y `fetch`.
- **Backend.** Java 17, Spring Boot, Spring Cloud Gateway, Spring Security y Maven.
- **Persistencia.** PostgreSQL en Supabase, Spring Data JPA y Flyway.
- **Documentación de APIs.** Springdoc, OpenAPI y Swagger UI.
- **Pruebas.** JUnit, Mockito, MockMvc, JaCoCo y Vitest.
- **Ejecución y despliegue.** Docker Compose, Nginx y AWS EC2. Para desarrollo local se utilizan Maven Wrapper y Node.js.

## 📁 Organización del proyecto

```text
fase3/proyecto_etapa3_fullstack/
├── .env.example
├── docker-compose.yml
├── backend/
│   ├── api-gateway/
│   ├── autenticacion-service/
│   ├── pacientes-service/
│   ├── catalogo-service/
│   ├── profesionales-service/
│   ├── agendamiento-service/
│   ├── ordenes-service/
│   └── scripts/
└── frontend/
```

Los documentos y las evidencias versionadas de la evaluación se encuentran en [`docs/ev3`](../../docs/ev3/).

## 🐳 Ejecución con Docker Compose

Desde la raíz del repositorio, entra a la carpeta de la fase 3 y copia la plantilla de configuración.

```bash
cd fase3/proyecto_etapa3_fullstack
cp .env.example .env
```

En PowerShell, usa `Copy-Item .env.example .env` para copiar la plantilla.

Completa `.env` con la URL JDBC, el usuario y la contraseña de PostgreSQL para cada microservicio. Los prefijos son `AUTENTICACION_DB_`, `PACIENTES_DB_`, `CATALOGO_DB_`, `PROFESIONALES_DB_`, `AGENDAMIENTO_DB_` y `ORDENES_DB_`. Cada prefijo utiliza las variantes `URL`, `USERNAME` y `PASSWORD`.

Para una instalación nueva, genera las claves RSA con Node.js.

```bash
node backend/scripts/generar-claves.mjs ./secrets
```

Si ya tienes claves para NutriVida, configura sus rutas mediante `JWT_PRIVATE_KEY_FILE` y `JWT_PUBLIC_KEY_FILE`. Si la base requiere un administrador inicial, configura `BOOTSTRAP_ADMIN_ENABLED`, `BOOTSTRAP_ADMIN_EMAIL` y `BOOTSTRAP_ADMIN_PASSWORD`. Guarda `.env` y las claves privadas fuera del control de versiones.

Con Docker iniciado, valida la configuración y levanta el entorno.

```bash
docker compose config --quiet
docker compose up --build -d
docker compose ps
```

Abre [NutriVida en local](http://localhost:5173). El Gateway escucha en `localhost:8080` y los microservicios están disponibles en los puertos `8081` a `8086`.

Si cambias el origen del frontend, actualiza `FRONTEND_URL`. Para un entorno HTTPS, configura el origen público exacto y activa `SESSION_COOKIE_SECURE=true`.

Para consultar los registros de los componentes:

```bash
docker compose logs -f api-gateway agendamiento-service ordenes-service
```

Para detener el entorno:

```bash
docker compose down
```

## 🚀 Ejecución local sin Docker

Necesitas **Java 17**, **Node.js**, **npm** y acceso a las bases PostgreSQL configuradas. Define en cada terminal las variables de conexión y JWT que requiere el servicio.

Al ejecutar Autenticación directamente con Maven, configura `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` y `SPRING_DATASOURCE_PASSWORD`, además de `JWT_PRIVATE_KEY_LOCATION` y `JWT_PUBLIC_KEY_LOCATION`.

Inicia Autenticación, los demás microservicios y el Gateway desde sus respectivas carpetas, cada uno en una terminal independiente.

```bash
./mvnw spring-boot:run
```

En PowerShell, usa `.\mvnw.cmd spring-boot:run`. La carpeta [`backend/scripts/`](./backend/scripts/) contiene el generador de claves y el script de arranque para PowerShell.

Después, desde [`frontend/`](./frontend/), instala las dependencias e inicia Vite.

```bash
npm ci
npm run dev
```

Abre [NutriVida en local](http://localhost:5173). Vite reenvía `/api` al Gateway en el puerto `8080`.

### Configuración independiente de Catálogo y Profesionales

El perfil `nutrivida` incluye los datos de ejemplo del proyecto. Para reutilizar uno de estos servicios en una instalación nueva con una base propia, usa `SPRING_PROFILES_ACTIVE=generico`. En una base que ya tiene aplicadas las migraciones de NutriVida, conserva el perfil `nutrivida`.

Configura `JWT_ISSUER`, `JWT_JWK_SET_URI` y, si corresponde, `JWT_ROLES_CLAIM`. Los roles de escritura se configuran con `CATALOGO_WRITE_ROLE` y `PROFESIONALES_WRITE_ROLE`. Si el catálogo está vacío, crea primero una categoría mediante `POST /api/v1/catalogo/categorias`.

## 📚 Swagger UI

Con los servicios en ejecución, abre Swagger UI para consultar los contratos y ejecutar solicitudes. Para las operaciones protegidas, usa **Authorize** con un JWT de una cuenta de prueba que tenga el rol correspondiente.

| Servicio | Documentación local |
| --- | --- |
| Autenticación | [Swagger UI · 8081](http://localhost:8081/doc/swagger-ui.html) |
| Pacientes | [Swagger UI · 8082](http://localhost:8082/doc/swagger-ui.html) |
| Catálogo | [Swagger UI · 8083](http://localhost:8083/doc/swagger-ui.html) |
| Profesionales | [Swagger UI · 8084](http://localhost:8084/doc/swagger-ui.html) |
| Agendamiento | [Swagger UI · 8085](http://localhost:8085/doc/swagger-ui.html) |
| Órdenes | [Swagger UI · 8086](http://localhost:8086/doc/swagger-ui.html) |

## 🧪 Pruebas y evidencias

Desde la carpeta de cada módulo Java, ejecuta `./mvnw verify` o `.\mvnw.cmd verify` en PowerShell. Los módulos con JaCoCo generan el informe en `target/site/jacoco/index.html`.

Catálogo y Profesionales tienen configurado en Maven un mínimo del **80 % de cobertura de líneas**. Para ejecutar sus pruebas de arranque con base de datos, configura una instancia PostgreSQL de pruebas y activa `RUN_DATABASE_TESTS=true`.

Desde `frontend/`, ejecuta:

```bash
npm run test -- --run
npm run build
```

La verificación local de cierre utilizó el Gateway, los seis microservicios y una instancia temporal de PostgreSQL 17. Documenta la persistencia de la ficha del paciente, el rechazo de consultas a registros ajenos, la validación del precio de la cita, el conflicto de horario y la recuperación de una orden con una cita pendiente. El registro también consigna **155 pruebas de frontend aprobadas en 18 archivos** y una compilación exitosa de Vite.

| Evidencia | Archivo |
| --- | --- |
| Verificación REST con los seis microservicios | [Cierre del flujo de orden y cita](../../docs/ev3/pruebas/cierre-integracion-local.md) |
| Pruebas de backend | [Registro de pruebas locales](../../docs/ev3/pruebas/backend-local.json) |
| Verificación previa con catálogo simulado | [Registro de integración local](../../docs/ev3/pruebas/integracion-frontend-backend-local.json) |
| Informes JaCoCo del Gateway y los seis microservicios | [Reportes de cobertura](../../docs/ev3/cobertura/) |

## 📘 Documentación de la entrega

| Entregable | Documento |
| --- | --- |
| Especificación de Requisitos de Software | [ERS de NutriVida](../../docs/ev3/DSY1104%20Evaluaci%C3%B3n%20Parcial%203%20-%20Anexo%204%20ERS-Especificacion%20de%20Requisitos%20del%20software.docx) |
| APIs e Integración | [Anexo 2 · Informe y capturas](../../docs/ev3/DSY1104%20Evaluaci%C3%B3n%20Parcial%203%20-%20Anexo%202%20Documentaci%C3%B3n%20APIs%20e%20Integraci%C3%B3n.docx) |
| Documentación de APIs | [Anexo 3 · Planilla de endpoints](../../docs/ev3/DSY1104%20Evaluaci%C3%B3n%20Parcial%203%20-%20Anexo%203%20Documentaci%C3%B3n%20APIs.xlsm) |
| Manual de usuario | [Anexo 4 · Manual de NutriVida](../../docs/ev3/DSY1104%20Evaluaci%C3%B3n%20Parcial%203%20-%20Anexo%204%20Manual%20de%20usuario.docx) |

El código de la fase 3 se encuentra en [`frontend/`](./frontend/) y [`backend/`](./backend/). La pauta de la EV3 solicita acompañar la entrega con los archivos comprimidos de ambos componentes.

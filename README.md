# 🥑 NutriVida

<p align="center">
  <strong>Plataforma web de la Clínica Nutricional NutriVida</strong>
</p>

<p align="center">
  Consulta de planes nutricionales, agendamiento de citas y gestión de la clínica.
</p>

<p align="center">
  <a href="https://54.160.139.179/">☁️ Aplicación en AWS</a>
  ·
  <a href="./fase1/proyecto_etapa1_html/">Fase 1</a>
  ·
  <a href="./fase2/proyecto_etapa2_react/">Fase 2</a>
  ·
  <a href="./fase3/proyecto_etapa3_fullstack/">Fase 3</a>
</p>

## 🌿 Acerca del proyecto

**NutriVida** es un proyecto académico de Desarrollo Full Stack II para una clínica nutricional. Los visitantes pueden consultar planes, conocer a los nutricionistas, revisar ofertas y leer artículos sobre alimentación saludable. Los clientes pueden crear una cuenta, solicitar atenciones y consultar sus citas y órdenes. El personal de la clínica dispone de paneles de gestión según su rol.

El repositorio reúne la evolución del proyecto desde el sitio inicial en HTML, CSS y JavaScript hasta la aplicación integrada con **React y Vite, Spring Boot, un API Gateway y PostgreSQL en Supabase**.

## 📚 Fases del proyecto

| Fase | Desarrollo | Código y guía |
| --- | --- | --- |
| **1 · Sitio web inicial** | Sitio adaptable con HTML, CSS, JavaScript y Bootstrap. Presenta la clínica, los profesionales y los servicios nutricionales. | [README de la fase 1](./fase1/proyecto_etapa1_html/README.md) |
| **2 · Aplicación React** | Migración a React y Vite. Incorpora navegación, componentes reutilizables, formularios, contextos, administración de registros, persistencia en el navegador y pruebas automatizadas. | [README de la fase 2](./fase2/proyecto_etapa2_react/README.md) |
| **3 · Integración full stack** | Conexión del frontend con seis microservicios en Spring Boot mediante APIs REST. Incorpora autenticación con JWT, acceso por roles, persistencia en PostgreSQL y el flujo integrado de órdenes y citas. | [README de la fase 3](./fase3/proyecto_etapa3_fullstack/README.md) |

## ☁️ Despliegue en AWS

**[Abrir NutriVida en AWS EC2 · Fase 3](https://54.160.139.179/)**

La fase 2 también se publicó en AWS EC2 con Ubuntu y Nginx. El procedimiento y las capturas de esa publicación se conservan en la [documentación de despliegue de la EV2](./docs/ev2/despliegue_aws/).

## ✨ Funcionalidades de la aplicación integrada

| Área | Funcionalidades |
| --- | --- |
| **Sitio público** | Información de la clínica, listado y detalle de nutricionistas, planes con precios en CLP, filtros por categoría, ofertas, blog y formulario de contacto. |
| **Cuentas y pacientes** | Registro, inicio y cierre de sesión, renovación de sesión web y gestión de fichas de identificación y contacto. El formulario valida el RUN y permite seleccionar región y comuna. |
| **Agendamiento y carrito** | Selección de plan, profesional, motivo, fecha y horario. El sistema comprueba la disponibilidad y permite revisar las atenciones antes de registrar la orden. |
| **Órdenes y citas** | Registro y consulta de órdenes propias. Consulta, reprogramación y cancelación de citas según los permisos y el estado de cada registro. |
| **Gestión de la clínica** | Paneles para consultar órdenes y catálogo, y para administrar cuentas, roles, pacientes, profesionales, productos y categorías. |

El formulario de contacto y el registro de órdenes se utilizan con fines de demostración académica. El flujo de órdenes y citas no realiza cobros.

### 👥 Roles

| Rol | Acceso |
| --- | --- |
| **Cliente** | Consulta planes y profesionales, solicita atenciones y gestiona sus propias citas y órdenes según las acciones disponibles. |
| **Vendedor** | Consulta el catálogo y los listados y detalles de órdenes desde el panel comercial. |
| **Administrador** | Gestiona cuentas, roles, pacientes, profesionales y catálogo. Consulta órdenes y realiza los cambios de estado autorizados. |

## 🧩 Arquitectura de la fase 3

El frontend envía las solicitudes a `/api`. En desarrollo, Vite las reenvía al **API Gateway**. Con Docker Compose, Nginx sirve la aplicación compilada y reenvía las solicitudes de API al Gateway. Cada microservicio aplica sus reglas de negocio y guarda sus datos en PostgreSQL.

| Componente | Puerto local | Ruta base | Responsabilidad |
| --- | ---: | --- | --- |
| Frontend | `5173` | `/` | Sitio público, formularios, carrito y paneles por rol. |
| API Gateway | `8080` | `/api/v1` | Enrutamiento de solicitudes, validación de JWT y control de acceso. |
| Autenticación | `8081` | `/api/v1/autenticacion` | Registro, sesiones y gestión de cuentas, roles y estados. |
| Pacientes | `8082` | `/api/v1/pacientes` | Consulta y gestión de fichas de pacientes. |
| Catálogo | `8083` | `/api/v1/catalogo` | Productos, categorías y planes disponibles para el carrito. |
| Profesionales | `8084` | `/api/v1/profesionales` | Gestión de nutricionistas, especialidades y modalidades de atención. |
| Agendamiento | `8085` | `/api/v1/agendamiento` | Disponibilidad, registro, consulta, reprogramación y cancelación de citas. |
| Órdenes | `8086` | `/api/v1/ordenes` | Validación de precios, preparación, publicación y cambios de estado de órdenes. |

Autenticación firma los JWT de acceso con RSA y almacena las contraseñas como hashes BCrypt. El frontend mantiene el token de acceso en memoria y usa una cookie `HttpOnly` para renovar la sesión web. Los servicios protegidos verifican los permisos y la titularidad del recurso cuando corresponde.

### 🛒 Flujo de orden y cita

1. El cliente selecciona un plan, un profesional y un horario disponible, y agrega la atención al carrito.
2. Al pulsar **Registrar orden**, el frontend llama a `POST /api/v1/ordenes/preparar`. Órdenes consulta los precios en Catálogo y guarda la solicitud con una clave de idempotencia para reconocer reintentos.
3. Agendamiento registra las citas asociadas a las unidades de la orden y comprueba que los horarios sigan disponibles. Si queda una cita pendiente, el cliente puede corregir su horario y reintentar. El sistema conserva la orden preparada y las citas registradas.
4. Cuando todas las citas están confirmadas, el frontend llama a `POST /api/v1/ordenes/{id}/publicar`. El cliente puede consultar la orden en **Mis órdenes** y revisar las atenciones en **Mis citas**.

La orden y la cita tienen estados independientes. Una orden publicada puede tener estado comercial `PENDIENTE` mientras su cita está `CONFIRMADA`.

## 🛠️ Tecnologías

| Área | Tecnologías |
| --- | --- |
| Sitio inicial | HTML5, CSS, JavaScript y Bootstrap |
| Frontend | React, Vite, React Router, React Bootstrap, React Hook Form, React Context y `fetch` |
| Backend | Java 17, Spring Boot, Spring Cloud Gateway, Spring Security y Maven |
| Persistencia | `localStorage` en la fase 2. PostgreSQL en Supabase, Spring Data JPA y Flyway en la fase 3 |
| Contratos de API | Springdoc, OpenAPI y Swagger UI |
| Pruebas y cobertura | Vitest, React Testing Library, JUnit, Mockito, MockMvc y JaCoCo |
| Ejecución y despliegue | Docker Compose, Nginx y AWS EC2 |
| Control de versiones | Git y GitHub |

## 📁 Organización del repositorio

```text
nutrivida-tienda-online/
├── fase1/proyecto_etapa1_html/
├── fase2/proyecto_etapa2_react/
├── fase3/proyecto_etapa3_fullstack/
│   ├── backend/
│   ├── frontend/
│   ├── .env.example
│   └── docker-compose.yml
├── docs/
│   ├── ev1/
│   ├── ev2/
│   └── ev3/
└── README.md
```

## 🚀 Ejecutar el proyecto

Clona el repositorio y abre la fase que quieras ejecutar.

```bash
git clone https://github.com/soofigonb/nutrivida-tienda-online.git
cd nutrivida-tienda-online
```

### Fase 1 · Sitio estático

Abre `fase1/proyecto_etapa1_html/index.html` con un servidor estático, como **Live Server** en VS Code. Consulta las instrucciones del [README de la fase 1](./fase1/proyecto_etapa1_html/README.md).

### Fase 2 · React y Vite

Con Node.js y npm instalados, ejecuta desde la raíz del repositorio:

```bash
cd fase2/proyecto_etapa2_react
npm ci
npm run dev
```

Abre la dirección que indique Vite, normalmente [http://localhost:5173/](http://localhost:5173/). Los datos de demostración de esta fase se guardan en el navegador. Consulta el [README de la fase 2](./fase2/proyecto_etapa2_react/README.md).

### Fase 3 · Aplicación full stack

Desde la raíz del repositorio, entra a la carpeta de la fase 3 y copia la plantilla de variables.

```bash
cd fase3/proyecto_etapa3_fullstack
cp .env.example .env
```

En PowerShell, el comando equivalente es `Copy-Item .env.example .env`. Configura en `.env` las conexiones a PostgreSQL y las rutas de las claves RSA. Guarda las credenciales y las claves privadas fuera del control de versiones.

Para una instalación nueva, puedes generar las claves con `node backend/scripts/generar-claves.mjs ./secrets`. Con Docker iniciado y la configuración completa, ejecuta:

```bash
docker compose config --quiet
docker compose up --build -d
docker compose ps
```

El frontend se abre en [http://localhost:5173/](http://localhost:5173/) y el Gateway escucha en `localhost:8080`. Las variables por servicio, la ejecución sin Docker y los enlaces de Swagger UI se detallan en el [README de la fase 3](./fase3/proyecto_etapa3_fullstack/README.md).

## 🧪 Pruebas y evidencias

| Fase | Resultado documentado | Evidencia |
| --- | --- | --- |
| **2 · React** | La ejecución de referencia registró **151 pruebas aprobadas en 15 archivos** y **90,20 % de cobertura de líneas**. | [Pruebas unitarias y cobertura de la EV2](./docs/ev2/pruebas_unitarias/) |
| **3 · Frontend** | El registro de cierre consigna **155 pruebas aprobadas en 18 archivos** y una compilación exitosa con Vite. | [Verificación local de la EV3](./docs/ev3/pruebas/cierre-integracion-local.md) |
| **3 · Backend** | Se conservan los resultados locales y los informes JaCoCo del Gateway y los seis microservicios. | [Pruebas locales](./docs/ev3/pruebas/backend-local.json) · [Reportes de cobertura](./docs/ev3/cobertura/) |
| **3 · Integración REST** | La verificación con PostgreSQL local documenta el guardado de la ficha, los permisos sobre registros propios, la validación de precios, los conflictos de horario y la recuperación de una orden con una cita pendiente. | [Cierre del flujo de orden y cita](./docs/ev3/pruebas/cierre-integracion-local.md) |

Para ejecutar las pruebas del frontend de la fase 2 o 3, entra a la carpeta correspondiente y usa `npm run test -- --run`. Para verificar un módulo Java de la fase 3, ejecuta `./mvnw verify` desde su carpeta o `.\mvnw.cmd verify` en PowerShell.

## 📘 Documentación de las tres fases

### Fase 1 · Requerimientos y sitio inicial

| Entregable | Archivo |
| --- | --- |
| Planilla de requerimientos | [Anexo 2 · Planilla de Requerimientos](./docs/ev1/DSY1104%20Evaluaci%C3%B3n%20Parcial%201%20-%20Anexo%202%20Planilla%20de%20Requerimientos.xlsx) |
| Especificación de Requisitos de Software | [Anexo 4 · ERS de la fase 1](./docs/ev1/DSY1104%20Evaluaci%C3%B3n%20Parcial%201%20-%20Anexo%204%20ERS-Especificacion%20de%20Requisitos%20del%20software.docx) |

### Fase 2 · Aplicación React, pruebas y despliegue

| Entregable | Archivo |
| --- | --- |
| Especificación de Requisitos de Software | [Anexo 4 · ERS de la fase 2](./docs/ev2/DSY1104%20Evaluaci%C3%B3n%20Parcial%202%20-%20Anexo%204%20ERS-Especificacion%20de%20Requisitos%20del%20software.docx.pdf) |
| Informe de pruebas | [Informe de Pruebas de NutriVida](./docs/ev2/pruebas_unitarias/Informe%20Pruebas%20NutriVida.pdf) |
| Cobertura y evidencias | [Reporte de cobertura](./docs/ev2/pruebas_unitarias/cobertura/) · [Capturas de las pruebas](./docs/ev2/pruebas_unitarias/evidencias/) |
| Despliegue en AWS EC2 | [Procedimiento de despliegue](./docs/ev2/despliegue_aws/README.md) · [Evidencias del despliegue](./docs/ev2/despliegue_aws/evidencias/) |

### Fase 3 · Integración full stack

| Entregable | Archivo |
| --- | --- |
| Especificación de Requisitos de Software | [ERS de la fase 3](./docs/ev3/DSY1104%20Evaluaci%C3%B3n%20Parcial%203%20-%20Anexo%204%20ERS-Especificacion%20de%20Requisitos%20del%20software.docx) |
| APIs e Integración | [Anexo 2 · Informe y evidencias de integración](./docs/ev3/DSY1104%20Evaluaci%C3%B3n%20Parcial%203%20-%20Anexo%202%20Documentaci%C3%B3n%20APIs%20e%20Integraci%C3%B3n.docx) |
| Documentación de APIs | [Anexo 3 · Planilla de endpoints](./docs/ev3/DSY1104%20Evaluaci%C3%B3n%20Parcial%203%20-%20Anexo%203%20Documentaci%C3%B3n%20APIs.xlsm) |
| Manual de usuario | [Anexo 4 · Manual de NutriVida](./docs/ev3/DSY1104%20Evaluaci%C3%B3n%20Parcial%203%20-%20Anexo%204%20Manual%20de%20usuario.docx) |
| Pruebas y cobertura | [Resultados de pruebas](./docs/ev3/pruebas/) · [Reportes JaCoCo](./docs/ev3/cobertura/) |

El código de la fase 3 está disponible en las carpetas de [frontend](./fase3/proyecto_etapa3_fullstack/frontend/) y [backend](./fase3/proyecto_etapa3_fullstack/backend/).

## 🤝 Trabajo colaborativo

El equipo organiza los cambios en ramas y los integra a `main` mediante Pull Requests. Cada Pull Request describe el cambio y las verificaciones realizadas.

## 👥 Equipo de desarrollo

- **Jonathan Rivera**
- **Nitsi Sepúlveda**
- **Sofía González**

Proyecto académico de **Desarrollo Full Stack II · Duoc UC**.

<p align="center">
  🌿 <strong>NutriVida · Un cambio de hábitos cambia tu vida</strong>
</p>

# 🥑 NutriVida · Fase 2

<p align="center">
  <strong>Clínica nutricional para una vida más saludable</strong>
</p>

<p align="center">
  Aplicación frontend desarrollada con React, Vite y React Bootstrap.
</p>

---

## 🌿 Descripción

**NutriVida** es una aplicación web para consultar servicios nutricionales, registrar pacientes, agendar atenciones y administrar la información de pacientes y profesionales.

Esta segunda etapa migra el sitio original de HTML, CSS y JavaScript hacia una aplicación React. La interfaz utiliza componentes reutilizables, propiedades, estado, contextos y navegación entre páginas.

El proyecto incorpora formularios con validaciones, operaciones CRUD, persistencia local y pruebas automatizadas con Vitest.

> NutriVida es un prototipo frontend con datos de demostración. La autenticación, la confirmación de reservas y el envío del formulario de contacto son simulados. No procesa pagos reales ni utiliza un backend.

---

## ✨ Funcionalidades

### Sitio público

- Presentación de la clínica e información institucional.
- Listado de nutricionistas conectado con los datos administrados.
- Visualización del detalle de cada profesional mediante una ventana modal.
- Planes y servicios con precios en pesos chilenos.
- Visualización de una promoción mediante un botón interactivo.
- Listado de blogs y páginas de artículos.
- Formulario de contacto con validaciones.
- Navegación entre páginas y secciones.
- Menú responsive y pie de página compartido.

### Registro e inicio de sesión

- Registro de cuentas de pacientes.
- Validación del RUN/RUT y su dígito verificador.
- Validación de nombres, apellidos, correo, teléfono y dirección.
- Selección relacionada de región y comuna.
- Confirmación de contraseña.
- Detección de RUN/RUT y correos previamente registrados.
- Inicio y cierre de sesión simulados.
- Acceso diferenciado para pacientes y administrador.
- Actualización del menú según la sesión.
- Persistencia local de la sesión.

### Agendamiento

- Selección de un plan o servicio y un nutricionista.
- Preselección del plan desde la página de servicios.
- Ingreso del motivo de consulta.
- Selección de fecha y horario.
- Validación para impedir atenciones en fechas y horarios pasados.
- Detección de reservas para el mismo profesional, fecha y hora.
- Incorporación de la atención al carrito.

El precio de la atención corresponde al plan seleccionado. La elección del nutricionista no agrega un cobro adicional.

### Carrito de reservas

- Visualización de las atenciones seleccionadas.
- Cálculo del total.
- Eliminación individual y vaciado del carrito.
- Conservación de las reservas al actualizar la página.
- Validación de disponibilidad y precio antes de confirmar.
- Confirmación simulada y generación de un resumen.
- Conservación del carrito cuando ocurre un fallo de confirmación.
- Manejo de errores de almacenamiento.
- Prevención de duplicados al reintentar una confirmación.

### Panel administrativo

- Acceso restringido en la interfaz según el rol de la sesión.
- Menú y distribución propios del panel.
- Dashboard con cantidades de pacientes, nutricionistas y citas del día.
- Creación, listado, edición y eliminación de pacientes y nutricionistas.
- Búsqueda en los listados.
- Formularios reutilizables con validaciones.
- Confirmación antes de eliminar registros.
- Bloqueo de eliminación de registros con citas o reservas asociadas.
- Actualización de los datos utilizados por las páginas públicas.

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| React | Componentes, propiedades, estado y contextos. |
| Vite | Servidor de desarrollo y compilación. |
| JavaScript y JSX | Lógica y construcción de la interfaz. |
| React Router | Rutas, navegación y layouts. |
| React Bootstrap | Componentes de interfaz. |
| Bootstrap | Grillas y utilidades responsive. |
| Bootstrap Icons | Iconografía. |
| React Hook Form | Gestión y validación de formularios. |
| CSS | Estilos personalizados. |
| `localStorage` y JSON | Persistencia local. |
| Vitest | Ejecución de pruebas automatizadas. |
| React Testing Library | Renderizado y consultas sobre los componentes en pruebas. |
| user-event | Simulación de interacciones de usuario. |
| jest-dom | Verificaciones sobre el DOM. |
| jsdom | Entorno de navegador para las pruebas. |
| Oxlint | Análisis estático del código. |
| Git y GitHub | Control de versiones y colaboración. |

---

## 🚀 Instalación y ejecución

### Requisitos

- Node.js 24.
- npm.
- Git.
- Un navegador web actualizado.

### 1. Clonar el repositorio

```bash
git clone https://github.com/soofigonb/nutrivida-tienda-online.git
```

### 2. Entrar en la aplicación React

```bash
cd nutrivida-tienda-online/fase2/proyecto_etapa2_react
```

### 3. Instalar las dependencias

```bash
npm ci
```

Este comando instala las dependencias utilizando las versiones registradas en `package-lock.json`.

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre la dirección indicada en la terminal. Habitualmente será:

**http://localhost:5173/**

Si el puerto está ocupado, Vite puede utilizar otro.

Para detener el servidor, presiona **Ctrl + C**.

> Ejecuta los comandos de npm dentro de `fase2/proyecto_etapa2_react`, donde se encuentra `package.json`.

---

## 📋 Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm ci` | Instala las dependencias desde el archivo de bloqueo. |
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run test` | Ejecuta Vitest en modo de observación. |
| `npm run test -- --run` | Ejecuta todas las pruebas una vez. |
| `npm run lint` | Analiza el código con Oxlint. |
| `npm run build` | Genera la compilación de producción. |
| `npm run preview` | Sirve la compilación para revisarla localmente. |

---

## 📁 Organización del proyecto

| Ubicación | Responsabilidad |
|---|---|
| `src/assets/` | Imágenes importadas por los componentes. |
| `src/components/` | Componentes reutilizables, secciones y layouts. |
| `src/pages/` | Páginas asociadas a las rutas. |
| `src/context/` | Gestión compartida de sesión, datos y carrito. |
| `src/data/` | Datos iniciales de profesionales, planes, blogs, regiones y comunas. |
| `src/utils/` | Funciones de almacenamiento, formato y validación. |
| `src/styles/Admin.css` | Estilos del panel administrativo. |
| `src/App.jsx` | Composición de layouts y definición de rutas. |
| `src/App.css` | Estilos de las páginas y componentes. |
| `src/index.css` | Estilos globales. |
| `src/main.jsx` | Punto de entrada y configuración inicial de React. |
| `src/setupTests.js` | Configuración compartida de las pruebas. |
| `public/` | Recursos estáticos públicos. |
| `index.html` | Documento principal utilizado por Vite. |
| `vite.config.js` | Configuración de Vite y Vitest. |
| `package.json` | Dependencias y scripts. |
| `package-lock.json` | Versiones registradas de las dependencias. |

Los archivos de pruebas utilizan la extensión `.test.jsx` y se encuentran junto a las páginas o contextos correspondientes.

---

## 🧩 Componentes y gestión del estado

La aplicación distribuye las responsabilidades entre componentes, páginas y contextos.

| Elemento | Responsabilidad |
|---|---|
| `Navbar` y `Footer` | Navegación y pie de página del sitio público. |
| `ListaNutricionistas` | Listado de profesionales y selección del detalle. |
| `PlanesServicios` | Presentación de servicios y control de la promoción. |
| `ArticuloBlog` | Presentación reutilizable del contenido de los artículos. |
| `FormularioContacto` | Validación y resultado del contacto simulado. |
| `AdminLayout` | Menú y distribución del panel administrativo. |
| `AdminListado` | Listados, búsqueda y acciones administrativas. |
| `AdminFormulario` | Formularios de pacientes y nutricionistas. |
| `RutaAdmin` | Control de acceso administrativo en la interfaz. |
| `ScrollNavegacion` | Desplazamiento al cambiar de página o sección. |

Las propiedades permiten proporcionar datos y funciones a los componentes reutilizables. El estado controla interacciones como abrir un detalle, mostrar una promoción y actualizar formularios.

### Contextos

| Contexto | Información y operaciones |
|---|---|
| `AuthContext` | Registro, inicio de sesión, usuario actual y cierre de sesión. |
| `DatosContext` | Lectura y operaciones CRUD de pacientes y nutricionistas. |
| `CarritoContext` | Reservas, cantidades, total y confirmación. |

---

## 🌐 Navegación

### Sitio público

| Ruta | Página |
|---|---|
| `/` | Inicio. |
| `/registro` | Registro de pacientes. |
| `/login` | Inicio de sesión. |
| `/login?acceso=admin` | Acceso administrativo. |
| `/agendar` | Agendamiento de atención. |
| `/carrito` | Carrito y confirmación de reservas. |
| `/blogs/alimentacion-antiinflamatoria` | Artículo sobre alimentación antiinflamatoria. |
| `/blogs/hidratacion-deportiva` | Artículo sobre hidratación deportiva. |

El inicio contiene enlaces a las secciones Nosotros, Servicios, Blogs y Contacto.

### Panel administrativo

| Ruta | Página |
|---|---|
| `/admin` | Dashboard. |
| `/admin/pacientes` | Listado de pacientes. |
| `/admin/pacientes/nuevo` | Creación de pacientes. |
| `/admin/pacientes/:id/editar` | Edición de un paciente. |
| `/admin/nutricionistas` | Listado de nutricionistas. |
| `/admin/nutricionistas/nuevo` | Creación de nutricionistas. |
| `/admin/nutricionistas/:id/editar` | Edición de un nutricionista. |

El sitio público comparte navbar y footer. El panel administrativo utiliza un layout independiente.

---

## 📝 Formularios y validaciones

Los formularios muestran mensajes asociados a los datos ingresados y evitan continuar cuando existen errores.

| Formulario | Validaciones principales |
|---|---|
| Registro | Campos obligatorios, RUN/RUT, correo permitido, teléfono, región y comuna, contraseña y duplicados. |
| Login | Campos obligatorios, credenciales y tipo de acceso. |
| Agendamiento | Plan, profesional, motivo, fecha futura y disponibilidad del horario. |
| Contacto | Nombre, formato del correo y longitud del mensaje. |
| Administración | Datos del registro, formatos, duplicados y reglas de edición. |

El registro admite correos de los dominios `duoc.cl`, `profesor.duoc.cl` y `gmail.com`.

El formulario de contacto valida los datos y muestra el resultado de un envío simulado; no envía correos electrónicos reales.

---

## 💾 Datos y persistencia

Los archivos de `src/data/` proporcionan los datos iniciales. Los contextos conectan esa información con las páginas y gestionan las actualizaciones.

| Clave de almacenamiento | Contenido |
|---|---|
| `pacientesNutriVida` | Pacientes registrados. |
| `nutricionistasNutriVida` | Profesionales administrados. |
| `sesionNutriVida` | Sesión simulada. |
| `carritoNutriVida` | Atenciones seleccionadas. |
| `citasNutriVida` | Citas confirmadas. |

Las operaciones CRUD permiten crear, consultar, actualizar y eliminar registros. Las modificaciones de profesionales se reflejan en el listado público y en el agendamiento.

La persistencia pertenece al navegador y al origen desde el que se ejecuta la aplicación. Los datos no se comparten automáticamente entre equipos o navegadores.

---

## 📱 Diseño responsive

La interfaz combina grillas y utilidades de Bootstrap, componentes de React Bootstrap y media queries personalizadas.

El diseño adapta la navegación, tarjetas, formularios, tablas y panel administrativo a distintos tamaños de pantalla.

| Dispositivo de referencia | Ancho |
|---|---|
| Celular | 360 px |
| Tablet | 768 px |
| Escritorio | 1280 px |

Las fuentes utilizadas son **Roboto** para los textos y **Fraunces** para los títulos.

---

## 🧪 Pruebas automatizadas

Las pruebas utilizan **Vitest**, **React Testing Library**, **user-event** y **jsdom** para comprobar comportamientos de la aplicación.

### Ejecutar todas las pruebas

```bash
npm run test -- --run
```

### Ejecutar en modo de observación

```bash
npm run test
```

### Ejecutar un archivo específico

```bash
npm run test -- --run src/pages/Admin.test.jsx
```

### Organización de las pruebas

| Archivo | Casos |
|---|---:|
| `src/pages/Admin.test.jsx` | 11 |
| `src/context/CarritoContext.test.jsx` | 10 |
| `src/pages/Carrito.test.jsx` | 4 |
| `src/pages/Agendar.test.jsx` | 3 |
| `src/pages/Registro.test.jsx` | 1 |
| **Total** | **29** |

### Comportamientos verificados

- Acceso administrativo según la sesión y el rol.
- Búsqueda y operaciones administrativas.
- Validación y persistencia de registros.
- Preselección del plan desde la URL.
- Rechazo de fechas pasadas y reservas duplicadas.
- Cálculo del total y eliminación de elementos del carrito.
- Confirmación de reservas y conservación de datos ante fallos.
- Manejo de errores de almacenamiento y reintentos.
- Renderizado del título de Registro.

Las pruebas simulan eventos de usuario y utilizan mocks cuando es necesario provocar errores de almacenamiento o aislar dependencias.

El almacenamiento se limpia entre los casos correspondientes y los mocks se restauran para mantener la independencia de las pruebas.

---

## 📦 Compilación de producción

Genera los archivos de producción con:

```bash
npm run build
```

El resultado se guarda en `dist/`.

Para revisar esa compilación localmente:

```bash
npm run preview
```

Abre la dirección indicada en la terminal.

Las carpetas `node_modules/` y `dist/` se generan localmente y están excluidas del control de versiones.

---

## 🤝 Trabajo colaborativo

El equipo utiliza Git y GitHub para mantener el historial del proyecto y trabajar mediante ramas.

Los cambios se integran a `main` mediante Pull Requests. Los mensajes de commit identifican al integrante y describen el aporte realizado.

La revisión de cambios incluye la ejecución de las pruebas y la compilación de la aplicación.

---

## 📘 Enlaces del proyecto

- [Presentación general del repositorio](../../README.md)
- [Primera etapa: HTML, CSS y JavaScript](../../fase1/proyecto_etapa1_html/)
- [Documentación del proyecto](../../docs/)

---

## 👥 Equipo de desarrollo

- **Jonathan Rivera**
- **Nitsi Sepúlveda**
- **Sofía González**

Proyecto académico desarrollado para la asignatura **Desarrollo Full Stack II — Duoc UC**.

---

<p align="center">
  🌿 <strong>NutriVida · Un cambio de hábitos cambia tu vida</strong>
</p>

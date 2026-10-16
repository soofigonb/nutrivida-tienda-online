# 🥑 NutriVida · Fase 2

<p align="center">
  <strong>Clínica nutricional para una vida más saludable</strong>
</p>

<p align="center">
  Aplicación frontend desarrollada con React, Vite y React Bootstrap.
</p>

---

## 🌿 Descripción

**NutriVida** permite consultar servicios nutricionales, registrar pacientes, agendar atenciones y administrar pacientes y profesionales.

La segunda etapa migra la versión original de HTML, CSS y JavaScript hacia React, utilizando componentes reutilizables, propiedades, estados, contextos y navegación entre páginas.

Incluye un catálogo por categorías, ofertas, formularios con validaciones, revisión y confirmación de reservas, operaciones CRUD y persistencia local. Sus comportamientos se verifican mediante pruebas automatizadas con Vitest.

> Es un prototipo frontend con datos de demostración. La autenticación, la confirmación de reservas y el envío de contacto son simulados. No procesa pagos reales ni utiliza un backend.

---

## ✨ Funcionalidades

### Sitio público

- Presentación de la clínica e información institucional.
- Video educativo de la OPS/OMS, con fuente y enlace original.
- Listado de nutricionistas conectado con los datos administrados.
- Detalle de cada profesional mediante una ventana modal.
- Planes y servicios con precios en pesos chilenos.
- Catálogo con filtro por categoría.
- Categoría seleccionada conservada mediante parámetros de la URL.
- Página de ofertas con condiciones del beneficio.
- Promoción interactiva en el inicio.
- Blogs y páginas de artículos.
- Formulario de contacto validado.
- Navegación responsive y footer compartido.

### Registro y sesión

- Registro de cuentas de pacientes.
- Validación de RUN/RUT y dígito verificador.
- Validación de datos personales y confirmación de contraseña.
- Selección relacionada de región y comuna.
- Detección de RUN/RUT y correos duplicados.
- Inicio y cierre de sesión simulados.
- Acceso diferenciado para pacientes y administrador.
- Actualización del menú según la sesión.
- Persistencia de sesión y manejo de errores del almacenamiento.

### Agendamiento

- Selección del plan y del nutricionista.
- Preselección del plan desde servicios y ofertas.
- Ingreso del motivo de consulta.
- Selección de fecha y horario.
- Validación de fechas y horarios futuros.
- Detección de reservas duplicadas para un profesional.
- Incorporación de consultas al carrito.

El precio corresponde al plan seleccionado. La elección de un nutricionista no agrega un cobro adicional.

### Carrito y revisión de reservas

El proceso se organiza en tres pasos:

1. Revisar las consultas del carrito y su total.
2. Comprobar los servicios e ingresar los datos del paciente.
3. Confirmar y consultar el resumen de las citas creadas.

Incluye:

- Eliminación individual y vaciado del carrito.
- Persistencia de las consultas al actualizar la página.
- Nombre y correo completados desde la sesión cuando está disponible.
- Validación de datos del paciente.
- Regreso al carrito antes de confirmar.
- Comprobación de disponibilidad y precio al confirmar.
- Resumen con paciente, profesional, servicio, fecha, hora y código.
- Conservación del carrito ante errores de confirmación.
- Prevención de duplicados al reintentar.
- Control de simulación de fallo para demostrar el manejo de errores.

Los datos ingresados durante la revisión se guardan en la cita y no modifican el perfil ni la sesión.

### Categorías y ofertas

El catálogo organiza los servicios en:

- Evaluación inicial.
- Atención integral.
- Nutrición deportiva.

La página de ofertas presenta el beneficio de una medición de composición corporal sin costo adicional, sus condiciones y el enlace al plan correspondiente.

La promoción añade un beneficio al servicio; no modifica su precio ni aplica un descuento monetario. La medición se realiza presencialmente en la clínica.

### Panel administrativo

- Control de acceso en la interfaz según el rol.
- Layout y menú propios.
- Dashboard con pacientes, profesionales y citas del día.
- Creación, listado, edición y eliminación de registros.
- Búsquedas en los listados.
- Formularios reutilizables con validaciones.
- Confirmación antes de eliminar.
- Comprobación de relaciones con citas y reservas.
- Actualización de profesionales en las páginas públicas.

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| React y JSX | Componentes, propiedades, estado y contextos. |
| Vite | Desarrollo y compilación. |
| React Router | Rutas, layouts y parámetros de navegación. |
| React Bootstrap | Componentes de interfaz. |
| Bootstrap | Grillas y utilidades responsive. |
| Bootstrap Icons | Iconografía. |
| React Hook Form | Gestión y validación de formularios. |
| CSS | Estilos personalizados. |
| `localStorage` y JSON | Persistencia local. |
| Vitest | Ejecución de pruebas. |
| React Testing Library | Renderizado y consultas de componentes. |
| user-event | Interacciones de usuario en pruebas. |
| jest-dom | Aserciones sobre el DOM. |
| jsdom | Entorno DOM para las pruebas. |
| @vitest/coverage-v8 | Medición de cobertura. |
| Oxlint | Análisis estático. |
| AWS EC2 y Nginx | Publicación de la compilación. |
| Git y GitHub | Control de versiones. |

---

## 🚀 Instalación y ejecución

### Requisitos

- Node.js 24.
- npm.
- Git.
- Un navegador web actualizado.

### Clonar e instalar

```bash
git clone https://github.com/soofigonb/nutrivida-tienda-online.git
cd nutrivida-tienda-online/fase2/proyecto_etapa2_react
npm ci
```

`npm ci` utiliza las versiones registradas en `package-lock.json`.

### Iniciar el servidor

```bash
npm run dev
```

Abre la dirección indicada en la terminal, normalmente [http://localhost:5173/](http://localhost:5173/).

Vite puede utilizar otro puerto si el habitual está ocupado. Para detener el servidor, presiona **Ctrl + C**.

> Ejecuta los comandos de npm dentro de `fase2/proyecto_etapa2_react`, donde está `package.json`.

---

## 📋 Comandos

| Comando | Descripción |
|---|---|
| `npm ci` | Instala dependencias desde el archivo de bloqueo. |
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run test` | Ejecuta Vitest en modo de observación. |
| `npm run test -- --run` | Ejecuta toda la suite una vez. |
| `npm run test:coverage` | Ejecuta las pruebas y genera la cobertura. |
| `npm run lint` | Analiza el código con Oxlint. |
| `npm run build` | Genera la compilación en `dist/`. |
| `npm run preview` | Sirve la compilación para revisión local. |

---

## 📁 Organización

| Ubicación | Responsabilidad |
|---|---|
| `src/assets/` | Imágenes importadas por los componentes. |
| `src/components/` | Componentes reutilizables, secciones y layouts. |
| `src/pages/` | Páginas asociadas a las rutas. |
| `src/context/` | Sesión, datos y carrito compartidos. |
| `src/data/` | Datos iniciales, planes, promoción, blogs, regiones y comunas. |
| `src/utils/` | Almacenamiento, formatos y validaciones. |
| `src/styles/Admin.css` | Estilos administrativos. |
| `src/App.jsx` | Layouts y definición de rutas. |
| `src/App.css` | Estilos de páginas y componentes. |
| `src/index.css` | Estilos globales. |
| `src/main.jsx` | Punto de entrada de React. |
| `src/setupTests.js` | Configuración compartida de pruebas. |
| `public/` | Recursos estáticos públicos. |
| `index.html` | Documento principal de Vite. |
| `vite.config.js` | Configuración de Vite, Vitest y cobertura. |
| `package.json` | Dependencias y scripts. |
| `package-lock.json` | Versiones registradas de dependencias. |

Los archivos de pruebas utilizan las extensiones `.test.jsx` y `.test.js`.

---

## 🧩 Componentes y estado

| Elemento | Responsabilidad |
|---|---|
| `Navbar` y `Footer` | Navegación y pie del sitio público. |
| `Nosotros` | Información institucional y video. |
| `ListaNutricionistas` | Listado y detalle de profesionales. |
| `PlanesServicios` | Servicios y promoción en el inicio. |
| `TarjetaServicio` | Tarjeta reutilizada en el inicio y el catálogo. |
| `Servicios` | Catálogo y filtro de categorías mediante la URL. |
| `Ofertas` | Beneficio, condiciones y acceso al agendamiento. |
| `ArticuloBlog` | Presentación reutilizable de artículos. |
| `FormularioContacto` | Validación y resultado del contacto simulado. |
| `Carrito` | Listado, revisión de datos y resultado de confirmación. |
| `AdminLayout` | Distribución del panel. |
| `AdminListado` | Búsqueda y acciones administrativas. |
| `AdminFormulario` | Formularios de pacientes y profesionales. |
| `RutaAdmin` | Control del acceso administrativo en la interfaz. |
| `ScrollNavegacion` | Desplazamiento al cambiar de página o sección. |

Las propiedades proporcionan datos y funciones a los componentes. El estado controla formularios, promoción, detalle de profesionales y pasos del carrito.

### Contextos

| Contexto | Operaciones |
|---|---|
| `AuthContext` | Registro, inicio de sesión, usuario y cierre de sesión. |
| `DatosContext` | Lectura y CRUD de pacientes y nutricionistas. |
| `CarritoContext` | Consultas, disponibilidad, cantidad, total y confirmación. |

---

## 🌐 Navegación

### Sitio público

| Ruta | Página |
|---|---|
| `/` | Inicio. |
| `/servicios` | Catálogo por categorías. |
| `/servicios?categoria=...` | Catálogo con categoría seleccionada. |
| `/ofertas` | Ofertas y condiciones de los beneficios. |
| `/registro` | Registro de pacientes. |
| `/login` | Inicio de sesión. |
| `/login?acceso=admin` | Acceso administrativo. |
| `/agendar` | Agendamiento. |
| `/agendar?plan=consulta-inicial` | Agendamiento con un plan preseleccionado. |
| `/carrito` | Carrito, revisión y confirmación de reservas. |
| `/blogs/alimentacion-antiinflamatoria` | Artículo de alimentación antiinflamatoria. |
| `/blogs/hidratacion-deportiva` | Artículo de hidratación deportiva. |

El inicio incluye las secciones Nosotros, Servicios, Blogs y Contacto. El menú también permite abrir el catálogo y la página de ofertas.

Los pasos de revisión y confirmación se presentan dentro de `/carrito`.

### Administración

| Ruta | Página |
|---|---|
| `/admin` | Dashboard. |
| `/admin/pacientes` | Pacientes. |
| `/admin/pacientes/nuevo` | Creación de pacientes. |
| `/admin/pacientes/:id/editar` | Edición de pacientes. |
| `/admin/nutricionistas` | Nutricionistas. |
| `/admin/nutricionistas/nuevo` | Creación de profesionales. |
| `/admin/nutricionistas/:id/editar` | Edición de profesionales. |

El panel utiliza su propio layout. Las rutas inexistentes muestran una página de error con acceso al inicio.

---

## 📝 Formularios y validaciones

| Formulario | Validaciones principales |
|---|---|
| Registro | Campos obligatorios, RUN/RUT, correo, teléfono, región, comuna, contraseña y duplicados. |
| Login | Campos obligatorios, credenciales y tipo de acceso. |
| Agendamiento | Plan, profesional, motivo, fecha futura y disponibilidad. |
| Revisión de reserva | Nombre y correo del paciente antes de confirmar. |
| Contacto | Nombre, formato del correo y longitud del mensaje. |
| Administración | Datos obligatorios, formatos, duplicados y reglas de edición. |

El registro admite correos de los dominios `duoc.cl`, `profesor.duoc.cl` y `gmail.com`.

El formulario de contacto muestra el resultado de una validación y envío simulado; no envía correos reales.

---

## 💾 Datos y persistencia

Los archivos de `src/data/` proporcionan los datos iniciales. Los contextos gestionan las operaciones y conectan las actualizaciones con la interfaz.

| Clave | Contenido |
|---|---|
| `pacientesNutriVida` | Pacientes registrados. |
| `nutricionistasNutriVida` | Profesionales administrados. |
| `sesionNutriVida` | Sesión simulada. |
| `carritoNutriVida` | Consultas seleccionadas. |
| `citasNutriVida` | Citas confirmadas. |

Las modificaciones de profesionales se reflejan en el listado público y en el agendamiento.

Las operaciones comprueban los datos e informan los errores de almacenamiento en los escenarios implementados.

La persistencia pertenece al navegador y al origen utilizado. Los datos no se comparten entre dispositivos, navegadores o entre localhost y AWS.

---

## 📱 Diseño responsive

La interfaz utiliza grillas y utilidades de Bootstrap, componentes de React Bootstrap y media queries personalizadas.

La revisión manual comprende navegación, tarjetas, formularios, tablas, catálogo, ofertas y panel administrativo.

| Referencia | Ancho |
|---|---:|
| Celular | 360 px |
| Tablet | 768 px |
| Escritorio | 1280 px |

Las fuentes utilizadas son **Roboto** para textos y **Fraunces** para títulos. El video educativo utiliza un contenedor adaptable con relación de aspecto 16:9.

---

## 🧪 Pruebas automatizadas

Las pruebas utilizan Vitest, React Testing Library, user-event y jsdom.

### Ejecución

```bash
npm run test -- --run
```

Para observar cambios durante el desarrollo:

```bash
npm run test
```

Para ejecutar un archivo:

```bash
npm run test -- --run src/pages/Catalogo.test.jsx
```

### Resultado de referencia

La ejecución con cobertura del **16 de octubre de 2026 a las 02:20:55, hora de Chile**, aprobó **151 pruebas en 15 archivos**, sin pruebas fallidas. Su duración fue de **34,07 segundos**.

| Archivo | Comportamientos comprobados |
|---|---|
| `src/App.test.jsx` | Rutas públicas, layouts y acceso administrativo. |
| `src/components/Navbar.test.jsx` | Sesión, contador y navegación. |
| `src/components/ScrollNavegacion.test.jsx` | Desplazamiento por ruta y sección. |
| `src/components/FormularioContacto.test.jsx` | Validaciones, mensajes y limpieza. |
| `src/components/ListaNutricionistas.test.jsx` | Listado y detalle de profesionales. |
| `src/components/PlanesServicios.test.jsx` | Planes, promoción y enlace al agendamiento. |
| `src/context/AuthContext.test.jsx` | Registro, duplicados, sesión y conservación de datos. |
| `src/context/CarritoContext.test.jsx` | Persistencia, validaciones, fallos y reintentos. |
| `src/pages/Admin.test.jsx` | Acceso, búsquedas y operaciones administrativas. |
| `src/pages/Agendar.test.jsx` | Plan preseleccionado, fechas y duplicados. |
| `src/pages/Carrito.test.jsx` | Total, revisión, datos del paciente y confirmación. |
| `src/pages/Catalogo.test.jsx` | Categorías, URL, ofertas y navegación. |
| `src/pages/Login.test.jsx` | Credenciales, tipos de acceso y errores. |
| `src/pages/Registro.test.jsx` | Datos personales, dominios, comunas y envío. |
| `src/utils/utils.test.js` | Almacenamiento, fechas, RUN y precios. |

### Mocks e independencia

Se utilizan `vi.fn` y `vi.spyOn` para controlar respuestas de contextos, observar llamadas y simular errores del almacenamiento.

Las pruebas de fechas controlan el reloj mediante temporizadores de Vitest. Los casos preparan sus datos, desmontan los componentes y restauran los mocks según el entorno de cada archivo.

### Cobertura

```bash
npm run test:coverage
```

El proveedor **v8** genera un resumen en terminal, un reporte HTML y `coverage-summary.json`.

| Métrica | Cobertura | Elementos ejecutados |
|---|---:|---:|
| Sentencias | 90,29 % | 791 de 876 |
| Ramas | 81,89 % | 638 de 779 |
| Funciones | 93,44 % | 228 de 244 |
| Líneas | 90,20 % | 764 de 847 |

Abre `coverage/index.html` en el navegador para consultar el reporte local.

La medición incluye los archivos JavaScript y JSX de `src/`, incluso los que no tienen pruebas directas. Excluye las pruebas, `setupTests.js` y `main.jsx`.

La cobertura indica qué código se ejecutó; no demuestra por sí sola que todos los escenarios estén comprobados. El diseño responsive, el video y el despliegue se revisan en un navegador real.

### Informe y evidencias

- [Informe de pruebas](../../docs/ev2/pruebas_unitarias/Informe%20Pruebas%20NutriVida.pdf).
- [Reporte HTML y recursos](../../docs/ev2/pruebas_unitarias/cobertura/).
- [Resumen de cobertura](../../docs/ev2/pruebas_unitarias/cobertura/coverage-summary.json).
- [Captura de cobertura](../../docs/ev2/pruebas_unitarias/evidencias/cobertura-final.png).
- [Resultado de las pruebas](../../docs/ev2/pruebas_unitarias/evidencias/resultado-pruebas.png).

Para actualizar la copia documental después de generar la cobertura, ejecutar desde esta carpeta:

```bash
cp -R coverage/. ../../docs/ev2/pruebas_unitarias/cobertura/
```

GitHub muestra el HTML como código. El reporte conservado se consulta abriendo su `index.html` desde la copia local del repositorio.

---

## 📦 Compilación

```bash
npm run build
```

La compilación se genera en `dist/`.

Para revisarla localmente:

```bash
npm run preview
```

Las carpetas locales `node_modules/`, `dist/` y `coverage/` están excluidas del control de versiones. La copia de cobertura en `docs/ev2/pruebas_unitarias/cobertura/` se conserva como documentación.

---

## ☁️ Despliegue en AWS

La aplicación se publicó en **AWS EC2**, utilizando **Ubuntu Server 24.04 LTS** y **Nginx**.

**URL registrada:** [http://3.95.61.26](http://3.95.61.26)

Nginx sirve los archivos de producción y utiliza `try_files` para permitir el acceso a las rutas de React Router.

La disponibilidad depende de la instancia y del laboratorio AWS Academy. La IP pública puede cambiar al detener e iniciar la instancia.

Consulta la [configuración, evidencias y procedimiento de actualización](../../docs/ev2/despliegue/README.md).

---

## 🤝 Trabajo colaborativo

El proyecto utiliza ramas de trabajo y Pull Requests para integrar cambios en `main`.

Los mensajes de commit identifican al integrante y describen el cambio. Antes de publicar, se incorporan las actualizaciones de `main` y se verifican las pruebas y la compilación cuando corresponde.

---

## 📘 Documentación

- [README general](../../README.md).
- [Primera etapa](../../fase1/proyecto_etapa1_html/).
- [Documentación de la segunda entrega](../../docs/ev2/).
- [Informe de pruebas](../../docs/ev2/pruebas_unitarias/Informe%20Pruebas%20NutriVida.pdf).
- [Despliegue en AWS](../../docs/ev2/despliegue/README.md).

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

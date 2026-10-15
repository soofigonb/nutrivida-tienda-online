# 🥑 NutriVida · Fase 1

<p align="center">
  <strong>Clínica nutricional para una vida más saludable</strong>
</p>

<p align="center">
  Primera versión del sitio web, desarrollada con HTML, CSS, JavaScript y Bootstrap.
</p>

---

## 🌿 Descripción

**NutriVida** es un prototipo frontend para una clínica nutricional. Permite consultar información sobre la clínica, conocer a sus profesionales y revisar sus planes y servicios.

Esta carpeta conserva la primera etapa del proyecto y sirve como referencia para la migración a React disponible en [Fase 2](../../fase2/proyecto_etapa2_react/).

> Las operaciones son simuladas y los datos se almacenan localmente en el navegador mediante `localStorage`. El proyecto no procesa pagos reales ni utiliza autenticación conectada a un servidor.

---

## ✨ Funcionalidades

### Sitio público

- Presentación de la clínica NutriVida.
- Información sobre su historia, misión y equipo.
- Listado dinámico de nutricionistas.
- Planes y servicios con precios.
- Dos artículos sobre nutrición y hábitos saludables.
- Formulario de contacto.
- Navegación responsive y menú para dispositivos móviles.
- Pie de página con redes sociales y datos de contacto.

### Agendamiento y carrito

- Selección de un plan y un nutricionista.
- Ingreso del motivo de consulta.
- Selección de fecha y horario.
- Validación de los datos de agendamiento.
- Incorporación de atenciones al carrito.
- Visualización del resumen y cálculo del total.
- Eliminación de atenciones y confirmación simulada.
- Persistencia local de la información.

### Cuentas de usuario

- Registro de pacientes.
- Inicio de sesión simulado.
- Formularios con validaciones.
- Selección de región y comuna.

### Panel administrativo

- Dashboard con información general.
- Listado de pacientes y nutricionistas.
- Creación, edición y eliminación de registros.
- Formularios con validaciones.
- Almacenamiento local de datos.

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura y contenido de las páginas. |
| CSS | Estilos personalizados y adaptación a distintos tamaños de pantalla. |
| JavaScript | Interacciones, validaciones y gestión de datos. |
| Bootstrap | Componentes y sistema de grillas. |
| Bootstrap Icons | Iconografía. |
| `localStorage` | Persistencia local en el navegador. |
| Git y GitHub | Control de versiones y colaboración. |

---

## 🚀 Cómo ejecutar esta versión

### Requisitos

- Git.
- Visual Studio Code.
- Extensión Live Server.
- Un navegador web actualizado.

### 1. Clonar el repositorio

```bash
git clone https://github.com/soofigonb/nutrivida-tienda-online.git
```

### 2. Abrir la carpeta de la fase 1

```bash
cd nutrivida-tienda-online/fase1/proyecto_etapa1_html
code .
```

También puedes abrir la carpeta desde **Archivo → Abrir carpeta** en Visual Studio Code.

### 3. Iniciar el servidor local

1. Abre `index.html`.
2. Haz clic derecho dentro del editor.
3. Selecciona **Open with Live Server**.
4. Utiliza la dirección que abra el navegador.

Esta versión se ejecuta con un servidor estático. No requiere instalar dependencias con npm.

> Bootstrap, los iconos, las fuentes y los contenidos externos pueden requerir conexión a internet.

---

## 📁 Organización de archivos

Todas las rutas de esta tabla corresponden a esta carpeta.

| Archivo o carpeta | Contenido |
|---|---|
| `css/style.css` | Estilos del sitio público y del panel administrativo. |
| `img/` | Imágenes de profesionales, artículos y otros recursos. |
| `js/app.js` | Lógica, validaciones y gestión de datos. |
| `index.html` | Página principal de la clínica. |
| `agendar.html` | Formulario de agendamiento. |
| `carrito.html` | Carrito y resumen de atenciones. |
| `login.html` | Inicio de sesión. |
| `registro.html` | Registro de pacientes. |
| `blog-detalle-1.html` | Primer artículo de nutrición. |
| `blog-detalle-2.html` | Segundo artículo de nutrición. |
| `admin-home.html` | Dashboard administrativo. |
| `admin-pacientes.html` | Listado y gestión de pacientes. |
| `admin-nutricionistas.html` | Listado y gestión de nutricionistas. |
| `admin-form-paciente.html` | Formulario de pacientes. |
| `admin-form-nutricionista.html` | Formulario de nutricionistas. |
| `README.md` | Documentación de la primera etapa. |

---

## 💾 Persistencia de datos

La información se conserva mediante `localStorage` en el navegador utilizado.

- Los datos permanecen después de actualizar la página.
- No se comparten automáticamente entre dispositivos o navegadores.
- Eliminar los datos del sitio en el navegador también elimina la información guardada.
- Deben utilizarse datos ficticios para las demostraciones.

---

## 📘 Documentación y otras etapas

- [Presentación general del proyecto](../../README.md)
- [Aplicación React — Fase 2](../../fase2/proyecto_etapa2_react/)
- [Documentación de la primera etapa](../../docs/ev1/)

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
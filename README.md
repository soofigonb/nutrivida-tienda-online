# 🥑 NutriVida

<p align="center">
  <strong>Clínica nutricional para una vida más saludable</strong>
</p>

<p align="center">
  Proyecto frontend para la consulta de servicios nutricionales, el agendamiento de citas y la administración de pacientes y nutricionistas.
</p>

---

## 🌿 Descripción del proyecto

**NutriVida** es un proyecto web para una clínica nutricional que facilita el acceso a información sobre sus profesionales, planes y servicios.

El repositorio reúne dos etapas de desarrollo: la versión original construida con HTML, CSS y JavaScript, y su migración a una aplicación con React y Vite.

La versión React organiza la interfaz mediante componentes reutilizables, propiedades, estado y navegación entre páginas. El proyecto contempla formularios con validaciones, agendamiento de consultas, un carrito de reservas y un panel administrativo.

> El sistema corresponde a una simulación frontend. La persistencia mediante `localStorage` es local al navegador. No incluye pagos reales, envío efectivo de correos electrónicos ni autenticación conectada a un servidor.

---

## ✨ Alcance funcional

### Sitio público

- Presentación de la clínica NutriVida.
- Sección Nosotros con información institucional.
- Listado de nutricionistas y visualización de sus detalles.
- Planes y servicios con precios.
- Visualización de promociones.
- Artículos y consejos de nutrición.
- Formulario de contacto con validaciones.
- Navegación y diseño responsive.

### Agendamiento y carrito

- Selección de un servicio y un nutricionista.
- Ingreso del motivo de consulta.
- Selección y validación de fecha y horario.
- Incorporación de consultas al carrito de reservas.
- Visualización del resumen y cálculo del total.
- Eliminación de reservas.
- Confirmación simulada de la operación.
- Persistencia local de la información.

### Cuentas de usuario

- Registro de pacientes.
- Inicio y cierre de sesión simulados.
- Validación de los datos ingresados.
- Selección de región y comuna.
- Navegación según el rol del usuario.

### Panel administrativo

- Listado de pacientes y nutricionistas.
- Creación, edición y eliminación de registros.
- Formularios con validaciones.
- Búsquedas y filtros.
- Persistencia local de los datos.

El alcance describe las funcionalidades del proyecto y orienta su migración desde la primera etapa hacia React.

---

## 🛠️ Tecnologías

| Área | Tecnologías |
|---|---|
| Primera etapa | HTML5, CSS y JavaScript |
| Interfaz React | React y JSX |
| Desarrollo y compilación | Vite |
| Navegación | React Router |
| Estilos y componentes | CSS, Bootstrap y React Bootstrap |
| Iconografía | Bootstrap Icons |
| Formularios | React Hook Form |
| Persistencia local | `localStorage` y JSON |
| Entorno de desarrollo | Node.js y npm |
| Pruebas previstas | Vitest |
| Despliegue previsto | AWS EC2 |
| Control de versiones | Git y GitHub |

---

## 📁 Organización del repositorio

| Ubicación | Contenido |
|---|---|
| `fase1/proyecto_etapa1_html/` | Sitio original desarrollado con HTML, CSS y JavaScript. |
| `fase2/proyecto_etapa2_react/` | Aplicación React, dependencias y configuración de Vite. |
| `docs/ev1/` | ERS y planilla de requerimientos de la primera etapa. |
| `docs/` | Ubicación del ERS actualizado a la versión 2. |
| `docs/pruebas_unitarias/` | Ubicación destinada al informe, resultados y evidencias de pruebas. |
| `README.md` | Presentación e instrucciones generales del proyecto. |

Dentro de la aplicación React:

| Ubicación | Responsabilidad |
|---|---|
| `src/components/` | Componentes de la interfaz. |
| `src/pages/` | Páginas utilizadas por las rutas. |
| `src/data/` | Datos iniciales de profesionales, planes y artículos. |
| `src/utils/` | Funciones auxiliares reutilizables. |
| `src/assets/` | Imágenes y recursos importados por los componentes. |
| `public/` | Recursos estáticos públicos. |
| `src/App.jsx` | Composición principal y rutas de la aplicación. |
| `src/main.jsx` | Punto de entrada de React. |
| `src/index.css` | Estilos globales. |
| `src/App.css` | Estilos de páginas y componentes. |

---

## 🚀 Ejecutar la aplicación React

### Requisitos

- Node.js 24.
- npm.
- Git.
- Un navegador web.

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

Este comando utiliza las versiones registradas en `package-lock.json`.

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre la dirección que indique la terminal. Habitualmente será:

```text
http://localhost:5173/
```

Si ese puerto está ocupado, Vite puede utilizar otro. La terminal debe permanecer abierta mientras se utiliza el servidor.

Para detenerlo, presiona **Ctrl + C**.

> Los comandos de npm deben ejecutarse dentro de `fase2/proyecto_etapa2_react`, donde se encuentra el archivo `package.json`.

---

## 📦 Compilación y revisión

Desde la carpeta de la aplicación React:

### Generar la versión de producción

```bash
npm run build
```

Los archivos generados se guardan en `dist/`.

### Revisar la compilación localmente

```bash
npm run preview
```

Abre la dirección que indique la terminal. Este comando permite revisar la compilación y no realiza un despliegue público.

### Ejecutar el análisis del código

```bash
npm run lint
```

Las carpetas `node_modules/` y `dist/` se generan localmente y están excluidas del control de versiones.

---

## 🖥️ Consultar la primera etapa

La versión original se encuentra en:

```text
fase1/proyecto_etapa1_html/
```

Para revisarla en Visual Studio Code, abre el archivo `index.html` de esa carpeta y utiliza un servidor local, como la extensión **Live Server**.

Esta etapa se conserva como referencia del contenido y las funcionalidades que se trasladan a React.

---

## 🧪 Pruebas unitarias

La estrategia de pruebas contempla el uso de **Vitest** para verificar componentes, interacciones y reglas del sistema.

Las pruebas consideran aspectos como:

- Renderizado de componentes y recepción de propiedades.
- Cambios de estado e interacción con botones.
- Validación de formularios.
- Cálculo del total del carrito.
- Gestión de reservas y registros.
- Persistencia local.

Los archivos ejecutables de prueba se organizarán dentro de la aplicación React. El informe de pruebas, los resultados y las evidencias de cobertura se almacenarán en `docs/pruebas_unitarias/`.

Los comandos de ejecución se documentarán junto con la configuración de Vitest cuando esta se incorpore al proyecto.

---

## ☁️ Despliegue

El proyecto contempla la publicación de la aplicación React en **AWS EC2**, utilizando los archivos generados por la compilación de producción.

La dirección pública y las instrucciones del entorno se incorporarán una vez realizado y verificado el despliegue.

---

## 🤝 Trabajo colaborativo

El equipo utiliza ramas para desarrollar cambios y **Pull Requests** para revisar e integrar el trabajo en `main`.

Antes de comenzar una tarea:

```bash
git switch main
git pull --ff-only origin main
git switch -c nombre/descripcion-tarea
```

Para guardar y publicar los cambios:

```bash
git status
git add .
git commit -m "nombre: describir el cambio"
git push -u origin nombre/descripcion-tarea
```

Después, crea un Pull Request en GitHub con `main` como rama de destino e incluye una descripción de los cambios y las verificaciones realizadas.

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

# 🥑 NutriVida

<p align="center">
  <strong>Clínica nutricional para una vida más saludable</strong>
</p>

<p align="center">
  Aplicación web para consultar servicios nutricionales, agendar atenciones y administrar pacientes y profesionales.
</p>

<p align="center">
  <a href="./fase1/proyecto_etapa1_html/">Fase 1 · HTML</a>
  ·
  <a href="./fase2/proyecto_etapa2_react/">Fase 2 · React</a>
  ·
  <a href="./docs/">Documentación</a>
</p>

---

## 🌿 Acerca del proyecto

**NutriVida** es un proyecto web para una clínica nutricional. Su propósito es facilitar el acceso a información sobre la clínica, sus profesionales, planes de atención y contenidos sobre alimentación saludable.

La aplicación permite registrar pacientes, iniciar sesión, seleccionar un servicio, agendar una consulta y confirmar reservas mediante un carrito. También incorpora un panel administrativo para gestionar pacientes y nutricionistas.

El repositorio conserva la evolución del proyecto en dos etapas: una primera versión construida con HTML, CSS y JavaScript, y una segunda versión desarrollada con React y Vite.

> El sistema es un prototipo frontend con datos de demostración. Utiliza persistencia local en el navegador y simula la autenticación, la confirmación de reservas y el envío del formulario de contacto. No procesa pagos reales ni utiliza un backend.

---

## 📚 Etapas del proyecto

| Etapa | Descripción | Documentación |
|---|---|---|
| **Fase 1** | Sitio desarrollado con HTML, CSS, JavaScript y Bootstrap. | [Consultar README](./fase1/proyecto_etapa1_html/README.md) |
| **Fase 2** | Migración a React con componentes reutilizables, navegación, contextos, persistencia y pruebas automatizadas. | [Consultar README](./fase2/proyecto_etapa2_react/README.md) |

Cada etapa incluye sus propias instrucciones de ejecución y organización de archivos.

---

## ✨ Funcionalidades principales

### Sitio público

- Presentación de la clínica e información institucional.
- Video educativo sobre alimentación saludable, con su fuente.
- Listado de nutricionistas y visualización de sus detalles.
- Planes y servicios con precios en pesos chilenos.
- Promoción interactiva.
- Blogs y artículos sobre nutrición.
- Formulario de contacto con validaciones.
- Navegación responsive.

### Cuentas de usuario

- Registro de pacientes.
- Validación de RUN/RUT y datos personales.
- Selección relacionada de región y comuna.
- Inicio y cierre de sesión simulados.
- Acceso diferenciado para pacientes y administrador.
- Actualización del menú según la sesión.

### Agendamiento y carrito

- Selección de un plan y un nutricionista.
- Ingreso del motivo, fecha y horario de atención.
- Validación de fechas y horarios futuros.
- Detección de reservas duplicadas.
- Incorporación y eliminación de atenciones en el carrito.
- Cálculo del total según los planes seleccionados.
- Confirmación simulada y resumen de reservas.
- Persistencia y manejo de errores de almacenamiento.

### Panel administrativo

- Dashboard con información general.
- Listados y búsquedas de pacientes y nutricionistas.
- Creación, edición y eliminación de registros.
- Formularios reutilizables con validaciones.
- Confirmación de eliminación.
- Validación de relaciones con citas y reservas.
- Actualización de los profesionales utilizados en el sitio público.

---

## 🛠️ Tecnologías

| Área | Tecnologías |
|---|---|
| Primera etapa | HTML5, CSS y JavaScript |
| Aplicación React | React y JSX |
| Desarrollo y compilación | Vite |
| Navegación | React Router |
| Diseño e interfaz | Bootstrap, React Bootstrap y CSS |
| Iconografía | Bootstrap Icons |
| Formularios | React Hook Form |
| Estado compartido | React Context |
| Persistencia | `localStorage` y JSON |
| Pruebas | Vitest, React Testing Library, user-event y jest-dom |
| Entorno de pruebas | jsdom |
| Cobertura | v8 mediante `@vitest/coverage-v8` |
| Análisis estático | Oxlint |
| Entorno de desarrollo | Node.js y npm |
| Control de versiones | Git y GitHub |

---

## 📁 Organización del repositorio

| Ubicación | Contenido |
|---|---|
| [`fase1/proyecto_etapa1_html/`](./fase1/proyecto_etapa1_html/) | Primera versión del sitio y su README. |
| [`fase2/proyecto_etapa2_react/`](./fase2/proyecto_etapa2_react/) | Aplicación React, configuración, pruebas y README técnico. |
| [`docs/ev1/`](./docs/ev1/) | Documentación de la primera etapa. |
| [`docs/ev2/`](./docs/ev2/) | Documentación de la segunda entrega. |
| [`docs/ev2/pruebas_unitarias/`](./docs/ev2/pruebas_unitarias/) | Informe de pruebas, reporte de cobertura y evidencias. |
| `README.md` | Presentación e instrucciones generales. |

La aplicación React organiza sus archivos en componentes, páginas, contextos, datos, utilidades, estilos y recursos.

---

## 🚀 Ejecutar la aplicación React

### Requisitos

- Node.js 24.
- npm.
- Git.
- Un navegador web actualizado.

### 1. Clonar el repositorio

```bash
git clone https://github.com/soofigonb/nutrivida-tienda-online.git
```

### 2. Entrar en la aplicación

```bash
cd nutrivida-tienda-online/fase2/proyecto_etapa2_react
```

### 3. Instalar las dependencias

```bash
npm ci
```

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre la dirección indicada en la terminal, normalmente:

**http://localhost:5173/**

Si el puerto está ocupado, Vite puede utilizar otro.

Para detener el servidor, presiona **Ctrl + C**.

> Los comandos de npm deben ejecutarse dentro de `fase2/proyecto_etapa2_react`, donde se encuentra `package.json`.

---

## 🖥️ Ejecutar la versión HTML

1. Abre la carpeta `fase1/proyecto_etapa1_html/` en Visual Studio Code.
2. Abre `index.html`.
3. Selecciona **Open with Live Server**.

Esta versión utiliza un servidor estático y no requiere instalar dependencias con npm.

Consulta las instrucciones completas en el [README de la fase 1](./fase1/proyecto_etapa1_html/README.md).

---

## 🧪 Pruebas y cobertura

La aplicación React utiliza **Vitest** para ejecutar pruebas de componentes, interacciones, reglas de negocio y persistencia local.

Desde `fase2/proyecto_etapa2_react/`:

### Ejecutar todas las pruebas

```bash
npm run test -- --run
```

### Generar el reporte de cobertura

```bash
npm run test:coverage
```

La ejecución de referencia del **15 de octubre de 2026** aprobó **139 pruebas en 14 archivos**, sin pruebas fallidas.

| Métrica | Cobertura |
|---|---:|
| Sentencias | 90,00 % |
| Ramas | 80,74 % |
| Funciones | 93,36 % |
| Líneas | 89,82 % |

El reporte local se genera en `coverage/index.html` y puede abrirse con un navegador.

La cobertura indica qué código se ejecutó durante las pruebas. Su interpretación, alcance y limitaciones se explican en el informe.

### Documentación de pruebas

- [Informe de pruebas y análisis de cobertura](./docs/ev2/pruebas_unitarias/Informe%20Pruebas%20NutriVida.pdf).
- [Reporte de cobertura y recursos HTML](./docs/ev2/pruebas_unitarias/cobertura/).
- [Resumen de cobertura en JSON](./docs/ev2/pruebas_unitarias/cobertura/coverage-summary.json).
- [Captura de cobertura](./docs/ev2/pruebas_unitarias/evidencias/cobertura-final.png).
- [Resultado de ejecución de las pruebas](./docs/ev2/pruebas_unitarias/evidencias/resultado-pruebas.png).

GitHub muestra los archivos HTML como código. Para navegar por el reporte conservado, abre `docs/ev2/pruebas_unitarias/cobertura/index.html` desde la copia local del repositorio.

---

## 📦 Verificación y compilación

Desde la carpeta de la aplicación React:

### Analizar el código

```bash
npm run lint
```

### Generar la compilación de producción

```bash
npm run build
```

### Revisar la compilación localmente

```bash
npm run preview
```

La compilación se genera en `dist/`. Las carpetas `node_modules/`, `dist/` y `coverage/` de la aplicación React se generan localmente y están excluidas del control de versiones.

La copia del reporte conservada en `docs/ev2/pruebas_unitarias/cobertura/` forma parte de la documentación.

---

## 💾 Persistencia local

La aplicación conserva pacientes, nutricionistas, sesión, reservas y citas mediante `localStorage`.

Los datos pertenecen al navegador y al origen desde el que se ejecuta la aplicación. No se comparten automáticamente entre dispositivos o navegadores.

Para las demostraciones deben utilizarse datos ficticios.

---

## 🤝 Trabajo colaborativo

El equipo utiliza ramas de trabajo y **Pull Requests** para revisar e integrar los cambios en `main`.

### Comenzar una tarea

Con el directorio de trabajo limpio:

```bash
git switch main
git pull --ff-only origin main
git switch -c nombre/descripcion-tarea
```

### Guardar los cambios

Desde la raíz del repositorio:

```bash
git status
git add .
git commit -m "nombre: describir el cambio"
```

### Integrar las actualizaciones de main

Desde la rama de trabajo:

```bash
git fetch origin
git merge origin/main
```

Si la integración modifica la aplicación React, ejecuta sus pruebas y compilación antes de publicar.

### Publicar la rama

```bash
git push -u origin nombre/descripcion-tarea
```

Después, crea un Pull Request con `main` como destino e incluye una descripción del cambio y las verificaciones realizadas.

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

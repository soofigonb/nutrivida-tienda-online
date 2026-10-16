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
  <a href="./docs/ev2/">Documentación EV2</a>
</p>

---

## 🌿 Acerca del proyecto

**NutriVida** es un proyecto web para una clínica nutricional. Facilita el acceso a información sobre sus profesionales, planes de atención y contenidos sobre alimentación saludable.

La aplicación permite registrar pacientes, iniciar sesión, explorar servicios por categoría, consultar ofertas, agendar atenciones y revisar los datos de una reserva antes de confirmarla. También incorpora un panel administrativo para gestionar pacientes y nutricionistas.

El repositorio conserva dos etapas: la versión original desarrollada con HTML, CSS y JavaScript, y su migración a React con Vite.

> El sistema es un prototipo frontend con datos de demostración. La autenticación, la confirmación de reservas y el envío de contacto son simulados. Los datos se almacenan localmente en el navegador. No utiliza un backend ni procesa pagos reales.

---

## 📚 Etapas del proyecto

| Etapa | Descripción | Documentación |
|---|---|---|
| Fase 1 | Sitio desarrollado con HTML, CSS, JavaScript y Bootstrap. | [README de fase 1](./fase1/proyecto_etapa1_html/README.md) |
| Fase 2 | Aplicación React con componentes reutilizables, navegación, contextos, CRUD, persistencia y pruebas automatizadas. | [README de fase 2](./fase2/proyecto_etapa2_react/README.md) |

---

## ✨ Funcionalidades principales

### Sitio público

- Presentación de la clínica e información institucional.
- Video educativo sobre alimentación saludable, con su fuente.
- Listado de nutricionistas y detalle de cada profesional.
- Planes y servicios con precios en pesos chilenos.
- Catálogo con filtro por categoría y selección conservada en la URL.
- Página de ofertas con condiciones del beneficio.
- Promoción interactiva en el inicio.
- Blogs y artículos sobre nutrición.
- Formulario de contacto con validaciones.
- Navegación y diseño responsive.

### Cuentas de usuario

- Registro de pacientes con validaciones.
- Comprobación del RUN/RUT y su dígito verificador.
- Selección relacionada de región y comuna.
- Detección de RUN/RUT y correos duplicados.
- Inicio y cierre de sesión simulados.
- Acceso diferenciado para pacientes y administrador.
- Actualización del menú según la sesión.

### Agendamiento y carrito

- Selección de un plan, profesional, motivo, fecha y horario.
- Preselección del plan desde servicios y ofertas.
- Validación de fechas y horarios futuros.
- Detección de reservas duplicadas.
- Incorporación, eliminación y vaciado de consultas.
- Cálculo del total según los planes seleccionados.
- Revisión de consultas y datos del paciente antes de confirmar.
- Nombre y correo completados desde la sesión cuando está disponible.
- Confirmación simulada con resumen y código de reserva.
- Manejo de errores y conservación de reservas ante fallos.
- Prevención de duplicados al reintentar la confirmación.

El precio corresponde al plan seleccionado. No se agrega un cobro adicional por elegir un nutricionista.

### Panel administrativo

- Dashboard con información general.
- Listados y búsquedas de pacientes y nutricionistas.
- Creación, edición y eliminación de registros.
- Formularios reutilizables con validaciones.
- Confirmación antes de eliminar.
- Comprobación de relaciones con citas y reservas.
- Actualización de los profesionales utilizados por el sitio público.

---

## 🛠️ Tecnologías

| Área | Tecnologías |
|---|---|
| Primera etapa | HTML5, CSS y JavaScript |
| Aplicación | React y JSX |
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
| Publicación | AWS EC2, Ubuntu y Nginx |
| Control de versiones | Git y GitHub |

---

## 📁 Organización del repositorio

| Ubicación | Contenido |
|---|---|
| [`fase1/proyecto_etapa1_html/`](./fase1/proyecto_etapa1_html/) | Versión original y su README. |
| [`fase2/proyecto_etapa2_react/`](./fase2/proyecto_etapa2_react/) | Aplicación React, configuración y pruebas. |
| [`docs/ev1/`](./docs/ev1/) | Documentación de la primera entrega. |
| [`docs/ev2/`](./docs/ev2/) | Documentación de la segunda entrega. |
| [ERS de NutriVida versión 2](./docs/ev2/DSY1104%20Evaluaci%C3%B3n%20Parcial%202%20-%20Anexo%204%20ERS-Especificacion%20de%20Requisitos%20del%20software.docx.pdf) | Requisitos y criterios de aceptación de la aplicación React. |
| [`docs/ev2/pruebas_unitarias/`](./docs/ev2/pruebas_unitarias/) | Informe, cobertura y evidencias de pruebas. |
| [`docs/ev2/despliegue_aws/`](./docs/ev2/despliegue_aws/) | Procedimiento y evidencias del despliegue en AWS. |
| `README.md` | Presentación e instrucciones generales. |

---

## 🚀 Ejecutar la aplicación React

### Requisitos

- Node.js 24.
- npm.
- Git.
- Un navegador web actualizado.

### Instalación

```bash
git clone https://github.com/soofigonb/nutrivida-tienda-online.git
cd nutrivida-tienda-online/fase2/proyecto_etapa2_react
npm ci
```

### Iniciar el servidor

```bash
npm run dev
```

Abre la dirección indicada en la terminal, normalmente [http://localhost:5173/](http://localhost:5173/).

Si el puerto está ocupado, Vite puede utilizar otro. Para detener el servidor, presiona **Ctrl + C**.

> Los comandos de npm se ejecutan dentro de `fase2/proyecto_etapa2_react`, donde se encuentra `package.json`.

---

## 🖥️ Ejecutar la primera etapa

Abre `fase1/proyecto_etapa1_html/index.html` mediante un servidor estático, como la extensión **Live Server** de Visual Studio Code.

Esta etapa no requiere instalar dependencias con npm.

Consulta el [README de fase 1](./fase1/proyecto_etapa1_html/README.md).

---

## 🧪 Pruebas y cobertura

Desde la carpeta React:

```bash
npm run test -- --run
```

Para ejecutar las pruebas y generar la cobertura:

```bash
npm run test:coverage
```

La ejecución de referencia del **16 de octubre de 2026 a las 02:20:55, hora de Chile**, aprobó **151 pruebas en 15 archivos**, sin pruebas fallidas. La duración registrada fue de **34,07 segundos**.

| Métrica | Cobertura | Elementos ejecutados |
|---|---:|---:|
| Sentencias | 90,29 % | 791 de 876 |
| Ramas | 81,89 % | 638 de 779 |
| Funciones | 93,44 % | 228 de 244 |
| Líneas | 90,20 % | 764 de 847 |

Las pruebas verifican formularios, navegación, acceso por rol, categorías, ofertas, administración, reservas, persistencia y manejo de errores.

El reporte local se genera en `coverage/index.html`. La cobertura indica qué código se ejecutó; su alcance y limitaciones se analizan en el informe.

### Informe y evidencias

- [Informe de pruebas y análisis de cobertura](./docs/ev2/pruebas_unitarias/Informe%20Pruebas%20NutriVida.pdf).
- [Reporte HTML y recursos](./docs/ev2/pruebas_unitarias/cobertura/).
- [Resumen de cobertura en JSON](./docs/ev2/pruebas_unitarias/cobertura/coverage-summary.json).
- [Captura de cobertura](./docs/ev2/pruebas_unitarias/evidencias/cobertura-final.png).
- [Resultado de las pruebas](./docs/ev2/pruebas_unitarias/evidencias/resultado-pruebas.png).

GitHub muestra el HTML como código. Para navegar por el reporte, abre `docs/ev2/pruebas_unitarias/cobertura/index.html` desde la copia local del repositorio.

---

## 📦 Análisis y compilación

Desde la carpeta React:

```bash
npm run lint
npm run build
npm run preview
```

- `lint` analiza el código con Oxlint.
- `build` genera la compilación en `dist/`.
- `preview` permite revisar esa compilación localmente.

Las carpetas `node_modules/`, `dist/` y `coverage/` de la aplicación se generan localmente y están excluidas del control de versiones.

La copia de cobertura ubicada en `docs/ev2/pruebas_unitarias/cobertura/` se conserva como documentación.

---

## ☁️ Despliegue en AWS

La aplicación se publicó en una instancia **AWS EC2**, con **Ubuntu Server 24.04 LTS** y **Nginx**.

**URL registrada del despliegue:** [http://54.160.216.249](http://54.160.216.249)

Nginx utiliza una configuración compatible con React Router para servir las rutas de la aplicación.

El entorno pertenece a AWS Academy. Su disponibilidad depende de que la instancia y el laboratorio permanezcan activos. La IP pública puede cambiar al detener e iniciar la instancia.

Consulta el [procedimiento de despliegue y actualización](./docs/ev2/despliegue_aws/README.md).

---

## 💾 Persistencia local

La aplicación conserva pacientes, profesionales, sesión, reservas y citas mediante `localStorage`.

Los datos pertenecen al navegador y al origen utilizado. No se comparten automáticamente entre dispositivos, navegadores o entre localhost y AWS.

En las demostraciones se utilizan datos ficticios.

---

## 🤝 Trabajo colaborativo

Los cambios se desarrollan mediante ramas y se integran a `main` utilizando Pull Requests.

### Crear una rama

Con el directorio de trabajo limpio:

```bash
git switch main
git pull --ff-only origin main
git switch -c nombre/descripcion-tarea
```

### Guardar cambios

Desde la raíz del repositorio:

```bash
git status
git add .
git commit -m "nombre: describir el cambio"
```

### Actualizar la rama antes de publicar

```bash
git fetch origin
git merge origin/main
```

Si la integración modifica la aplicación, se comprueban las pruebas y la compilación antes de publicar.

### Publicar

```bash
git push -u origin nombre/descripcion-tarea
```

Después se crea un Pull Request con `main` como destino, describiendo los cambios y las verificaciones realizadas.

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

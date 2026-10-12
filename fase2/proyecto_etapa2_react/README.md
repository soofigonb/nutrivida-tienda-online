# 🌿 NutriVida
### Clínica nutricional · Aplicación web

NutriVida es una aplicación web orientada a la atención nutricional. Reúne información sobre la clínica, sus profesionales, planes de atención y artículos sobre alimentación saludable.

El proyecto evoluciona desde una versión desarrollada con HTML, CSS y JavaScript hacia una aplicación con React, utilizando componentes reutilizables, navegación entre páginas y formularios con validaciones.

---

## 👥 Equipo de desarrollo

| Integrante |
|---|
| Jonathan Rivera |
| Nitsi Sepúlveda |
| Sofía González |

**Institución:** Duoc UC  
**Asignatura:** Desarrollo Fullstack II

## 🎯 Propósito

Ofrecer una interfaz clara y accesible para conocer los servicios de NutriVida y facilitar la gestión de la atención nutricional.

El desarrollo contempla registro de pacientes, inicio de sesión, agendamiento, carrito de reservas y administración de pacientes y profesionales.

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| React | Componentes y gestión de la interfaz. |
| Vite | Entorno de desarrollo y compilación. |
| JavaScript | Lógica de la aplicación. |
| React Router DOM | Navegación entre páginas. |
| React Bootstrap | Componentes de interfaz. |
| Bootstrap | Distribución responsive y estilos base. |
| Bootstrap Icons | Iconos. |
| React Hook Form | Formularios y validaciones. |
| CSS | Estilos personalizados. |
| Git y GitHub | Control de versiones y colaboración. |

Se contempla incorporar **Vitest** para pruebas unitarias y **AWS EC2** para el despliegue.

## 🌱 Contenido de la aplicación

La página de inicio reúne:

- Presentación de la clínica.
- Información institucional y áreas de atención.
- Nutricionistas, especialidades y detalles.
- Planes y servicios con precios.
- Promoción interactiva.
- Blogs y artículos.
- Formulario de Contacto.
- Redes sociales y datos de contacto.

La navegación y el pie de página se comparten entre las distintas páginas mediante componentes reutilizables.

## 🚀 Instalación y ejecución

### Requisitos

- Node.js.
- npm.
- Git.

### Instalación

```bash
git clone https://github.com/soofigonb/nutrivida-react.git
cd nutrivida-react
npm install
```

### Ejecución local

```bash
npm run dev
```

Abrir la dirección indicada en la terminal, normalmente:

**http://localhost:5173**

Para detener el servidor, presionar `Ctrl + C`.

### Compilación de producción

```bash
npm run build
npm run preview
```

La compilación se genera en la carpeta `dist/`. El comando `preview` permite revisarla localmente.

## 📋 Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run build` | Genera la compilación de producción. |
| `npm run preview` | Permite revisar localmente la compilación. |
| `npm run lint` | Revisa el código con Oxlint. |

## 📁 Organización del proyecto

| Ubicación | Contenido |
|---|---|
| `src/assets/` | Imágenes de la aplicación. |
| `src/components/` | Componentes reutilizables, secciones y layouts. |
| `src/pages/` | Páginas asociadas a las rutas. |
| `src/data/` | Datos simulados de nutricionistas, servicios y blogs. |
| `src/context/` | Contextos destinados a compartir estado. |
| `src/utils/` | Funciones auxiliares, formato y validaciones. |
| `src/App.jsx` | Definición de rutas y componentes compartidos. |
| `src/App.css` | Estilos de páginas y secciones. |
| `src/index.css` | Estilos generales. |
| `src/main.jsx` | Punto de entrada de React. |
| `index.html` | Documento principal utilizado por Vite. |

La estructura incluye archivos preparados para continuar el desarrollo de los módulos.

## 🌐 Navegación

| Ruta | Página |
|---|---|
| `/` | Inicio. |
| `/blogs/alimentacion-antiinflamatoria` | Artículo de alimentación antiinflamatoria. |
| `/blogs/hidratacion-deportiva` | Artículo de hidratación deportiva. |
| `/registro` | Registro de pacientes. |
| `/login` | Inicio de sesión. |
| `/agendar` | Agendamiento de atención. |
| `/carrito` | Carrito de reservas. |

Las rutas de Registro, Login, Agendar y Carrito contienen vistas provisionales mientras se implementan sus funcionalidades.

## 📝 Formularios

El formulario de Contacto utiliza React Hook Form para comprobar los datos y mostrar mensajes asociados a cada campo.

| Campo | Validación |
|---|---|
| Nombre | Obligatorio, entre 2 y 100 caracteres. |
| Correo electrónico | Obligatorio, formato válido y máximo 100 caracteres. |
| Mensaje | Obligatorio, entre 2 y 500 caracteres. |

Los nombres y mensajes que solo contienen espacios se rechazan. Al completar correctamente el formulario, se limpian los campos y se muestra el resultado de la validación.

**El envío de Contacto es simulado y no genera correos reales.**

## 💾 Gestión de datos

Los archivos JavaScript de `src/data/` actúan como fuente de datos simulada.

El desarrollo contempla persistencia mediante `localStorage` y operaciones CRUD para gestionar pacientes y nutricionistas, además de conservar reservas y actualizar la interfaz.

La integración completa de persistencia y CRUD se encuentra en desarrollo.

## 📱 Diseño responsive

La interfaz combina Bootstrap, React Bootstrap y media queries personalizadas para adaptar tarjetas, formularios, imágenes y navegación.

Los tamaños de referencia para la verificación son:

| Dispositivo | Ancho |
|---|---|
| Celular | 360 px |
| Tablet | 768 px |
| Escritorio | 1280 px |

## 🧪 Pruebas y calidad

Se contempla configurar Vitest para comprobar:

- Renderizado de componentes.
- Uso de propiedades y cambios de estado.
- Eventos de usuario.
- Renderizado condicional.
- Validaciones de formularios.
- Operaciones CRUD y persistencia.

Se incorporarán mocks cuando sea necesario aislar dependencias, junto con un reporte de cobertura y análisis de resultados.

Los comandos de pruebas se documentarán una vez configurado el entorno.

La revisión del código y la compilación pueden ejecutarse con:

```bash
npm run lint
npm run build
```

## ☁️ Despliegue

La publicación de la aplicación está prevista en AWS EC2, utilizando la compilación de producción y un servidor web configurado para admitir la navegación y recarga de las rutas de React.

La URL pública y el procedimiento de despliegue se incorporarán cuando estén disponibles.

## 📘 Documentación

La documentación del proyecto contempla:

- Especificación de Requisitos de Software (ERS), versión 2.
- Flujos de navegación y reglas de validación.
- Pruebas unitarias y análisis de cobertura.
- Instrucciones de uso y despliegue.

Los documentos se enlazarán desde este apartado cuando estén disponibles en el repositorio.

## 🤝 Desarrollo colaborativo

El equipo utiliza ramas de trabajo y Pull Requests para revisar e integrar los cambios.

Los commits identifican al autor y describen el aporte realizado. Antes de integrar una funcionalidad, se revisa su comportamiento en localhost, su adaptación a distintos tamaños de pantalla y la compilación del proyecto.

## 🔗 Repositorios

- [NutriVida React](https://github.com/soofigonb/nutrivida-react)
- [Versión original en HTML, CSS y JavaScript](https://github.com/soofigonb/nutrivida-tienda-online)

---

Proyecto académico en desarrollo. Utiliza datos de demostración y funcionalidades simuladas. Su alcance corresponde al frontend, sin microservicios ni procesamiento real de pagos.

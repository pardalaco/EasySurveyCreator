# EasySurveyCreator

**EasySurveyCreator** es una aplicación web para crear encuestas
rápidas, compartirlas mediante un enlace o un código QR y consultar los
resultados en tiempo real.

El proyecto nace con un objetivo principalmente práctico: aplicar los
conocimientos adquiridos durante una etapa de formación en JavaScript,
TypeScript, React, testing, desarrollo backend y cloud. Más que crear
una plataforma compleja o un producto innovador, la idea es pasar de
seguir cursos y tutoriales a construir una aplicación completa desde
cero, tomando decisiones técnicas y resolviendo problemas reales durante
el desarrollo.

La aplicación está desarrollada con una arquitectura separada de
frontend y backend.

- **Repositorio:** [GitHub --
  EasySurveyCreator](https://github.com/pardalaco/EasySurveyCreator)
- **Aplicación:** [EasySurveyCreator](https://easysurveycreator.onrender.com/)

## Funcionalidades

- Crear encuestas a partir de una pregunta.
- Añadir entre **2 y 5 opciones** de respuesta.
- Compartir las encuestas mediante un enlace.
- Generar un código QR para acceder a una encuesta desde dispositivos
  móviles.
- Emitir votos y consultar los resultados.
- Actualizar los resultados automáticamente y en tiempo real cuando se
  reciben nuevos votos.

## Tecnologías

### Frontend

- **React 19** y **TypeScript** para construir la interfaz.
- **Vite** como herramienta de desarrollo y compilación.
- **Chakra UI** y **React Bootstrap** para los componentes visuales.
- **React Router** para la navegación.
- **TanStack Query** y **Axios** para la gestión de peticiones y
  comunicación HTTP.
- **Socket.IO Client** para recibir actualizaciones en tiempo real.
- **qrcode.react** para generar códigos QR.

### Backend

- **Node.js** y **TypeScript**.
- **Express 5** para desarrollar la API REST.
- **Joi** para validar los datos recibidos.
- **Socket.IO** para la comunicación bidireccional y las
  actualizaciones en tiempo real.
- **CORS** para configurar el acceso desde el frontend.

### Calidad y desarrollo

- **Vitest** para las pruebas automatizadas.
- **Testing Library** y **jsdom** para las pruebas del frontend.
- **Prettier** para mantener un formato de código consistente.
- **Husky** y **Git Hooks** para automatizar tareas antes de los
  commits y los pushes.
- **ESLint** para analizar el código del cliente.

## Estructura del proyecto

```text
EasySurveyCreator/
├── client/                 # Aplicación frontend (React + Vite)
│   ├── public/
│   ├── src/
│   └── test/
├── server/                 # API y servidor de Socket.IO
│   ├── src/
│   └── test/
├── docs/                   # Documentación y planificación
├── package.json            # Scripts y herramientas comunes
└── vitest.config.ts        # Configuración de Vitest
```

## Requisitos

Para trabajar con el proyecto necesitas:

- Node.js y npm.
- Git.

Se recomienda utilizar una versión de Node.js compatible con las
versiones de las dependencias del proyecto.

## Instalación

Clona el repositorio:

```bash
git clone https://github.com/pardalaco/EasySurveyCreator.git
cd EasySurveyCreator
```

Instala las dependencias de la raíz, del servidor y del cliente:

```bash
npm install

cd server
npm install

cd ../client
npm install
```

## Configuración

El servidor se inicia en desarrollo leyendo las variables de entorno
desde `server/.env`:

```bash
npm run dev
```

Antes de arrancarlo, crea el archivo `server/.env` con la configuración
que requiera el servidor. Los nombres y valores de las variables deben
corresponderse con los que utiliza el código del proyecto.

> No incluyas archivos `.env` ni secretos en el repositorio. Si
> despliegas la aplicación, configura las variables necesarias desde el
> panel de la plataforma de hosting.

El cliente también puede necesitar la dirección de la API para
comunicarse con el servidor. Configura esa dirección mediante las
variables de entorno que utilice la aplicación Vite.

## Ejecución en desarrollo

El frontend y el backend se ejecutan como procesos independientes. Abre
dos terminales desde la raíz del repositorio.

**Terminal 1 -- Backend**

```bash
cd server
npm run dev
```

**Terminal 2 -- Frontend**

```bash
cd client
npm run dev
```

Vite mostrará en la terminal la dirección local desde la que puedes
abrir la aplicación.

## Pruebas

El proyecto utiliza Vitest para ejecutar pruebas automatizadas.

Para ejecutar las pruebas del servidor:

```bash
cd server
npm test
```

Para ejecutar las pruebas del cliente:

```bash
cd client
npm test
```

Para ejecutar todas las pruebas una sola vez, sin dejar el modo
interactivo:

```bash
cd server
npm run test:run

cd ../client
npm run test:run
```

## Compilación y comprobación de tipos

**Backend**

```bash
cd server
npm run typecheck
npm run build
```

El resultado de la compilación se genera en `server/dist`. Para iniciar
la versión compilada:

```bash
npm start
```

**Frontend**

```bash
cd client
npm run typecheck
npm run build
```

La compilación del cliente se genera en `client/dist`. Para servirla
localmente en modo de previsualización:

```bash
npm run preview
```

## Formato y calidad del código

Desde la raíz del proyecto puedes comprobar el formato de los archivos:

```bash
npm run format:check
```

Y aplicar Prettier para formatearlos:

```bash
npm run format
```

El repositorio también utiliza Husky y Git Hooks para automatizar
comprobaciones durante el flujo de trabajo. Según la configuración del
proyecto, se aplica el formateo antes de los commits y se ejecutan las
pruebas antes de enviar cambios al repositorio remoto.

## Despliegue

La aplicación se despliega separando sus dos partes:

- **Frontend:** publicado como sitio web estático.
- **Backend:** ejecutado como servicio Node.js.

La configuración de despliegue del cliente incluye `client/vercel.json`.
El despliegue del backend requiere configurar el servicio con el comando
de compilación y el de inicio correspondientes:

```bash
npm run build
npm start
```

Configura en la plataforma de hosting las variables de entorno
necesarias y las direcciones de comunicación entre frontend y backend.

## Documentación adicional

En el directorio [`docs/`](./docs/) se encuentra documentación
complementaria del proyecto:

- [`propuesta_del_proyecto.md`](./docs/propuesta_del_proyecto.md):
  planteamiento y propuesta inicial.
- [`lista_de_tareas.md`](./docs/lista_de_tareas.md): tareas y
  seguimiento del desarrollo.
- [`implementaciones.md`](./docs/implementaciones.md): decisiones e
  implementaciones realizadas.

## Inspiración

El concepto y parte de la referencia visual del proyecto toman como
inspiración [MiniPoll](https://minipoll.co/). EasySurveyCreator es un
desarrollo propio realizado desde cero con fines de aprendizaje y puesta
en práctica; no pretende ser una copia, sustitución ni mejora de esa
plataforma.

## Objetivo del proyecto

EasySurveyCreator es, sobre todo, un proyecto de aprendizaje y
aplicación práctica. Su desarrollo permite reunir en una misma
aplicación conocimientos de frontend, backend, APIs REST, validación,
comunicación en tiempo real, testing, automatización y despliegue.

La intención es seguir utilizándolo como punto de partida para aprender,
experimentar y desarrollar nuevos proyectos.

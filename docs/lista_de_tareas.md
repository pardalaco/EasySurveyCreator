# Lista de Tareas e Implementación: MiniPoll

---

## 🛠️ Backend (Node.js + Express + TypeScript)

### 1. Configuración Inicial

- [x] Inicializar el proyecto Node.js (`npm init -y`).
- [x] Instalar dependencias de producción: `express`, `cors`.
- [x] Instalar dependencias de desarrollo: `typescript`, `@types/node`, `@types/express`, `@types/cors`, `tsx`.
- [x] Configurar `tsconfig.json` con soporte para módulos ESNext.
- [x] Configurar el script de desarrollo (`npm run dev`) con `tsx watch`.

### 2. Modelado de Datos y Lógica

- [x] Definir interfaces de TypeScript para `PollOption` y `Poll` en `src/types.ts`.
- [x] Crear el almacenamiento temporal en memoria (array `polls: Poll[]`).

### 3. Desarrollo de Endpoints API

- [x] **`POST /api/polls`**
  - [x] Validar que la petición incluya una pregunta válida y al menos 2 opciones.
  - [x] Generar un ID único corto para la encuesta (`crypto.randomUUID()`).
  - [x] Guardar la nueva encuesta y devolver el objeto creado con código `201`.
- [x] **`GET /api/polls/:id`**
  - [x] Buscar la encuesta por ID.
  - [x] Retornar error `404` si no existe o el objeto de la encuesta si se encuentra.
- [x] **`POST /api/polls/:id/vote`**
  - [x] Validar la existencia de la encuesta y que el `optionIndex` sea válido.
  - [x] Incrementar el contador de votos de la opción seleccionada.
  - [x] Devolver la encuesta actualizada.

---

## 🎨 Frontend (React + TypeScript + Vite)

### 1. Configuración Inicial

- [x] Crear el proyecto con Vite y plantilla React-TS (`npm create vite@latest`).
- [x] Limpiar archivos y estilos por defecto de Vite.
- [x] Crear el archivo `src/types.ts` alineado con el backend.

### 2. Componentes e Interfaz de Usuario

- [x] **Componente `CreatePoll` (Creación de Encuestas):**
  - [x] Input para la pregunta principal.
  - [x] Renderizado dinámico de campos para opciones (permitir entre 2 y 5).
  - [x] Botón para añadir nuevos campos de opción.
  - [x] Manejo del envío del formulario mediante un `fetch` (`POST /api/polls`).
- [x] **Componente `PollView` (Votación y Resultados):**
  - [x] `useEffect` para obtener los datos de la encuesta al cargar (`GET /api/polls/:id`).
  - [x] Renderizar botones para votar cuando el usuario aún no ha emitido su voto.
  - [x] Función para enviar el voto al servidor (`POST /api/polls/:id/vote`).
  - [x] Renderizar barras de progreso animadas con el porcentaje de cada opción tras votar.
- [x] **Integración en `App.tsx`:**
  - [x] Controlar el estado de la vista actual (Vista de creación vs. Vista de la encuesta).

---

## 🚀 Mejoras Opcionales para el Portfolio (Extras)

- [ ] **Prevención de múltiples votos:** Guardar el ID de la encuesta en el `localStorage` del navegador al votar.
- [x] **Copiar enlace:** Botón para copiar al portapapeles la URL directa a la encuesta.
- [ ] **Persistencia:** Reemplazar el almacenamiento en memoria del servidor por una base de datos ligera como SQLite o PostgreSQL con Prisma.

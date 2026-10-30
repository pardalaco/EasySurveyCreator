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
- [ ] Definir interfaces de TypeScript para `PollOption` y `Poll` en `src/types.ts`.
- [ ] Crear el almacenamiento temporal en memoria (array `polls: Poll[]`).

### 3. Desarrollo de Endpoints API
- [ ] **`POST /api/polls`**
  - [ ] Validar que la petición incluya una pregunta válida y al menos 2 opciones.
  - [ ] Generar un ID único corto para la encuesta (`crypto.randomUUID()`).
  - [ ] Guardar la nueva encuesta y devolver el objeto creado con código `201`.
- [ ] **`GET /api/polls/:id`**
  - [ ] Buscar la encuesta por ID.
  - [ ] Retornar error `404` si no existe o el objeto de la encuesta si se encuentra.
- [ ] **`POST /api/polls/:id/vote`**
  - [ ] Validar la existencia de la encuesta y que el `optionIndex` sea válido.
  - [ ] Incrementar el contador de votos de la opción seleccionada.
  - [ ] Devolver la encuesta actualizada.

---

## 🎨 Frontend (React + TypeScript + Vite)

### 1. Configuración Inicial
- [ ] Crear el proyecto con Vite y plantilla React-TS (`npm create vite@latest`).
- [ ] Limpiar archivos y estilos por defecto de Vite.
- [ ] Crear el archivo `src/types.ts` alineado con el backend.

### 2. Componentes e Interfaz de Usuario
- [ ] **Componente `CreatePoll` (Creación de Encuestas):**
  - [ ] Input para la pregunta principal.
  - [ ] Renderizado dinámico de campos para opciones (permitir entre 2 y 5).
  - [ ] Botón para añadir nuevos campos de opción.
  - [ ] Manejo del envío del formulario mediante un `fetch` (`POST /api/polls`).
- [ ] **Componente `PollView` (Votación y Resultados):**
  - [ ] `useEffect` para obtener los datos de la encuesta al cargar (`GET /api/polls/:id`).
  - [ ] Renderizar botones para votar cuando el usuario aún no ha emitido su voto.
  - [ ] Función para enviar el voto al servidor (`POST /api/polls/:id/vote`).
  - [ ] Renderizar barras de progreso animadas con el porcentaje de cada opción tras votar.
- [ ] **Integración en `App.tsx`:**
  - [ ] Controlar el estado de la vista actual (Vista de creación vs. Vista de la encuesta).

---

## 🚀 Mejoras Opcionales para el Portfolio (Extras)
- [ ] **Prevención de múltiples votos:** Guardar el ID de la encuesta en el `localStorage` del navegador al votar.
- [ ] **Copiar enlace:** Botón para copiar al portapapeles la URL directa a la encuesta.
- [ ] **Persistencia:** Reemplazar el almacenamiento en memoria del servidor por una base de datos ligera como SQLite o PostgreSQL con Prisma.
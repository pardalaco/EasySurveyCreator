# Propuesta de Proyecto: MiniPoll 📊

## 1. Visión General
**MiniPoll** es una aplicación web ágil y visualmente atractiva pensada para formar parte de un portfolio de desarrollo web. Permite a cualquier usuario crear encuestas en pocos segundos, compartir el enlace y recibir votos en tiempo real, ofreciendo una representación gráfica e interactiva de los resultados.

El objetivo principal es demostrar habilidades sólidas de desarrollo Full Stack combinando un frontend dinámico en **React** y un backend fuertemente tipado utilizando **Node.js con TypeScript**.

---

## 2. Tecnologías Utilizadas

*   **Frontend:**
    *   **React** (con TypeScript)
    *   **Vite** (bundler y entorno de desarrollo rápido)
    *   **CSS / CSS Modules / Tailwind** (para estilos modernos y responsivos)
*   **Backend:**
    *   **Node.js** con **Express**
    *   **TypeScript** (tipado estricto en la lógica de servidor)
    *   **Cors** (gestión de políticas de origen cruzado)
    *   **TSX** (ejecución y entorno de desarrollo para Node.js + TS)

---

## 3. Arquitectura y Flujo de Usuario

1.  **Creación de Encuesta:**
    *   El usuario ingresa un título/pregunta y de 2 a 5 opciones.
    *   Al enviar, el frontend realiza una petición `POST` al servidor backend.
    *   El backend genera una ID única para la encuesta y devuelve la confirmación.

2.  **Votación y Resultados:**
    *   El usuario es redirigido a la vista de la encuesta (`/poll/:id`).
    *   Selecciona una opción y emite su voto enviando un `POST` al backend.
    *   El cliente actualiza inmediatamente la pantalla para mostrar las barras de porcentaje y el recuento total de votos.

---

## 4. Valor para el Portfolio
*   **Demostración Full Stack:** Conexión fluida entre cliente y servidor.
*   **Buenas Prácticas de Tipado:** Uso de interfaces y tipos en TypeScript compartidos conceptualmente entre ambas capas.
*   **Diseño centrado en UX:** Transición fluida de formulario a resultados interactivos.
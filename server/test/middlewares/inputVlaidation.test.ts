import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import axios from "axios";
import type { AxiosInstance } from "axios";
import type { Server } from "http";
import createHttpError from "http-errors";

// --- Función auxiliar y Middleware ---
const hasForbiddenKeys = (value: any): boolean => {
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (key.startsWith("$") || key.includes(".")) {
        return true;
      }
      if (hasForbiddenKeys(value[key])) {
        return true;
      }
    }
  }
  return false;
};

const inputValidationMiddleware = (req: any, res: any, next: any) => {
  if (
    hasForbiddenKeys(req.body) ||
    hasForbiddenKeys(req.query) ||
    hasForbiddenKeys(req.params)
  ) {
    return next(
      createHttpError(
        400,
        "Petición bloqueada: se han detectado patrones no permitidos en la entrada."
      )
    );
  }
  next();
};

// --- Creación de la app de Express ---
const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(inputValidationMiddleware);

  app.post("/survey", (req, res) => {
    res.status(200).json({ success: true, data: req.body });
  });

  // Manejador de errores
  app.use((err: any, req: any, res: any, next: any) => {
    const errCode = err.code || err.status || 500;
    res.status(errCode).send(err.message);
  });

  return app;
};

// --- Suite de Tests con Vitest y Axios ---
describe("inputValidationMiddleware (con Axios)", () => {
  let server: Server;
  let api: AxiosInstance;

  // Levantar servidor en un puerto efímero (puerto 0 asigna uno libre dinámicamente)
  beforeAll(() => {
    const app = createApp();
    server = app.listen(0);
    const address = server.address();

    if (typeof address === "object" && address !== null) {
      api = axios.create({
        baseURL: `http://localhost:${address.port}`,
        validateStatus: () => true, // Evita que Axios lance excepción en respuestas 4xx/5xx para poder evaluar res.status
      });
    }
  });

  // Cerrar servidor al terminar las pruebas
  afterAll(() => {
    server.close();
  });

  it("debe permitir peticiones válidas y devolver estado 200", async () => {
    const response = await api.post("/survey", {
      question: "¿Cuál es tu framework favorito?",
      options: [{ text: "Express" }, { text: "Fastify" }],
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  it('debe bloquear (Error 400) si detecta inyección NoSQL con "$"', async () => {
    const response = await api.post("/survey", {
      question: "¿Cuál es tu framework favorito?",
      options: [{ text: "Express" }, { text: "Fastify" }],
      $where: "this.password == ''",
    });

    expect(response.status).toBe(400);
    expect(response.data).toContain("Petición bloqueada");
  });

  it('debe bloquear (Error 400) si detecta inyección con punto "." en la clave', async () => {
    const response = await api.post("/survey", {
      "user.role": "admin",
    });

    expect(response.status).toBe(400);
    expect(response.data).toContain("Petición bloqueada");
  });
});

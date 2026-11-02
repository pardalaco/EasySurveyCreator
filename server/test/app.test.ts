import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import axios from "axios";
import type { AxiosInstance } from "axios";
import { app } from "../src/app.js";

const validSurvey = {
  question: "¿Cuál es tu lenguaje favorito?",
  options: [{ text: "TypeScript" }, { text: "JavaScript" }],
};

let server: Server;
let api: AxiosInstance;

function post(path: string, body: unknown) {
  return api.post(path, body);
}

beforeAll(async () => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  server = await new Promise<Server>((resolve) => {
    const listener = app.listen(0, () => resolve(listener));
  });
  const address = server.address() as AddressInfo;
  api = axios.create({
    baseURL: `http://127.0.0.1:${address.port}`,
    validateStatus: () => true,
  });
});

afterAll(async () => {
  vi.restoreAllMocks();
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /survey", () => {
  it("responde 200 con un body válido", async () => {
    const res = await post("/survey", validSurvey);

    expect(res.status).toBe(200);

    const body = res.data;

    // Verificamos que devuelva la encuesta enviada junto con un id generado
    expect(body).toMatchObject({
      question: validSurvey.question,
      options: validSurvey.options,
    });

    expect(body).toHaveProperty("id");
  });

  it("responde 400 si falta la pregunta", async () => {
    const res = await post("/survey", { options: validSurvey.options });

    expect(res.status).toBe(400);
    expect(res.data).toContain('"question" is required');
  });

  it("responde 400 con el body vacío", async () => {
    const res = await post("/survey", {});

    expect(res.status).toBe(400);
    expect(res.data).toContain('"question" is required');
  });

  it("responde 400 si hay menos de 2 opciones", async () => {
    const res = await post("/survey", {
      question: "pregunta",
      options: [{ text: "única" }],
    });

    expect(res.status).toBe(400);
    expect(res.data).toContain("must contain at least 2 items");
  });

  it("responde 400 si se envía el id", async () => {
    const res = await post("/survey", { ...validSurvey, id: "123" });

    expect(res.status).toBe(400);
    expect(res.data).toContain('"id" is not allowed');
  });

  it("responde 500 con JSON malformado", async () => {
    const res = await api.post("/survey", "{ no es json", {
      headers: { "Content-Type": "application/json" },
    });

    expect(res.status).toBe(500);
  });

  it("responde 400 si no se envía Content-Type JSON", async () => {
    const res = await api.post("/survey", JSON.stringify(validSurvey), {
      headers: { "Content-Type": false },
    });

    expect(res.status).toBe(400);
  });
});

describe("GET /survey/:id", () => {
  it("responde 200 con la encuesta creada", async () => {
    const createdRes = await post("/survey", validSurvey);
    const created = createdRes.data;

    const res = await api.get(`/survey/${created.id}`);

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({
      id: created.id,
      timestamp: created.timestamp,
      question: validSurvey.question,
      options: validSurvey.options,
    });
  });

  it("responde 404 si la encuesta no existe", async () => {
    const res = await api.get(`/survey/${crypto.randomUUID()}`);

    expect(res.status).toBe(404);
    expect(res.data).toBe("Survey not found");
  });
});

describe("rutas", () => {
  it("responde 404 para GET /survey", async () => {
    const res = await api.get("/survey");

    expect(res.status).toBe(404);
  });

  it("responde 404 para rutas desconocidas", async () => {
    const res = await api.get("/no-existe");

    expect(res.status).toBe(404);
  });
});

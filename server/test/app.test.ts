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
import { app } from "../src/app.js";

const validSurvey = {
  question: "¿Cuál es tu lenguaje favorito?",
  options: [{ text: "TypeScript" }, { text: "JavaScript" }],
};

let server: Server;
let baseUrl: string;

function post(path: string, body: unknown) {
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeAll(async () => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  server = await new Promise<Server>((resolve) => {
    const listener = app.listen(0, () => resolve(listener));
  });
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
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

describe("POST /suvery", () => {
  it("responde 200 con un body válido", async () => {
    const res = await post("/suvery", validSurvey);

    expect(res.status).toBe(200);

    const body = await res.json();

    // Verificamos que devuelva la encuesta enviada junto con un id generado
    expect(body).toMatchObject({
      question: validSurvey.question,
      options: validSurvey.options,
    });

    expect(body).toHaveProperty("id");
  });

  it("responde 400 si falta la pregunta", async () => {
    const res = await post("/suvery", { options: validSurvey.options });

    expect(res.status).toBe(400);
    expect(await res.text()).toContain('"question" is required');
  });

  it("responde 400 con el body vacío", async () => {
    const res = await post("/suvery", {});

    expect(res.status).toBe(400);
    expect(await res.text()).toContain('"question" is required');
  });

  it("responde 400 si hay menos de 2 opciones", async () => {
    const res = await post("/suvery", {
      question: "pregunta",
      options: [{ text: "única" }],
    });

    expect(res.status).toBe(400);
    expect(await res.text()).toContain("must contain at least 2 items");
  });

  it("responde 400 si se envía el id", async () => {
    const res = await post("/suvery", { ...validSurvey, id: "123" });

    expect(res.status).toBe(400);
    expect(await res.text()).toContain('"id" is not allowed');
  });

  it("responde 400 si una opción tiene votes negativos", async () => {
    const res = await post("/suvery", {
      question: "pregunta",
      options: [{ text: "ok", votes: -1 }, { text: "otra" }],
    });

    expect(res.status).toBe(400);
    expect(await res.text()).toContain(
      '"options[0].votes" must be greater than or equal to 0'
    );
  });

  it("responde 500 con JSON malformado", async () => {
    const res = await fetch(`${baseUrl}/suvery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ no es json",
    });

    expect(res.status).toBe(500);
  });

  it("responde 400 si no se envía Content-Type JSON", async () => {
    const res = await fetch(`${baseUrl}/suvery`, {
      method: "POST",
      body: JSON.stringify(validSurvey),
    });

    expect(res.status).toBe(400);
  });
});

describe("rutas", () => {
  it("responde 404 para GET /suvery", async () => {
    const res = await fetch(`${baseUrl}/suvery`);

    expect(res.status).toBe(404);
  });

  it("responde 404 para rutas desconocidas", async () => {
    const res = await fetch(`${baseUrl}/no-existe`);

    expect(res.status).toBe(404);
  });
});

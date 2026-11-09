import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { AddressInfo } from "node:net";
import axios from "axios";
import type { AxiosInstance } from "axios";
import { io, server } from "../../src/app.js";
import { io as ioClient, Socket } from "socket.io-client";

const monitorIpsMock = vi.hoisted(() => ({
  register: vi.fn((_ip: string) => 1),
}));

vi.mock("../../src/utils/monitorIps.js", () => ({
  MonitorIPs: class {
    register(ip: string) {
      return monitorIpsMock.register(ip);
    }
  },
}));

type EmittedSurvey = {
  id: string;
  timestamp: string;
  question: string;
  options: Array<{ id: number; text: string; votes: number }>;
};

describe("Routes /suvery", () => {
  const validSurvey = {
    question: "¿Cuál es tu lenguaje favorito?",
    options: [{ text: "TypeScript" }, { text: "JavaScript" }],
  };

  let api: AxiosInstance;

  function post(path: string, body: unknown) {
    return api.post(path, body);
  }

  beforeAll(async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    await new Promise<void>((resolve) => {
      server.listen(0, () => resolve());
    });
    const address = server.address() as AddressInfo;
    api = axios.create({
      baseURL: `http://127.0.0.1:${address.port}`,
      validateStatus: () => true,
    });
  });

  afterAll(async () => {
    vi.restoreAllMocks();
    server.closeAllConnections();
    await io.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    monitorIpsMock.register.mockReset();
    monitorIpsMock.register.mockImplementation(() => 1);
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

    describe("límite de encuestas por IP (MonitorIPs)", () => {
      const limitMessage =
        "You have reached the maximum number of surveys for today. Please try again tomorrow.";

      it("registra la IP del cliente al crear la encuesta", async () => {
        const res = await post("/survey", validSurvey);

        expect(res.status).toBe(200);
        expect(monitorIpsMock.register).toHaveBeenCalledTimes(1);
        expect(monitorIpsMock.register).toHaveBeenCalledWith(
          expect.any(String)
        );
      });

      it("responde 429 con el mensaje de límite diario alcanzado", async () => {
        monitorIpsMock.register.mockImplementationOnce(() => {
          throw new Error(limitMessage);
        });

        const res = await post("/survey", validSurvey);

        expect(res.status).toBe(429);
        expect(res.data).toBe(limitMessage);
      });

      it("responde 429 si la IP del cliente es inválida", async () => {
        monitorIpsMock.register.mockImplementationOnce(() => {
          throw new Error(
            'IP inválida ("no-es-una-ip"): "no-es-una-ip" must be a valid ip address'
          );
        });

        const res = await post("/survey", validSurvey);

        expect(res.status).toBe(429);
        expect(res.data).toContain('IP inválida ("no-es-una-ip")');
      });

      it("no crea la encuesta cuando responde 429", async () => {
        const randomUUIDSpy = vi.spyOn(crypto, "randomUUID");
        monitorIpsMock.register.mockImplementationOnce(() => {
          throw new Error(limitMessage);
        });

        const res = await post("/survey", validSurvey);

        expect(res.status).toBe(429);
        expect(typeof res.data).toBe("string");
        expect(randomUUIDSpy).not.toHaveBeenCalled();
        randomUUIDSpy.mockRestore();
      });

      it("permite crear una encuesta cuando el registro de IP vuelve a funcionar", async () => {
        monitorIpsMock.register.mockImplementationOnce(() => {
          throw new Error(limitMessage);
        });

        const blocked = await post("/survey", validSurvey);
        expect(blocked.status).toBe(429);

        const res = await post("/survey", validSurvey);

        expect(res.status).toBe(200);
        expect(res.data).toHaveProperty("id");
        expect(res.data.question).toBe(validSurvey.question);
      });

      it("responde 400 por validación de body antes que 429", async () => {
        monitorIpsMock.register.mockImplementationOnce(() => {
          throw new Error(limitMessage);
        });

        const res = await post("/survey", { options: validSurvey.options });

        expect(res.status).toBe(400);
        expect(res.data).toContain('"question" is required');
        expect(monitorIpsMock.register).not.toHaveBeenCalled();
      });
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

  describe("POST /survey/:id/vote", () => {
    async function createSurvey() {
      const res = await post("/survey", validSurvey);
      return res.data as {
        id: string;
        options: Array<{ id: number; text: string; votes: number }>;
      };
    }

    it("responde 200 incrementando los votos de la opción elegida", async () => {
      const survey = await createSurvey();

      const res = await post(`/survey/${survey.id}/vote`, { optionIndex: 1 });

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(survey.id);
      expect(res.data.options).toHaveLength(2);
      expect(res.data.options[1].votes).toBe(1);
      expect(res.data.options[0].votes).toBe(0);
    });

    it("acumula los votos en llamadas consecutivas", async () => {
      const survey = await createSurvey();

      await post(`/survey/${survey.id}/vote`, { optionIndex: 1 });
      const res = await post(`/survey/${survey.id}/vote`, { optionIndex: 1 });

      expect(res.status).toBe(200);
      expect(res.data.options[1].votes).toBe(2);

      const stored = await api.get(`/survey/${survey.id}`);
      expect(stored.data.options[1].votes).toBe(2);
    });

    it("responde 404 si la encuesta no existe", async () => {
      const res = await post(`/survey/${crypto.randomUUID()}/vote`, {
        optionIndex: 1,
      });

      expect(res.status).toBe(404);
      expect(res.data).toBe("No existe la encuesta");
    });

    it("responde 404 si la opción no existe en la encuesta", async () => {
      const survey = await createSurvey();

      const res = await post(`/survey/${survey.id}/vote`, { optionIndex: 99 });

      expect(res.status).toBe(404);
      expect(res.data).toBe("No existe la opción para esta encuesta");
    });

    it("responde 400 si falta optionIndex", async () => {
      const survey = await createSurvey();

      const res = await post(`/survey/${survey.id}/vote`, {});

      expect(res.status).toBe(400);
      expect(res.data).toContain('"optionIndex" is required');
    });

    it("responde 400 si el body no es JSON válido", async () => {
      const survey = await createSurvey();

      const res = await api.post(`/survey/${survey.id}/vote`, "{ no es json", {
        headers: { "Content-Type": "application/json" },
      });

      expect(res.status).toBe(500);
    });
  });

  describe("Socket.io", () => {
    const clients: Socket[] = [];

    function connectClient(): Promise<Socket> {
      const address = server.address() as AddressInfo;
      const client = ioClient(`http://127.0.0.1:${address.port}`, {
        transports: ["websocket"],
        forceNew: true,
      });
      clients.push(client);

      return new Promise((resolve, reject) => {
        const onError = (err: Error) => reject(err);
        client.once("connect", () => {
          client.off("connect_error", onError);
          resolve(client);
        });
        client.once("connect_error", onError);
      });
    }

    function waitForEvent(
      client: Socket,
      event: string
    ): Promise<EmittedSurvey> {
      return new Promise((resolve) => {
        client.once(event, resolve);
      });
    }

    afterEach(() => {
      for (const client of clients) {
        client.disconnect();
      }
      clients.length = 0;
    });

    it("permite conectar un cliente al servidor", async () => {
      const client = await connectClient();

      expect(client.connected).toBe(true);
    });

    it("emite update-vote-{id} con la encuesta actualizada al votar", async () => {
      const createdRes = await post("/survey", validSurvey);
      const surveyId = createdRes.data.id as string;

      const client = await connectClient();
      const eventPromise = waitForEvent(client, `update-vote-${surveyId}`);

      const voteRes = await post(`/survey/${surveyId}/vote`, {
        optionIndex: 1,
      });

      const emitted = await eventPromise;

      expect(emitted.id).toBe(surveyId);
      expect(emitted).toEqual(voteRes.data);
      expect(emitted.options).toHaveLength(2);
      expect(emitted.options[1]?.votes).toBe(1);
      expect(emitted.options[0]?.votes).toBe(0);
    });

    it("notifica a todos los clientes conectados", async () => {
      const createdRes = await post("/survey", validSurvey);
      const surveyId = createdRes.data.id as string;

      const clientA = await connectClient();
      const clientB = await connectClient();

      const eventA = waitForEvent(clientA, `update-vote-${surveyId}`);
      const eventB = waitForEvent(clientB, `update-vote-${surveyId}`);

      await post(`/survey/${surveyId}/vote`, { optionIndex: 0 });

      const [emittedA, emittedB] = await Promise.all([eventA, eventB]);

      expect(emittedA.options[0]?.votes).toBe(1);
      expect(emittedB.options[0]?.votes).toBe(1);
      expect(emittedA).toEqual(emittedB);
    });

    it("no emite el evento si el voto es de otra encuesta", async () => {
      const createdRes = await post("/survey", validSurvey);
      const surveyId = createdRes.data.id as string;
      const otherId = crypto.randomUUID();

      const client = await connectClient();

      let otherEventReceived = false;
      client.once(`update-vote-${otherId}`, () => {
        otherEventReceived = true;
      });

      const eventPromise = waitForEvent(client, `update-vote-${surveyId}`);
      await post(`/survey/${surveyId}/vote`, { optionIndex: 1 });
      await eventPromise;

      expect(otherEventReceived).toBe(false);
    });
  });
});

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

let server: Server;
let api: AxiosInstance;

beforeEach(() => {
  vi.clearAllMocks();
});

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

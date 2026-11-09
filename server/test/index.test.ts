import { beforeEach, describe, expect, it, vi } from "vitest";

const listenMock = vi.fn((_port: unknown, callback?: () => void) => {
  callback?.();
  return {};
});

vi.mock("../src/app.js", () => ({
  server: {
    listen: (...args: unknown[]) =>
      listenMock(args[0] as string, args[1] as () => void),
  },
}));

describe("index (entry point)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("PORT", "3000");
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("arranca el servidor escuchando en el puerto de la env PORT", async () => {
    await import("../src/index.js");

    expect(listenMock).toHaveBeenCalledTimes(1);
    expect(listenMock).toHaveBeenCalledWith("3000", expect.any(Function));
  });

  it("registra el mensaje de escucha en consola", async () => {
    await import("../src/index.js");

    expect(console.log).toHaveBeenCalledWith("Escuchando en puerto 3000");
  });

  it("usa el puerto definido en la variable de entorno", async () => {
    vi.stubEnv("PORT", "8080");

    await import("../src/index.js");

    expect(listenMock).toHaveBeenCalledWith("8080", expect.any(Function));
    expect(console.log).toHaveBeenCalledWith("Escuchando en puerto 8080");
  });
});

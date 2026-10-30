import { describe, expect, it } from "vitest";
import { HttpError } from "../../src/utils/httpError.js";

describe("HttpError", () => {
  it("es una instancia de Error", () => {
    const err = new HttpError("fallo");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(HttpError);
  });

  it("usa 400 como código por defecto", () => {
    const err = new HttpError("fallo");
    expect(err.code).toBe(400);
  });

  it("permite definir un código personalizado", () => {
    const err = new HttpError("no encontrado", 404);
    expect(err.code).toBe(404);
  });

  it("conserva el mensaje y el nombre del error", () => {
    const err = new HttpError("algo salió mal", 500);
    expect(err.message).toBe("algo salió mal");
    expect(err.name).toBe("HttpError");
  });

  it("genera stack trace", () => {
    const err = new HttpError("boom");
    expect(err.stack).toBeDefined();
    expect(err.stack).toContain("HttpError: boom");
  });
});

import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { validateOptionIndex } from "../../src/middlewares/validateOptionIndex.js";
import type { Survey, VoteSchema } from "../../src/types/index.js";
import { HttpError } from "../../src/utils/httpError.js";

const mockSurveys: Survey[] = [
  {
    id: "1",
    question: "¿Cuál es tu framework favorito?",
    options: [
      { id: 1, text: "React", votes: 10 },
      { id: 2, text: "Vue", votes: 5 },
    ],
    timestamp: new Date(),
  },
  {
    id: "2",
    question: "¿Qué lenguaje prefieres?",
    options: [
      { id: 1, text: "TypeScript", votes: 20 },
      { id: 2, text: "JavaScript", votes: 15 },
    ],
    timestamp: new Date(),
  },
];

function run(id: string, body: unknown) {
  const req = { params: { id }, body } as unknown as Request;
  const res = {} as Response;
  const next = vi.fn();
  validateOptionIndex(mockSurveys)(req, res, next as unknown as NextFunction);
  return next;
}

describe("validateOptionIndex", () => {
  it("continúa con next() si la opción existe en la encuesta", () => {
    const next = run("1", { optionIndex: 1 } satisfies VoteSchema);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("continúa con next() con la última opción de la encuesta", () => {
    const next = run("2", { optionIndex: 2 } satisfies VoteSchema);

    expect(next).toHaveBeenCalledWith();
  });

  it("propaga un HttpError con código 404 si la opción no existe", () => {
    const next = run("1", { optionIndex: 99 } satisfies VoteSchema);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    const err = next.mock.calls[0]?.[0] as HttpError;
    expect(err.code).toBe(404);
    expect(err.message).toBe("No existe la opción para esta encuesta");
  });

  it("propaga un HttpError con código 404 si optionIndex es undefined", () => {
    const next = run("1", {});

    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    expect((next.mock.calls[0]?.[0] as HttpError).code).toBe(404);
  });

  it("no llama a next() sin argumentos cuando hay error", () => {
    const next = run("1", { optionIndex: 0 });

    expect(next).not.toHaveBeenCalledWith();
  });
});

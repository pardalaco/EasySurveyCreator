import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { validateSurveyId } from "../../src/middlewares/validateSurveyId.js";
import type { Survey } from "../../src/types/index.js";
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

function run(id: string | undefined) {
  const req = { params: id === undefined ? {} : { id } } as Request;
  const res = {} as Response;
  const next = vi.fn();
  validateSurveyId(mockSurveys)(req, res, next as unknown as NextFunction);
  return next;
}

describe("validateSurveyId", () => {
  it("continúa con next() si la encuesta existe", () => {
    const next = run("1");

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("propaga un HttpError con código 404 si la encuesta no existe", () => {
    const next = run("999");

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    const err = next.mock.calls[0]?.[0] as HttpError;
    expect(err.code).toBe(404);
    expect(err.message).toBe("No existe la encuesta");
  });

  it("propaga un HttpError con código 404 si no hay parámetro id", () => {
    const next = run(undefined);

    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    expect((next.mock.calls[0]?.[0] as HttpError).code).toBe(404);
  });

  it("no llama a next() sin argumentos cuando hay error", () => {
    const next = run("no-existe");

    expect(next).not.toHaveBeenCalledWith();
  });

  it("funciona con una lista de encuestas vacía", () => {
    const req = { params: { id: "1" } } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();
    validateSurveyId([])(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    expect((next.mock.calls[0]?.[0] as HttpError).code).toBe(404);
  });
});

import { describe, expect, it, vi } from "vitest";
import Joi from "joi";
import type { Request, Response, NextFunction } from "express";
import { validateSchema } from "../../src/middlewares/validateSchema.js";
import { surveyCreatorSchema } from "../../src/schemas/survey.js";
import { HttpError } from "../../src/utils/httpError.js";

const validSurvey = {
  question: "¿Cuál es tu lenguaje favorito?",
  options: [{ text: "TypeScript" }, { text: "JavaScript" }],
};

function run(schema: Joi.ObjectSchema, body: unknown) {
  const req = { body } as Request;
  const res = {} as Response;
  const next = vi.fn();
  validateSchema(schema)(req, res, next as unknown as NextFunction);
  return next;
}

describe("validateSchema", () => {
  it("continúa con next() cuando el body es válido", () => {
    const next = run(surveyCreatorSchema, validSurvey);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("propaga un HttpError con código 400 cuando el body es inválido", () => {
    const next = run(surveyCreatorSchema, { options: [] });

    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    const err = next.mock.calls[0]?.[0] as HttpError;
    expect(err.code).toBe(400);
    expect(err.message).toBeTruthy();
  });

  it("valida body undefined como objeto vacío", () => {
    const next = run(surveyCreatorSchema, undefined);

    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    const err = next.mock.calls[0]?.[0] as HttpError;
    expect(err.code).toBe(400);
    expect(err.message).toContain('"question" is required');
  });

  it("funciona con un esquema custom", () => {
    const schema = Joi.object({ name: Joi.string().required() });

    expect(run(schema, { name: "daniel" })).toHaveBeenCalledWith();

    const next = run(schema, {});
    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    expect((next.mock.calls[0]?.[0] as HttpError).code).toBe(400);
  });
});

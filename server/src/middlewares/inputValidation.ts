import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError.js";

// Función recursiva para buscar claves peligrosas (NoSQL Injection)
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

export const inputValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    hasForbiddenKeys(req.body) ||
    hasForbiddenKeys(req.query) ||
    hasForbiddenKeys(req.params)
  ) {
    const err = new HttpError("Error: Entrada inválida", 400);
    return next(err);
  }

  next();
};

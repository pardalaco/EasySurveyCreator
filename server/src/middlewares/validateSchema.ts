import type { Request, Response, NextFunction } from "express";
import type { ObjectSchema } from "joi";
import { HttpError } from "../utils/httpError.js";

export const validateSchema =
  (schema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body ?? {});

    if (error) {
      const errorMessage = error.details?.[0]?.message || "Error de validación";
      const err = new HttpError(error.message);
      err.code = 400;
      next(err);
    }

    next();
  };

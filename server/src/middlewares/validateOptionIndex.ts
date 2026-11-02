import type { Request, Response, NextFunction } from "express";
import type { Survey, VoteSchema } from "../types/index.js";
import { HttpError } from "../utils/httpError.js";

export const validateOptionIndex =
  (surveys: Array<Survey>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const body = req.body as VoteSchema;
    const optionIndex = body.optionIndex;

    const survey = surveys.filter((s) => s.id === id)[0] as Survey;

    const options = survey.options;

    const optionExist = options.filter((s) => s.id === optionIndex)[0];
    if (optionExist === undefined) {
      const err = new HttpError(`No existe la opción para esta encuesta`);
      err.code = 404;
      return next(err);
    }

    next();
  };

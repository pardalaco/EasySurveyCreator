import type { Request, Response, NextFunction } from "express";
import type { Survey } from "../types/index.js";
import { HttpError } from "../utils/httpError.js";

export const validateSurveyId =
  (surveys: Array<Survey>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const survey = surveys.filter((s) => s.id === id)[0];

    if (survey === undefined) {
      const err = new HttpError(`No existe la encuesta`);
      err.code = 404;
      return next(err);
    }

    next();
  };

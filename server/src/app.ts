import express from "express";
import type { Request, Response, NextFunction } from "express";
import { validateSchema } from "./middlewares/validateSchema.js";
import { validateOptionIndex } from "./middlewares/validateOptionIndex.js";
import { validateSurveyId } from "./middlewares/validateSurveyId.js";
import { surveyCreatorSchema, surveyVoteSchema } from "./schemas/survey.js";
import { HttpError } from "./utils/httpError.js";
import type { Survey } from "./types/index.js";

const surveys: Array<Survey> = [];

const app = express();

app.use(express.json());

app.post("/survey", validateSchema(surveyCreatorSchema), (req, res) => {
  console.log("POST/survey");

  const body = req.body as Survey;

  let { options } = body;

  options = options.map((o, index) => ({
    ...o,
    id: index,
  }));

  // Opcional: asegurarte de que cumple con el tipo Survey
  const newSurvey: Survey = {
    ...body,
    id: String(crypto.randomUUID()),
    options: options,
    timestamp: new Date(),
  };

  surveys.push(newSurvey);

  console.log(surveys);
  res.send(newSurvey);
});

app.get("/survey/:id", (req, res) => {
  console.log("GET /survey");

  const id = req.params.id;
  const survey = surveys.find((s) => s.id === id);
  if (!survey) {
    res.status(404).send("Survey not found");
    return;
  }

  res.status(200).send(survey);
});

app.post(
  "/survey/:id/vote",
  validateSchema(surveyVoteSchema),
  validateSurveyId(surveys),
  validateOptionIndex(surveys),
  (req, res) => {
    const id = req.params.id;
    console.log(`POST/survey/${id}/vote`);
  }
);

app.use((req, res) => {
  res.status(404).send("La página que estas buscando no existe");
  console.log(`404 Not found: ${req.method} ${req.url}`);
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.code || 500).send(err.message);
});

export { app };

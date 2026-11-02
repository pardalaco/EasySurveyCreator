import express from "express";
import type { Request, Response, NextFunction } from "express";
import { validateSchema } from "./middlewares/validateSchema.js";
import { validateOptionIndex } from "./middlewares/validateOptionIndex.js";
import { validateSurveyId } from "./middlewares/validateSurveyId.js";
import { surveyCreatorSchema, surveyVoteSchema } from "./schemas/survey.js";
import { HttpError } from "./utils/httpError.js";
import type { Survey, SurveyOption, VoteSchema } from "./types/index.js";

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
    votes: 0,
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
    const body = req.body as VoteSchema;
    const optionIndex = body.optionIndex;

    const survey = surveys.filter((s) => s.id === id)[0] as Survey;
    let option = survey.options.filter(
      (s) => s.id === optionIndex
    )[0] as SurveyOption;

    let { votes } = option;
    votes += 1;
    option = { ...option, votes };

    survey.options = survey.options.map((o) => {
      if (o.id === option.id) return option;
      else return o;
    });

    res.status(200).send(survey);
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

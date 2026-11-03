import express from "express";
import { validateOptionIndex } from "../middlewares/validateOptionIndex.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { validateSurveyId } from "../middlewares/validateSurveyId.js";
import { surveyCreatorSchema, surveyVoteSchema } from "../schemas/survey.js";
import type { Survey, SurveyOption, VoteSchema } from "../types/index.js";

const surveys: Array<Survey> = [];

const router = express.Router();

router.post("/", validateSchema(surveyCreatorSchema), (req, res) => {
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

router.get("/:id", (req, res) => {
  console.log("GET /survey");

  const id = req.params.id;
  const survey = surveys.find((s) => s.id === id);
  if (!survey) {
    res.status(404).send("Survey not found");
    return;
  }

  res.status(200).send(survey);
});

router.post(
  "/:id/vote",
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

export default router;

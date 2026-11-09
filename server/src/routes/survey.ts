import express from "express";
import { validateOptionIndex } from "../middlewares/validateOptionIndex.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { validateSurveyId } from "../middlewares/validateSurveyId.js";
import { surveyCreatorSchema, surveyVoteSchema } from "../schemas/survey.js";
import type { Survey, SurveyOption, VoteSchema } from "../types/index.js";
import debug from "debug";
import { HttpError } from "../utils/httpError.js";
import { MonitorIPs } from "../utils/monitorIps.js";

const surveys: Array<Survey> = [];

const limitSurvey = process.env.LIMIT_SURVEY_FOR_IP
  ? parseInt(process.env.LIMIT_SURVEY_FOR_IP, 10)
  : 0;
const monitorIps = new MonitorIPs(limitSurvey);

const router = express.Router();
const log = debug("mi-app:surveys");

router.post("/", validateSchema(surveyCreatorSchema), (req, res) => {
  const ipClient = req.ip as string;

  try {
    monitorIps.register(ipClient);
  } catch (error) {
    const err = error as Error;
    res.status(429).send(err.message);

    log(`POST /survey - 429 Too Many Requests: ${err.message}`);

    return;
  }

  const surveyId = String(crypto.randomUUID().replace(/-/g, "").slice(0, 8));

  log(`POST /survey - ${surveyId} - ${req.ip}`);

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
    id: surveyId,
    options: options,
    timestamp: new Date(),
  };

  surveys.push(newSurvey);

  res.send(newSurvey);
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  log(`GET /survey/${id} - ${req.ip}`);

  const survey = surveys.find((s) => s.id === id);
  if (!survey) {
    log(`${req.method} /survey${req.url} - 404 Not found`);
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

    log(`GET /survey/${id}/vote - ${optionIndex} - ${req.ip}`);

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

    const io = req.app.get("io"); // Obtener la instancia de Socket.io desde Express y emitir a todos
    io.emit(`update-vote-${id}`, survey);

    res.status(200).send(survey);
  }
);

export default router;

import Joi from "joi";
import type { Survey, SurveyOption, VoteSchema } from "../types/index.js";

// Esquema para validar cada opción individual de la encuesta
const surveyOptionSchema = Joi.object<SurveyOption>({
  id: Joi.number()
    .forbidden()
    .alter({
      create: (s) => s.forbidden(),
      update: (s) => s.required(),
    }),
  text: Joi.string().required().min(1),
  votes: Joi.number().integer().min(0).default(0),
});

const suveryCreateOptionSchema = surveyOptionSchema.tailor(
  "create"
) as Joi.ObjectSchema<SurveyOption>;
const suveryUpdateOptionSchema = surveyOptionSchema.tailor(
  "update"
) as Joi.ObjectSchema<SurveyOption>;

// Esquema principal para crear/validar la encuesta
const surveyCreatorSchema = Joi.object<Survey>({
  id: Joi.string().forbidden(), // El ID no debe ser enviado por el cliente (lo genera el backend)
  question: Joi.string().required().max(255), // La pregunta es obligatoria y debe tener un tamaño razonable
  options: Joi.array().items(suveryCreateOptionSchema).required().min(2).max(5), // Exigimos entre 2 y 5 opciones como acordamos
  timestamp: Joi.date().forbidden(),
});

const surveyVoteSchema = Joi.object<VoteSchema>({
  optionIndex: Joi.number().forbidden().required(),
});

export { surveyCreatorSchema, surveyVoteSchema };

import Joi from "joi";
import { type Survey, type SurveyOption } from "../types/index.js";

// Esquema para validar cada opción individual de la encuesta
const surveyOptionSchema = Joi.object<SurveyOption>({
  id: Joi.number()
    .positive()
    .forbidden()
    .alter({
      create: (s) => s.forbidden(),
      update: (s) => s.required(),
    }),
  text: Joi.string().required().min(1),
  votes: Joi.number().integer().min(0).default(0),
});

const suveryCreateOptionSchema = surveyOptionSchema.tailor("create");
const suveryUpdateOptionSchema = surveyOptionSchema.tailor("update");

// Esquema principal para crear/validar la encuesta
const surveyCreatorSchema = Joi.object<Survey>({
  id: Joi.string().forbidden(), // El ID no debe ser enviado por el cliente (lo genera el backend)
  question: Joi.string().required().max(255), // La pregunta es obligatoria y debe tener un tamaño razonable
  options: Joi.array().items(suveryCreateOptionSchema).required().min(2).max(5), // Exigimos entre 2 y 5 opciones como acordamos
  timestamp: Joi.date().forbidden(),
});

export { surveyCreatorSchema };

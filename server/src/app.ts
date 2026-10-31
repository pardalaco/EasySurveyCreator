import express from "express";
import type { Request, Response, NextFunction } from "express";
import { validateSchema } from "./middlewares/validateSchema.js";
import { surveyCreatorSchema } from "./schemas/suvery.js";
import { HttpError } from "./utils/httpError.js";
import type { Suvery } from "./types/index.js";

const suverys: Array<Suvery> = [];

const app = express();

app.use(express.json());

app.post("/suvery", validateSchema(surveyCreatorSchema), (req, res) => {
  console.log("/suvery");

  const body = req.body as Suvery;

  // Opcional: asegurarte de que cumple con el tipo Suvery
  const newSurvey: Suvery = {
    ...body,
    id: String(suverys.length + 1),
  };

  suverys.push(newSurvey);

  console.log(suverys);
  res.send(newSurvey);
});

app.use((req, res) => {
  res.status(404).send("La página que estas buscando no existe");
  console.log(`404 Not found: ${req.method} ${req.url}`);
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.code || 500).send(err.message);
});

export { app };

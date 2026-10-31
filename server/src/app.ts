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
  console.log("POST/suvery");

  const body = req.body as Suvery;

  // Opcional: asegurarte de que cumple con el tipo Suvery
  const newSurvey: Suvery = {
    ...body,
    id: String(crypto.randomUUID()),
  };

  suverys.push(newSurvey);

  console.log(suverys);
  res.send(newSurvey);
});

app.get("/suvery/:id", (req, res) => {
  console.log("GET /suvery");

  const id = req.params.id;
  const suvery = suverys.find((s) => s.id === id);
  if (!suvery) {
    res.status(404).send("Suvery not found");
    return;
  }

  res.status(200).send(suvery);
});

app.use((req, res) => {
  res.status(404).send("La página que estas buscando no existe");
  console.log(`404 Not found: ${req.method} ${req.url}`);
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.code || 500).send(err.message);
});

export { app };

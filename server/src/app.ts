import express from "express";
import type { Request, Response, NextFunction } from "express";
import { validateSchema } from "./middlewares/validateSchema.js";
import { surveyCreatorSchema } from "./schemas/suvery.js";
import { HttpError } from "./utils/httpError.js";

const app = express();

app.use(express.json());

app.post("/suvery", validateSchema(surveyCreatorSchema), (req, res) => {
  console.log("/suvery");
  res.send("OK");
});

app.use((req, res) => {
  res.status(404).send("La página que estas buscando no existe");
  console.log(`404 Not found: ${req.method} ${req.url}`);
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.code || 500).send(err.message);
});

export { app };

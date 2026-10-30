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

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.code || 500).send(err.message);
});

app.listen(process.env.PORT, () =>
  console.log(`Escuchando en puerto ${process.env.PORT}`)
);

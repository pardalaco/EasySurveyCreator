import type { NextFunction, Request, Response } from "express";
import express from "express";
import { HttpError } from "./utils/httpError.js";
import surveyRoute from "./routes/survey.js";
import cors from "cors";
import debug from "debug";
import { inputValidationMiddleware } from "./middlewares/inputValidation.js";

const app = express();
const log = debug("mi-app:surveys");

const corsOptions = {
  origin: process.env.CLIENT_URL,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(inputValidationMiddleware);

app.use("/survey", surveyRoute);

app.use((req, res) => {
  res.status(404).send("La página que estas buscando no existe");
  log(`${req.method} ${req.url} - 404 Not found`);
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  const errCode = err.code || 500;
  res.status(errCode).send(err.message);
  log(`${req.method} ${req.url} - Error ${errCode}: ${err.message}`);
});

export { app };

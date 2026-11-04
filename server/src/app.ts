import type { NextFunction, Request, Response } from "express";
import express from "express";
import { HttpError } from "./utils/httpError.js";
import surveyRoute from "./routes/survey.js";
import cors from "cors";

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());

app.use("/survey", surveyRoute);

app.use((req, res) => {
  res.status(404).send("La página que estas buscando no existe");
  console.log(`404 Not found: ${req.method} ${req.url}`);
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.code || 500).send(err.message);
});

export { app };

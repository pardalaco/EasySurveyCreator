import type { NextFunction, Request, Response } from "express";
import express from "express";
import { HttpError } from "./utils/httpError.js";
import surveyRoute from "./routes/survey.js";
import cors from "cors";
import debug from "debug";
import { inputValidationMiddleware } from "./middlewares/inputValidation.js";
import http from "http";
import { Server } from "socket.io";

const corsUrlOrigin = process.env.CLIENT_URL || "*";

const app = express();
const log = debug("EasySurveyCreator");

// Configuración del Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsUrlOrigin,
    methods: ["GET", "POST"],
  },
});

// Guardar `io` en app para poder usarlo dentro de tus controladores/rutas si lo necesitas
app.set("io", io);

// Escuchar conexiones básicas de los clientes
io.on("connection", (socket) => {
  log(`Cliente conectado: ${socket.id}`);

  socket.on("disconnect", () => {
    log(`Cliente desconectado: ${socket.id}`);
  });
});

// Configuración de cors
const corsOptions = {
  origin: corsUrlOrigin,
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

export { app, server, io };

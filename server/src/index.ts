import { app } from "./app.js";

app.listen(process.env.PORT, () =>
  console.log(`Escuchando en puerto ${process.env.PORT}`)
);

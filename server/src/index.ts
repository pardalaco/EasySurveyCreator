import { server } from "./app.js";

server.listen(process.env.PORT, () =>
  console.log(`Escuchando en puerto ${process.env.PORT}`)
);

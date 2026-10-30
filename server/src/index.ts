import express from "express";

const app = express();

app.use(express.json());

app.post("/suvery", (req, res) => {
  console.log("/suvery");
  res.send(req.body);
});

app.listen(process.env.PORT, () =>
  console.log(`Escuchando en puerto ${process.env.PORT}`)
);

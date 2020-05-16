const express = require("express");
const connectDb = require("./config/db");

const errorMiddleware = require("./middleware/errors");

const app = express();

// Conectar ao BD
connectDb();

// Usar bodyParser
app.use(express.json({ extended: false }));

// Definir rota de checagem de saúde da API
app.get("/", (req, res) => res.send("API rodando"));

// Definir rotas
app.use("/api/user", require("./routes/api/user"));
app.use("/api/profile", require("./routes/api/profile"));

// Definir rota para erros 404
app.all("*", (req, res, next) => {
  const err = new Error(`Ops! Parece que não encontramos o que você procura.`);
  err.statusCode = 404;

  next(err);
});

// Inicializar middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor iniciado na porta ${PORT}`));

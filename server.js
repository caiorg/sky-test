const express = require("express");
const connectDb = require("./config/db");

const app = express();

// Conectar ao BD
connectDb();

app.get("/", (req, res) => res.send("API rodando"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor iniciado na porta ${PORT}`));

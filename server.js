const express = require("express");
const connectDb = require("./config/db");

const app = express();

// Conectar ao BD
connectDb();

// Inicializar middleware
app.use(express.json({ extended: false }));

// Definir rota de checagem de saúde da API
app.get("/", (req, res) => res.send("API rodando"));

// Definir rotas
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor iniciado na porta ${PORT}`));

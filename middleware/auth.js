const jwt = require("jsonwebtoken");
const config = require("config");

const User = require("../models/User");

module.exports = async function (req, res, next) {
  // Obter o token do header
  const authorization = req.header("Authorization");
  const token = authorization && authorization.split(" ")[1];

  // Verificar se há token definido
  if (!token) {
    return res.status(401).json({ mensagem: "Não autorizado" });
  }

  // Verificar veracidade do token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    const user = await User.findOne({ token });

    if (!user) {
      const err = new Error("Sessão inválida");
      err.statusCode = 403;
      return next(err);
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    await User.findOneAndUpdate({ token }, { $unset: "token" });
    err.statusCode = 403;
    next(err);
  }
};

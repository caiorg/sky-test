const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  // Obter o token do header
  const authorization = req.header("Authorization");
  const token = authorization && authorization.split(" ")[1];

  // Verificar se há token definido
  if (!token) {
    return res.status(401).json({ mensagem: "Não autorizado" });
  }

  // Verificar veracidade do token
  try {
    const decoded = jwt.verify(
      token,
      config.get("jwtSecret"),
      (err, decoded) => {
        if (err) {
          return res.status(403).json({ mensagem: "Sessão inválida" });
        }

        return decoded;
      }
    );

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ mensagem: "Token inválido" });
  }
};

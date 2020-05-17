const isValidJSONString = require("../utils/isValidJSONString");

module.exports = function (err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  const message = err.message || error.mensagem;

  res.status(err.statusCode).json({
    mensagem:
      isValidJSONString(message) || message || "Erro interno no servidor",
  });
};

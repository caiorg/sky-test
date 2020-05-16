module.exports = function (err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    mensagem: err.message || "Erro interno no servidor",
  });
};

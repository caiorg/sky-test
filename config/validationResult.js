const { validationResult } = require("express-validator");

module.exports = validationResult.withDefaults({
  formatter: (error) => {
    return {
      parametro: error.param,
      valor: error.value,
      mensagem: error.msg,
    };
  },
});

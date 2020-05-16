const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  senha: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  data_criacao: {
    type: Date,
    default: Date.now,
  },
  data_atualizacao: {
    type: Date,
  },
  ultimo_login: {
    type: Date,
  },
  token: {
    type: String,
  },
});

module.exports = User = mongoose.model("user", UserSchema);

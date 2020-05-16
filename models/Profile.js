const mongoose = require("mongoose");

const TelephoneSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: true,
    minlength: 8,
  },
  ddd: {
    type: String,
    required: true,
    minlength: 2,
  },
});

const AddressSchema = new mongoose.Schema({
  logradouro: {
    type: String,
    required: true,
  },
  numero: {
    type: Number,
    required: true,
  },
  complemento: {
    type: String,
  },
  cep: {
    type: String,
    minlength: 9,
    required: true,
  },
});

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  telefones: {
    type: [TelephoneSchema],
  },
  endereco: {
    type: AddressSchema,
  },
  data_criacao: {
    type: Date,
    default: Date.now,
  },
  data_atualizacao: {
    type: Date,
  },
});

module.exports = Profile = mongoose.model("profile", ProfileSchema);

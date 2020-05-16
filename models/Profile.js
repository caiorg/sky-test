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

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  telefones: {
    type: [TelephoneSchema],
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

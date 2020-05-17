const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
  nome: {
    ofString: ["admin", "user"],
  },
  urlsPermitidas: {
    type: [String],
    required: true,
  },
});

module.exports = Role = mongoose.model("role", RoleSchema);

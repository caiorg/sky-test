const express = require("express");
const router = express.Router();

// @route   GET api/profile
// @desc    Rota de teste
// @access  Public
router.get("/", (req, res) => res.send("Rota do perfil usuário"));

module.exports = router;

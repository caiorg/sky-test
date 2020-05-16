const express = require("express");
const router = express.Router();

// @route   GET api/auth
// @desc    Rota de teste
// @access  Public
router.get("/", (req, res) => res.send("Rota de autenticação"));

module.exports = router;

const express = require("express");
const router = express.Router();

// @route   POST api/users
// @desc    Registrar usuário
// @access  Public
router.post("/signup", (req, res) => {
  console.log(req.body);
  res.send("Rota do usuário");
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

// @route   POST api/users
// @desc    Registrar usuário
// @access  Public
router.post(
  "/signup",
  [
    check("nome", "O nome obrigatório").not().isEmpty(),
    check("email", "Por favor informe seu email").isEmail(),
    check("senha", "Utilize uma senha com 6 ou mais caracteres").isLength({
      min: 6,
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.send("Rota do usuário");
  }
);

module.exports = router;

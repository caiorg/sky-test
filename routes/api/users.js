const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");

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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome, email, senha } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "E-mail já existente" }] });
      }

      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      const salt = await bcrypt.genSalt(10);

      user = new User({ nome, email, senha, avatar });

      user.senha = await bcrypt.hash(senha, salt);

      await user.save();

      res.send("Usuário cadastrado");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Erro no servidor");
    }
  }
);

module.exports = router;

const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { body, check, validationResult } = require("express-validator");

const auth = require("../../middleware/auth");

const User = require("../../models/User");

const _validationResult = validationResult.withDefaults({
  formatter: (error) => {
    return {
      parametro: error.param,
      valor: error.value,
      mensagem: error.msg,
    };
  },
});

// @route   GET api/users
// @desc    Rota de teste
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-senha -token");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

// @route   POST api/user/signup
// @desc    Registrar usuário
// @access  Public
router.post(
  "/signup",
  [
    body("email")
      .custom(async (email) => {
        let user = await User.findOne({ email });
        if (user) {
          return Promise.reject("E-mail já existente");
        }
      })
      .isEmail()
      .normalizeEmail(),
    check("nome", "O nome é obrigatório").not().isEmpty(),
    check("senha", "Utilize uma senha com 6 ou mais caracteres").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = _validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome, email, senha } = req.body;

    try {
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      const salt = await bcrypt.genSalt(10);

      user = new User({ nome, email, senha, avatar });

      user.senha = await bcrypt.hash(senha, salt);
      user.data_atualizacao = Date.now();

      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: config.get("jwtExpiresIn") },
        async (err, token) => {
          if (err) throw err;

          user.ultimo_login = Date.now();
          user.token = token;

          await user.save();

          res.json({ user });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Erro no servidor");
    }
  }
);

// @route   POST api/user/signin
// @desc    Autenticar usuário e obter token
// @access  Public
router.post(
  "/signin",
  [
    check("email", "Por favor informe seu email").isEmail().normalizeEmail(),
    check("senha", "Senha é obrigatória").exists(),
  ],
  async (req, res) => {
    const errors = _validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, senha } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Usuário e/ou senha inválidos" }] });
      }

      const isMatch = await bcrypt.compare(senha, user.senha);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Usuário e/ou senha inválidos" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: config.get("jwtExpiresIn") },
        async (err, token) => {
          if (err) throw err;

          user.token = token;
          user.ultimo_login = Date.now();

          await user.save();

          res.json({ user });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Erro no servidor");
    }
  }
);

module.exports = router;

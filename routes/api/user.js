const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { body, check } = require("express-validator");
const validationResult = require("../../config/validationResult");

const auth = require("../../middleware/auth");

const User = require("../../models/User");

// @route   GET api/users
// @desc    Rota de teste
// @access  Private
router.get("/", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-senha -token");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    return next(err);
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
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error(JSON.stringify({ errors: errors.array() }));
      return next(err);
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
      return next(err);
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
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error(JSON.stringify({ errors: errors.array() }));
      err.statusCode = 400;
      return next(err);
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

// @route   POST api/user/signout
// @desc    Autenticar usuário e obter token
// @access  Private
router.post("/signout", auth, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $unset: { token: 1 } });
    res.json({ mensagem: "Usuário desconectado" });
  } catch (err) {
    console.error(err.message);
    return next(err);
  }
});

module.exports = router;

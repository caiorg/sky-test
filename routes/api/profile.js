const express = require("express");
const router = express.Router();
const config = require("config");
const auth = require("../../middleware/auth");
const acl = require("../../middleware/acl");
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");
const Profile = require("../../models/Profile");
const Role = require("../../models/Role");

// @route   GET api/profile/me
// @desc    Obter perfil do usuário atual
// @access  Private
router.get("/me", auth, acl, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    })
      .populate("user", ["nome", "avatar", "papel"])
      .populate("papel", ["nome", "urlsPermitidas"]);

    if (!profile) {
      return res.status(400).json({ msg: "Este usuário não possui perfil" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

// @route   POST api/profile
// @desc    Criar ou atualizar o perfil do usuário
// @access  Private
router.post(
  "/",
  [
    auth,
    acl,
    [
      check("telefones", "Lista de telefones obrigatória").not().isEmpty(),
      check("endereco", "O endereço é obrigatório").not().isEmpty(),
    ],
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error(JSON.stringify({ errors: errors.array() }));
      return next(err);
    }

    const { telefones, endereco, papel } = req.body;

    const role =
      (await Role.findOne({ nome: papel })) ||
      (await Role.findOne({ nome: config.get("defaultRole") }));

    const profileFields = {};

    profileFields.user = req.user.id;
    profileFields.papel = role.id;

    if (telefones) profileFields.telefones = telefones;
    if (endereco) profileFields.endereco = endereco;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        profileFields.data_atualizacao = Date.now();

        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      profile = new Profile(profileFields);
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      return next(err);
    }
  }
);

// @route   GET api/profile
// @desc    Obter todos os perfis
// @access  Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find()
      .populate("user", ["nome", "avatar"])
      .populate("papel", ["nome", "urlsPermitidas"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Obter o perfil do usuário pelo seu id
// @access  Private
router.get("/user/:user_id", auth, acl, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["nome", "avatar"]);

    if (!profile) {
      const err = new Error("Perfil não encontrado");
      err.statusCode = 400;
      return next(err);
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      const err = new Error("Perfil não encontrado");
      err.statusCode = 400;
      return next(err);
    }

    res.status(500).send("Erro no servidor");
  }
});

// @route   DELETE api/profile
// @desc    Excluir perfil e respectivo usuário
// @access  Private
router.delete("/", auth, acl, async (req, res) => {
  try {
    // Excluir perfil do usuário
    await Profile.findOneAndRemove({ user: req.user.id });

    // Excluir usuário
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "Usuário excluído" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

module.exports = router;

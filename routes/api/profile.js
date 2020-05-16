const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");
const Profile = require("../../models/Profile");

// @route   GET api/profile/me
// @desc    Obter perfil do usuário atual
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["nome", "avatar"]);

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
    [check("telefones", "Lista de telefones obrigatória").not().isEmpty()],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { telefones } = req.body;

    const profileFields = {};

    profileFields.user = req.user.id;

    if (telefones) profileFields.telefones = telefones;

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
      res.status(500).send("Erro no servidor");
    }
  }
);

// @route   GET api/profile
// @desc    Obter todos os perfis
// @access  Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["nome", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Obter o perfi do usuário pelo seu id
// @access  Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["nome", "avatar"]);

    if (!profile) {
      res.status(400).json({ msg: "Perfil não encontrado" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      res.status(400).json({ msg: "Perfil não encontrado" });
    }
    res.status(500).send("Erro no servidor");
  }
});

module.exports = router;

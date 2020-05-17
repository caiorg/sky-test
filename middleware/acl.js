const Profile = require("../models/Profile");
const Role = require("../models/Role");

module.exports = async function (req, res, next) {
  const profile = await Profile.findOne({ user: req.user.id });
  if (!profile) {
    const err = new Error("Este usuário não possui um perfil criado.");
    err.statusCode = 403;
    return next(err);
  }

  const role = await Role.findById(profile.papel);

  if (
    role &&
    role.urlsPermitidas &&
    role.urlsPermitidas != "*" &&
    !role.urlsPermitidas.includes(req.originalUrl)
  ) {
    const err = new Error("Não autorizado");
    err.statusCode = 403;
    return next(err);
  }

  return next();
};

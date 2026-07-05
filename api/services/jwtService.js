const jwt = require("jsonwebtoken");
const config = require("../config");
const db = require("./db");

const TABLE = "jetons_rafraichissement";

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id_utilisateur, email: user.email, role: user.role },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpires }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id_utilisateur, type: "refresh" },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpires }
  );
}

function verifyAccessToken(token)  { return jwt.verify(token, config.jwt.accessSecret); }
function verifyRefreshToken(token) { return jwt.verify(token, config.jwt.refreshSecret); }

function saveRefreshToken(idUtilisateur, token) {
  const decoded = jwt.decode(token);
  db.insert(TABLE, {
    id_utilisateur: idUtilisateur,
    token,
    date_creation: new Date().toISOString(),
    date_expiration: new Date(decoded.exp * 1000).toISOString(),
    revoque: false,
  }, "id_jeton");
}

function isRefreshTokenValid(token) {
  const j = db.findOne(TABLE, (x) => x.token === token);
  if (!j || j.revoque) return false;
  return new Date(j.date_expiration) > new Date();
}

function revokeRefreshToken(token) {
  const j = db.findOne(TABLE, (x) => x.token === token);
  if (j) db.update(TABLE, j.id_jeton, { revoque: true }, "id_jeton");
}

function revokeAllUserTokens(idUtilisateur) {
  db.findAll(TABLE, (x) => x.id_utilisateur === idUtilisateur)
    .forEach((j) => db.update(TABLE, j.id_jeton, { revoque: true }, "id_jeton"));
}

module.exports = {
  generateAccessToken, generateRefreshToken,
  verifyAccessToken, verifyRefreshToken,
  saveRefreshToken, isRefreshTokenValid,
  revokeRefreshToken, revokeAllUserTokens,
};

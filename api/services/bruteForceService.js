const config = require("../config");
const db = require("./db");

const TABLE = "tentatives_connexion";

function recordAttempt(email, ip, succes) {
  db.insert(TABLE, {
    email,
    ip_adresse: ip || "unknown",
    date_tentative: new Date().toISOString(),
    succes: !!succes,
  }, "id_tentative");
}

function isLocked(email) {
  const cutoff = new Date(Date.now() - config.security.lockoutMinutes * 60000);
  const fails = db.findAll(TABLE, (x) =>
    x.email === email && !x.succes && new Date(x.date_tentative) > cutoff
  );
  return fails.length >= config.security.maxLoginAttempts;
}

function resetAttempts(email) {
  db.removeWhere(TABLE, (x) => x.email === email && !x.succes);
}

module.exports = { recordAttempt, isLocked, resetAttempts };

const bcrypt = require("bcryptjs");
const db = require("../services/db");
const config = require("../config");
const jwtSvc = require("../services/jwtService");
const bfSvc = require("../services/bruteForceService");
const { validation, validateFields } = require("../utils/validation");

const TABLE = "utilisateurs";

function toPublicUser(u) {
  return {
    id: u.id_utilisateur, nom: u.nom, prenom: u.prenom,
    email: u.email, telephone: u.telephone, role: u.role,
  };
}

exports.register = async (req, res) => {
  const { nom, prenom, email, telephone, mot_de_passe } = req.body;
  const errs = validateFields(
    { nom, prenom, email, password: mot_de_passe, telephone },
    { nom: validation.nom, prenom: validation.nom, email: validation.email, password: validation.password, telephone: validation.telephone }
  );
  if (errs) return res.status(400).json({ error: "Champs invalides", details: errs });

  try {
    if (db.findOne(TABLE, (u) => u.email === email))
      return res.status(409).json({ error: "Cet email est déjà utilisé" });

    const hash = await bcrypt.hash(mot_de_passe, config.security.bcryptRounds);
    const user = db.insert(TABLE, {
      nom, prenom, email, telephone: telephone || null,
      mot_de_passe: hash, role: "client", actif: true,
      date_creation: new Date().toISOString(),
    }, "id_utilisateur");

    const accessToken  = jwtSvc.generateAccessToken(user);
    const refreshToken = jwtSvc.generateRefreshToken(user);
    jwtSvc.saveRefreshToken(user.id_utilisateur, refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, secure: config.nodeEnv === "production",
      sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ accessToken, user: toPublicUser(user) });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.login = async (req, res) => {
  const { email, mot_de_passe } = req.body;
  const ip = req.ip || "unknown";
  if (!email || !mot_de_passe) return res.status(400).json({ error: "Email et mot de passe requis" });

  try {
    if (bfSvc.isLocked(email))
      return res.status(429).json({ error: `Trop de tentatives. Réessayez dans ${config.security.lockoutMinutes} min.` });

    const user = db.findOne(TABLE, (u) => u.email === email && u.actif);
    if (!user) {
      bfSvc.recordAttempt(email, ip, false);
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const match = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!match) {
      bfSvc.recordAttempt(email, ip, false);
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    bfSvc.recordAttempt(email, ip, true);
    bfSvc.resetAttempts(email);

    const accessToken  = jwtSvc.generateAccessToken(user);
    const refreshToken = jwtSvc.generateRefreshToken(user);
    jwtSvc.saveRefreshToken(user.id_utilisateur, refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, secure: config.nodeEnv === "production",
      sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken, user: toPublicUser(user) });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.refresh = (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ error: "Refresh token manquant" });
  try {
    const payload = jwtSvc.verifyRefreshToken(token);
    if (!jwtSvc.isRefreshTokenValid(token)) return res.status(401).json({ error: "Refresh token invalide" });
    const user = db.findById(TABLE, payload.id, "id_utilisateur");
    if (!user || !user.actif) return res.status(401).json({ error: "Utilisateur introuvable" });
    res.json({ accessToken: jwtSvc.generateAccessToken(user) });
  } catch {
    res.status(401).json({ error: "Refresh token expiré" });
  }
};

exports.logout = (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) jwtSvc.revokeRefreshToken(token);
  res.clearCookie("refreshToken");
  res.json({ message: "Déconnexion réussie" });
};

exports.me = (req, res) => {
  const user = db.findById(TABLE, req.user.id, "id_utilisateur");
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
  res.json(toPublicUser(user));
};

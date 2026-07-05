const { verifyAccessToken } = require("../services/jwtService");

function authenticate(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) return res.status(401).json({ error: "Token manquant" });
  try {
    req.user = verifyAccessToken(h.slice(7));
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") return res.status(401).json({ error: "Token expiré", code: "TOKEN_EXPIRED" });
    return res.status(401).json({ error: "Token invalide" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Non authentifié" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Accès refusé" });
    next();
  };
}

module.exports = { authenticate, requireRole };

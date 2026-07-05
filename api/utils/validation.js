const validation = {
  email(e) {
    if (!e || typeof e !== "string") return "Email requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Email invalide";
    return null;
  },
  password(p) {
    if (!p || typeof p !== "string") return "Mot de passe requis";
    if (p.length < 12) return "Minimum 12 caractères";
    if (!/[A-Z]/.test(p)) return "Au moins une majuscule";
    if (!/[a-z]/.test(p)) return "Au moins une minuscule";
    if (!/[0-9]/.test(p)) return "Au moins un chiffre";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(p)) return "Au moins un caractère spécial";
    return null;
  },
  nom(n) {
    if (!n || typeof n !== "string") return "Nom requis";
    if (n.trim().length < 2) return "Nom trop court";
    return null;
  },
  telephone(t) {
    if (!t) return null;
    if (!/^[+\d][\d\s\-()]{6,29}$/.test(t)) return "Téléphone invalide";
    return null;
  },
};

function validateFields(fields, rules) {
  const errors = {};
  for (const [k, r] of Object.entries(rules)) {
    const err = r(fields[k]);
    if (err) errors[k] = err;
  }
  return Object.keys(errors).length ? errors : null;
}

module.exports = { validation, validateFields };

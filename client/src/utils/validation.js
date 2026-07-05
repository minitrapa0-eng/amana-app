export const validation = {
  email(e) {
    if (!e) return "Email requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Email invalide";
    return null;
  },
  password(p) {
    if (!p) return "Mot de passe requis";
    if (p.length < 12) return "Minimum 12 caractères";
    if (!/[A-Z]/.test(p)) return "Au moins une majuscule";
    if (!/[a-z]/.test(p)) return "Au moins une minuscule";
    if (!/[0-9]/.test(p)) return "Au moins un chiffre";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(p)) return "Au moins un caractère spécial";
    return null;
  },
  nom(n) {
    if (!n) return "Requis";
    if (n.trim().length < 2) return "Trop court";
    return null;
  },
};

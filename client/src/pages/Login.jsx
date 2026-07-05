import { useState } from "react";
import { authApi } from "../services/api";
import { validation } from "../utils/validation";

export default function Login({ navigate, onLogin }) {
  const [email, setEmail] = useState("rachid.touimi@amana.ma");
  const [mdp, setMdp] = useState("Amana@2025");
  const [errs, setErrs] = useState({});
  const [alert, setAlert] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setAlert("");
    const nextErrs = {};
    const emailErr = validation.email(email);
    if (emailErr) nextErrs.email = emailErr;
    if (!mdp) nextErrs.mdp = "Requis";
    setErrs(nextErrs);
    if (Object.keys(nextErrs).length) return;

    setLoading(true);
    const { ok, status, data } = await authApi.login(email, mdp);
    setLoading(false);
    if (!ok) {
      if (status === 429) setAlert("Trop de tentatives. Réessayez plus tard.");
      else setAlert(data?.error || "Identifiants invalides");
      return;
    }
    onLogin(data.user);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">
            <span className="ar">أمانة</span>
            <span className="fr">amana</span>
          </div>
          <div className="auth-logo-sub">Gestion de colis</div>
        </div>

        <h1 className="auth-title">Connexion</h1>
        <p className="auth-subtitle">Bienvenue sur votre espace</p>

        {alert && <div className="form-alert">{alert}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@amana.ma"
            />
            {errs.email && <div className="form-error">{errs.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-input"
              value={mdp}
              onChange={(e) => setMdp(e.target.value)}
              placeholder="••••••••••••"
            />
            {errs.mdp && <div className="form-error">{errs.mdp}</div>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="auth-footer">
          Pas encore de compte ?{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("register"); }}>
            S'inscrire
          </a>
        </div>
      </div>
    </div>
  );
}

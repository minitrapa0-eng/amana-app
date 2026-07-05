import { useState } from "react";
import { authApi } from "../services/api";
import { validation } from "../utils/validation";

export default function Register({ navigate, onLogin }) {
  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", telephone: "", mot_de_passe: "", confirm: "",
  });
  const [errs, setErrs] = useState({});
  const [alert, setAlert] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setAlert("");
    const nextErrs = {};
    nextErrs.nom      = validation.nom(form.nom);
    nextErrs.prenom   = validation.nom(form.prenom);
    nextErrs.email    = validation.email(form.email);
    nextErrs.mot_de_passe = validation.password(form.mot_de_passe);
    if (form.mot_de_passe !== form.confirm) nextErrs.confirm = "Les mots de passe ne correspondent pas";
    Object.keys(nextErrs).forEach((k) => { if (!nextErrs[k]) delete nextErrs[k]; });
    setErrs(nextErrs);
    if (Object.keys(nextErrs).length) return;

    setLoading(true);
    const { ok, data } = await authApi.register({
      nom: form.nom, prenom: form.prenom, email: form.email,
      telephone: form.telephone, mot_de_passe: form.mot_de_passe,
    });
    setLoading(false);
    if (!ok) { setAlert(data?.error || "Erreur d'inscription"); return; }
    onLogin(data.user);
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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

        <h1 className="auth-title">Créer un compte</h1>
        <p className="auth-subtitle">Rejoignez la plateforme Amana</p>

        {alert && <div className="form-alert">{alert}</div>}

        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Prénom</label>
              <input className="form-input" value={form.prenom} onChange={(e) => set("prenom", e.target.value)} />
              {errs.prenom && <div className="form-error">{errs.prenom}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Nom</label>
              <input className="form-input" value={form.nom} onChange={(e) => set("nom", e.target.value)} />
              {errs.nom && <div className="form-error">{errs.nom}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={form.email} onChange={(e) => set("email", e.target.value)} />
            {errs.email && <div className="form-error">{errs.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Téléphone (optionnel)</label>
            <input className="form-input" value={form.telephone} onChange={(e) => set("telephone", e.target.value)} placeholder="+212 6 12 34 56 78" />
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input type="password" className="form-input" value={form.mot_de_passe} onChange={(e) => set("mot_de_passe", e.target.value)} />
            {errs.mot_de_passe && <div className="form-error">{errs.mot_de_passe}</div>}
            <div className="pwd-hint">
              Min. 12 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirmer le mot de passe</label>
            <input type="password" className="form-input" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} />
            {errs.confirm && <div className="form-error">{errs.confirm}</div>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <div className="auth-footer">
          Déjà un compte ?{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("login"); }}>
            Se connecter
          </a>
        </div>
      </div>
    </div>
  );
}

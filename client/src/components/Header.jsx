import { useState } from "react";

export default function Header({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const initial = user?.prenom?.[0]?.toUpperCase() || "U";

  return (
    <header className="header">
      <div className="header-left">
        <button className="icon-btn" title="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6"  x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="welcome-badge">
          <div><strong>Bienvenue :</strong> {user?.prenom} {user?.nom}</div>
          <div><strong>Profil :</strong> {user?.role === "admin" ? "Administrateur" : user?.role === "operateur" ? "Opérateur" : "Client"}</div>
        </div>
      </div>

      <div className="header-logo">
        <div className="header-logo-mark">
          <span className="ar">أمانة</span>
          <span className="fr">amana</span>
        </div>
      </div>

      <div className="header-right">
        <button className="avatar" onClick={() => setOpen(!open)}>{initial}</button>
        {open && (
          <div className="avatar-menu">
            <div className="avatar-menu-header">
              <div className="avatar-menu-name">{user?.prenom} {user?.nom}</div>
              <div className="avatar-menu-email">{user?.email}</div>
            </div>
            <button className="avatar-menu-item danger" onClick={() => { setOpen(false); onLogout(); }}>
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

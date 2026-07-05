import { useEffect, useState } from "react";
import { statsApi } from "../services/api";
import Header from "../components/Header";
import KpiCards from "../components/KpiCards";
import MesStatistiques from "../components/MesStatistiques";
import MesEnvois from "../components/MesEnvois";

const TABS = [
  { id: "stats",       label: "Mes statistiques" },
  { id: "envois",      label: "Mes envois" },
  { id: "mes-dem",     label: "Mes demandes de modification" },
  { id: "dem",         label: "Demandes de modification" },
  { id: "creer-client",label: "Créer un client" },
  { id: "creer-user",  label: "Créer un utilisateur" },
  { id: "list-user",   label: "Liste d'utilisateurs" },
];

export default function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState("stats");
  const [stats, setStats] = useState({ totalColis: 0, totalEnvois: 0, totalCRBT: 0 });

  useEffect(() => {
    statsApi.dashboard().then(({ ok, data }) => { if (ok) setStats(data); });
  }, []);

  return (
    <div className="dashboard">
      <Header user={user} onLogout={onLogout} />
      <KpiCards stats={stats} />

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="content">
        {tab === "stats"  && <MesStatistiques stats={stats} />}
        {tab === "envois" && <MesEnvois />}
        {!["stats", "envois"].includes(tab) && (
          <div className="placeholder">
            <div className="placeholder-icon">📦</div>
            <div className="placeholder-title">{TABS.find((t) => t.id === tab)?.label}</div>
            <div>Cette section sera développée prochainement.</div>
          </div>
        )}
      </div>
    </div>
  );
}

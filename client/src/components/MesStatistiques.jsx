import { useEffect, useState } from "react";
import { statsApi, refApi } from "../services/api";
import DonutChart from "./DonutChart";
import GaugeChart from "./GaugeChart";
import LineChart  from "./LineChart";
import MoroccoMap from "./MoroccoMap";

export default function MesStatistiques({ stats }) {
  const [statuts, setStatuts]     = useState([]);
  const [paiements, setPaiements] = useState({ paye: 0, impaye: 0, en_attente: 0 });
  const [villes, setVilles]       = useState([]);
  const [evolution, setEvolution] = useState([]);
  const [filters, setFilters] = useState({
    code: "", telephone: "", statut: "", ville: "", paiement: "", crbt: "",
  });

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const [s, p, v, e] = await Promise.all([
      statsApi.statuts(), statsApi.paiements(),
      statsApi.villes(), statsApi.evolution(),
    ]);
    if (s.ok) setStatuts(s.data);
    if (p.ok) setPaiements(p.data);
    if (v.ok) setVilles(v.data);
    if (e.ok) setEvolution(e.data);
  }

  const setF = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  // Statuts d'envois (simplification : mêmes données que "statuts" mais catégorisés autrement)
  const envoisData = statuts.map((s) => ({
    libelle: s.libelle,
    couleur: s.code === "livre" ? "#16a34a" : s.code === "retourne" ? "#ef4444" : "#9ca3af",
    nb: s.nb, pct: s.pct,
  }));

  return (
    <>
      <div className="section">
        <div className="section-header">
          <div className="section-title">Mes statistiques</div>
          <button className="icon-btn" onClick={loadAll} title="Rafraîchir">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
          </button>
        </div>

        <div className="filters">
          <div className="filter-group">
            <input className="filter-input" placeholder="Code envoi" value={filters.code}
                   onChange={(e) => setF("code", e.target.value)} />
            <input className="filter-input" placeholder="Tel destinataire" value={filters.telephone}
                   onChange={(e) => setF("telephone", e.target.value)} />
          </div>
          <div className="filter-group">
            <div className="filter-label">Date dépôt</div>
            <input type="date" className="filter-input" />
            <div className="filter-label">Date statut</div>
            <input type="date" className="filter-input" />
          </div>
          <div className="filter-group">
            <select className="filter-input" value={filters.statut} onChange={(e) => setF("statut", e.target.value)}>
              <option value="">Tout statut</option>
              {statuts.map((s) => <option key={s.code} value={s.code}>{s.libelle}</option>)}
            </select>
            <select className="filter-input" value={filters.ville} onChange={(e) => setF("ville", e.target.value)}>
              <option value="">Toute destination</option>
              {villes.map((v) => <option key={v.ville} value={v.ville}>{v.ville}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <select className="filter-input" value={filters.paiement} onChange={(e) => setF("paiement", e.target.value)}>
              <option value="">Paiement</option>
              <option value="paye">Payé</option>
              <option value="impaye">Impayé</option>
              <option value="en_attente">En attente</option>
            </select>
            <select className="filter-input" value={filters.crbt} onChange={(e) => setF("crbt", e.target.value)}>
              <option value="">CRBT</option>
              <option value="avec">Avec CRBT</option>
              <option value="sans">Sans CRBT</option>
            </select>
          </div>
          <div className="filter-group">
            <div className="filter-label">Date paiement</div>
            <input type="date" className="filter-input" />
          </div>
        </div>

        <div className="summary">
          {stats?.totalColis || 0} Colis / {Math.round(stats?.totalCRBT || 0).toLocaleString("fr-FR")} MAD
        </div>

        <div className="charts-row">
          <DonutChart title="Détail des statuts" data={statuts} />
          <GaugeChart title="Statut des Paiements" {...paiements} />
          <DonutChart title="Statut des envois" data={envoisData} />
        </div>

        <div className="bottom-row">
          <LineChart data={evolution} />
          <MoroccoMap villes={villes} />
        </div>
      </div>
    </>
  );
}

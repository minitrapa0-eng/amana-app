import { useEffect, useState } from "react";
import { colisApi } from "../services/api";

const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("fr-FR") + " " + dt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

export default function MesEnvois() {
  const [colis, setColis] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ code: "", telephone: "", statut: "", paiement: "" });

  useEffect(() => { load(); }, [page, perPage]);

  async function load() {
    setLoading(true);
    const params = { page, limit: perPage };
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    const { ok, data } = await colisApi.list(params);
    if (ok && data) { setColis(data.items); setTotal(data.total); }
    setLoading(false);
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const applyFilters = () => { setPage(1); load(); };

  const pageNums = pageRange(page, totalPages);

  return (
    <div className="section">
      <div className="section-header">
        <div className="section-title">Mes envois</div>
        <button className="icon-btn" onClick={load} title="Rafraîchir">↻</button>
      </div>

      <div className="filters" style={{ marginBottom: 20 }}>
        <input className="filter-input" placeholder="Code envoi" value={filters.code}
               onChange={(e) => setFilters({ ...filters, code: e.target.value })}
               onKeyDown={(e) => e.key === "Enter" && applyFilters()} />
        <input className="filter-input" placeholder="Tel destinataire" value={filters.telephone}
               onChange={(e) => setFilters({ ...filters, telephone: e.target.value })}
               onKeyDown={(e) => e.key === "Enter" && applyFilters()} />
        <select className="filter-input" value={filters.statut}
                onChange={(e) => { setFilters({ ...filters, statut: e.target.value }); }}>
          <option value="">Tout statut</option>
          <option value="en_transit">En transit</option>
          <option value="en_cours">En cours de livraison</option>
          <option value="livre">Livré</option>
          <option value="retourne">Retourné</option>
        </select>
        <select className="filter-input" value={filters.paiement}
                onChange={(e) => setFilters({ ...filters, paiement: e.target.value })}>
          <option value="">Paiement</option>
          <option value="paye">Payé</option>
          <option value="impaye">Impayé</option>
          <option value="en_attente">En attente</option>
        </select>
        <button className="btn-primary" style={{ padding: "8px 16px" }} onClick={applyFilters}>
          Filtrer
        </button>
      </div>

      <div className="summary">{total} Colis</div>

      <div className="table-wrapper">
        <table className="envois-table">
          <thead>
            <tr>
              <th></th>
              <th>Code envoi</th>
              <th>Date dépôt</th>
              <th>Destination</th>
              <th>Statut</th>
              <th>Date statut</th>
              <th>CRBT</th>
              <th>Tél destinataire</th>
              <th>Date paiement</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Chargement...</td></tr>
            ) : colis.length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Aucun colis</td></tr>
            ) : colis.map((c) => (
              <tr key={c.id_colis} className={c.statut_code || ""}>
                <td><input type="checkbox" /></td>
                <td><span className="code-envoi">{c.code_envoi}</span></td>
                <td>{fmtDate(c.date_depot)}</td>
                <td style={{ fontWeight: 600 }}>{c.ville_destination}</td>
                <td>
                  {c.statut_libelle && (
                    <span className="status-pill" style={{
                      background: (c.statut_couleur || "#94a3b8") + "22",
                      color: c.statut_couleur || "#4b5563",
                    }}>
                      <span className="status-pill-dot" style={{ background: c.statut_couleur || "#94a3b8" }} />
                      {c.statut_libelle}
                    </span>
                  )}
                </td>
                <td>{fmtDate(c.date_statut)}</td>
                <td style={{ fontWeight: 600 }}>{Number(c.crbt_montant).toLocaleString("fr-FR")} MAD</td>
                <td style={{ fontFamily: "monospace" }}>{c.telephone_destinataire}</td>
                <td>{c.date_paiement ? new Date(c.date_paiement).toLocaleDateString("fr-FR") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <div className="pagination-left">
          Éléments par page :
          <select className="pagination-select" value={perPage}
                  onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
            {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span>
            {total === 0 ? 0 : ((page - 1) * perPage + 1)}–{Math.min(page * perPage, total)} sur {total}
          </span>
        </div>
        <div className="pagination-right">
          <button className="pagination-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
          {pageNums.map((p, i) =>
            p === "…"
              ? <span key={`e${i}`} className="pagination-btn" style={{ background: "none" }}>…</span>
              : <button key={p} className={`pagination-btn ${p === page ? "active" : ""}`}
                        onClick={() => setPage(p)}>{p}</button>
          )}
          <button className="pagination-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>›</button>
        </div>
      </div>
    </div>
  );
}

function pageRange(page, totalPages) {
  const pages = [1];
  if (page > 3) pages.push("…");
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) pages.push(p);
  if (page < totalPages - 2) pages.push("…");
  if (totalPages > 1) pages.push(totalPages);
  return pages;
}

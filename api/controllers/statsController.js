const db = require("../services/db");

function getUserColis(req) {
  let items = db.findAll("colis");
  if (req.user.role === "client") items = items.filter((c) => c.id_utilisateur === req.user.id);
  return items;
}

function dernierStatutCode(id_colis) {
  const hist = db.findAll("historique_statut", (h) => h.id_colis === id_colis);
  if (!hist.length) return null;
  hist.sort((a, b) => new Date(b.date_changement) - new Date(a.date_changement));
  const s = db.findById("statuts", hist[0].id_statut, "id_statut");
  return s?.code || null;
}

// GET /api/stats/dashboard
exports.dashboard = (req, res) => {
  const colis = getUserColis(req);
  res.json({
    totalColis: colis.length,
    totalEnvois: colis.length,
    totalCRBT: colis.reduce((s, c) => s + (Number(c.crbt_montant) || 0), 0),
  });
};

// GET /api/stats/statuts
exports.repartitionStatuts = (req, res) => {
  const colis = getUserColis(req);
  const statuts = db.findAll("statuts").sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
  const total = colis.length || 1;
  const result = statuts.map((s) => {
    const nb = colis.filter((c) => dernierStatutCode(c.id_colis) === s.code).length;
    return { code: s.code, libelle: s.libelle, couleur: s.couleur, nb, pct: +(nb * 100 / total).toFixed(2) };
  }).filter((r) => r.nb > 0);
  res.json(result);
};

// GET /api/stats/paiements
exports.repartitionPaiements = (req, res) => {
  const colis = getUserColis(req);
  const paiements = db.findAll("paiements");
  const ids = new Set(colis.map((c) => c.id_colis));

  let paye = 0, impaye = 0, en_attente = 0;
  paiements.forEach((p) => {
    if (!ids.has(p.id_colis)) return;
    if (p.statut === "paye")       paye++;
    else if (p.statut === "impaye") impaye++;
    else                            en_attente++;
  });
  const total = paye + impaye + en_attente || 1;
  res.json({
    paye, impaye, en_attente,
    pct_paye:    +(paye * 100 / total).toFixed(2),
    pct_impaye:  +(impaye * 100 / total).toFixed(2),
    pct_attente: +(en_attente * 100 / total).toFixed(2),
  });
};

// GET /api/stats/villes
exports.repartitionVilles = (req, res) => {
  const colis = getUserColis(req);
  const grouped = {};
  colis.forEach((c) => {
    if (!grouped[c.id_ville]) grouped[c.id_ville] = { nb: 0, total_crbt: 0 };
    grouped[c.id_ville].nb++;
    grouped[c.id_ville].total_crbt += Number(c.crbt_montant) || 0;
  });
  const result = Object.entries(grouped).map(([id, agg]) => {
    const v = db.findById("villes", Number(id), "id_ville");
    return {
      ville: v?.nom || "Inconnue",
      lat: v?.latitude ? Number(v.latitude) : null,
      lng: v?.longitude ? Number(v.longitude) : null,
      nb: agg.nb,
      total_crbt: agg.total_crbt,
    };
  }).sort((a, b) => b.nb - a.nb);
  res.json(result);
};

// GET /api/stats/evolution
exports.evolution = (req, res) => {
  const colis = getUserColis(req);
  const grouped = {};
  colis.forEach((c) => {
    const d = new Date(c.date_depot);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!grouped[key]) grouped[key] = { nb_envois: 0, total_crbt: 0 };
    grouped[key].nb_envois++;
    grouped[key].total_crbt += Number(c.crbt_montant) || 0;
  });
  const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const result = Object.entries(grouped).sort().map(([mois, agg]) => {
    const [y, m] = mois.split("-");
    return {
      mois,
      libelle: `${MOIS[parseInt(m, 10) - 1]} ${y}`,
      nb_envois: agg.nb_envois,
      total_crbt: agg.total_crbt,
    };
  });
  res.json(result);
};

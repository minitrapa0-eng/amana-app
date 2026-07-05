const db = require("../services/db");

// Helper : retourne le dernier statut d'un colis
function dernierStatut(id_colis) {
  const historique = db.findAll("historique_statut", (h) => h.id_colis === id_colis);
  if (!historique.length) return null;
  historique.sort((a, b) => new Date(b.date_changement) - new Date(a.date_changement));
  const h = historique[0];
  const s = db.findById("statuts", h.id_statut, "id_statut");
  return { ...h, statut: s };
}

// Helper : enrichit un colis avec ses relations
function enrichir(colis) {
  const dest = db.findById("destinataires", colis.id_destinataire, "id_destinataire");
  const ville = db.findById("villes", colis.id_ville, "id_ville");
  const paiement = db.findOne("paiements", (p) => p.id_colis === colis.id_colis);
  const stat = dernierStatut(colis.id_colis);

  return {
    ...colis,
    ville_destination: ville?.nom,
    ville_lat: ville?.latitude,
    ville_lng: ville?.longitude,
    destinataire_nom: dest?.nom,
    destinataire_prenom: dest?.prenom,
    telephone_destinataire: dest?.telephone,
    adresse: dest?.adresse,
    statut_code:    stat?.statut?.code,
    statut_libelle: stat?.statut?.libelle,
    statut_couleur: stat?.statut?.couleur,
    date_statut:    stat?.date_changement,
    paiement_statut:  paiement?.statut,
    date_paiement:    paiement?.date_paiement,
    paiement_methode: paiement?.methode,
  };
}

// GET /api/colis
exports.list = (req, res) => {
  try {
    const {
      code, statut, ville, paiement, crbt,
      date_depot_debut, date_depot_fin, telephone,
      page = 1, limit = 20,
    } = req.query;

    let items = db.findAll("colis");

    // Client → filtrer sur ses colis
    if (req.user.role === "client") {
      items = items.filter((c) => c.id_utilisateur === req.user.id);
    }

    items = items.map(enrichir);

    if (code)      items = items.filter((c) => c.code_envoi.toLowerCase().includes(code.toLowerCase()));
    if (ville)     items = items.filter((c) => (c.ville_destination || "").toLowerCase().includes(ville.toLowerCase()));
    if (telephone) items = items.filter((c) => (c.telephone_destinataire || "").includes(telephone));
    if (statut)    items = items.filter((c) => c.statut_code === statut);
    if (paiement)  items = items.filter((c) => c.paiement_statut === paiement);
    if (crbt === "avec") items = items.filter((c) => c.crbt_montant > 0);
    if (crbt === "sans") items = items.filter((c) => c.crbt_montant === 0);
    if (date_depot_debut) items = items.filter((c) => new Date(c.date_depot) >= new Date(date_depot_debut));
    if (date_depot_fin)   items = items.filter((c) => new Date(c.date_depot) <= new Date(date_depot_fin));

    items.sort((a, b) => new Date(b.date_depot) - new Date(a.date_depot));

    const total = items.length;
    const p = Number(page), l = Number(limit);
    const paginated = items.slice((p - 1) * l, p * l);

    res.json({ total, page: p, limit: l, items: paginated });
  } catch (err) {
    console.error("colis.list error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// GET /api/colis/:id
exports.getById = (req, res) => {
  const colis = db.findById("colis", req.params.id, "id_colis");
  if (!colis) return res.status(404).json({ error: "Colis introuvable" });
  if (req.user.role === "client" && colis.id_utilisateur !== req.user.id)
    return res.status(403).json({ error: "Accès refusé" });

  const historique = db.findAll("historique_statut", (h) => h.id_colis === colis.id_colis)
    .sort((a, b) => new Date(b.date_changement) - new Date(a.date_changement))
    .map((h) => ({ ...h, statut: db.findById("statuts", h.id_statut, "id_statut") }));

  res.json({ ...enrichir(colis), historique });
};

// POST /api/colis
exports.create = (req, res) => {
  const { code_envoi, id_destinataire, id_ville, poids, dimensions, description, crbt_montant } = req.body;
  if (!code_envoi || !id_destinataire || !id_ville)
    return res.status(400).json({ error: "code_envoi, id_destinataire et id_ville requis" });

  if (db.findOne("colis", (c) => c.code_envoi === code_envoi))
    return res.status(409).json({ error: "Ce code envoi existe déjà" });

  const colis = db.insert("colis", {
    code_envoi,
    id_utilisateur:  req.user.id,
    id_destinataire: Number(id_destinataire),
    id_ville:        Number(id_ville),
    date_depot:      new Date().toISOString(),
    poids:           poids || null,
    dimensions:      dimensions || null,
    description:     description || null,
    crbt_montant:    Number(crbt_montant) || 0,
  }, "id_colis");

  // Statut initial "en_transit"
  const statutInitial = db.findOne("statuts", (s) => s.code === "en_transit");
  if (statutInitial) {
    db.insert("historique_statut", {
      id_colis:        colis.id_colis,
      id_statut:       statutInitial.id_statut,
      date_changement: new Date().toISOString(),
      commentaire:     "Colis créé",
    }, "id_historique");
  }

  // Paiement en attente si CRBT
  if (colis.crbt_montant > 0) {
    db.insert("paiements", {
      id_colis: colis.id_colis,
      date_paiement: null,
      montant: colis.crbt_montant,
      methode: "espece",
      statut: "en_attente",
      reference: null,
    }, "id_paiement");
  }

  res.status(201).json(colis);
};

// PUT /api/colis/:id
exports.update = (req, res) => {
  const fields = ["id_destinataire", "id_ville", "poids", "dimensions", "description", "crbt_montant"];
  const changes = {};
  fields.forEach((f) => { if (req.body[f] !== undefined) changes[f] = req.body[f]; });
  if (!Object.keys(changes).length) return res.status(400).json({ error: "Aucun champ à modifier" });

  const colis = db.update("colis", req.params.id, changes, "id_colis");
  if (!colis) return res.status(404).json({ error: "Colis introuvable" });
  res.json({ message: "Colis mis à jour", colis });
};

// POST /api/colis/:id/statut
exports.changeStatut = (req, res) => {
  const { statut_code, commentaire } = req.body;
  if (!statut_code) return res.status(400).json({ error: "statut_code requis" });

  const stat = db.findOne("statuts", (s) => s.code === statut_code);
  if (!stat) return res.status(400).json({ error: "Statut inconnu" });

  const colis = db.findById("colis", req.params.id, "id_colis");
  if (!colis) return res.status(404).json({ error: "Colis introuvable" });

  db.insert("historique_statut", {
    id_colis: colis.id_colis,
    id_statut: stat.id_statut,
    date_changement: new Date().toISOString(),
    commentaire: commentaire || null,
  }, "id_historique");

  // Auto-paiement si livré
  if (statut_code === "livre") {
    const paiement = db.findOne("paiements", (p) => p.id_colis === colis.id_colis && p.statut === "en_attente");
    if (paiement) {
      db.update("paiements", paiement.id_paiement, {
        statut: "paye",
        date_paiement: new Date().toISOString(),
      }, "id_paiement");
    }
  }

  res.json({ message: "Statut mis à jour" });
};

// DELETE /api/colis/:id
exports.remove = (req, res) => {
  const ok = db.remove("colis", req.params.id, "id_colis");
  if (!ok) return res.status(404).json({ error: "Colis introuvable" });
  db.removeWhere("historique_statut", (h) => h.id_colis === Number(req.params.id));
  db.removeWhere("paiements", (p) => p.id_colis === Number(req.params.id));
  res.json({ message: "Colis supprimé" });
};

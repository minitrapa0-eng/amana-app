const db = require("../services/db");
const bcrypt = require("bcryptjs");
const config = require("../config");

// ═══════════════════ VILLES ═══════════════════
exports.villes = {
  list:    (_req, res) => res.json(db.findAll("villes").sort((a, b) => a.nom.localeCompare(b.nom))),
  getById: (req, res) => {
    const v = db.findById("villes", req.params.id, "id_ville");
    if (!v) return res.status(404).json({ error: "Ville introuvable" });
    res.json(v);
  },
  create: (req, res) => {
    const { nom, region, code_postal, latitude, longitude } = req.body;
    if (!nom) return res.status(400).json({ error: "nom requis" });
    const v = db.insert("villes", { nom, region, code_postal, latitude, longitude }, "id_ville");
    res.status(201).json(v);
  },
  update: (req, res) => {
    const v = db.update("villes", req.params.id, req.body, "id_ville");
    if (!v) return res.status(404).json({ error: "Ville introuvable" });
    res.json(v);
  },
  remove: (req, res) => {
    if (!db.remove("villes", req.params.id, "id_ville")) return res.status(404).json({ error: "Ville introuvable" });
    res.json({ message: "Ville supprimée" });
  },
};

// ═══════════════════ DESTINATAIRES ═══════════════════
exports.destinataires = {
  list:    (_req, res) => res.json(db.findAll("destinataires")),
  getById: (req, res) => {
    const d = db.findById("destinataires", req.params.id, "id_destinataire");
    if (!d) return res.status(404).json({ error: "Destinataire introuvable" });
    res.json(d);
  },
  create: (req, res) => {
    const { nom, prenom, telephone, adresse } = req.body;
    if (!nom || !telephone) return res.status(400).json({ error: "nom et telephone requis" });
    res.status(201).json(db.insert("destinataires", { nom, prenom, telephone, adresse }, "id_destinataire"));
  },
  update: (req, res) => {
    const d = db.update("destinataires", req.params.id, req.body, "id_destinataire");
    if (!d) return res.status(404).json({ error: "Destinataire introuvable" });
    res.json(d);
  },
  remove: (req, res) => {
    if (!db.remove("destinataires", req.params.id, "id_destinataire")) return res.status(404).json({ error: "Introuvable" });
    res.json({ message: "Destinataire supprimé" });
  },
};

// ═══════════════════ STATUTS (référentiel) ═══════════════════
exports.statuts = {
  list: (_req, res) => res.json(db.findAll("statuts").sort((a, b) => (a.ordre || 0) - (b.ordre || 0))),
};

// ═══════════════════ PAIEMENTS ═══════════════════
exports.paiements = {
  list: (req, res) => {
    let items = db.findAll("paiements");
    if (req.user.role === "client") {
      const colisIds = new Set(db.findAll("colis", (c) => c.id_utilisateur === req.user.id).map((c) => c.id_colis));
      items = items.filter((p) => colisIds.has(p.id_colis));
    }
    // Ajouter le code envoi
    items = items.map((p) => {
      const c = db.findById("colis", p.id_colis, "id_colis");
      return { ...p, code_envoi: c?.code_envoi };
    });
    res.json(items);
  },
  updateStatut: (req, res) => {
    const changes = {};
    ["statut", "methode", "reference"].forEach((f) => { if (req.body[f] !== undefined) changes[f] = req.body[f]; });
    if (req.body.statut === "paye") changes.date_paiement = new Date().toISOString();
    const p = db.update("paiements", req.params.id, changes, "id_paiement");
    if (!p) return res.status(404).json({ error: "Paiement introuvable" });
    res.json(p);
  },
};

// ═══════════════════ DEMANDES DE MODIFICATION ═══════════════════
exports.demandes = {
  list: (req, res) => {
    let items = db.findAll("demandes_modification");
    if (req.user.role === "client") items = items.filter((d) => d.id_client === req.user.id);
    items = items.map((d) => {
      const c = db.findById("colis", d.id_colis, "id_colis");
      const client = db.findById("utilisateurs", d.id_client, "id_utilisateur");
      const admin = d.id_admin ? db.findById("utilisateurs", d.id_admin, "id_utilisateur") : null;
      return { ...d, code_envoi: c?.code_envoi,
               client_nom: client?.nom, client_prenom: client?.prenom,
               admin_nom: admin?.nom, admin_prenom: admin?.prenom };
    });
    res.json(items);
  },
  create: (req, res) => {
    const { id_colis, type_modif, ancienne_valeur, nouvelle_valeur } = req.body;
    if (!id_colis || !type_modif) return res.status(400).json({ error: "id_colis et type_modif requis" });
    const c = db.findById("colis", id_colis, "id_colis");
    if (!c) return res.status(404).json({ error: "Colis introuvable" });
    if (req.user.role === "client" && c.id_utilisateur !== req.user.id)
      return res.status(403).json({ error: "Accès refusé" });
    const d = db.insert("demandes_modification", {
      id_colis: Number(id_colis), id_client: req.user.id, id_admin: null,
      date_demande: new Date().toISOString(), type_modif,
      ancienne_valeur, nouvelle_valeur, statut: "en_attente",
      motif_refus: null, date_traitement: null,
    }, "id_demande");
    res.status(201).json(d);
  },
  traiter: (req, res) => {
    const { statut, motif_refus } = req.body;
    if (!["acceptee", "refusee"].includes(statut))
      return res.status(400).json({ error: "statut = 'acceptee' ou 'refusee'" });
    const d = db.update("demandes_modification", req.params.id, {
      statut, motif_refus, id_admin: req.user.id,
      date_traitement: new Date().toISOString(),
    }, "id_demande");
    if (!d) return res.status(404).json({ error: "Demande introuvable" });
    res.json(d);
  },
};

// ═══════════════════ UTILISATEURS (admin) ═══════════════════
exports.utilisateurs = {
  list: (_req, res) => {
    const items = db.findAll("utilisateurs").map((u) => {
      const nb = db.findAll("colis", (c) => c.id_utilisateur === u.id_utilisateur).length;
      return {
        id: u.id_utilisateur, nom: u.nom, prenom: u.prenom, email: u.email,
        telephone: u.telephone, role: u.role, actif: u.actif,
        date_creation: u.date_creation, nb_colis: nb,
      };
    });
    res.json(items);
  },
  create: async (req, res) => {
    const { nom, prenom, email, mot_de_passe, telephone, role } = req.body;
    if (!nom || !prenom || !email || !mot_de_passe) return res.status(400).json({ error: "Champs requis manquants" });
    if (db.findOne("utilisateurs", (u) => u.email === email))
      return res.status(409).json({ error: "Email déjà utilisé" });
    const hash = await bcrypt.hash(mot_de_passe, config.security.bcryptRounds);
    const u = db.insert("utilisateurs", {
      nom, prenom, email, telephone: telephone || null,
      mot_de_passe: hash, role: role || "client", actif: true,
      date_creation: new Date().toISOString(),
    }, "id_utilisateur");
    res.status(201).json({ id: u.id_utilisateur, email });
  },
  update: (req, res) => {
    const allowed = ["nom", "prenom", "telephone", "actif"];
    const changes = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) changes[f] = req.body[f]; });
    if (req.body.role !== undefined && req.user.role === "admin") changes.role = req.body.role;
    const u = db.update("utilisateurs", req.params.id, changes, "id_utilisateur");
    if (!u) return res.status(404).json({ error: "Utilisateur introuvable" });
    res.json({ message: "Utilisateur mis à jour" });
  },
  remove: (req, res) => {
    // Désactivation logique
    const u = db.update("utilisateurs", req.params.id, { actif: false }, "id_utilisateur");
    if (!u) return res.status(404).json({ error: "Utilisateur introuvable" });
    res.json({ message: "Utilisateur désactivé" });
  },
};

const express = require("express");
const authCtrl  = require("./controllers/authController");
const colisCtrl = require("./controllers/colisController");
const statsCtrl = require("./controllers/statsController");
const others    = require("./controllers/othersController");
const { authenticate, requireRole } = require("./middleware/auth");

const router = express.Router();

// ─── AUTH ───
router.post("/auth/register", authCtrl.register);
router.post("/auth/login",    authCtrl.login);
router.post("/auth/refresh",  authCtrl.refresh);
router.post("/auth/logout",   authCtrl.logout);
router.get ("/auth/me",       authenticate, authCtrl.me);

// ─── COLIS ───
router.get   ("/colis",           authenticate, colisCtrl.list);
router.get   ("/colis/:id",       authenticate, colisCtrl.getById);
router.post  ("/colis",           authenticate, colisCtrl.create);
router.put   ("/colis/:id",       authenticate, colisCtrl.update);
router.post  ("/colis/:id/statut",authenticate, requireRole("admin", "operateur"), colisCtrl.changeStatut);
router.delete("/colis/:id",       authenticate, requireRole("admin"), colisCtrl.remove);

// ─── STATS ───
router.get("/stats/dashboard", authenticate, statsCtrl.dashboard);
router.get("/stats/statuts",   authenticate, statsCtrl.repartitionStatuts);
router.get("/stats/paiements", authenticate, statsCtrl.repartitionPaiements);
router.get("/stats/villes",    authenticate, statsCtrl.repartitionVilles);
router.get("/stats/evolution", authenticate, statsCtrl.evolution);

// ─── VILLES ───
router.get   ("/villes",     authenticate, others.villes.list);
router.get   ("/villes/:id", authenticate, others.villes.getById);
router.post  ("/villes",     authenticate, requireRole("admin"), others.villes.create);
router.put   ("/villes/:id", authenticate, requireRole("admin"), others.villes.update);
router.delete("/villes/:id", authenticate, requireRole("admin"), others.villes.remove);

// ─── DESTINATAIRES ───
router.get   ("/destinataires",     authenticate, others.destinataires.list);
router.get   ("/destinataires/:id", authenticate, others.destinataires.getById);
router.post  ("/destinataires",     authenticate, others.destinataires.create);
router.put   ("/destinataires/:id", authenticate, others.destinataires.update);
router.delete("/destinataires/:id", authenticate, requireRole("admin"), others.destinataires.remove);

// ─── STATUTS (référentiel) ───
router.get("/statuts", authenticate, others.statuts.list);

// ─── PAIEMENTS ───
router.get  ("/paiements",     authenticate, others.paiements.list);
router.patch("/paiements/:id", authenticate, requireRole("admin", "operateur"), others.paiements.updateStatut);

// ─── DEMANDES ───
router.get  ("/demandes",             authenticate, others.demandes.list);
router.post ("/demandes",             authenticate, others.demandes.create);
router.patch("/demandes/:id/traiter", authenticate, requireRole("admin"), others.demandes.traiter);

// ─── UTILISATEURS (admin) ───
router.get   ("/utilisateurs",     authenticate, requireRole("admin"), others.utilisateurs.list);
router.post  ("/utilisateurs",     authenticate, requireRole("admin"), others.utilisateurs.create);
router.patch ("/utilisateurs/:id", authenticate, requireRole("admin"), others.utilisateurs.update);
router.delete("/utilisateurs/:id", authenticate, requireRole("admin"), others.utilisateurs.remove);

module.exports = router;

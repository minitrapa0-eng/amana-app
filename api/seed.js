// ═══════════════════════════════════════════════════════════════
//   Seed - Données initiales
//   Exécuter avec : npm run seed
// ═══════════════════════════════════════════════════════════════

const bcrypt = require("bcryptjs");
const db = require("./services/db");

async function seed() {
  console.log("→ Suppression des données existantes...");
  ["utilisateurs","villes","destinataires","statuts","colis",
   "historique_statut","paiements","demandes_modification",
   "jetons_rafraichissement","tentatives_connexion"
  ].forEach((t) => db.reset(t));

  console.log("→ Insertion des statuts...");
  db.bulkInsert("statuts", [
    { code: "en_transit", libelle: "En transit",            couleur: "#f59e0b", ordre: 1 },
    { code: "en_cours",   libelle: "En cours de livraison", couleur: "#3b82f6", ordre: 2 },
    { code: "livre",      libelle: "Envoi livré",           couleur: "#16a34a", ordre: 3 },
    { code: "retourne",   libelle: "Retourné",              couleur: "#ef4444", ordre: 4 },
    { code: "perdu",      libelle: "Perdu",                 couleur: "#1f2937", ordre: 5 },
  ], "id_statut");

  console.log("→ Insertion des villes marocaines...");
  db.bulkInsert("villes", [
    { nom: "Casablanca", region: "Casablanca-Settat",       code_postal: "20000", latitude: 33.5731, longitude: -7.5898 },
    { nom: "Rabat",      region: "Rabat-Salé-Kénitra",      code_postal: "10000", latitude: 34.0209, longitude: -6.8416 },
    { nom: "Fès",        region: "Fès-Meknès",              code_postal: "30000", latitude: 34.0331, longitude: -5.0003 },
    { nom: "Meknès",     region: "Fès-Meknès",              code_postal: "50000", latitude: 33.8935, longitude: -5.5473 },
    { nom: "Marrakech",  region: "Marrakech-Safi",          code_postal: "40000", latitude: 31.6295, longitude: -7.9811 },
    { nom: "Tanger",     region: "Tanger-Tétouan",          code_postal: "90000", latitude: 35.7595, longitude: -5.8340 },
    { nom: "Tétouan",    region: "Tanger-Tétouan",          code_postal: "93000", latitude: 35.5785, longitude: -5.3684 },
    { nom: "Agadir",     region: "Souss-Massa",             code_postal: "80000", latitude: 30.4278, longitude: -9.5981 },
    { nom: "Kénitra",    region: "Rabat-Salé-Kénitra",      code_postal: "14000", latitude: 34.2610, longitude: -6.5802 },
    { nom: "Salé",       region: "Rabat-Salé-Kénitra",      code_postal: "11000", latitude: 34.0531, longitude: -6.7985 },
    { nom: "Oujda",      region: "Oriental",                code_postal: "60000", latitude: 34.6867, longitude: -1.9114 },
    { nom: "Khouribga",  region: "Béni Mellal-Khénifra",    code_postal: "25000", latitude: 32.8811, longitude: -6.9063 },
    { nom: "Settat",     region: "Casablanca-Settat",       code_postal: "26000", latitude: 33.0000, longitude: -7.6167 },
    { nom: "El Jadida",  region: "Casablanca-Settat",       code_postal: "24000", latitude: 33.2316, longitude: -8.5007 },
    { nom: "Merzouga",   region: "Drâa-Tafilalet",          code_postal: "52202", latitude: 31.0999, longitude: -4.0128 },
    { nom: "Ouarzazate", region: "Drâa-Tafilalet",          code_postal: "45000", latitude: 30.9189, longitude: -6.8934 },
    { nom: "Guelmim",    region: "Guelmim-Oued Noun",       code_postal: "81000", latitude: 28.9870, longitude: -10.0574 },
    { nom: "Laâyoune",   region: "Laâyoune-Sakia El Hamra", code_postal: "70000", latitude: 27.1418, longitude: -13.1875 },
    { nom: "Dakhla",     region: "Dakhla-Oued Ed-Dahab",    code_postal: "73000", latitude: 23.6848, longitude: -15.9578 },
    { nom: "Tinejdad",   region: "Drâa-Tafilalet",          code_postal: "52450", latitude: 31.5265, longitude: -5.0472 },
  ], "id_ville");

  console.log("→ Insertion des utilisateurs (mot de passe : Amana@2025)...");
  const hash = await bcrypt.hash("Amana@2025", 10);
  db.bulkInsert("utilisateurs", [
    { nom: "Admin",     prenom: "Super",    email: "admin@amana.ma",           telephone: "+212600000000", mot_de_passe: hash, role: "admin",     actif: true, date_creation: new Date().toISOString() },
    { nom: "Touimi",    prenom: "Rachid",   email: "rachid.touimi@amana.ma",   telephone: "+212611111111", mot_de_passe: hash, role: "client",    actif: true, date_creation: new Date().toISOString() },
    { nom: "Bennani",   prenom: "Sara",     email: "sara.bennani@gmail.com",   telephone: "+212622222222", mot_de_passe: hash, role: "client",    actif: true, date_creation: new Date().toISOString() },
    { nom: "Alami",     prenom: "Karim",    email: "karim.alami@outlook.fr",   telephone: "+212633333333", mot_de_passe: hash, role: "client",    actif: true, date_creation: new Date().toISOString() },
    { nom: "Operator",  prenom: "Amana",    email: "ops@amana.ma",             telephone: "+212644444444", mot_de_passe: hash, role: "operateur", actif: true, date_creation: new Date().toISOString() },
  ], "id_utilisateur");

  console.log("→ Insertion des destinataires...");
  db.bulkInsert("destinataires", [
    { nom: "El Amrani", prenom: "Youssef", telephone: "0629548466", adresse: "12 rue Ibn Sina" },
    { nom: "Cherkaoui", prenom: "Fatima",  telephone: "0629548466", adresse: "Résidence Al Manar" },
    { nom: "Rachidi",   prenom: "Anas",    telephone: "0629548466", adresse: "Boulevard Hassan II" },
    { nom: "Bouazza",   prenom: "Malika",  telephone: "0629548466", adresse: "45 avenue Mohammed V" },
    { nom: "Nassiri",   prenom: "Hicham",  telephone: "0629548466", adresse: "Lotissement Al Wafa" },
    { nom: "Zerouali",  prenom: "Nadia",   telephone: "0629548466", adresse: "Rue de la Kasbah" },
    { nom: "Ouazzani",  prenom: "Karim",   telephone: "0629548466", adresse: "Riad Andalous" },
    { nom: "Idrissi",   prenom: "Amine",   telephone: "0629548466", adresse: "Bd Zerktouni" },
    { nom: "Bakkali",   prenom: "Salma",   telephone: "0629548466", adresse: "Rue Al Massira" },
    { nom: "Berrada",   prenom: "Omar",    telephone: "0629548466", adresse: "Complexe UN" },
  ], "id_destinataire");

  console.log("→ Insertion des colis + historique + paiements...");
  // Rachid = client id=2
  const colisSpec = [
    { code: "QB228184565MA", dest: 1,  ville: 10, jour: "2025-12-08", h: "17:46", crbt: 6650,  statut: "livre",   dateStatut: "2025-12-09T12:10:00", paye: true,  datePaye: "2025-12-09T12:15:00" },
    { code: "QB228183922MA", dest: 2,  ville: 19, jour: "2025-12-04", h: "16:49", crbt: 5400,  statut: "en_cours",dateStatut: "2025-12-09T10:17:00", paye: false },
    { code: "QB229489245MA", dest: 3,  ville: 9,  jour: "2025-12-08", h: "17:46", crbt: 9000,  statut: "en_transit",dateStatut: "2025-12-08T19:31:00", paye: false },
    { code: "QB228272004MA", dest: 4,  ville: 18, jour: "2025-12-08", h: "17:58", crbt: 10050, statut: "en_transit",dateStatut: "2025-12-08T19:19:00", paye: false },
    { code: "QB228184525MA", dest: 5,  ville: 20, jour: "2025-12-08", h: "17:58", crbt: 3150,  statut: "en_transit",dateStatut: "2025-12-08T19:14:00", paye: false },
    { code: "QB228184551MA", dest: 6,  ville: 17, jour: "2025-12-08", h: "17:58", crbt: 6750,  statut: "en_transit",dateStatut: "2025-12-08T19:09:00", paye: false },
    { code: "QB207930157MA", dest: 7,  ville: 12, jour: "2025-08-11", h: "17:48", crbt: 6000,  statut: "livre",   dateStatut: "2025-08-13T15:44:00", paye: true,  datePaye: "2025-08-18T10:00:00" },
    { code: "QB208133718MA", dest: 8,  ville: 20, jour: "2025-08-08", h: "17:16", crbt: 8300,  statut: "livre",   dateStatut: "2025-08-13T15:22:00", paye: true,  datePaye: "2025-08-14T11:30:00" },
    { code: "QB207930165MA", dest: 9,  ville: 6,  jour: "2025-08-11", h: "17:48", crbt: 6950,  statut: "livre",   dateStatut: "2025-08-13T13:37:00", paye: true,  datePaye: "2025-08-15T14:00:00" },
    { code: "QB207930171MA", dest: 10, ville: 1,  jour: "2025-08-12", h: "16:56", crbt: 5340,  statut: "livre",   dateStatut: "2025-08-13T10:33:00", paye: true,  datePaye: "2025-08-15T16:45:00" },
    { code: "QB207930189MA", dest: 1,  ville: 2,  jour: "2025-08-09", h: "09:12", crbt: 4200,  statut: "livre",   dateStatut: "2025-08-11T14:25:00", paye: true,  datePaye: "2025-08-13T09:00:00" },
    { code: "QB207930192MA", dest: 2,  ville: 5,  jour: "2025-08-10", h: "11:30", crbt: 7800,  statut: "livre",   dateStatut: "2025-08-12T09:18:00", paye: true,  datePaye: "2025-08-14T10:15:00" },
    { code: "QB207930205MA", dest: 3,  ville: 8,  jour: "2025-08-10", h: "14:22", crbt: 5500,  statut: "livre",   dateStatut: "2025-08-12T16:40:00", paye: true,  datePaye: "2025-08-14T14:30:00" },
    { code: "QB207930218MA", dest: 4,  ville: 3,  jour: "2025-08-11", h: "08:45", crbt: 4800,  statut: "livre",   dateStatut: "2025-08-13T11:12:00", paye: true,  datePaye: "2025-08-15T09:00:00" },
    { code: "QB207930224MA", dest: 5,  ville: 4,  jour: "2025-08-11", h: "10:18", crbt: 3900,  statut: "livre",   dateStatut: "2025-08-13T09:55:00", paye: true,  datePaye: "2025-08-15T11:45:00" },
  ];

  const statutsMap = {};
  db.findAll("statuts").forEach((s) => statutsMap[s.code] = s.id_statut);

  colisSpec.forEach((c) => {
    const colis = db.insert("colis", {
      code_envoi: c.code, id_utilisateur: 2, id_destinataire: c.dest, id_ville: c.ville,
      date_depot: `${c.jour}T${c.h}:00`, poids: 1.5, dimensions: "30x20x15",
      description: "Colis standard", crbt_montant: c.crbt,
    }, "id_colis");

    // Statut initial
    db.insert("historique_statut", {
      id_colis: colis.id_colis, id_statut: statutsMap.en_transit,
      date_changement: `${c.jour}T${c.h}:00`, commentaire: "Colis créé",
    }, "id_historique");

    // Statut final si différent
    if (c.statut !== "en_transit") {
      db.insert("historique_statut", {
        id_colis: colis.id_colis, id_statut: statutsMap[c.statut],
        date_changement: c.dateStatut, commentaire: c.statut === "livre" ? "Livré au destinataire" : "En cours",
      }, "id_historique");
    }

    // Paiement
    db.insert("paiements", {
      id_colis: colis.id_colis,
      date_paiement: c.paye ? c.datePaye : null,
      montant: c.crbt,
      methode: "espece",
      statut: c.paye ? "paye" : "en_attente",
      reference: c.paye ? `PAY-${colis.id_colis.toString().padStart(4, "0")}` : null,
    }, "id_paiement");
  });

  console.log("\n✓ Seed terminé");
  console.log("  Comptes (mot de passe : Amana@2025)");
  console.log("    - admin@amana.ma          (admin)");
  console.log("    - rachid.touimi@amana.ma  (client)");
  console.log("    - sara.bennani@gmail.com  (client)");
  console.log("    - ops@amana.ma            (operateur)");
}

seed().catch((err) => { console.error("Erreur seed :", err); process.exit(1); });

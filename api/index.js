const express      = require("express");
const cookieParser = require("cookie-parser");
const cors         = require("cors");
const config       = require("./config");

const app = express();

app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (config.nodeEnv === "development") {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString().substring(11,19)} ${req.method.padEnd(6)} ${req.originalUrl}`);
    next();
  });
}

app.get("/", (_req, res) => {
  res.json({
    name: "Amana API",
    version: "1.0.0",
    status: "running",
    storage: "JSON files (./data/)",
    endpoints: {
      auth:  "/api/auth/{register,login,refresh,logout,me}",
      colis: "/api/colis",
      stats: "/api/stats/{dashboard,statuts,paiements,villes,evolution}",
      autre: "/api/{villes,destinataires,statuts,paiements,demandes,utilisateurs}",
    },
  });
});

app.use("/api", require("./routes"));

app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} introuvable` }));
app.use((err, _req, res, _next) => {
  console.error("Erreur non gérée :", err);
  res.status(500).json({ error: "Erreur serveur inattendue" });
});

app.listen(config.port, () => {
  console.log("╔═════════════════════════════════════════════╗");
  console.log("║   AMANA API                                 ║");
  console.log("╚═════════════════════════════════════════════╝");
  console.log(`✓ Serveur : http://localhost:${config.port}`);
  console.log(`✓ CORS    : ${config.frontendUrl}`);
  console.log(`✓ Storage : JSON files (./data/)`);
  console.log(`\n  Tip : lancer 'npm run seed' pour créer les données de test\n`);
});

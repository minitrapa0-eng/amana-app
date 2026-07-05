# Amana — Plateforme de gestion de colis

Projet complet **Node.js + Express + React** avec **stockage JSON** (pas de base de données à installer).

## 📁 Structure

```
amana/
├── api/        # Backend Node.js + Express (stockage JSON)
└── client/     # Frontend React + Vite
```

## 🚀 Démarrage

### 1. Backend (dans un terminal)

```bash
cd api
npm install
cp .env.example .env       # optionnel, valeurs par défaut OK en dev
npm run seed               # crée les données de test dans ./data/
npm start
```

L'API tourne sur **http://localhost:4000**

### 2. Frontend (dans un AUTRE terminal)

```bash
cd client
npm install
npm run dev
```

L'application est sur **http://localhost:5173**

## 🔑 Comptes de test

Mot de passe pour tous : **`Amana@2025`**

| Email | Rôle |
|---|---|
| admin@amana.ma | Admin |
| rachid.touimi@amana.ma | Client (15 colis) |
| sara.bennani@gmail.com | Client |
| ops@amana.ma | Opérateur |

## ✅ Fonctionnalités

- ✔️ **Inscription / connexion** avec JWT (access + refresh)
- ✔️ **Protection anti brute-force** (5 essais / 15 min)
- ✔️ **Dashboard** avec 3 KPI (colis, envois, CRBT)
- ✔️ **Statistiques visuelles** :
  - Donut "Détail des statuts"
  - Jauge "Statut des paiements"
  - Donut "Statut des envois"
  - Line chart évolution mensuelle
  - Carte du Maroc avec marqueurs par ville
- ✔️ **Mes envois** : tableau des colis avec filtres et pagination
- ✔️ **API REST** complète : colis, villes, destinataires, statuts, paiements, demandes, utilisateurs

## 🛠️ Stack

- **Backend** : Node.js + Express + JWT (jsonwebtoken) + bcryptjs
- **Frontend** : React 18 + Vite + CSS pur
- **Stockage** : fichiers JSON dans `api/data/`

## 📡 Endpoints principaux

- `POST /api/auth/{register,login,refresh,logout}` + `GET /api/auth/me`
- `GET|POST|PUT|DELETE /api/colis[/:id]`
- `POST /api/colis/:id/statut`
- `GET /api/stats/{dashboard,statuts,paiements,villes,evolution}`
- `GET|POST|PUT|DELETE /api/{villes,destinataires,paiements,demandes,utilisateurs}`

Voir le README dans `api/` pour tous les détails.

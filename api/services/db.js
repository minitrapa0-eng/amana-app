// ═══════════════════════════════════════════════════════════════
//   Stockage JSON (remplace MariaDB)
//   Chaque "table" = 1 fichier JSON avec { lastId, items: [] }
// ═══════════════════════════════════════════════════════════════

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Charge une table (retourne { lastId, items: [] })
function load(table) {
  const filepath = path.join(DATA_DIR, `${table}.json`);
  if (!fs.existsSync(filepath)) return { lastId: 0, items: [] };
  try {
    return JSON.parse(fs.readFileSync(filepath, "utf8"));
  } catch {
    return { lastId: 0, items: [] };
  }
}

// Sauvegarde une table
function save(table, data) {
  const filepath = path.join(DATA_DIR, `${table}.json`);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf8");
}

// ─── Opérations CRUD ───

function findAll(table, filterFn) {
  const data = load(table);
  return filterFn ? data.items.filter(filterFn) : data.items;
}

function findOne(table, filterFn) {
  const data = load(table);
  return data.items.find(filterFn) || null;
}

function findById(table, id, idField = "id") {
  return findOne(table, (x) => x[idField] === Number(id));
}

function insert(table, obj, idField = "id") {
  const data = load(table);
  data.lastId = (data.lastId || 0) + 1;
  const newItem = { [idField]: data.lastId, ...obj };
  data.items.push(newItem);
  save(table, data);
  return newItem;
}

function update(table, id, changes, idField = "id") {
  const data = load(table);
  const idx = data.items.findIndex((x) => x[idField] === Number(id));
  if (idx === -1) return null;
  data.items[idx] = { ...data.items[idx], ...changes };
  save(table, data);
  return data.items[idx];
}

function remove(table, id, idField = "id") {
  const data = load(table);
  const idx = data.items.findIndex((x) => x[idField] === Number(id));
  if (idx === -1) return false;
  data.items.splice(idx, 1);
  save(table, data);
  return true;
}

function removeWhere(table, filterFn) {
  const data = load(table);
  const before = data.items.length;
  data.items = data.items.filter((x) => !filterFn(x));
  save(table, data);
  return before - data.items.length;
}

// Bulk insert (pour le seed)
function bulkInsert(table, arr, idField = "id") {
  const data = load(table);
  arr.forEach((obj) => {
    data.lastId = (data.lastId || 0) + 1;
    data.items.push({ [idField]: data.lastId, ...obj });
  });
  save(table, data);
}

// Nettoie tout (pour le seed)
function reset(table) {
  save(table, { lastId: 0, items: [] });
}

module.exports = {
  load, save,
  findAll, findOne, findById,
  insert, update, remove, removeWhere,
  bulkInsert, reset,
  DATA_DIR,
};

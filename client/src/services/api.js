// ═══════════════════════════════════════════════════════════════
//   Service API - fetch + gestion JWT (access + refresh)
// ═══════════════════════════════════════════════════════════════

const API = "/api"; // proxy via vite.config.js vers http://localhost:4000

const TOKEN_KEY = "amana_access_token";
const USER_KEY  = "amana_user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const getUser = () => {
  const s = localStorage.getItem(USER_KEY);
  return s ? JSON.parse(s) : null;
};
export const setUser = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u));
export const removeUser = () => localStorage.removeItem(USER_KEY);

// ─── Refresh silencieux ───
let refreshing = null;

async function tryRefresh() {
  if (refreshing) return refreshing;
  refreshing = fetch(`${API}/auth/refresh`, { method: "POST", credentials: "include" })
    .then((r) => r.ok ? r.json() : null)
    .then((data) => {
      if (data?.accessToken) { setToken(data.accessToken); return true; }
      return false;
    })
    .catch(() => false)
    .finally(() => { refreshing = null; });
  return refreshing;
}

// ─── Fetch avec auth + auto-refresh ───
export async function authFetch(path, options = {}) {
  const doFetch = async () => {
    const token = getToken();
    return fetch(`${API}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  };

  let res = await doFetch();
  if (res.status === 401) {
    const ok = await tryRefresh();
    if (ok) res = await doFetch();
  }
  return { ok: res.ok, status: res.status, data: await res.json().catch(() => null) };
}

// ═══════════════════ AUTH API ═══════════════════
export const authApi = {
  async register(body) {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data) { setToken(data.accessToken); setUser(data.user); }
    return { ok: res.ok, status: res.status, data };
  },

  async login(email, mot_de_passe) {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, mot_de_passe }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data) { setToken(data.accessToken); setUser(data.user); }
    return { ok: res.ok, status: res.status, data };
  },

  async me() {
    const { ok, data } = await authFetch("/auth/me");
    return ok ? data : null;
  },

  async logout() {
    await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    removeToken(); removeUser();
  },
};

// ═══════════════════ COLIS API ═══════════════════
export const colisApi = {
  list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return authFetch(`/colis${query ? "?" + query : ""}`);
  },
  getById(id) { return authFetch(`/colis/${id}`); },
  create(body) { return authFetch(`/colis`, { method: "POST", body: JSON.stringify(body) }); },
};

// ═══════════════════ STATS API ═══════════════════
export const statsApi = {
  dashboard() { return authFetch("/stats/dashboard"); },
  statuts()   { return authFetch("/stats/statuts"); },
  paiements() { return authFetch("/stats/paiements"); },
  villes()    { return authFetch("/stats/villes"); },
  evolution() { return authFetch("/stats/evolution"); },
};

// ═══════════════════ RÉFÉRENTIELS ═══════════════════
export const refApi = {
  villes()  { return authFetch("/villes"); },
  statuts() { return authFetch("/statuts"); },
};

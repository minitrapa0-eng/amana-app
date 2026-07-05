import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { authApi, getUser, getToken } from "./services/api";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkSession(); }, []);

  async function checkSession() {
    const token = getToken();
    const savedUser = getUser();
    if (token && savedUser) {
      const me = await authApi.me();
      if (me) {
        setUser(me);
        setPage("dashboard");
      }
    }
    setLoading(false);
  }

  const navigate = (p) => setPage(p);

  const onLogin = (u) => {
    setUser(u);
    setPage("dashboard");
  };

  const onLogout = async () => {
    await authApi.logout();
    setUser(null);
    setPage("login");
  };

  if (loading) return <div className="loading">Chargement...</div>;

  if (page === "login")    return <Login navigate={navigate} onLogin={onLogin} />;
  if (page === "register") return <Register navigate={navigate} onLogin={onLogin} />;
  if (page === "dashboard" && user) return <Dashboard user={user} onLogout={onLogout} />;

  return <Login navigate={navigate} onLogin={onLogin} />;
}

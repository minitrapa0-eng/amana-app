export default function KpiCards({ stats }) {
  const cards = [
    { label: "Nb. Colis affiché",         value: stats?.totalColis ?? "—",   icon: "✉", color: "#ee5a24", accent: "#ee5a24" },
    { label: "Total envois de la période", value: stats?.totalEnvois ?? "—", icon: "📦", color: "#f4a261", accent: "#f4a261" },
    { label: "Total CRBT",                 value: stats?.totalCRBT != null ? `${Math.round(stats.totalCRBT).toLocaleString("fr-FR")} MAD` : "—", icon: "💵", color: "#3b82f6", accent: "#3b82f6" },
  ];
  return (
    <div className="kpi-row">
      {cards.map((c, i) => (
        <div key={i} className="kpi-card">
          <div className="kpi-card-body">
            <div>
              <div className="kpi-card-label">{c.label}</div>
              <div className="kpi-card-value">{c.value}</div>
            </div>
            <div className="kpi-card-icon" style={{ color: c.color }}>{c.icon}</div>
          </div>
          <div className="kpi-card-bar" style={{ background: c.accent }} />
        </div>
      ))}
    </div>
  );
}

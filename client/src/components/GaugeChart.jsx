// Gauge : jauge demi-cercle pour "Statut des paiements"
export default function GaugeChart({ title, paye = 0, impaye = 0, en_attente = 0 }) {
  const total = paye + impaye + en_attente || 1;
  const pctPaye = (paye * 100 / total).toFixed(2);

  const cx = 100, cy = 130, r = 65, w = 22;
  const start = Math.PI;
  const totalRad = Math.PI;

  const payeAngle    = start + (paye / total) * totalRad;
  const impayeAngle  = payeAngle + (impaye / total) * totalRad;
  const attenteAngle = impayeAngle + (en_attente / total) * totalRad;

  return (
    <div className="chart-card">
      <div className="chart-title">{title}</div>
      <div style={{ position: "relative" }}>
        <svg width="100%" height="200" viewBox="0 0 200 200">
          <path d={arc(cx, cy, r, w, start, payeAngle)}    fill="#3b82f6" />
          <path d={arc(cx, cy, r, w, payeAngle, impayeAngle)} fill="#ef4444" />
          <path d={arc(cx, cy, r, w, impayeAngle, attenteAngle)} fill="#9ca3af" />
          <text x={cx} y={cy - 15} textAnchor="middle" fontSize="20" fontWeight="700" fill="#1f2937">
            {pctPaye}%
          </text>
          <text x={cx} y={cy + 5} textAnchor="middle" fontSize="11" fill="#6b7280">
            Payé
          </text>
        </svg>
      </div>
      <div className="chart-legend">
        <div className="chart-legend-item"><span className="chart-legend-dot" style={{ background: "#ef4444" }} />Impayé ({impaye})</div>
        <div className="chart-legend-item"><span className="chart-legend-dot" style={{ background: "#3b82f6" }} />Payé ({paye})</div>
        {en_attente > 0 && <div className="chart-legend-item"><span className="chart-legend-dot" style={{ background: "#9ca3af" }} />En attente ({en_attente})</div>}
      </div>
    </div>
  );
}

function arc(cx, cy, r, w, start, end) {
  const rInner = r - w;
  const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
  const x3 = cx + rInner * Math.cos(end),   y3 = cy + rInner * Math.sin(end);
  const x4 = cx + rInner * Math.cos(start), y4 = cy + rInner * Math.sin(start);
  const large = (end - start) > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4} Z`;
}

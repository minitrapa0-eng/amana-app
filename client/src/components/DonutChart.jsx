// Donut chart : reçoit [{ libelle, couleur, nb, pct }, ...]
export default function DonutChart({ title, data = [] }) {
  const total = data.reduce((s, d) => s + d.nb, 0) || 1;
  const cx = 100, cy = 100, r = 65, w = 22;

  let startAngle = -Math.PI / 2;
  const arcs = data.map((d) => {
    const angle = (d.nb / total) * Math.PI * 2;
    const endAngle = startAngle + angle;
    const arc = describeArc(cx, cy, r, w, startAngle, endAngle);
    const midAngle = (startAngle + endAngle) / 2;
    const labelR = r - w / 2;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);
    startAngle = endAngle;
    return { path: arc, color: d.couleur, pct: d.pct, lx, ly, big: d.pct >= 4 };
  });

  return (
    <div className="chart-card">
      <div className="chart-title">{title}</div>
      <svg width="100%" height="200" viewBox="0 0 200 200">
        {arcs.map((a, i) => (
          <path key={i} d={a.path} fill={a.color} stroke="#fff" strokeWidth="2" />
        ))}
        {arcs.map((a, i) => a.big && (
          <text key={`t${i}`} x={a.lx} y={a.ly} textAnchor="middle" dominantBaseline="central"
                fill="#fff" fontSize="11" fontWeight="700">
            {a.pct}%
          </text>
        ))}
      </svg>
      <div className="chart-legend">
        {data.map((d, i) => (
          <div key={i} className="chart-legend-item">
            <span className="chart-legend-dot" style={{ background: d.couleur }} />
            <span>{d.libelle}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Génère un path SVG pour un arc "donut"
function describeArc(cx, cy, r, w, start, end) {
  const rInner = r - w;
  const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
  const x3 = cx + rInner * Math.cos(end),   y3 = cy + rInner * Math.sin(end);
  const x4 = cx + rInner * Math.cos(start), y4 = cy + rInner * Math.sin(start);
  const large = (end - start) > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4} Z`;
}

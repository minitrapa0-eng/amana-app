// Line chart : évolution CRBT + envois par mois
export default function LineChart({ data = [] }) {
  const W = 500, H = 300, PAD_L = 50, PAD_R = 30, PAD_T = 30, PAD_B = 60;
  const CW = W - PAD_L - PAD_R, CH = H - PAD_T - PAD_B;

  const maxCrbt = Math.max(...data.map((d) => d.total_crbt), 1);
  const maxEnvois = Math.max(...data.map((d) => d.nb_envois), 1);
  const n = data.length;

  const xPos = (i) => n === 1 ? PAD_L + CW / 2 : PAD_L + (i * CW) / (n - 1);
  const yCrbt   = (v) => PAD_T + CH - (v / maxCrbt) * CH;
  const yEnvois = (v) => PAD_T + CH - (v / maxEnvois) * CH;

  const pathCrbt   = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xPos(i)} ${yCrbt(d.total_crbt)}`).join(" ");
  const pathEnvois = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xPos(i)} ${yEnvois(d.nb_envois)}`).join(" ");

  return (
    <div className="line-card">
      <div style={{ display: "flex", justifyContent: "center", gap: 20, fontSize: 12, marginBottom: 8 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ee5a24" }} />
          Total CRBT
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" }} />
          Total Envois
        </span>
      </div>

      {n === 0 ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 250, color: "#9ca3af" }}>
          Aucune donnée
        </div>
      ) : (
        <svg width="100%" height="300" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          {/* Grille horizontale */}
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
            <line key={i}
              x1={PAD_L} x2={PAD_L + CW}
              y1={PAD_T + CH * r} y2={PAD_T + CH * r}
              stroke="#e5e7eb" strokeWidth="1" />
          ))}
          {/* Lignes verticales des mois */}
          {data.map((_, i) => (
            <line key={i}
              x1={xPos(i)} x2={xPos(i)}
              y1={PAD_T} y2={PAD_T + CH}
              stroke="#e5e7eb" strokeDasharray="2,3" />
          ))}

          {/* Ligne CRBT */}
          <path d={pathCrbt} fill="none" stroke="#ee5a24" strokeWidth="2" />
          {data.map((d, i) => (
            <circle key={`c${i}`} cx={xPos(i)} cy={yCrbt(d.total_crbt)} r="5" fill="#ee5a24" stroke="#fff" strokeWidth="2" />
          ))}
          {/* Ligne Envois */}
          <path d={pathEnvois} fill="none" stroke="#3b82f6" strokeWidth="2" />
          {data.map((d, i) => (
            <circle key={`e${i}`} cx={xPos(i)} cy={yEnvois(d.nb_envois)} r="5" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
          ))}

          {/* Labels X */}
          {data.map((d, i) => (
            <text key={`x${i}`} x={xPos(i)} y={H - 30}
                  textAnchor="end" fontSize="11" fill="#6b7280"
                  transform={`rotate(-35, ${xPos(i)}, ${H - 30})`}>
              {d.libelle}
            </text>
          ))}
        </svg>
      )}
    </div>
  );
}

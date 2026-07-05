import { useState } from "react";

// Carte simplifiée du Maroc avec marqueurs pour chaque ville
export default function MoroccoMap({ villes = [] }) {
  const [hovered, setHovered] = useState(null);

  // Coordonnées relatives approximatives pour placer les villes sur le SVG
  // (calibrées visuellement à partir de la carte de fond)
  const VILLE_COORDS = {
    "Casablanca": { x: 145, y: 215 },
    "Rabat":      { x: 175, y: 155 },
    "Fès":        { x: 235, y: 115 },
    "Meknès":     { x: 210, y: 125 },
    "Marrakech":  { x: 165, y: 260 },
    "Tanger":     { x: 240, y: 60 },
    "Tétouan":    { x: 290, y: 80 },
    "Agadir":     { x: 90,  y: 265 },
    "Kénitra":    { x: 190, y: 130 },
    "Salé":       { x: 178, y: 148 },
    "Oujda":      { x: 340, y: 105 },
    "Khouribga":  { x: 200, y: 200 },
    "Settat":     { x: 175, y: 210 },
    "El Jadida":  { x: 130, y: 225 },
    "Merzouga":   { x: 305, y: 175 },
    "Ouarzazate": { x: 200, y: 270 },
    "Guelmim":    { x: 75,  y: 300 },
    "Laâyoune":   { x: 55,  y: 340 },
    "Dakhla":     { x: 30,  y: 380 },
    "Tinejdad":   { x: 260, y: 200 },
  };

  return (
    <div className="map-card">
      <svg viewBox="0 0 420 380" width="100%" height="100%">
        {/* Contours simplifiés du Maroc */}
        <path
          d="M 95 50 L 130 45 L 165 50 L 200 48 L 235 52 L 260 55 L 280 62 L 295 72 L 305 88 L 318 95 L 330 110 L 335 130 L 332 150 L 325 168 L 320 188 L 315 205 L 308 222 L 295 240 L 280 258 L 262 275 L 240 290 L 215 302 L 188 312 L 158 320 L 125 325 L 95 322 L 70 315 L 55 302 L 50 285 L 58 265 L 70 245 L 78 225 L 82 205 L 78 185 L 75 165 L 78 145 L 82 125 L 85 105 L 88 85 L 92 65 Z"
          fill="#e5e7eb"
          stroke="#9ca3af"
          strokeWidth="1"
        />
        <path
          d="M 95 322 L 60 360 L 55 380 L 110 380 L 145 350 L 158 320 Z"
          fill="#eef0f3"
          stroke="#9ca3af"
          strokeWidth="1"
        />

        {/* Marqueurs des villes */}
        {villes.map((v, i) => {
          const coords = VILLE_COORDS[v.ville];
          if (!coords) return null;
          const r = v.nb >= 20 ? 18 : v.nb >= 5 ? 14 : 10;
          const color = v.ville === "Merzouga" ? "#ee5a24" : "#3b82f6";
          const isHovered = hovered?.ville === v.ville;
          return (
            <g key={i}
               onMouseEnter={() => setHovered(v)}
               onMouseLeave={() => setHovered(null)}
               style={{ cursor: "pointer" }}>
              <circle
                cx={coords.x} cy={coords.y} r={r}
                fill={color} stroke="#fff" strokeWidth="2"
                opacity={hovered && !isHovered ? 0.5 : 1}
              />
              <text
                x={coords.x} y={coords.y + 4}
                textAnchor="middle" fill="#fff"
                fontSize="11" fontWeight="700"
              >
                {v.nb}
              </text>
              {v.ville === "Merzouga" && (
                <text x={coords.x} y={coords.y + r + 12}
                      textAnchor="middle" fontSize="9" fontWeight="600" fill="#333">
                  MERZOUGA
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {hovered && (
        <div style={{
          position: "absolute", bottom: 12, left: 12,
          background: "white", border: "1px solid #e5e7eb",
          borderRadius: 6, padding: "6px 10px", fontSize: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}>
          <div style={{ fontWeight: 600 }}>{hovered.ville}</div>
          <div style={{ color: "#6b7280" }}>{hovered.nb} colis • {Math.round(hovered.total_crbt).toLocaleString("fr-FR")} MAD</div>
        </div>
      )}
    </div>
  );
}

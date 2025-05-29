import React from "react";
import "../app/css/FullScreenMap.css";

// Datos de los edificios (5x5)
const buildings = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `Edificio ${i + 1}`,
  sector: i % 3 === 0 ? "Tecnología" : i % 2 === 0 ? "Finanzas" : "Comercio",
}));

// Componente principal
const FullScreenMap = () => {
  return (
    <div className="fullscreen-container">
      {/* Mapa Espacial (Parte Superior) */}
      <div className="space-map">
        <svg viewBox="0 0 100 50" preserveAspectRatio="none">
          {/* Fondo del espacio */}
          <rect x="0" y="0" width="100" height="50" fill="#0a0a2a" />

          {/* Luna grande (esquina inferior derecha) */}
          <circle cx="85" cy="45" r="10" fill="#e0e0e0" />

          {/* Planeta mediano (centro superior) */}
          <circle cx="50" cy="20" r="7" fill="#4a8fe7" />

          {/* Planeta pequeño + Luna (esquina superior izquierda) */}
          <circle cx="15" cy="10" r="4" fill="#f5a623" />
          <circle cx="12" cy="8" r="1.5" fill="#cccccc" />
        </svg>
      </div>

      {/* Mapa Ciudad (Parte Inferior - Isométrico 5x5) */}
      <div className="city-map">
        <svg viewBox="0 0 100 50" preserveAspectRatio="none">
          {/* Fondo de la ciudad */}
          <rect x="0" y="0" width="100" height="50" fill="#1e1e1e" />

          {/* Edificios (5x5) en perspectiva isométrica */}
          {buildings.map((building, index) => {
            const row = Math.floor(index / 5);
            const col = index % 5;
            const x = 20 + col * 12 - row * 2; // Ajuste isométrico
            const y = 10 + row * 8 + col * 2;  // Ajuste isométrico
            const height = 1 + (building.id % 1.1) * 4; // Altura variable

            // Edificio Lanzadera (ID 3)
            if (building.id === 3) {
              return (
                <g key={building.id}>
                  <polygon
                    points={`${x},${y} ${x + 8},${y - 4} ${x + 16},${y} ${x + 8},${y + 4}`}
                    fill="#ff5555"
                  />
                  <rect x={x + 4} y={y} width={8} height={height} fill="#aa3333" />
                  <text x={x + 8} y={y + 15} fill="white" textAnchor="middle" fontSize="2">
                    {building.name}
                  </text>
                </g>
              );
            }

            // Edificios normales
            return (
              <g key={building.id}>
                <rect x={x} y={y} width={8} height={height} fill="#3333aa" />
                <polygon
                  points={`${x},${y} ${x + 4},${y - 2} ${x + 8},${y} ${x + 4},${y + 2}`}
                  fill="#5555ff"
                />
                <text x={x + 4} y={y + height + 2} fill="white" textAnchor="middle" fontSize="1.5">
                  {building.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default FullScreenMap;
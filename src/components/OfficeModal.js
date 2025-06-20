"use client";
import React, { useState } from 'react';
import '../app/css/OfficeModal.css'; // Ensure this path is correct

const OfficeModal = ({ office, onClose, onAcceptMission }) => {
  const [selectedMissionId, setSelectedMissionId] = useState(null);

  if (!office) {
    return null;
  }

  const handleMissionClick = (missionId) => {
    setSelectedMissionId(prevId => (prevId === missionId ? null : missionId));
  };

  const handleAcceptMission = (mission) => {
    onClose();
    onAcceptMission(mission);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{office.name}</h2>
        <p className="office-description">{office.description}</p>

        {office.missions && office.missions.length > 0 && (
          <div className="mission-list">
            <h3>Misiones Disponibles:</h3>
            {office.missions.map(mission => (
              <div
                key={mission.id}
                className="mission-item"
                onClick={() => handleMissionClick(mission.id)}
              >
                <div className="mission-title">{mission.name}</div>
                <div><strong>Ubicación:</strong> {mission.location}</div>
                <div><strong>Recompensa:</strong> {mission.reward} eWaveTokens</div>

                {selectedMissionId === mission.id && (
                  <div className="mission-detail">
                    <p>{mission.description}</p>
                    <button
                      className="modal-button"
                      onClick={(e) => { e.stopPropagation(); handleAcceptMission(mission); }}
                    >
                      Acceptar Misión
                    </button>
                    <button
                      className="modal-button secondary"
                      onClick={(e) => { e.stopPropagation(); handleMissionClick(null); }}
                    >
                      Ocultar Descripción
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <button className="modal-button" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default OfficeModal;

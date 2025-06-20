import React, { useState } from 'react';
import '../app/css/OfficeModal.css';

const OfficeModal = ({ office, onClose, onAcceptMission }) => {
  const [selectedMissionId, setSelectedMissionId] = useState(null);

  if (!office) {
    return null;
  }

  const handleMissionClick = (missionId) => {
    setSelectedMissionId(prevId => (prevId === missionId ? null : missionId));
  };

  const handleAcceptMission = (mission) => {
    // console.log("Mission Accepted in OfficeModal:", mission);
    onClose(); // Close this modal
    onAcceptMission(mission); // Pass mission to parent (ui.js)
  };

  // Basic styles - consider moving to OfficeModal.css for larger applications
  const missionListStyle = {
    textAlign: 'left',
    marginTop: '20px',
    maxHeight: '300px', // Added for scrollability if list is long
    overflowY: 'auto',  // Added for scrollability
  };

  const missionItemStyle = {
    border: '1px solid #eee',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const missionTitleStyle = {
    fontWeight: 'bold',
    fontSize: '1.1em',
  };

  const missionDetailStyle = {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    border: '1px solid #ddd',
  };

  const buttonStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
    marginTop: '10px',
  };

  const hideButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6c757d',
  };


  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{office.name}</h2>
        <p>{office.description}</p>

        {office.missions && office.missions.length > 0 && (
          <div style={missionListStyle}>
            <h3>Misiones Disponibles:</h3>
            {office.missions.map(mission => (
              <div key={mission.id} style={missionItemStyle} onClick={() => handleMissionClick(mission.id)}>
                <div style={missionTitleStyle}>{mission.name}</div>
                <div><strong>Ubicación:</strong> {mission.location}</div>
                <div><strong>Recompensa:</strong> {mission.reward} eWaveTokens</div>

                {selectedMissionId === mission.id && (
                  <div style={missionDetailStyle}>
                    <p>{mission.description}</p>
                    <button style={buttonStyle} onClick={(e) => { e.stopPropagation(); handleAcceptMission(mission); }}>
                      Acceptar Misión
                    </button>
                    <button style={hideButtonStyle} onClick={(e) => { e.stopPropagation(); handleMissionClick(null); }}>
                      Ocultar Descripción
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <button onClick={onClose} style={{marginTop: '20px'}}>Cerrar</button>
      </div>
    </div>
  );
};

export default OfficeModal;

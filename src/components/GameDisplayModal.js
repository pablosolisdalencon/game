import React, { useEffect } from 'react';
import '../app/css/GameDisplayModal.css';
import { minigameStyles } from '../data/gameSettings.js';
import { locationSettings } from '../data/locationVisuals.js';
import AsteroidsGame from './minigames/AsteroidsGame';
import TowerDefenseGame from './minigames/TowerDefenseGame';
import SurvivalGame from './minigames/SurvivalGame';

const GameDisplayModal = ({ mission, onClose }) => {
  useEffect(() => {
    if (mission) {
      const style = minigameStyles[mission.minigameType];
      const visuals = locationSettings[mission.location];

      console.log(`--- Settings for Mission: ${mission.name} ---`);
      console.log("Minigame Type:", mission.minigameType);
      console.log("Selected Minigame Styles:", style);
      console.log("Location:", mission.location);
      console.log("Selected Location Visuals:", visuals);
      console.log("------------------------------------------");
    }
  }, [mission]);

  if (!mission) {
    return null;
  }

  const renderMinigame = () => {
    // These settings would eventually be passed down to the actual game components
    // const gameStyle = minigameStyles[mission.minigameType];
    // const environmentVisuals = locationSettings[mission.location];

    switch (mission.minigameType) {
      case 'Asteroids':
        return <AsteroidsGame mission={mission} onGameFinish={onClose} />;
      case 'Tower Defense':
        return <TowerDefenseGame mission={mission} onGameFinish={onClose} />;
      case 'Survival':
        return <SurvivalGame mission={mission} onGameFinish={onClose} />;
      default:
        return <p>Unknown Minigame Type: {mission.minigameType}</p>;
    }
  };

  return (
    <div className="game-modal-overlay">
      <div className="game-modal-content">
        <h2>Game Display: {mission.name}</h2>
        <div className="minigame-area">
          {renderMinigame()}
        </div>
        {/* The onClose is now primarily triggered from within the minigames */}
        {/* <p>Minigame Type: {mission.minigameType}</p> */}
        {/* <button onClick={onClose}>Cerrar Juego (Fallback)</button> */}
      </div>
    </div>
  );
};

export default GameDisplayModal;

"use client";
import React, { useEffect, useMemo } from 'react'; // Added useMemo
import '../app/css/GameDisplayModal.css';
import { minigameStyles } from '../data/gameSettings.js';
import { locationSettings } from '../data/locationVisuals.js';
import AsteroidsGame from './minigames/AsteroidsGame';
import TowerDefenseGame from './minigames/TowerDefenseGame';
import SurvivalGame from './minigames/SurvivalGame';

const GameDisplayModal = ({ mission, onClose }) => {
  // useMemo to prevent re-calculating style and visuals on every render unless mission changes
  const currentGameStyle = useMemo(() => {
    if (!mission) return null;
    return minigameStyles[mission.minigameType];
  }, [mission]);

  const currentLocationVisuals = useMemo(() => {
    if (!mission) return null;
    return locationSettings[mission.location];
  }, [mission]);

  useEffect(() => {
    if (mission && currentGameStyle && currentLocationVisuals) {
      console.log(`--- Settings for Mission: ${mission.name} ---`);
      console.log("Minigame Type:", mission.minigameType);
      console.log("Selected Minigame Styles:", currentGameStyle);
      console.log("Location:", mission.location);
      console.log("Selected Location Visuals:", currentLocationVisuals);
      console.log("------------------------------------------");
    }
  }, [mission, currentGameStyle, currentLocationVisuals]);

  if (!mission) {
    return null;
  }

  const renderMinigame = () => {
    if (!currentGameStyle || !currentLocationVisuals) {
      return <p>Loading game settings...</p>; // Or some other placeholder
    }

    switch (mission.minigameType) {
      case 'Asteroids':
        return <AsteroidsGame mission={mission} onGameFinish={onClose} styleProps={currentGameStyle} visualProps={currentLocationVisuals} />;
      case 'Tower Defense':
        return <TowerDefenseGame mission={mission} onGameFinish={onClose} styleProps={currentGameStyle} visualProps={currentLocationVisuals} />;
      case 'Survival':
        return <SurvivalGame mission={mission} onGameFinish={onClose} styleProps={currentGameStyle} visualProps={currentLocationVisuals} />;
      default:
        return <p>Unknown Minigame Type: {mission.minigameType}</p>;
    }
  };

  return (
    <div className="game-modal-overlay">
      <div className="game-modal-content">
        <div className="game-modal-header">
          <h2>{mission.name}</h2>
          <p className="mission-subtitle">Engage: {mission.minigameType} on {mission.location}</p>
        </div>
        <div className="minigame-area">
          {renderMinigame()}
        </div>
        {/* Fallback close button is removed as per previous plan; minigames handle exit. */}
      </div>
    </div>
  );
};

export default GameDisplayModal;

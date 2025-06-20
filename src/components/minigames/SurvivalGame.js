"use client";
import React, { useState, useEffect } from 'react';
import { usePlayerAccount } from '../../context/PlayerAccountContext';

const SurvivalGame = ({ mission, onGameFinish, styleProps, visualProps }) => {
  const { recordMissionCompletion } = usePlayerAccount();
  const [score, setScore] = useState(0);
  const [mineralsFound, setMineralsFound] = useState({ tamita: 0, janita: 0, elenita: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [enemiesDefeated, setEnemiesDefeated] = useState(0);
  const [targetEnemiesToDefeat, setTargetEnemiesToDefeat] = useState(mission ? mission.objectives : 5);
  const [activeEnemies, setActiveEnemies] = useState(0);
  const [gameMessage, setGameMessage] = useState("");

  const mineralTypes = ['tamita', 'janita', 'elenita'];

  // Dynamic Styles
  const gameAreaStyle = {
    border: `2px solid ${visualProps?.borderColor || '#777'}`,
    backgroundColor: visualProps?.environmentTheme === 'forest' ? 'darkgreen' : (visualProps?.groundTexture ? `url(${visualProps.groundTexture})` : (visualProps?.skyColor || '#3c3c3c')),
    color: styleProps?.fontColor || 'white',
    padding: '20px',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    fontFamily: styleProps?.font || 'Arial, sans-serif',
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
  };

  const statsHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    color: styleProps?.fontColor || 'white',
  };

  const conceptualElementsStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    margin: '20px 0',
    padding: '10px',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: '5px',
  };

  const playerDynamicStyle = {
    border: `1px solid ${styleProps?.characterSkinBorder || 'lightblue'}`,
    padding: '10px',
    backgroundColor: styleProps?.characterSkin || 'blue', // Example: 'adventurer_sprite' could map to a color or image later
    color: styleProps?.fontColor || 'white', // Assuming text on player element
    borderRadius: '4px',
  };

  const enemiesDynamicStyle = {
    border: `1px solid ${styleProps?.enemySkinBorder || 'lightcoral'}`,
    padding: '10px',
    backgroundColor: styleProps?.enemySkin || 'darkred', // Example: 'zombie_sprite'
    color: styleProps?.fontColor || 'white', // Assuming text on enemy element
    borderRadius: '4px',
  };

  const buttonContainerStyle = { marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' };

  const baseButtonStyle = {
    padding: '10px 15px',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    margin: '5px', // Use margin for gap in flex-wrap scenarios
    transition: 'background-color 0.2s ease, transform 0.1s ease',
  };

  const gameActionButtonStyle = (disabled) => ({
    ...baseButtonStyle,
    backgroundColor: disabled ? (styleProps?.disabledButtonColor ||'#555') : (styleProps?.actionButtonColor || '#28a745'),
  });

  const claimExitButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: gameMessage === "Survived! Mission Complete!" ? (styleProps?.successButtonColor || '#28a745') : (styleProps?.dangerButtonColor ||'#dc3545'),
  };

  const gameMessageDynamicStyle = {
    textAlign: 'center',
    margin: '15px 0',
    fontSize: '1.2em',
    fontWeight: 'bold',
    minHeight: '30px',
    color: styleProps?.messageColor || (gameMessage.includes("Failed") ? (styleProps?.dangerColor || "red") : (styleProps?.successColor || "lightgreen")),
  };

  const gameOverTextStyle = { // Renamed
    textAlign: 'center',
    color: styleProps?.gameOverTextColor || 'lightgreen',
    fontSize: '1.5em',
    marginTop: '30px'
  };


  useEffect(() => {
    if (mission) {
      setTargetEnemiesToDefeat(mission.objectives || 5);
      setScore(0);
      setMineralsFound({ tamita: 0, janita: 0, elenita: 0 });
      setGameOver(false);
      setPlayerHealth(100);
      setEnemiesDefeated(0);
      setActiveEnemies(0);
      setGameMessage("");
    }
  }, [mission]);

  const handleSpawnEnemy = () => {
    if (gameOver) return;
    setActiveEnemies(prev => prev + 1);
  };

  const handleDefeatEnemy = () => {
    if (gameOver || activeEnemies <= 0) return;
    setActiveEnemies(prev => prev - 1);
    const newEnemiesDefeated = enemiesDefeated + 1;
    setEnemiesDefeated(newEnemiesDefeated);
    setScore(prev => prev + 15);

    if (Math.random() < 0.25) {
      const foundMineral = mineralTypes[Math.floor(Math.random() * mineralTypes.length)];
      setMineralsFound(prev => ({ ...prev, [foundMineral]: prev[foundMineral] + 1 }));
    }

    if (newEnemiesDefeated >= targetEnemiesToDefeat) {
      setGameOver(true);
      setGameMessage("Survived! Mission Complete!");
    }
  };

  const handlePlayerTakesDamage = () => {
    if (gameOver) return;
    const newHealth = playerHealth - 10;
    setPlayerHealth(newHealth);

    if (newHealth <= 0) {
      setPlayerHealth(0);
      setGameOver(true);
      setGameMessage("Overwhelmed! Mission Failed!");
    }
  };

  const handleClaimAndExit = () => {
    if (gameMessage === "Survived! Mission Complete!") {
      recordMissionCompletion(mission.reward, mineralsFound);
    }
    onGameFinish();
  };

  if (!mission || !styleProps || !visualProps) {
    return <div>Loading game assets...</div>;
  }

  return (
    <div style={gameAreaStyle}>
      <h3>Survival Challenge: {mission.name}</h3>
      <div style={statsHeaderStyle}>
        <span>Score: {score}</span>
        <span style={{color: playerHealth < 30 ? (styleProps?.lowHealthColor || 'red') : (styleProps?.healthColor || 'white')}}>
          Player Health: {playerHealth}%
        </span>
        <span>Enemies Defeated: {enemiesDefeated} / {targetEnemiesToDefeat}</span>
      </div>
      <div style={{marginBottom: '10px', color: styleProps?.itemColor || 'gold'}}>Minerals: {mineralTypes.map(m => `${m.charAt(0).toUpperCase() + m.slice(1)}: ${mineralsFound[m]}`).join(', ')}</div>

      <div style={gameMessageDynamicStyle}>{!gameOver ? `Active Enemies: ${activeEnemies}` : gameMessage}</div>

      <div style={conceptualElementsStyle}>
        <div style={playerDynamicStyle}>Player</div>
        <div style={enemiesDynamicStyle}>Enemy Area ({activeEnemies} active)</div>
      </div>

      {!gameOver && (
        <div style={buttonContainerStyle}>
          <button onClick={handleSpawnEnemy} style={gameActionButtonStyle(gameOver)} disabled={gameOver}>
            Simulate Spawn Enemy
          </button>
          <button onClick={handleDefeatEnemy} style={gameActionButtonStyle(activeEnemies <= 0 || gameOver)} disabled={activeEnemies <= 0 || gameOver}>
            Simulate Defeat Enemy
          </button>
          <button onClick={handlePlayerTakesDamage} style={gameActionButtonStyle(gameOver)} disabled={gameOver}>
            Simulate Player Takes Damage
          </button>
        </div>
      )}

      {gameOver && (
        <div style={gameOverTextStyle}>
          <p>{gameMessage}</p> {/* Message is already set with outcome */}
          <p>Final Score: {score}</p>
          <p>Total Enemies Defeated: {enemiesDefeated}</p>
          <p>Minerals Collected: {mineralTypes.map(m => `${m.charAt(0).toUpperCase() + m.slice(1)}: ${mineralsFound[m]}`).join(', ')}</p>
          <button
            onClick={handleClaimAndExit}
            style={claimExitButtonStyle}
          >
            {gameMessage === "Survived! Mission Complete!" ? "Claim Rewards & Exit" : "Exit"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SurvivalGame;

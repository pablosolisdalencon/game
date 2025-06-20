"use client";
import React, { useState, useEffect } from 'react';
import { usePlayerAccount } from '../../context/PlayerAccountContext';

const TowerDefenseGame = ({ mission, onGameFinish, styleProps, visualProps }) => {
  const { recordMissionCompletion } = usePlayerAccount();
  const [score, setScore] = useState(0);
  const [mineralsFound, setMineralsFound] = useState({ tamita: 0, janita: 0, elenita: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [currentWave, setCurrentWave] = useState(0);
  const [baseHealth, setBaseHealth] = useState(100);
  const [enemiesRemainingInWave, setEnemiesRemainingInWave] = useState(0);
  const [totalObjectives, setTotalObjectives] = useState(mission ? mission.objectives : 10);
  const [objectivesCompleted, setObjectivesCompleted] = useState(0);
  const [waveInProgress, setWaveInProgress] = useState(false);
  const [gameOutcomeMessage, setGameOutcomeMessage] = useState("");

  const mineralTypes = ['tamita', 'janita', 'elenita'];

  // Dynamic Styles
  const gameAreaStyle = {
    border: `2px solid ${visualProps?.borderColor || '#555'}`,
    backgroundColor: visualProps?.groundTexture ? `url(${visualProps.groundTexture})` : (visualProps?.skyColor || '#282c34'),
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

  const statsContainerStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '15px',
    color: styleProps?.fontColor || 'white',
  };

  const conceptualElementsStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    margin: '20px 0',
    padding: '10px',
    backgroundColor: 'rgba(0,0,0,0.2)', // Semi-transparent overlay for elements
    borderRadius: '5px',
  };

  const pathStyle = {
    border: `2px dashed ${styleProps?.pathColor || '#777'}`,
    padding: '10px',
    flexGrow: 1,
    textAlign: 'center',
    backgroundColor: visualProps?.pathDisplayColor || 'rgba(100,100,100,0.3)',
  };

  const towerDynamicStyle = {
    border: `2px solid ${styleProps?.towerColor || 'green'}`,
    padding: '10px', margin: '0 5px',
    backgroundColor: styleProps?.towerColor || 'darkgreen',
    color: styleProps?.fontColor || 'white',
  };

  const buttonContainerStyle = { marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' };

  const baseButtonStyle = {
    padding: '10px 15px',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '10px',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
  };

  const gameActionButtonStyle = (disabled) => ({
    ...baseButtonStyle,
    backgroundColor: disabled ? (styleProps?.disabledButtonColor || '#555') : (styleProps?.buttonColor || '#007bff'),
  });

  const claimExitButtonStyle = {
    ...baseButtonStyle,
    marginTop: '20px',
    backgroundColor: gameOutcomeMessage === "Victory!" ? (styleProps?.successButtonColor ||'#28a745') : (styleProps?.dangerButtonColor ||'#dc3545'),
  };

  const gameOverTextStyle = { // Renamed
    textAlign: 'center',
    color: styleProps?.gameOverTextColor || 'yellow',
    fontSize: '1.5em',
    marginTop: '30px'
  };


  useEffect(() => {
    if (mission) {
      setTotalObjectives(mission.objectives);
      setScore(0);
      setMineralsFound({ tamita: 0, janita: 0, elenita: 0 });
      setGameOver(false);
      setCurrentWave(0);
      setBaseHealth(100);
      setEnemiesRemainingInWave(0);
      setObjectivesCompleted(0);
      setWaveInProgress(false);
      setGameOutcomeMessage("");
    }
  }, [mission]);

  const handleStartNextWave = () => {
    if (gameOver || waveInProgress) return;
    const newWave = currentWave + 1;
    setCurrentWave(newWave);
    setEnemiesRemainingInWave(newWave * 5);
    setWaveInProgress(true);
  };

  const handleEnemyDefeated = () => {
    if (gameOver || !waveInProgress || enemiesRemainingInWave <= 0) return;
    setScore(prev => prev + 5);
    setEnemiesRemainingInWave(prev => prev - 1);
    const newObjectivesCompleted = objectivesCompleted + 1;
    setObjectivesCompleted(newObjectivesCompleted);

    if (Math.random() < 0.2) {
      const foundMineral = mineralTypes[Math.floor(Math.random() * mineralTypes.length)];
      setMineralsFound(prev => ({ ...prev, [foundMineral]: prev[foundMineral] + 1 }));
    }

    if (newObjectivesCompleted >= totalObjectives) {
      setGameOver(true);
      setGameOutcomeMessage("Victory!");
      setWaveInProgress(false);
    } else if (enemiesRemainingInWave - 1 === 0) {
      setWaveInProgress(false);
    }
  };

  const handleEnemyReachedBase = () => {
    if (gameOver || !waveInProgress || enemiesRemainingInWave <= 0) return;
    const newHealth = baseHealth - 10;
    setBaseHealth(newHealth);
    setEnemiesRemainingInWave(prev => prev - 1);

    if (newHealth <= 0) {
      setBaseHealth(0);
      setGameOver(true);
      setGameOutcomeMessage("Defeat!");
      setWaveInProgress(false);
    } else if (enemiesRemainingInWave - 1 === 0) {
      setWaveInProgress(false);
    }
  };

  const handleClaimAndExit = () => {
    if (gameOutcomeMessage === "Victory!") {
      recordMissionCompletion(mission.reward, mineralsFound);
    }
    onGameFinish();
  };

  if (!mission || !styleProps || !visualProps) {
    return <div>Loading game assets...</div>;
  }

  return (
    <div style={gameAreaStyle}>
      <h3>Tower Defense: {mission.name}</h3>
      <div style={statsContainerStyle}>
        <span>Score: {score}</span>
        <span>Base Health: {baseHealth}%</span>
        <span>Wave: {currentWave}</span>
        <span>Progress: {objectivesCompleted} / {totalObjectives}</span>
      </div>
      <div style={{color: styleProps?.fontColor || 'white'}}>Minerals: {mineralTypes.map(m => `${m.charAt(0).toUpperCase() + m.slice(1)}: ${mineralsFound[m]}`).join(', ')}</div>

      <div style={conceptualElementsStyle}>
        <div style={pathStyle}>Path (Enemies move here)</div>
        <div style={towerDynamicStyle}>Tower 1</div>
        <div style={towerDynamicStyle}>Tower 2</div>
      </div>
      <div style={{textAlign: 'center', margin: '10px 0', color: styleProps?.enemyColor || 'white'}}>Enemies in Wave: {enemiesRemainingInWave}</div>

      {!gameOver && (
        <div style={buttonContainerStyle}>
          <button onClick={handleStartNextWave} style={gameActionButtonStyle(waveInProgress || gameOver)} disabled={waveInProgress || gameOver}>
            Start Next Wave
          </button>
          <button onClick={handleEnemyDefeated} style={gameActionButtonStyle(!waveInProgress || gameOver)} disabled={!waveInProgress || gameOver}>
            Simulate Enemy Defeated
          </button>
          <button onClick={handleEnemyReachedBase} style={gameActionButtonStyle(!waveInProgress || gameOver)} disabled={!waveInProgress || gameOver}>
            Simulate Enemy Reached Base
          </button>
        </div>
      )}

      {gameOver && (
        <div style={gameOverTextStyle}>
          <p>Game Over! Mission: {mission.name} - {gameOutcomeMessage}</p>
          <p>Final Score: {score}</p>
          <p>Waves Survived: {currentWave}</p>
          <p>Minerals Collected: {mineralTypes.map(m => `${m.charAt(0).toUpperCase() + m.slice(1)}: ${mineralsFound[m]}`).join(', ')}</p>
          <button
            onClick={handleClaimAndExit}
            style={claimExitButtonStyle}
          >
            {gameOutcomeMessage === "Victory!" ? "Claim Rewards & Exit" : "Exit"}
          </button>
        </div>
      )}
    </div>
  );
};

export default TowerDefenseGame;

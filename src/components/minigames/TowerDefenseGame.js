import React, { useState, useEffect } from 'react';
import { usePlayerAccount } from '../../context/PlayerAccountContext';

const TowerDefenseGame = ({ mission, onGameFinish }) => {
  const { recordMissionCompletion } = usePlayerAccount();
  const [score, setScore] = useState(0);
  const [mineralsFound, setMineralsFound] = useState({ tamita: 0, janita: 0, elenita: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [currentWave, setCurrentWave] = useState(0);
  const [baseHealth, setBaseHealth] = useState(100);
  const [enemiesRemainingInWave, setEnemiesRemainingInWave] = useState(0);
  const [totalObjectives, setTotalObjectives] = useState(mission ? mission.objectives : 10); // e.g. total enemies or waves
  const [objectivesCompleted, setObjectivesCompleted] = useState(0);
  const [waveInProgress, setWaveInProgress] = useState(false);
  const [gameOutcomeMessage, setGameOutcomeMessage] = useState("");

  const mineralTypes = ['tamita', 'janita', 'elenita'];

  // Styles
  const gameAreaStyle = {
    border: '2px solid #555',
    backgroundColor: '#282c34',
    color: 'white',
    padding: '20px',
    width: '700px',
    fontFamily: 'Arial, sans-serif',
    margin: 'auto',
  };
  const statsContainerStyle = { display: 'flex', justifyContent: 'space-around', marginBottom: '15px' };
  const conceptualElementsStyle = { display: 'flex', justifyContent: 'space-around', margin: '20px 0', padding: '10px', backgroundColor: '#333942' };
  const pathStyle = { border: '1px dashed #777', padding: '10px', flexGrow: 1, textAlign: 'center' };
  const towerStyle = { border: '1px solid green', padding: '10px', margin: '0 5px', backgroundColor: 'darkgreen' };
  const buttonContainerStyle = { marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' };
  const buttonStyle = (disabled) => ({
    padding: '10px 15px',
    backgroundColor: disabled ? '#555' : '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    marginRight: '10px', // Added for spacing if multiple buttons
  });
  const gameOverScreenStyle = { textAlign: 'center', color: 'yellow', fontSize: '1.5em', marginTop: '30px'};

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
    setEnemiesRemainingInWave(newWave * 5); // Example: enemies increase with wave number
    setWaveInProgress(true);
  };

  const handleEnemyDefeated = () => {
    if (gameOver || !waveInProgress || enemiesRemainingInWave <= 0) return;

    setScore(prev => prev + 5);
    setEnemiesRemainingInWave(prev => prev - 1);
    setObjectivesCompleted(prev => prev + 1);

    if (Math.random() < 0.2) { // 20% chance for mineral
      const foundMineral = mineralTypes[Math.floor(Math.random() * mineralTypes.length)];
      setMineralsFound(prev => ({ ...prev, [foundMineral]: prev[foundMineral] + 1 }));
    }

    if (objectivesCompleted + 1 >= totalObjectives) {
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

  if (!mission) return <div>Loading mission data...</div>;

  return (
    <div style={gameAreaStyle}>
      <h3>Tower Defense: {mission.name}</h3>
      <div style={statsContainerStyle}>
        <span>Score: {score}</span>
        <span>Base Health: {baseHealth}%</span>
        <span>Wave: {currentWave}</span>
        <span>Progress: {objectivesCompleted} / {totalObjectives}</span>
      </div>
      <div>Minerals: {mineralTypes.map(m => `${m.charAt(0).toUpperCase() + m.slice(1)}: ${mineralsFound[m]}`).join(', ')}</div>

      <div style={conceptualElementsStyle}>
        <div style={pathStyle}>Path (Enemies move here)</div>
        <div style={towerStyle}>Tower 1</div>
        <div style={towerStyle}>Tower 2</div>
      </div>
      <div style={{textAlign: 'center', margin: '10px 0'}}>Enemies in Wave: {enemiesRemainingInWave}</div>

      {!gameOver && (
        <div style={buttonContainerStyle}>
          <button onClick={handleStartNextWave} style={buttonStyle(waveInProgress || gameOver)} disabled={waveInProgress || gameOver}>
            Start Next Wave
          </button>
          <button onClick={handleEnemyDefeated} style={buttonStyle(!waveInProgress || gameOver)} disabled={!waveInProgress || gameOver}>
            Simulate Enemy Defeated
          </button>
          <button onClick={handleEnemyReachedBase} style={buttonStyle(!waveInProgress || gameOver)} disabled={!waveInProgress || gameOver}>
            Simulate Enemy Reached Base
          </button>
        </div>
      )}

      {gameOver && (
        <div style={gameOverScreenStyle}>
          <p>Game Over! Mission: {mission.name} - {gameOutcomeMessage}</p>
          <p>Final Score: {score}</p>
          <p>Waves Survived: {currentWave}</p>
          <p>Minerals Collected: {mineralTypes.map(m => `${m.charAt(0).toUpperCase() + m.slice(1)}: ${mineralsFound[m]}`).join(', ')}</p>
          <button
            onClick={handleClaimAndExit}
            style={{...buttonStyle(false), marginTop: '20px', backgroundColor: gameOutcomeMessage === "Victory!" ? '#28a745' : '#dc3545'}}
          >
            {gameOutcomeMessage === "Victory!" ? "Claim Rewards & Exit" : "Exit"}
          </button>
        </div>
      )}
    </div>
  );
};

export default TowerDefenseGame;

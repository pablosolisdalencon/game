import React, { useState, useEffect } from 'react';
import { usePlayerAccount } from '../../context/PlayerAccountContext';

const SurvivalGame = ({ mission, onGameFinish }) => {
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

  // Styles
  const gameAreaStyle = {
    border: '2px solid #777',
    backgroundColor: '#3c3c3c',
    color: 'white',
    padding: '20px',
    width: '650px',
    fontFamily: 'Arial, sans-serif',
    margin: 'auto',
  };
  const statsHeaderStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' };
  const conceptualElementsStyle = { display: 'flex', justifyContent: 'space-around', margin: '20px 0', padding: '10px', backgroundColor: '#4a4a4a' };
  const playerStyle = { border: '1px solid lightblue', padding: '10px', backgroundColor: 'blue' };
  const enemiesStyle = { border: '1px solid lightcoral', padding: '10px', backgroundColor: 'darkred' };
  const buttonContainerStyle = { marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' };
  const buttonStyle = (disabled) => ({
    padding: '10px 15px',
    backgroundColor: disabled ? '#555' : '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    marginRight: '10px',
  });
  const gameMessageStyle = { textAlign: 'center', margin: '15px 0', fontSize: '1.2em', fontWeight: 'bold', minHeight: '30px' };
  const gameOverScreenStyle = { textAlign: 'center', color: 'lightgreen', fontSize: '1.5em', marginTop: '30px'};

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

    if (Math.random() < 0.25) { // 25% chance for mineral
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

  if (!mission) return <div>Loading mission data...</div>;

  return (
    <div style={gameAreaStyle}>
      <h3>Survival Challenge: {mission.name}</h3>
      <div style={statsHeaderStyle}>
        <span>Score: {score}</span>
        <span>Player Health: {playerHealth}%</span>
        <span>Enemies Defeated: {enemiesDefeated} / {targetEnemiesToDefeat}</span>
      </div>
      <div style={{marginBottom: '10px'}}>Minerals: {mineralTypes.map(m => `${m.charAt(0).toUpperCase() + m.slice(1)}: ${mineralsFound[m]}`).join(', ')}</div>

      <div style={gameMessageStyle}>{!gameOver ? `Active Enemies: ${activeEnemies}` : gameMessage}</div>

      <div style={conceptualElementsStyle}>
        <div style={playerStyle}>Player</div>
        <div style={enemiesStyle}>Enemy Area</div>
      </div>

      {!gameOver && (
        <div style={buttonContainerStyle}>
          <button onClick={handleSpawnEnemy} style={buttonStyle(gameOver)} disabled={gameOver}>
            Simulate Spawn Enemy
          </button>
          <button onClick={handleDefeatEnemy} style={buttonStyle(activeEnemies <= 0 || gameOver)} disabled={activeEnemies <= 0 || gameOver}>
            Simulate Defeat Enemy
          </button>
          <button onClick={handlePlayerTakesDamage} style={buttonStyle(gameOver)} disabled={gameOver}>
            Simulate Player Takes Damage
          </button>
        </div>
      )}

      {gameOver && (
        <div style={gameOverScreenStyle}>
          {/* Game message is already displayed via gameMessageStyle */}
          <p>Final Score: {score}</p>
          <p>Total Enemies Defeated: {enemiesDefeated}</p>
          <p>Minerals Collected: {mineralTypes.map(m => `${m.charAt(0).toUpperCase() + m.slice(1)}: ${mineralsFound[m]}`).join(', ')}</p>
          <button
            onClick={handleClaimAndExit}
            style={{...buttonStyle(false), marginTop: '20px', backgroundColor: gameMessage === "Survived! Mission Complete!" ? '#28a745' : '#dc3545' }}
          >
            {gameMessage === "Survived! Mission Complete!" ? "Claim Rewards & Exit" : "Exit"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SurvivalGame;

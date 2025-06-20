import React, { useState, useEffect } from 'react';
import { usePlayerAccount } from '../../context/PlayerAccountContext';

const AsteroidsGame = ({ mission, onGameFinish }) => {
  const { recordMissionCompletion } = usePlayerAccount();
  const [score, setScore] = useState(0);
  const [mineralsFound, setMineralsFound] = useState({ tamita: 0, janita: 0, elenita: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [objectivesCompleted, setObjectivesCompleted] = useState(false); // To track if objectives were met for reward
  const [objectivesRemaining, setObjectivesRemaining] = useState(mission ? mission.objectives : 0);
  const [asteroids, setAsteroids] = useState([]);

  const mineralTypes = ['tamita', 'janita', 'elenita'];

  // Styles (can be moved to a CSS file later)
  const gameAreaStyle = {
    border: '2px solid #444',
    backgroundColor: '#000', // Default black, can be customized with props later
    color: 'white',
    padding: '20px',
    width: '600px',
    height: '400px',
    position: 'relative', // For positioning asteroids
    fontFamily: 'Arial, sans-serif',
    margin: 'auto', // Center the game area
  };

  const statDisplayStyle = {
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
  };

  const mineralsDisplayStyle = {
    marginTop: '5px',
  };

  const playerShipStyle = {
    width: '30px',
    height: '20px',
    backgroundColor: 'cyan', // Conceptual player ship color
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    borderRadius: '5px',
  };

  const asteroidStyle = (x, y, size) => ({
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: 'grey', // Conceptual asteroid color
    borderRadius: '50%',
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
  });

  const buttonStyle = {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
    display: 'block',
  };

  const gameOverStyle = {
    color: 'yellow',
    textAlign: 'center',
    fontSize: '1.5em',
    marginTop: '50px',
  };

  useEffect(() => {
    if (mission) {
      setObjectivesRemaining(mission.objectives);
      setScore(0);
      setMineralsFound({ tamita: 0, janita: 0, elenita: 0 });
      setGameOver(false);
      setObjectivesCompleted(false);
      const numAsteroids = Math.max(1, Math.floor(mission.objectives / 2));
      const newAsteroids = [];
      for (let i = 0; i < numAsteroids; i++) {
        newAsteroids.push({
          id: `ast-${i}`,
          x: Math.random() * 90,
          y: Math.random() * 60,
          size: Math.random() * 20 + 10,
        });
      }
      setAsteroids(newAsteroids);
    }
  }, [mission]);

  const handleDestroyAsteroid = () => {
    if (gameOver || objectivesRemaining <= 0) return;

    const newObjectivesRemaining = objectivesRemaining - 1;
    setObjectivesRemaining(newObjectivesRemaining);
    setScore(prev => prev + 10);

    if (Math.random() < 0.3) {
      const foundMineral = mineralTypes[Math.floor(Math.random() * mineralTypes.length)];
      setMineralsFound(prevMinerals => ({
        ...prevMinerals,
        [foundMineral]: prevMinerals[foundMineral] + 1,
      }));
    }

    if (newObjectivesRemaining === 0) {
      setGameOver(true);
      setObjectivesCompleted(true); // Player won
    }
  };

  const handleClaimRewards = () => {
    if (objectivesCompleted) {
      recordMissionCompletion(mission.reward, mineralsFound);
    }
    onGameFinish(); // Call to close modal etc.
  };

  if (!mission) {
    return <div>Loading mission data...</div>;
  }

  return (
    <div style={gameAreaStyle}>
      <div style={statDisplayStyle}>
        <span>Score: {score}</span>
        <span>Objectives Remaining: {objectivesRemaining}</span>
      </div>
      <div style={mineralsDisplayStyle}>
        Minerals:
        {mineralTypes.map(type => (
          <span key={type} style={{ marginLeft: '10px' }}>{type.charAt(0).toUpperCase() + type.slice(1)}: {mineralsFound[type]}</span>
        ))}
      </div>

      {/* Player Ship (Conceptual) */}
      <div style={playerShipStyle}></div>

      {/* Asteroids (Conceptual) */}
      {asteroids.map(ast => (
        <div key={ast.id} style={asteroidStyle(ast.x, ast.y, ast.size)} title={`Asteroid ${ast.id}`}></div>
      ))}

      {!gameOver && (
        <button onClick={handleDestroyAsteroid} style={buttonStyle}>
          Destroy Asteroid
        </button>
      )}

      {gameOver && (
        <div style={gameOverStyle}>
          <p>Mission {objectivesCompleted ? "Complete!" : "Ended!"}: {mission.name}</p>
          <p>Final Score: {score}</p>
          <p>Minerals Collected:</p>
          {mineralTypes.map(type => (
             <span key={type} style={{ display: 'block', marginLeft: '10px' }}>{type.charAt(0).toUpperCase() + type.slice(1)}: {mineralsFound[type]}</span>
          ))}
          <button onClick={handleClaimRewards} style={{...buttonStyle, marginTop: '20px', backgroundColor: '#28a745'}}>
            {objectivesCompleted ? "Claim Rewards & Exit" : "Exit"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AsteroidsGame;

"use client";
import React, { useState, useEffect } from 'react';
import { usePlayerAccount } from '../../context/PlayerAccountContext';

const AsteroidsGame = ({ mission, onGameFinish, styleProps, visualProps }) => {
  const { recordMissionCompletion } = usePlayerAccount();
  const [score, setScore] = useState(0);
  const [mineralsFound, setMineralsFound] = useState({ tamita: 0, janita: 0, elenita: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [objectivesCompleted, setObjectivesCompleted] = useState(false);
  const [objectivesRemaining, setObjectivesRemaining] = useState(mission ? mission.objectives : 0);
  const [asteroids, setAsteroids] = useState([]);

  const mineralTypes = ['tamita', 'janita', 'elenita'];

  // Dynamic styles based on props
  const gameAreaStyle = {
    border: `2px solid ${visualProps?.borderColor || '#444'}`,
    backgroundColor: styleProps?.backgroundColor || visualProps?.skyColor || '#000',
    color: styleProps?.scoreColor || 'white',
    padding: '20px',
    width: '100%', // Take full width of minigame-area
    height: '100%', // Take full height of minigame-area
    boxSizing: 'border-box', // Include padding and border in the element's total width and height
    position: 'relative',
    fontFamily: styleProps?.font || 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column', // To manage layout internally
  };

  const statDisplayStyle = {
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    color: styleProps?.scoreColor || 'white', // Use scoreColor for stats text
  };

  const mineralsDisplayStyle = {
    marginTop: '5px',
    color: styleProps?.scoreColor || 'white',
  };

  const playerShipStyle = {
    width: '30px',
    height: '20px',
    backgroundColor: styleProps?.playerShipColor || 'cyan',
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    borderRadius: '5px',
  };

  const asteroidDynamicStyle = (x, y, size) => ({
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: styleProps?.asteroidColor || 'grey',
    borderRadius: '50%',
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    boxShadow: `0 0 5px ${styleProps?.laserColor || 'transparent'}`, // Example usage of another style prop
  });

  const baseButtonStyle = { // Renamed to avoid conflict with OfficeModal's .modal-button if CSS isn't perfectly scoped
    padding: '10px 15px',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
    display: 'block', // Make buttons block for easier layout in this conceptual game
    marginLeft: 'auto',
    marginRight: 'auto',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
  };

  const actionButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: styleProps?.buttonColor || '#007bff',
  };

  const claimButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: styleProps?.successButtonColor || '#28a745', // Green for claim/success
    marginTop: '20px',
  };
   const exitButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: styleProps?.dangerButtonColor || '#dc3545', // Red for exit/failure
    marginTop: '20px',
  };


  const gameOverTextStyle = { // Renamed to avoid conflict
    color: styleProps?.gameOverTextColor || 'yellow',
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
          y: Math.random() * 60, // Keep them somewhat away from bottom where ship is
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
      setObjectivesCompleted(true);
    }
  };

  const handleClaimRewards = () => {
    if (objectivesCompleted) {
      recordMissionCompletion(mission.reward, mineralsFound);
    }
    onGameFinish();
  };

  if (!mission || !styleProps || !visualProps) { // Check for props
    return <div>Loading game assets...</div>;
  }

  return (
    <div style={gameAreaStyle}>
      <div style={{ flexGrow: 1, position: 'relative' }}> {/* Inner container for game elements, allows stats to be separate */}
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

        <div style={playerShipStyle}></div>

        {asteroids.map(ast => (
          <div key={ast.id} style={asteroidDynamicStyle(ast.x, ast.y, ast.size)} title={`Asteroid ${ast.id}`}></div>
        ))}
      </div>

      {!gameOver && (
        <button onClick={handleDestroyAsteroid} style={actionButtonStyle}>
          Destroy Asteroid
        </button>
      )}

      {gameOver && (
        <div style={gameOverTextStyle}>
          <p>Mission {objectivesCompleted ? "Complete!" : "Ended!"}: {mission.name}</p>
          <p>Final Score: {score}</p>
          <p>Minerals Collected:</p>
          {mineralTypes.map(type => (
             <span key={type} style={{ display: 'block', marginLeft: '10px' }}>{type.charAt(0).toUpperCase() + type.slice(1)}: {mineralsFound[type]}</span>
          ))}
          <button
            onClick={handleClaimRewards}
            style={objectivesCompleted ? claimButtonStyle : exitButtonStyle}
          >
            {objectivesCompleted ? "Claim Rewards & Exit" : "Exit"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AsteroidsGame;

"use client";
import React, { useState, useEffect, useRef } from 'react';
import { usePlayerAccount } from '../../context/PlayerAccountContext';
import VirtualJoystick from '../controls/VirtualJoystick';
import styles from './SurvivalGame.module.css';

const SurvivalGame = ({ mission, onGameFinish, styleProps, visualProps }) => {
  const { recordMissionCompletion } = usePlayerAccount();
  const canvasRef = useRef(null);
  const playerRef = useRef({
    x: 0, y: 0, radius: 15, speed: 2, color: 'skyblue',
    velocity: { x: 0, y: 0 }, angle: -Math.PI / 2,
    joystickAngle: -Math.PI / 2, joystickIntensity: 0,
    isHit: false, // For player hit state
  });
  const enemiesRef = useRef([]);
  const lastSpawnTimeRef = useRef(0);
  const spawnIntervalRef = useRef(3000); // Initial spawn interval

  const [score, setScore] = useState(0);
  const [mineralsFound, setMineralsFound] = useState({ tamita: 0, janita: 0, elenita: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [enemiesDefeated, setEnemiesDefeated] = useState(0);
  const [targetEnemiesToDefeat, setTargetEnemiesToDefeat] = useState(10);
  const [gameMessage, setGameMessage] = useState("");
  const [showClaimButton, setShowClaimButton] = useState(false);

  // Effect for Resetting Game State on Mission Change
  useEffect(() => {
    if (mission) {
      setScore(0); setMineralsFound({ tamita: 0, janita: 0, elenita: 0 });
      setGameOver(false); setGameMessage(""); setShowClaimButton(false);
      setPlayerHealth(100); setEnemiesDefeated(0);

      if (mission.objectives > 0) {
        setTargetEnemiesToDefeat(mission.objectives);
      } else {
        setTargetEnemiesToDefeat(10);
      }

      // Reset refs related to game state
      if(playerRef.current) {
        playerRef.current.joystickIntensity = 0;
        playerRef.current.velocity = { x: 0, y: 0 };
        playerRef.current.isHit = false;
      }
      enemiesRef.current = [];
      lastSpawnTimeRef.current = 0;
      // Adjust spawn interval based on mission difficulty (example)
      spawnIntervalRef.current = Math.max(500, 3000 - (mission.difficulty || 1) * 250);
    }
  }, [mission]);

  const spawnEnemy = (canvas, playerPos) => {
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    const radius = Math.random() * 10 + 10; // Radius 10-20
    const speed = Math.random() * 1 + 0.5; // Speed 0.5-1.5

    switch (edge) {
      case 0: x = Math.random() * canvas.width; y = 0 - radius; break;
      case 1: x = canvas.width + radius; y = Math.random() * canvas.height; break;
      case 2: x = Math.random() * canvas.width; y = canvas.height + radius; break;
      default: x = 0 - radius; y = Math.random() * canvas.height; break;
    }

    // Simple check to avoid spawning directly on player if player is near edge
    if (playerPos && Math.sqrt((x - playerPos.x)**2 + (y - playerPos.y)**2) < radius + playerPos.radius + 50) {
      if(edge === 0 || edge === 2) x = (x + canvas.width/2 + 50) % canvas.width;
      else y = (y + canvas.height/2 + 50) % canvas.height;
    }

    enemiesRef.current.push({
      id: Date.now() + Math.random(),
      x, y, radius, speed,
      color: styleProps?.enemyColor || styleProps?.enemySkin || 'tomato',
      health: 100, // Placeholder
      velocity: { x: 0, y: 0 }
    });
  };

  const handleJoystickMove = (angle, intensity) => { /* ... (same as before) ... */
    if (!playerRef.current || gameOver) return;
    const player = playerRef.current;
    player.joystickAngle = angle;
    player.joystickIntensity = intensity;
    player.angle = angle;
    if (intensity > 0.1) {
      player.velocity.x = Math.cos(angle) * player.speed * intensity;
      player.velocity.y = Math.sin(angle) * player.speed * intensity;
    } else {
      player.velocity.x = 0; player.velocity.y = 0;
    }
  };
  const handleJoystickEnd = () => { /* ... (same as before) ... */
    if (!playerRef.current) return;
    playerRef.current.joystickIntensity = 0;
    playerRef.current.velocity.x = 0; playerRef.current.velocity.y = 0;
  };

  const drawPlayer = (ctx) => { /* ... (same as before) ... */
    if (!playerRef.current || playerRef.current.isHit) return;
    const player = playerRef.current;
    ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(player.angle);
    ctx.fillStyle = player.color; ctx.beginPath();
    ctx.moveTo(player.radius, 0);
    ctx.lineTo(-player.radius * 0.5, player.radius * 0.6);
    ctx.lineTo(-player.radius * 0.2, 0);
    ctx.lineTo(-player.radius * 0.5, -player.radius * 0.6);
    ctx.closePath(); ctx.fill();
    if(styleProps?.playerHighlightColor){
        ctx.strokeStyle = styleProps.playerHighlightColor; ctx.lineWidth = 1.5; ctx.stroke();
    }
    ctx.restore();
  };

  const drawEnemy = (ctx, enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
    // TODO: Add health bar or visual damage indication later
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !styleProps || !visualProps || !mission) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    if (canvas.parentElement) {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    } else {
      canvas.width = 800; canvas.height = 600;
    }

    if (!playerRef.current) { // Initial setup for playerRef if it was null
        playerRef.current = {
             x: canvas.width / 2, y: canvas.height / 2, radius: 15, speed: 2,
             color: styleProps?.playerColor || styleProps?.characterSkin || 'skyblue',
             velocity: { x: 0, y: 0 }, angle: -Math.PI / 2,
             joystickAngle: -Math.PI / 2, joystickIntensity: 0, isHit: false
        };
    } else { // Re-center player and reset properties for new mission/resize
        playerRef.current.x = canvas.width / 2;
        playerRef.current.y = canvas.height / 2;
        playerRef.current.color = styleProps?.playerColor || styleProps?.characterSkin || 'skyblue';
        playerRef.current.angle = -Math.PI / 2;
        playerRef.current.velocity = { x: 0, y: 0 };
        playerRef.current.isHit = false;
        // joystickIntensity is reset by handleJoystickEnd or mission change effect
    }
    const player = playerRef.current;


    const gameLoop = (timestamp) => {
      if (!gameOver) {
        // Update Player Position
        if (player && !player.isHit) {
          player.x += player.velocity.x;
          player.y += player.velocity.y;
          player.x = Math.max(player.radius, Math.min(player.x, canvas.width - player.radius));
          player.y = Math.max(player.radius, Math.min(player.y, canvas.height - player.radius));
        }

        // Spawn Enemies
        const currentTime = performance.now();
        if (currentTime - lastSpawnTimeRef.current > spawnIntervalRef.current) {
          spawnEnemy(canvas, player); // Pass player for proximity check
          lastSpawnTimeRef.current = currentTime;
          spawnIntervalRef.current = Math.max(300, spawnIntervalRef.current * 0.995); // Speed up spawning
        }

        // Update Enemies
        enemiesRef.current.forEach(enemy => {
          if (player && !player.isHit) { // Only move if player exists and is not hit
            const angleToPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            enemy.velocity.x = Math.cos(angleToPlayer) * enemy.speed;
            enemy.velocity.y = Math.sin(angleToPlayer) * enemy.speed;
            enemy.x += enemy.velocity.x;
            enemy.y += enemy.velocity.y;
          }
          // TODO: Enemy-player collision, enemy-projectile collision in next steps
        });
      } // End if(!gameOver)

      // Drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = styleProps?.backgroundColor || visualProps?.skyColor || '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (player) drawPlayer(ctx);
      enemiesRef.current.forEach(enemy => drawEnemy(ctx, enemy));

      // Draw UI
      ctx.fillStyle = styleProps?.fontColor || 'white';
      const baseUiFontSize = styleProps?.uiFontSize || 20;
      ctx.font = `${baseUiFontSize / 2}px ${styleProps?.font || 'Arial'}`;
      if (gameOver) { /* ... (game over UI drawing same) ... */
        ctx.textAlign = 'center';
        const baseGameOverFontSize = styleProps?.gameOverFontSize || 36;
        ctx.font = `bold ${baseGameOverFontSize / 2}px ${styleProps?.font || 'Arial'}`;
        ctx.fillStyle = gameMessage === "Survived! Mission Complete!" ? (styleProps?.victoryColor || 'lime') : (styleProps?.defeatColor || 'red');
        ctx.fillText(gameMessage || "GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
        const baseFinalScoreFontSize = styleProps?.scoreFontSize || 20;
        ctx.font = `${baseFinalScoreFontSize / 2}px ${styleProps?.font || 'Arial'}`;
        ctx.fillStyle = styleProps?.scoreColor || "white";
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
      } else { /* ... (gameplay UI drawing same) ... */
        ctx.textAlign = 'left';
        ctx.fillText(`Health: ${playerHealth}%`, 20, 30);
        ctx.fillText(`Defeated: ${enemiesDefeated}/${targetEnemiesToDefeat}`, 20, 50);
        ctx.textAlign = 'right';
        ctx.fillText(`Score: ${score}`, canvas.width - 20, 30);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };
    gameLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [mission, styleProps, visualProps, gameOver, gameMessage, score, playerHealth, enemiesDefeated, targetEnemiesToDefeat]);

  useEffect(() => { /* ... (showClaimButton logic same) ... */
    if (gameOver) {
      setShowClaimButton(true);
      if (enemiesDefeated >= targetEnemiesToDefeat && targetEnemiesToDefeat > 0) {
          if (gameMessage !== "Survived! Mission Complete!") setGameMessage("Survived! Mission Complete!");
      } else if (!gameMessage && playerRef.current?.isHit) { // Check if player was hit for loss message
          setGameMessage("Overwhelmed! Mission Failed!");
      } else if (!gameMessage) { // Generic game over if no specific win/loss by hit
          setGameMessage("GAME OVER");
      }
    } else {
      setShowClaimButton(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver, enemiesDefeated, targetEnemiesToDefeat]);

  const handleClaimAndExit = () => { /* ... (same) ... */
    if (enemiesDefeated >= targetEnemiesToDefeat && targetEnemiesToDefeat > 0) {
      recordMissionCompletion(mission.reward, mineralsFound);
    }
    onGameFinish();
  };

  if (!mission || !styleProps || !visualProps) { /* ... (same) ... */
    return <div style={{ color: 'white', textAlign: 'center', width: '100%' }}>Loading game assets...</div>;
  }

  return (
    <div className={styles.gameContainer} style={{backgroundColor: styleProps?.backgroundColor || visualProps?.skyColor || '#111'}}>
      <canvas ref={canvasRef} className={styles.gameCanvas} />
      {!gameOver && (
        <div className={styles.joystickWrapper}>
          <VirtualJoystick size={100} knobSize={50} onMove={handleJoystickMove} onEnd={handleJoystickEnd} />
        </div>
      )}
      {gameOver && showClaimButton && (
        <button onClick={handleClaimAndExit}
            style={{ /* Using claimButtonOverlayStyle from Asteroids as a template, adjust as needed */
                position: 'absolute', top: `calc(50% + 60px)`, left: '50%',
                transform: 'translate(-50%, -50%)', padding: '12px 25px',
                backgroundColor: (enemiesDefeated >= targetEnemiesToDefeat && targetObjectivesToDefeat > 0) ? (styleProps?.successButtonColor || '#28a745') : (styleProps?.dangerButtonColor || '#dc3545'),
                color: 'white',
                border: `2px solid ${(enemiesDefeated >= targetEnemiesToDefeat && targetObjectivesToDefeat > 0) ? (styleProps?.successButtonBorderColor || '#1e7e34') : (styleProps?.dangerButtonBorderColor || '#bd2130')}`,
                borderRadius: '8px', cursor: 'pointer', fontSize: '1.1em', zIndex: 30,
                fontFamily: styleProps?.font || 'Electrolize, sans-serif',
                boxShadow: '0 0 15px rgba(0,0,0,0.7)', textTransform: 'uppercase',
            }}>
          {(enemiesDefeated >= targetEnemiesToDefeat && targetObjectivesToDefeat > 0) ? 'Claim Rewards & Exit' : 'Exit'}
        </button>
      )}
    </div>
  );
};

export default SurvivalGame;

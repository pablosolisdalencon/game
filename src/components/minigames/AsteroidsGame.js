"use client";
import React, { useState, useEffect, useRef } from 'react';
import { usePlayerAccount } from '../../context/PlayerAccountContext';

const PROJECTILE_SPEED = 7;
const PROJECTILE_LIFESPAN_MS = 1000;
const FIRE_RATE_COOLDOWN_MS = 250;

const ASTEROID_MAX_SIZE = 50;
const ASTEROID_MEDIUM_SIZE = 30;
const ASTEROID_MIN_SIZE = 15;

const SCORE_LARGE_ASTEROID = 20;
const SCORE_MEDIUM_ASTEROID = 50;
const SCORE_SMALL_ASTEROID = 100;

const NUM_STARS = 100;

const AsteroidsGame = ({ mission, onGameFinish, styleProps, visualProps }) => {
  const { recordMissionCompletion } = usePlayerAccount();
  const canvasRef = useRef(null);
  const playerRef = useRef({
    x: 0, y: 0, angle: -Math.PI / 2, velocity: { x: 0, y: 0 },
    rotationSpeed: 0.08, thrustPower: 0.15, friction: 0.985,
    radius: 15, color: 'cyan', isHit: false, isVulnerable: true,
  });
  const asteroidsRef = useRef([]);
  const projectilesRef = useRef([]);
  const starsRef = useRef([]);
  const particlesRef = useRef([]); // For explosions and thrust
  const keysPressedRef = useRef({});
  const lastShotTimeRef = useRef(0);

  const [score, setScore] = useState(0);
  const [mineralsFound, setMineralsFound] = useState({ tamita: 0, janita: 0, elenita: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [gameMessage, setGameMessage] = useState("");
  const [showClaimButton, setShowClaimButton] = useState(false);
  const [currentObjectivesCompleted, setCurrentObjectivesCompleted] = useState(0);
  const [targetObjectivesToDefeat, setTargetObjectivesToDefeat] = useState(0);

  const gameContainerStyle = { /* ... (same) ... */
    width: '100%', height: '100%',
    backgroundColor: styleProps?.backgroundColor || visualProps?.skyColor || '#000',
    display: 'flex', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box',
    position: 'relative',
  };
  const claimButtonOverlayStyle = { /* ... (same) ... */
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)', padding: '15px 30px',
    backgroundColor: currentObjectivesCompleted >= targetObjectivesToDefeat ? (styleProps?.successButtonColor || '#28a745') : (styleProps?.dangerButtonColor || '#dc3545'),
    color: 'white', border: 'none', borderRadius: '5px',
    cursor: 'pointer', fontSize: '1.2em', zIndex: 10,
    fontFamily: styleProps?.font || 'Arial, sans-serif',
    boxShadow: '0 0 15px rgba(0,0,0,0.5)',
  };

  function checkCircleCollision(circle1, circle2) { /* ... (same) ... */
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
  }
  function createAsteroid(canvas, size, position) { /* ... (same) ... */
    let x, y;
    if (position) {
      x = position.x;
      y = position.y;
    } else {
      const edge = Math.floor(Math.random() * 4);
      switch (edge) {
        case 0: x = Math.random() * canvas.width; y = 0 - size; break;
        case 1: x = canvas.width + size; y = Math.random() * canvas.height; break;
        case 2: x = Math.random() * canvas.width; y = canvas.height + size; break;
        default: x = 0 - size; y = Math.random() * canvas.height; break;
      }
    }
    return {
      x, y, radius: size,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.04,
      velocity: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
      color: styleProps?.asteroidColor || 'grey',
      sides: Math.floor(Math.random() * 3) + 5,
    };
  }

  // Particle Creation Function
  function createParticles(count, startX, startY, baseColor, options = {}) {
    const {
      speedRange = [0.5, 2],
      lifespanRange = [30, 60], // in frames
      radiusRange = [1, 3],
      emissionAngle, // specific angle for emission (e.g. thrust)
      angleSpread = Math.PI * 2 // spread around emissionAngle, default is full circle
    } = options;

    for (let i = 0; i < count; i++) {
      const angle = emissionAngle !== undefined
        ? emissionAngle - (angleSpread / 2) + (Math.random() * angleSpread)
        : Math.random() * Math.PI * 2;
      const speed = Math.random() * (speedRange[1] - speedRange[0]) + speedRange[0];
      const lifespan = Math.random() * (lifespanRange[1] - lifespanRange[0]) + lifespanRange[0];

      particlesRef.current.push({
        x: startX,
        y: startY,
        radius: Math.random() * (radiusRange[1] - radiusRange[0]) + radiusRange[0],
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        color: baseColor, // Can add variations later (e.g. shades of grey, yellow, orange for explosions)
        lifespan: lifespan,
        currentLifespan: lifespan,
        alpha: 1,
      });
    }
  }


  useEffect(() => { /* ... (state reset) ... */
    if (mission) {
      setScore(0); setMineralsFound({ tamita: 0, janita: 0, elenita: 0 });
      setGameOver(false); setGameMessage(""); setShowClaimButton(false);
      playerRef.current.isHit = false; playerRef.current.isVulnerable = true;
      projectilesRef.current = [];
      particlesRef.current = []; // Clear particles
      setTargetObjectivesToDefeat(mission.objectives * 4);
      setCurrentObjectivesCompleted(0);
    }
  }, [mission]);

  // Main Game Loop and Setup Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !styleProps || !visualProps || !mission) return;
    const ctx = canvas.getContext('2d');
    const gameWidth = 800; const gameHeight = 600;
    canvas.width = gameWidth; canvas.height = gameHeight;

    const player = playerRef.current;
    player.x = canvas.width / 2; player.y = canvas.height / 2;
    player.color = styleProps?.playerShipColor || 'cyan';
    player.angle = -Math.PI / 2; player.velocity = { x: 0, y: 0 };
    player.isHit = false;

    asteroidsRef.current = []; /* ... (asteroid init same) ... */
    const numInitialAsteroids = mission.objectives;
    for (let i = 0; i < numInitialAsteroids; i++) {
      asteroidsRef.current.push(createAsteroid(canvas, ASTEROID_MAX_SIZE));
    }

    starsRef.current = []; /* ... (starfield init same) ... */
    const starDensity = visualProps?.particleEffect === 'star_dust' ? NUM_STARS * 2 : NUM_STARS;
    for (let i = 0; i < starDensity; i++) {
      starsRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    const handleKeyDown = (e) => { /* ... (firing logic same) ... */
        keysPressedRef.current[e.key] = true;
        if ((e.key === ' ' || e.code === 'Space') && !gameOver) {
            e.preventDefault();
            if (performance.now() - lastShotTimeRef.current > FIRE_RATE_COOLDOWN_MS) {
            const p = playerRef.current;
            projectilesRef.current.push({
                x: p.x + Math.cos(p.angle) * p.radius,
                y: p.y + Math.sin(p.angle) * p.radius,
                radius: styleProps?.laserWidth || 2,
                length: 15,
                velocity: { x: Math.cos(p.angle) * PROJECTILE_SPEED, y: Math.sin(p.angle) * PROJECTILE_SPEED },
                color: styleProps?.laserColor || '#FF00FF',
                birthTime: performance.now(),
            });
            lastShotTimeRef.current = performance.now();
            }
        }
    };
    const handleKeyUp = (e) => { keysPressedRef.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    function drawPlayer(ctx, p, keys) { /* ... (same visual enhancements) ... */
        if (p.isHit) return;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.angle);
        ctx.beginPath(); ctx.moveTo(p.radius, 0);
        ctx.lineTo(-p.radius * 0.8, p.radius * 0.7);
        ctx.lineTo(-p.radius * 0.4, 0);
        ctx.lineTo(-p.radius * 0.8, -p.radius * 0.7);
        ctx.closePath();
        ctx.fillStyle = p.color; ctx.fill();
        const highlightColor = styleProps?.playerHighlightColor || '#00FFFF';
        ctx.strokeStyle = highlightColor; ctx.lineWidth = 2;
        ctx.shadowBlur = 10; ctx.shadowColor = highlightColor;
        ctx.stroke(); ctx.shadowBlur = 0;
        if (keys['ArrowUp'] && !gameOver) {
            // Thrust particles are now created in gameLoop update section
        }
        ctx.restore();
    }
    function drawAsteroid(ctx, ast) { /* ... (same visual enhancements) ... */
        ctx.save();
        ctx.translate(ast.x, ast.y); ctx.rotate(ast.angle);
        ctx.beginPath(); ctx.moveTo(ast.radius, 0);
        for (let i = 1; i < ast.sides; i++) {
            ctx.lineTo(ast.radius * Math.cos(i * 2 * Math.PI / ast.sides),
                    ast.radius * Math.sin(i * 2 * Math.PI / ast.sides));
        }
        ctx.closePath(); ctx.strokeStyle = ast.color;
        ctx.lineWidth = styleProps?.asteroidLineWidth || 2; ctx.stroke();
        if (styleProps?.asteroidFacetColor) {
            ctx.beginPath();
            for (let i = 0; i < ast.sides; i++) {
            ctx.moveTo(0,0);
            ctx.lineTo(ast.radius * Math.cos(i * 2 * Math.PI / ast.sides),
                        ast.radius * Math.sin(i * 2 * Math.PI / ast.sides));
            }
            ctx.strokeStyle = styleProps.asteroidFacetColor; ctx.lineWidth = 1; ctx.stroke();
        }
        ctx.restore();
    }
    function drawProjectile(ctx, proj) { /* ... (same visual enhancements) ... */
        ctx.save();
        ctx.translate(proj.x, proj.y);
        ctx.rotate(Math.atan2(proj.velocity.y, proj.velocity.x));
        ctx.shadowBlur = 10; ctx.shadowColor = proj.color;
        ctx.beginPath(); ctx.moveTo(0,0);
        ctx.lineTo(-proj.length, 0);
        ctx.strokeStyle = proj.color; ctx.lineWidth = proj.radius * 2;
        ctx.stroke();
        ctx.shadowBlur = 0; ctx.restore();
    }
    function drawStarfield(ctx) { /* ... (same) ... */
        starsRef.current.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 220, ${star.alpha * (0.5 + Math.abs(Math.sin(performance.now() / (1000 + star.radius * 100))))})`;
            ctx.fill();
        });
    }
    function drawGrid(ctx) { /* ... (same) ... */
        if (!visualProps?.gridColor) return;
        const gridSize = 50;
        ctx.strokeStyle = visualProps.gridColor; ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
        }
        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();
    }
    function drawAtmosphericHaze(ctx) { /* ... (same) ... */
        if (visualProps?.fogDensity > 0 && visualProps?.primaryColor) {
            const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width/2);
            let rgbaColor = visualProps.primaryColor.replace('rgb(', 'rgba(').replace(')', `, ${visualProps.fogDensity * 0.5})`);
            if (visualProps.primaryColor.startsWith('#')) {
                const r = parseInt(visualProps.primaryColor.slice(1,3), 16);
                const g = parseInt(visualProps.primaryColor.slice(3,5), 16);
                const b = parseInt(visualProps.primaryColor.slice(5,7), 16);
                rgbaColor = `rgba(${r},${g},${b},${visualProps.fogDensity * 0.5})`;
            }
            gradient.addColorStop(0, `rgba(0,0,0,0)`);
            gradient.addColorStop(1, rgbaColor);
            ctx.fillStyle = gradient;
            ctx.fillRect(0,0, canvas.width, canvas.height);
        }
    }
    function drawParticle(ctx, particle) {
        ctx.save();
        ctx.globalAlpha = particle.alpha > 0 ? particle.alpha : 0;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.restore();
    }

    let animationFrameId;
    function gameLoop() {
        if (gameOver) { /* ... (game over drawing, same) ... */
            ctx.fillStyle = "rgba(0,0,0,0.8)";
            ctx.fillRect(0,0, canvas.width, canvas.height);
            ctx.font = `bold ${styleProps?.gameOverFontSize || '36px'} ${styleProps?.font || 'Arial'}`;
            ctx.fillStyle = styleProps?.gameOverTextColor || "red";
            ctx.textAlign = "center";
            ctx.fillText(gameMessage || "GAME OVER", canvas.width/2, canvas.height/2 - 20);
            ctx.font = `${styleProps?.scoreFontSize || '20px'} ${styleProps?.font || 'Arial'}`;
            ctx.fillStyle = styleProps?.scoreColor || "white";
            ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 20);
            return;
        }

        const p = playerRef.current; const keys = keysPressedRef.current;
        if (!p.isHit) { /* ... (player movement) ... */
            if (keys['ArrowLeft']) p.angle -= p.rotationSpeed;
            if (keys['ArrowRight']) p.angle += p.rotationSpeed;
            if (keys['ArrowUp']) {
                p.velocity.x += Math.cos(p.angle) * p.thrustPower;
                p.velocity.y += Math.sin(p.angle) * p.thrustPower;
                // Create thrust particles
                const exhaustX = p.x - Math.cos(p.angle) * p.radius;
                const exhaustY = p.y - Math.sin(p.angle) * p.radius;
                createParticles(1, exhaustX, exhaustY, styleProps?.thrustColor || 'orange', {
                    speedRange: [1, 3], lifespanRange: [15, 30], radiusRange: [1, 3],
                    emissionAngle: p.angle + Math.PI, // Opposite to ship's direction
                    angleSpread: 0.5 // radians, narrow cone
                });
            }
            p.velocity.x *= p.friction; p.velocity.y *= p.friction;
            p.x += p.velocity.x; p.y += p.velocity.y;
            if (p.x < 0 - p.radius) p.x = canvas.width + p.radius; /* screen wrap */
            if (p.x > canvas.width + p.radius) p.x = 0 - p.radius;
            if (p.y < 0 - p.radius) p.y = canvas.height + p.radius;
            if (p.y > canvas.height + p.radius) p.y = 0 - p.radius;
        }

        asteroidsRef.current.forEach(ast => { /* ... (asteroid movement) ... */
            ast.angle += ast.rotationSpeed;
            ast.x += ast.velocity.x; ast.y += ast.velocity.y;
            if (ast.x < 0 - ast.radius) ast.x = canvas.width + ast.radius;
            if (ast.x > canvas.width + ast.radius) ast.x = 0 - ast.radius;
            if (ast.y < 0 - ast.radius) ast.y = canvas.height + ast.radius;
            if (ast.y > canvas.height + ast.radius) ast.y = 0 - ast.radius;
        });
        projectilesRef.current.forEach(proj => { /* ... (projectile movement, no lifespan here yet) ... */
            proj.x += proj.velocity.x; proj.y += proj.velocity.y;
        });

        // Update Particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const particle = particlesRef.current[i];
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.currentLifespan--;
            particle.alpha = particle.currentLifespan / particle.lifespan;
            if (particle.currentLifespan <= 0) {
                particlesRef.current.splice(i, 1);
            }
        }

        // Projectile lifespan/off-screen removal (kept separate from particle loop for clarity)
        for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
            const proj = projectilesRef.current[i];
            if (performance.now() - proj.birthTime > PROJECTILE_LIFESPAN_MS ||
                proj.x < 0 || proj.x > canvas.width || proj.y < 0 || proj.y > canvas.height) {
            projectilesRef.current.splice(i, 1);
            }
        }

        // Collision Detection: Projectiles vs Asteroids
        for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
            const proj = projectilesRef.current[i];
            for (let j = asteroidsRef.current.length - 1; j >= 0; j--) {
                const ast = asteroidsRef.current[j];
                if (checkCircleCollision(proj, ast)) {
                    projectilesRef.current.splice(i, 1);
                    const originalRadius = ast.radius;
                    createParticles(15, ast.x, ast.y, ast.color, { speedRange: [0.5, 2.5], lifespanRange: [30, 70], radiusRange: [1, 4] });
                    asteroidsRef.current.splice(j, 1);
                    if (originalRadius >= ASTEROID_MAX_SIZE) { /* ... (splitting logic same) ... */
                        setScore(s => s + SCORE_LARGE_ASTEROID);
                        asteroidsRef.current.push(createAsteroid(canvas, ASTEROID_MEDIUM_SIZE, { x: ast.x, y: ast.y }));
                        asteroidsRef.current.push(createAsteroid(canvas, ASTEROID_MEDIUM_SIZE, { x: ast.x, y: ast.y }));
                    } else if (originalRadius >= ASTEROID_MEDIUM_SIZE) {
                        setScore(s => s + SCORE_MEDIUM_ASTEROID);
                        asteroidsRef.current.push(createAsteroid(canvas, ASTEROID_MIN_SIZE, { x: ast.x, y: ast.y }));
                        asteroidsRef.current.push(createAsteroid(canvas, ASTEROID_MIN_SIZE, { x: ast.x, y: ast.y }));
                    } else {
                        setScore(s => s + SCORE_SMALL_ASTEROID);
                        setCurrentObjectivesCompleted(comp => comp + 1);
                        setMineralsFound(prev => ({ ...prev, tamita: prev.tamita + (Math.random() < 0.5 ? 1 : 0), janita: prev.janita + (Math.random() < 0.3 ? 1 : 0) }));
                    }
                    break;
                }
            }
        }

        // Collision Detection: Player vs Asteroids
        if (!p.isHit && p.isVulnerable) {
            for (let j = asteroidsRef.current.length - 1; j >= 0; j--) {
                const ast = asteroidsRef.current[j];
                if (checkCircleCollision(p, ast)) {
                    p.isHit = true;
                    createParticles(50, p.x, p.y, p.color, { speedRange: [1, 4], lifespanRange: [50, 100], radiusRange: [1, 5] });
                    setGameMessage("PLAYER DESTROYED! GAME OVER.");
                    setGameOver(true);
                    break;
                }
            }
        }

        if (!gameOver && currentObjectivesCompleted >= targetObjectivesToDefeat) { /* ... (victory condition same) ... */
             setGameMessage("MISSION COMPLETE!");
             setGameOver(true);
        }

        // Drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = styleProps?.backgroundColor || visualProps?.skyColor || '#030320';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawStarfield(ctx); drawGrid(ctx); drawAtmosphericHaze(ctx);
        particlesRef.current.forEach(particle => drawParticle(ctx, particle)); // Draw particles
        if (!p.isHit) drawPlayer(ctx, p, keys);
        asteroidsRef.current.forEach(ast => drawAsteroid(ctx, ast));
        projectilesRef.current.forEach(proj => drawProjectile(ctx, proj));

        /* ... (UI text drawing same) ... */
        ctx.fillStyle = styleProps?.scoreColor || "white";
        ctx.font = `bold ${styleProps?.uiFontSize || '20px'} ${styleProps?.font || 'Electrolize, sans-serif'}`;
        ctx.textAlign = "left";
        ctx.fillText(`Score: ${score}`, 10, 30);
        ctx.fillText(`Destroyed: ${currentObjectivesCompleted}/${targetObjectivesToDefeat}`, 10, 60);
        ctx.textAlign = "right";
        ctx.fillText(`Mission: ${mission.name}`, canvas.width - 10, 30);

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    gameLoop();
    return () => { /* ... (cleanup same) ... */
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mission, styleProps, visualProps, gameOver, score, currentObjectivesCompleted, targetObjectivesToDefeat, gameMessage]);

  useEffect(() => { /* ... (showClaimButton logic same) ... */
    if (gameOver) {
      setShowClaimButton(true);
    } else {
      setShowClaimButton(false);
    }
  }, [gameOver]); // Simplified dependency

  const handleClaimAndExit = () => { /* ... (same) ... */
    if (currentObjectivesCompleted >= targetObjectivesToDefeat) {
      recordMissionCompletion(mission.reward, mineralsFound);
    }
    onGameFinish();
  };

  if (!mission || !styleProps || !visualProps) { /* ... (same) ... */
    return <div style={{color: 'white', textAlign: 'center', width: '100%'}}>Loading game assets...</div>;
  }

  return (
    <div style={gameContainerStyle}>
      <canvas ref={canvasRef} />
      {gameOver && showClaimButton && (
        <button onClick={handleClaimAndExit} style={claimButtonOverlayStyle}>
          {currentObjectivesCompleted >= targetObjectivesToDefeat ? 'Claim Rewards & Exit' : 'Exit'}
        </button>
      )}
    </div>
  );
};

export default AsteroidsGame;

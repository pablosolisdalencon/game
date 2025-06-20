"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePlayerAccount } from '../../context/PlayerAccountContext';
import VirtualJoystick from '../controls/VirtualJoystick';
import styles from './AsteroidsGame.module.css';

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
    x: 400, y: 300, angle: -Math.PI / 2, velocity: { x: 0, y: 0 },
    rotationSpeed: 0.08, thrustPower: 0.15, friction: 0.985,
    radius: 15, color: 'cyan',
    isHit: false,
    isVulnerable: true,
    joystickAngle: -Math.PI / 2, joystickIntensity: 0, isFiring: false,
  });
  const asteroidsRef = useRef([]);
  const projectilesRef = useRef([]);
  const starsRef = useRef([]);
  const particlesRef = useRef([]);
  const lastShotTimeRef = useRef(0);
  const animationFrameIdRef = useRef(null);

  const [score, setScore] = useState(0);
  const [mineralsFound, setMineralsFound] = useState({ tamita: 0, janita: 0, elenita: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [gameMessage, setGameMessage] = useState("");
  const [showClaimButton, setShowClaimButton] = useState(false);
  const [currentObjectivesCompleted, setCurrentObjectivesCompleted] = useState(0);
  const [targetObjectivesToDefeat, setTargetObjectivesToDefeat] = useState(0);
  const [objectivesCompleted, setObjectivesCompleted] = useState(false); // Boolean flag for final reward logic

  const gameContainerStyle = {
    width: '100%', height: '100%',
    backgroundColor: styleProps?.backgroundColor || visualProps?.skyColor || '#000',
    display: 'flex', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box',
    position: 'relative',
  };
  const claimButtonOverlayStyle = {
    position: 'absolute', top: 'calc(50% + 40px)', left: '50%',
    transform: 'translate(-50%, -50%)', padding: '12px 25px',
    backgroundColor: objectivesCompleted ? (styleProps?.successButtonColor || '#28a745') : (styleProps?.dangerButtonColor || '#dc3545'),
    color: 'white', border: `2px solid ${objectivesCompleted ? (styleProps?.successButtonBorderColor || '#1e7e34') : (styleProps?.dangerButtonBorderColor || '#bd2130')}`,
    borderRadius: '8px', cursor: 'pointer', fontSize: '1.1em', zIndex: 30,
    fontFamily: styleProps?.font || 'Electrolize, sans-serif',
    boxShadow: '0 0 15px rgba(0,0,0,0.7)', textTransform: 'uppercase',
  };

  function checkCircleCollision(circle1, circle2) {
    if (!circle1 || !circle2) return false;
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
  }

  const initializeStars = useCallback((canvas, sRef, vProps) => {
    if (!canvas) return;
    sRef.current = [];
    const starDensity = vProps?.particleEffect === 'star_dust' ? NUM_STARS * 2 : NUM_STARS;
    for (let i = 0; i < starDensity; i++) {
      sRef.current.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        radius: Math.random() * 1.5, alpha: Math.random() * 0.5 + 0.2,
      });
    }
  }, []);

  const createAsteroid = useCallback((canvas, size, position) => {
    let x, y;
    if (!canvas) {
        console.warn("CreateAsteroid: Canvas not available for dimension calculations.");
        x = Math.random() * 800; y = Math.random() * 600;
    } else if (position) {
      x = position.x; y = position.y;
    } else {
      const edge = Math.floor(Math.random() * 4);
      switch (edge) {
        case 0: x = Math.random() * canvas.width; y = 0 - size; break;
        case 1: x = canvas.width + size; y = Math.random() * canvas.height; break;
        case 2: x = Math.random() * canvas.width; y = canvas.height + size; break;
        default: x = 0 - size; y = Math.random() * canvas.height; break;
      }
    }
    const player = playerRef.current;
    if (player && canvas && Math.sqrt((x - player.x)**2 + (y - player.y)**2) < size + player.radius + 100) {
        if(edge === 0 || edge === 2) x = (x + canvas.width/2 + 100) % canvas.width;
        else y = (y + canvas.height/2 + 100) % canvas.height;
    }
    return {
      x, y, radius: size,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.04,
      velocity: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
      color: styleProps?.asteroidColor || 'grey',
      sides: Math.floor(Math.random() * 3) + 5,
    };
  }, [styleProps?.asteroidColor]);

  const createParticles = useCallback((count, startX, startY, baseColor, options = {}) => {
    const {
      speedRange = [0.5, 2], lifespanRange = [30, 60], radiusRange = [1, 3],
      emissionAngle, angleSpread = Math.PI * 2
    } = options;
    for (let i = 0; i < count; i++) {
      const angle = emissionAngle !== undefined
        ? emissionAngle - (angleSpread / 2) + (Math.random() * angleSpread)
        : Math.random() * Math.PI * 2;
      const speed = Math.random() * (speedRange[1] - speedRange[0]) + speedRange[0];
      const lifespan = Math.random() * (lifespanRange[1] - lifespanRange[0]) + lifespanRange[0];
      particlesRef.current.push({
        x: startX, y: startY,
        radius: Math.random() * (radiusRange[1] - radiusRange[0]) + radiusRange[0],
        velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed, },
        color: baseColor, lifespan: lifespan, currentLifespan: lifespan, alpha: 1,
      });
    }
  }, []);

  const handleJoystickMove = useCallback((angle, intensity) => {
    if (!playerRef.current || gameOver) return;
    const player = playerRef.current;
    player.joystickAngle = angle; player.joystickIntensity = intensity;
    player.angle = angle;
    if (intensity > 0.1) {
      player.velocity.x = Math.cos(angle) * player.speed * intensity;
      player.velocity.y = Math.sin(angle) * player.speed * intensity;
    } else {
      player.velocity.x = 0; player.velocity.y = 0;
    }
  }, [gameOver]);

  const handleJoystickEnd = useCallback(() => {
    if (!playerRef.current || gameOver) return;
    playerRef.current.joystickIntensity = 0;
    playerRef.current.velocity.x = 0; playerRef.current.velocity.y = 0;
  }, [gameOver]);

  const handleFireButtonDown = useCallback(() => { if(!gameOver && playerRef.current) playerRef.current.isFiring = true; }, [gameOver]);
  const handleFireButtonUp = useCallback(() => { if(playerRef.current) playerRef.current.isFiring = false; }, []);

  const triggerShot = useCallback(() => {
    if (!playerRef.current || !canvasRef.current || gameOver) return;
    if (performance.now() - lastShotTimeRef.current > FIRE_RATE_COOLDOWN_MS) {
      const p = playerRef.current;
      projectilesRef.current.push({
        x: p.x + Math.cos(p.angle) * p.radius, y: p.y + Math.sin(p.angle) * p.radius,
        radius: styleProps?.laserWidth || 2, length: 15,
        velocity: { x: Math.cos(p.angle) * PROJECTILE_SPEED, y: Math.sin(p.angle) * PROJECTILE_SPEED },
        color: styleProps?.laserColor || '#FF00FF', birthTime: performance.now(),
      });
      lastShotTimeRef.current = performance.now();
    }
  }, [gameOver, styleProps?.laserColor, styleProps?.laserWidth]);

  // Main Game Setup and Loop Effect
  useEffect(() => {
    if (!mission || !styleProps || !visualProps) {
      console.warn("AsteroidsGame: Essential props missing for main setup."); return;
    }
    if (!canvasRef.current) {
      console.error("AsteroidsGame: Canvas ref not available for main setup."); return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("AsteroidsGame: Failed to get canvas context."); return;
    }

    // --- Full Game State Reset ---
    setScore(0); setMineralsFound({ tamita: 0, janita: 0, elenita: 0 });
    setGameOver(false); setGameMessage(""); setShowClaimButton(false);
    setObjectivesCompleted(false);
    setCurrentObjectivesCompleted(0);
    setTargetObjectivesToDefeat(mission.objectives > 0 ? mission.objectives * 4 : 4);
    projectilesRef.current = []; particlesRef.current = [];
    lastShotTimeRef.current = 0;

    const resizeCanvasLogic = () => {
        if (!canvasRef.current || !canvasRef.current.parentElement) {
            console.warn("resizeCanvasLogic: Canvas or parentElement not available.");
            if(canvasRef.current) {
                canvasRef.current.width = 800; canvasRef.current.height = 600;
            }
            return;
        }
        const canvas = canvasRef.current;
        const parent = canvas.parentElement;
        const newWidth = parent.clientWidth;
        const newHeight = parent.clientHeight;

        if (canvas.width !== newWidth || canvas.height !== newHeight) {
            canvas.width = newWidth;
            canvas.height = newHeight;
        }

        playerRef.current = {
            ...playerRef.current,
            x: canvas.width / 2, y: canvas.height / 2,
            color: styleProps?.playerShipColor || 'cyan',
            angle: -Math.PI / 2, velocity: { x: 0, y: 0 },
            isHit: false,
            isVulnerable: true,
            joystickAngle: -Math.PI / 2, joystickIntensity: 0, isFiring: false,
        };

        asteroidsRef.current = [];
        const numInitialAsteroids = mission.objectives > 0 ? mission.objectives : 1;
        for (let i = 0; i < numInitialAsteroids; i++) {
            asteroidsRef.current.push(createAsteroid(canvas, ASTEROID_MAX_SIZE));
        }
        initializeStars(canvas, starsRef, visualProps);
    };

    resizeCanvasLogic();
    window.addEventListener('resize', resizeCanvasLogic);

    function drawPlayer(ctx) {
        const player = playerRef.current;
        if (!player || player.isHit) return;

        ctx.save();
        ctx.translate(player.x, player.y); ctx.rotate(player.angle);
        ctx.beginPath(); ctx.moveTo(player.radius, 0);
        ctx.lineTo(-player.radius * 0.8, player.radius * 0.7);
        ctx.lineTo(-player.radius * 0.4, 0);
        ctx.lineTo(-player.radius * 0.8, -player.radius * 0.7);
        ctx.closePath();
        ctx.fillStyle = player.color; ctx.fill();
        const highlightColor = styleProps?.playerHighlightColor || '#00FFFF';
        ctx.strokeStyle = highlightColor; ctx.lineWidth = 2;
        ctx.shadowBlur = 10; ctx.shadowColor = highlightColor;
        ctx.stroke(); ctx.shadowBlur = 0;
        ctx.restore();
        if (player.joystickIntensity > 0.1 && !gameOver && !player.isHit) {
            ctx.save();
            ctx.translate(player.x, player.y); ctx.rotate(player.angle);
            const flameColor = styleProps?.thrustFlameColor || 'orange';
            ctx.fillStyle = flameColor; ctx.shadowBlur = 15; ctx.shadowColor = flameColor;
            ctx.beginPath(); ctx.moveTo(-player.radius * 0.4, 0);
            ctx.lineTo(-player.radius * 1.8, player.radius * 0.5 * player.joystickIntensity);
            ctx.lineTo(-player.radius * 1.8, -player.radius * 0.5 * player.joystickIntensity);
            ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
            ctx.restore();
        }
    }
    function drawAsteroid(ctx, ast) {
        if(!ast) return;
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
    function drawProjectile(ctx, proj) {
        if(!proj) return;
        ctx.save();
        ctx.translate(proj.x, proj.y);
        ctx.rotate(Math.atan2(proj.velocity.y, proj.velocity.x));
        ctx.shadowBlur = 10; ctx.shadowColor = proj.color;
        ctx.beginPath(); ctx.moveTo(0,0);
        ctx.lineTo(-(proj.length || 10), 0);
        ctx.strokeStyle = proj.color; ctx.lineWidth = (proj.radius || 2) * 2;
        ctx.stroke();
        ctx.shadowBlur = 0; ctx.restore();
    }
    function drawStarfield(ctx) {
        if (!starsRef.current) return;
        starsRef.current.forEach(star => {
            if(!star) return;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 220, ${star.alpha * (0.5 + Math.abs(Math.sin(performance.now() / (1000 + star.radius * 100))))})`;
            ctx.fill();
        });
    }
    function drawGrid(ctx) {
         if (!visualProps?.gridColor) return;
        const gridSize = 50;
        ctx.strokeStyle = visualProps.gridColor; ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
        for (let y = 0; y <= canvas.height; y += gridSize) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
        ctx.stroke();
    }
    function drawAtmosphericHaze(ctx) {
         if (visualProps?.fogDensity > 0 && visualProps?.primaryColor) {
            const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width/2);
            let rgbaColor = visualProps.primaryColor.replace('rgb(', 'rgba(').replace(')', `, ${visualProps.fogDensity * 0.5})`);
            if (visualProps.primaryColor.startsWith('#')) {
                const r = parseInt(visualProps.primaryColor.slice(1,3), 16); const g = parseInt(visualProps.primaryColor.slice(3,5), 16);
                const b = parseInt(visualProps.primaryColor.slice(5,7), 16);
                rgbaColor = `rgba(${r},${g},${b},${visualProps.fogDensity * 0.5})`;
            }
            gradient.addColorStop(0, `rgba(0,0,0,0)`); gradient.addColorStop(1, rgbaColor);
            ctx.fillStyle = gradient; ctx.fillRect(0,0, canvas.width, canvas.height);
        }
    }
    function drawParticle(ctx, particle) {
        if(!particle) return;
        ctx.save();
        ctx.globalAlpha = particle.alpha > 0 ? particle.alpha : 0;
        ctx.fillStyle = particle.color; ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1.0; ctx.restore();
    }
    function drawUI(ctx, canvas) {
        ctx.fillStyle = styleProps?.scoreColor || "white";
        const baseUiFontSize = styleProps?.uiFontSize || 20;
        const uiFont = `bold ${baseUiFontSize / 2}px ${styleProps?.font || 'Electrolize, sans-serif'}`;
        ctx.font = uiFont;
        ctx.textAlign = "left";
        ctx.fillText(`Score: ${score}`, 20, 30);
        ctx.fillText(`Destroyed: ${currentObjectivesCompleted}/${targetObjectivesToDefeat}`, 20, 50);
        ctx.fillText(`Minerals: T:${mineralsFound.tamita} J:${mineralsFound.janita} E:${mineralsFound.elenita}`, 20, 70);
        ctx.textAlign = "right";
        ctx.fillText(`Mission: ${mission.name}`, canvas.width - 20, 30);
        if (gameOver) {
            ctx.textAlign = 'center';
            const baseGameOverFontSize = styleProps?.gameOverFontSize || 36;
            ctx.font = `bold ${baseGameOverFontSize / 2}px ${styleProps?.font || 'Electrolize, sans-serif'}`;
            ctx.fillStyle = gameMessage === "MISSION COMPLETE!" ? (styleProps?.victoryColor || 'lime') : (styleProps?.defeatColor || 'red');
            ctx.fillText(gameMessage, canvas.width / 2, canvas.height / 2 - 30);
            const baseFinalScoreSize = styleProps?.scoreFontSize || 20;
            ctx.font = `${baseFinalScoreSize / 2}px ${styleProps?.font || 'Electrolize, sans-serif'}`;
            ctx.fillStyle = styleProps?.scoreColor || "white";
            ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);
        }
    }

    let localGameOver = gameOver;

    function gameLoop() {
        if (!canvasRef.current || !playerRef.current || !asteroidsRef.current || !projectilesRef.current || !particlesRef.current || !starsRef.current) {
            animationFrameIdRef.current = requestAnimationFrame(gameLoop); return;
        }
        const p = playerRef.current;
        localGameOver = gameOver;

        if (!localGameOver) {
            if (!p.isHit) {
                if (p.joystickIntensity > 0.1) {
                    let diff = p.joystickAngle - p.angle;
                    while (diff < -Math.PI) diff += 2 * Math.PI;
                    while (diff > Math.PI) diff -= 2 * Math.PI;
                    p.angle += diff * p.rotationSpeed * p.joystickIntensity;
                }
                if (p.joystickIntensity > 0.1) {
                    p.velocity.x += Math.cos(p.angle) * p.thrustPower * p.joystickIntensity;
                    p.velocity.y += Math.sin(p.angle) * p.thrustPower * p.joystickIntensity;
                    const exhaustX = p.x - Math.cos(p.angle) * (p.radius + 5);
                    const exhaustY = p.y - Math.sin(p.angle) * (p.radius + 5);
                    createParticles(1, exhaustX, exhaustY, styleProps?.thrustColor || 'orange', {
                        speedRange: [1, 3], lifespanRange: [10, 20], radiusRange: [1, 2.5],
                        emissionAngle: p.angle + Math.PI + (Math.random() - 0.5) * 0.3, angleSpread: 0.4
                    });
                }
                p.velocity.x *= p.friction; p.velocity.y *= p.friction;
                p.x += p.velocity.x; p.y += p.velocity.y;
                if (p.x < 0 - p.radius) p.x = canvas.width + p.radius;
                if (p.x > canvas.width + p.radius) p.x = 0 - p.radius;
                if (p.y < 0 - p.radius) p.y = canvas.height + p.radius;
                if (p.y > canvas.height + p.radius) p.y = 0 - p.radius;
            }

            if (p.isFiring) triggerShot();

            asteroidsRef.current.forEach(ast => {
                if(!ast) return;
                ast.angle += ast.rotationSpeed;
                ast.x += ast.velocity.x; ast.y += ast.velocity.y;
                if (ast.x < 0 - ast.radius) ast.x = canvas.width + ast.radius;
                if (ast.x > canvas.width + ast.radius) ast.x = 0 - ast.radius;
                if (ast.y < 0 - ast.radius) ast.y = canvas.height + ast.radius;
                if (ast.y > canvas.height + ast.radius) ast.y = 0 - ast.radius;
            });
            projectilesRef.current.forEach(proj => {
                 if(!proj) return;
                 proj.x += proj.velocity.x; proj.y += proj.velocity.y;
            });

            for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
                 const proj = projectilesRef.current[i];
                 if(!proj) continue;
                if (performance.now() - proj.birthTime > PROJECTILE_LIFESPAN_MS ||
                    proj.x < 0 || proj.x > canvas.width || proj.y < 0 || proj.y > canvas.height) {
                projectilesRef.current.splice(i, 1);
                }
            }

            for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
                const proj = projectilesRef.current[i];
                if (!proj) continue;
                for (let j = asteroidsRef.current.length - 1; j >= 0; j--) {
                    const ast = asteroidsRef.current[j];
                    if (!ast) continue;
                    if (checkCircleCollision(proj, ast)) {
                        projectilesRef.current.splice(i, 1);
                        const originalRadius = ast.radius;
                        createParticles(Math.floor(ast.radius/2), ast.x, ast.y, ast.color, { speedRange: [0.5, 2.5], lifespanRange: [30, 70], radiusRange: [1, originalRadius/10] });
                        asteroidsRef.current.splice(j, 1);
                        if (originalRadius >= ASTEROID_MAX_SIZE) {
                            setScore(s => s + SCORE_LARGE_ASTEROID);
                            asteroidsRef.current.push(createAsteroid(canvas, ASTEROID_MEDIUM_SIZE, { x: ast.x + (Math.random()-0.5)*10, y: ast.y + (Math.random()-0.5)*10 }));
                            asteroidsRef.current.push(createAsteroid(canvas, ASTEROID_MEDIUM_SIZE, { x: ast.x + (Math.random()-0.5)*10, y: ast.y + (Math.random()-0.5)*10 }));
                        } else if (originalRadius >= ASTEROID_MEDIUM_SIZE) {
                            setScore(s => s + SCORE_MEDIUM_ASTEROID);
                            asteroidsRef.current.push(createAsteroid(canvas, ASTEROID_MIN_SIZE, { x: ast.x + (Math.random()-0.5)*5, y: ast.y + (Math.random()-0.5)*5 }));
                            asteroidsRef.current.push(createAsteroid(canvas, ASTEROID_MIN_SIZE, { x: ast.x + (Math.random()-0.5)*5, y: ast.y + (Math.random()-0.5)*5 }));
                        } else {
                            setScore(s => s + SCORE_SMALL_ASTEROID);
                            setCurrentObjectivesCompleted(comp => comp + 1);
                            setMineralsFound(prev => ({ ...prev, tamita: prev.tamita + (Math.random() < 0.5 ? 1 : 0), janita: prev.janita + (Math.random() < 0.3 ? 1 : 0) }));
                        }
                        break;
                    }
                }
            }

            if (!p.isHit && p.isVulnerable) {
                 for (let j = asteroidsRef.current.length - 1; j >= 0; j--) {
                    const ast = asteroidsRef.current[j];
                     if (!ast) continue;
                    if (checkCircleCollision(p, ast)) {
                        p.isHit = true;
                        createParticles(50, p.x, p.y, p.color, { speedRange: [1, 4], lifespanRange: [50, 100], radiusRange: [1, 5] });
                        setGameMessage("PLAYER DESTROYED!");
                        setGameOver(true); localGameOver = true;
                        break;
                    }
                }
            }

            if (!localGameOver && currentObjectivesCompleted >= targetObjectivesToDefeat && targetObjectivesToDefeat > 0) {
                setGameMessage("MISSION COMPLETE!");
                setObjectivesCompleted(true);
                setGameOver(true); localGameOver = true;
            }
        }

        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const particle = particlesRef.current[i];
            if(!particle) continue;
            particle.x += particle.velocity.x; particle.y += particle.velocity.y;
            particle.currentLifespan--;
            particle.alpha = Math.max(0, particle.currentLifespan / particle.lifespan);
            if (particle.currentLifespan <= 0) { particlesRef.current.splice(i, 1); }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = styleProps?.backgroundColor || visualProps?.skyColor || '#030320';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawStarfield(ctx); drawGrid(ctx); drawAtmosphericHaze(ctx);
        particlesRef.current.forEach(particle => drawParticle(ctx, particle));

        if (!playerRef.current.isHit || !localGameOver) drawPlayer(ctx);
        asteroidsRef.current.forEach(ast => drawAsteroid(ctx, ast));
        projectilesRef.current.forEach(proj => drawProjectile(ctx, proj));

        drawUI(ctx, canvas);

        animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    }

    animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    return () => {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
        }
        window.removeEventListener('resize', resizeCanvasLogic);
    };
  }, [mission, styleProps, visualProps, initializeStars, createAsteroid, createParticles, triggerShot, score, currentObjectivesCompleted, targetObjectivesToDefeat, gameOver, gameMessage, mineralsFound]); // Added missing React states to dependency array

  useEffect(() => {
    if (gameOver) { setShowClaimButton(true);
      if (currentObjectivesCompleted >= targetObjectivesToDefeat && targetObjectivesToDefeat > 0) {
          if(gameMessage !== "MISSION COMPLETE!") setGameMessage("MISSION COMPLETE!");
          if(!objectivesCompleted) setObjectivesCompleted(true);
      } else if (playerRef.current?.isHit && gameMessage !== "PLAYER DESTROYED!") {
          setGameMessage("PLAYER DESTROYED!");
      } else if (!gameMessage) {
          setGameMessage("GAME OVER");
      }
    } else {
      setShowClaimButton(false);
    }
  }, [gameOver, currentObjectivesCompleted, targetObjectivesToDefeat, gameMessage, objectivesCompleted]);

  const handleClaimAndExit = () => {
    if (objectivesCompleted) {
      recordMissionCompletion(mission.reward, mineralsFound);
    }
    onGameFinish();
  };

  if (!mission || !styleProps || !visualProps) {
    return <div style={{color: 'white', textAlign: 'center', width: '100%'}}>Loading game assets...</div>;
  }

  return (
    <div style={gameContainerStyle}>
      <canvas ref={canvasRef} className={styles.gameCanvas} />
      {!gameOver && (
        <>
          <div className={styles.joystickWrapper}>
            <VirtualJoystick onMove={handleJoystickMove} onEnd={handleJoystickEnd} size={100} knobSize={50} />
          </div>
          <button
            className={styles.fireButton}
            onTouchStart={handleFireButtonDown} onTouchEnd={handleFireButtonUp}
            onMouseDown={handleFireButtonDown} onMouseUp={handleFireButtonUp}
          >
            FIRE
          </button>
        </>
      )}
      {gameOver && showClaimButton && (
        <button onClick={handleClaimAndExit} style={claimButtonOverlayStyle}>
          {objectivesCompleted ? 'Claim Rewards & Exit' : 'Exit'}
        </button>
      )}
    </div>
  );
};

export default AsteroidsGame;

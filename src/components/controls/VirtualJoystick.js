"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './VirtualJoystick.module.css';

const VirtualJoystick = ({ onMove, onEnd, size = 120, knobSize = 60 }) => {
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const baseRef = useRef(null);
  const joystickStateRef = useRef({ isDragging: false, angle: 0, intensity: 0 }); // To avoid stale closures in window event listeners

  const maxDist = size / 2 - knobSize / 2;

  const handleInteractionStart = useCallback((clientX, clientY) => {
    if (!baseRef.current) return;
    setIsDragging(true);
    joystickStateRef.current.isDragging = true;
    // No need to calculate offset if knob starts at center
  }, []);

  const handleInteractionMove = useCallback((clientX, clientY) => {
    if (!joystickStateRef.current.isDragging || !baseRef.current) return;

    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let currentAngle = Math.atan2(dy, dx);
    let currentIntensity = Math.min(1, distance / maxDist);

    let newX = 0;
    let newY = 0;

    if (distance > maxDist) {
      newX = Math.cos(currentAngle) * maxDist;
      newY = Math.sin(currentAngle) * maxDist;
    } else {
      newX = dx;
      newY = dy;
    }

    setKnobPos({ x: newX, y: newY });
    joystickStateRef.current.angle = currentAngle;
    joystickStateRef.current.intensity = currentIntensity;
    if (onMove) {
      onMove(currentAngle, currentIntensity);
    }
  }, [maxDist, onMove]);

  const handleInteractionEnd = useCallback(() => {
    if (!joystickStateRef.current.isDragging) return;

    setIsDragging(false);
    joystickStateRef.current.isDragging = false;
    setKnobPos({ x: 0, y: 0 });
    if (onEnd) {
      onEnd();
    }
    joystickStateRef.current.intensity = 0; // Reset intensity in ref as well
    if (onMove) { // Explicitly call onMove with zero intensity if needed by parent
        onMove(joystickStateRef.current.angle, 0);
    }
  }, [onEnd, onMove]);


  // Mouse event handlers
  const onMouseDown = (e) => handleInteractionStart(e.clientX, e.clientY);
  const onMouseMoveWindow = useCallback((e) => handleInteractionMove(e.clientX, e.clientY), [handleInteractionMove]);
  const onMouseUpWindow = useCallback(() => handleInteractionEnd(), [handleInteractionEnd]);

  // Touch event handlers
  const onTouchStart = (e) => {
    e.preventDefault(); // Prevent scrolling/other default touch actions
    const touch = e.touches[0];
    handleInteractionStart(touch.clientX, touch.clientY);
  };
  const onTouchMoveWindow = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleInteractionMove(touch.clientX, touch.clientY);
  }, [handleInteractionMove]);
  const onTouchEndWindow = useCallback(() => handleInteractionEnd(), [handleInteractionEnd]);


  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMoveWindow);
      window.addEventListener('mouseup', onMouseUpWindow);
      window.addEventListener('touchmove', onTouchMoveWindow, { passive: false });
      window.addEventListener('touchend', onTouchEndWindow);
      window.addEventListener('touchcancel', onTouchEndWindow);
    } else {
      window.removeEventListener('mousemove', onMouseMoveWindow);
      window.removeEventListener('mouseup', onMouseUpWindow);
      window.removeEventListener('touchmove', onTouchMoveWindow);
      window.removeEventListener('touchend', onTouchEndWindow);
      window.removeEventListener('touchcancel', onTouchEndWindow);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMoveWindow);
      window.removeEventListener('mouseup', onMouseUpWindow);
      window.removeEventListener('touchmove', onTouchMoveWindow);
      window.removeEventListener('touchend', onTouchEndWindow);
      window.removeEventListener('touchcancel', onTouchEndWindow);
    };
  }, [isDragging, onMouseMoveWindow, onMouseUpWindow, onTouchMoveWindow, onTouchEndWindow]);

  return (
    <div
      ref={baseRef}
      className={styles.base}
      style={{ '--joystick-size': `${size}px` }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <div
        className={styles.knob}
        style={{
          '--knob-size': `${knobSize}px`,
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
        }}
      />
    </div>
  );
};

export default VirtualJoystick;

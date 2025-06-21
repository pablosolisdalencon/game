"use client";
import React from 'react';
import { usePlayerAccount } from '../../context/PlayerAccountContext';
// We expect styles for .account-details, .menu-header to be in a global CSS like ui.css

const PlayerStatusMenu = () => {
  const { eWaveTokens, minerals } = usePlayerAccount();

  return (
    <div className="slot-menu account-details">
      <span className="menu-header">CUENTA</span>
      <div>eWaveTokens: {eWaveTokens}</div>
      <div>Tamita: {minerals.tamita}</div>
      <div>Janita: {minerals.janita}</div>
      <div>Elenita: {minerals.elenita}</div>
    </div>
  );
};

export default PlayerStatusMenu;

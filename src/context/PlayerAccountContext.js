"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';

const PlayerAccountContext = createContext(null);

export const PlayerAccountProvider = ({ children }) => {
  const [eWaveTokens, setEWaveTokens] = useState(0);
  const [minerals, setMinerals] = useState({ tamita: 0, janita: 0, elenita: 0 });

  const addEWaves = useCallback((amount) => {
    setEWaveTokens(prevTokens => prevTokens + amount);
  }, []);

  const addMinerals = useCallback((mineralType, amount) => {
    setMinerals(prevMinerals => {
      if (Object.prototype.hasOwnProperty.call(prevMinerals, mineralType)) {
        return {
          ...prevMinerals,
          [mineralType]: prevMinerals[mineralType] + amount,
        };
      }
      console.warn(`Attempted to add unknown mineral type: ${mineralType}`);
      return prevMinerals;
    });
  }, []);

  const recordMissionCompletion = useCallback((rewardEWaves, newMinerals) => {
    addEWaves(rewardEWaves);
    if (newMinerals) {
      for (const mineralType in newMinerals) {
        if (Object.prototype.hasOwnProperty.call(newMinerals, mineralType) && newMinerals[mineralType] > 0) {
          addMinerals(mineralType, newMinerals[mineralType]);
        }
      }
    }
    console.log(`Mission completed. Rewarded: ${rewardEWaves} eWaves, Minerals:`, newMinerals);
  }, [addEWaves, addMinerals]);

  const contextValue = {
    eWaveTokens,
    minerals,
    addEWaves,
    addMinerals,
    recordMissionCompletion,
  };

  return (
    <PlayerAccountContext.Provider value={contextValue}>
      {children}
    </PlayerAccountContext.Provider>
  );
};

export const usePlayerAccount = () => {
  const context = useContext(PlayerAccountContext);
  if (context === null) {
    throw new Error('usePlayerAccount must be used within a PlayerAccountProvider');
  }
  return context;
};

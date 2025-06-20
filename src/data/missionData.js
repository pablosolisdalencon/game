export const locations = [
  "Mars", "Europa", "Titan", "Ganymede", "Callisto",
  "Io", "Ceres", "Vesta", "Phobos", "Deimos"
];

export const minigameTypes = ["Asteroids", "Tower Defense", "Survival"];

// Helper to get a cleaner office name
const getOfficeName = (officeId) => {
  if (!officeId) return "Unknown Office";
  return officeId.replace(/Build$/, '').replace(/([A-Z])/g, ' $1').trim(); // Example: "mineriaBuild" -> "Mineria"
};

// Helper for mission name variations
const generateMissionName = (officeName, minigameType, location, difficulty) => {
  const nameTemplates = [
    `Operation ${location}: ${minigameType} Challenge for ${officeName}`,
    `${officeName} Initiative: Secure ${location} (${minigameType}, Lvl ${difficulty})`,
    `Critical Alert: ${minigameType} Deployment on ${location} - ${officeName} Sector`,
    `${location} Expedition: ${officeName}'s ${minigameType} Task (Tier ${difficulty})`,
    `Special Contract for ${officeName}: ${minigameType} on ${location}`,
  ];
  return nameTemplates[Math.floor(Math.random() * nameTemplates.length)];
};

// Helper for mission description variations
const generateMissionDescription = (minigameType, location, difficulty, officeName) => {
  let narrative = "";
  switch (minigameType) {
    case "Asteroids":
      narrative = `The ${officeName} division requires urgent mineral extraction in the hazardous asteroid fields of ${location}. Navigate carefully and meet the quota.`;
      break;
    case "Tower Defense":
      narrative = `${officeName} forces must defend a critical outpost on ${location} against incoming hostile waves. Strategic tower placement is key to survival.`;
      break;
    case "Survival":
      narrative = `A distress signal from ${location} indicates an operative from ${officeName} is stranded. Hold out against environmental threats and hostiles until extraction.`;
      break;
    default:
      narrative = `A standard operational task for the ${officeName} has been issued for ${location}.`;
  }
  return `${narrative} \n\n[Minigame: ${minigameType}] [Location: ${location}] [Difficulty: ${difficulty}]`;
};


export const generateMissions = (officeId) => {
  const missions = [];
  const officeDisplayName = getOfficeName(officeId);

  for (let i = 0; i < 10; i++) {
    const difficulty = i + 1;
    const selectedMinigameType = minigameTypes[Math.floor(Math.random() * minigameTypes.length)];
    const selectedLocation = locations[Math.floor(Math.random() * locations.length)];

    const missionName = generateMissionName(officeDisplayName, selectedMinigameType, selectedLocation, difficulty);
    const missionDescription = generateMissionDescription(selectedMinigameType, selectedLocation, difficulty, officeDisplayName);

    missions.push({
      id: `${officeId}-mission-${i}`, // Unique ID for the mission
      name: missionName,
      location: selectedLocation,
      reward: (difficulty) * 100, // Incremental eWaveTokens
      description: missionDescription,
      minigameType: selectedMinigameType,
      difficulty: difficulty, // Incremental number from 1 to 10
      objectives: difficulty * 5, // Number of objectives based on difficulty
    });
  }
  return missions;
};

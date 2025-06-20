export const locations = [
  "Mars", "Europa", "Titan", "Ganymede", "Callisto",
  "Io", "Ceres", "Vesta", "Phobos", "Deimos"
];

export const minigameTypes = ["Asteroids", "Tower Defense", "Survival"];

export const generateMissions = (officeId) => {
  const missions = [];
  const usedLocations = new Set(); // To ensure unique locations for variety if needed, or just use as is for now

  for (let i = 0; i < 10; i++) {
    const difficulty = i + 1;
    const minigameType = minigameTypes[Math.floor(Math.random() * minigameTypes.length)];

    let location = locations[Math.floor(Math.random() * locations.length)];
    // Optional: Ensure unique locations per office if desired, by checking usedLocations and picking another if already used.
    // For now, we'll allow duplicate locations for simplicity as the requirement is 10 unique missions, not unique locations.

    const missionName = `${officeId.replace('Build', '')} Mission ${difficulty} on ${location}`;

    missions.push({
      id: `${officeId}-mission-${i}`,
      name: missionName,
      location: location,
      reward: (i + 1) * 100, // Incremental eWaveTokens
      description: `Complete objectives for this mission. [Minigame: ${minigameType}] [Location: ${location}] [Difficulty: ${difficulty}]`,
      minigameType: minigameType,
      difficulty: difficulty,
      objectives: difficulty * 5,
    });
  }
  return missions;
};

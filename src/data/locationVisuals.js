import { locations } from './missionData.js'; // Assuming missionData.js is in the same directory

export const locationSettings = {
  [locations[0]]: { // Mars
    skyColor: "rgb(210, 140, 80)",
    groundTexture: "mars_rock_texture.png",
    ambientLight: "0.6",
    fogDensity: "0.05",
    filterEffect: "sepia(0.3)",
  },
  [locations[1]]: { // Europa
    skyColor: "rgb(40, 60, 100)",
    groundTexture: "europa_ice_texture.png",
    particleEffect: "subtle_ice_glimmer.js",
    primaryColor: "cyan",
    ambientLight: "0.3",
    fogDensity: "0.01",
  },
  [locations[2]]: { // Titan
    skyColor: "rgb(200, 180, 100)",
    groundTexture: "titan_methane_lakes_texture.png",
    particleEffect: "methane_rain.js",
    primaryColor: "orange",
    ambientLight: "0.4",
    fogDensity: "0.2",
  },
  [locations[3]]: { // Ganymede
    skyColor: "rgb(100, 120, 150)",
    groundTexture: "ganymede_rocky_ice_texture.png",
    ambientLight: "0.5",
    fogDensity: "0.02",
    auroraEffect: "faint_green_aurora.js",
  },
  [locations[4]]: { // Callisto
    skyColor: "rgb(70, 70, 90)",
    groundTexture: "callisto_cratered_surface.png",
    ambientLight: "0.2",
    fogDensity: "0.0",
    shadowIntensity: "0.7",
  },
  [locations[5]]: { // Io
    skyColor: "rgb(220, 200, 50)",
    groundTexture: "io_volcanic_plains.png",
    particleEffect: "sulfur_geysers.js",
    primaryColor: "yellow",
    ambientLight: "0.7",
    hazeEffect: "yellow_haze.js",
  },
  [locations[6]]: { // Ceres
    skyColor: "rgb(150, 150, 160)",
    groundTexture: "ceres_dusty_surface.png",
    ambientLight: "0.4",
    fogDensity: "0.005",
    craterDecals: "many_small_craters.png",
  },
  [locations[7]]: { // Vesta
    skyColor: "rgb(170, 160, 150)",
    groundTexture: "vesta_rocky_terrain.png",
    ambientLight: "0.45",
    fogDensity: "0.0",
    sunGlareEffect: "moderate_glare.js",
  },
  [locations[8]]: { // Phobos
    skyColor: "rgb(50, 50, 60)",
    groundTexture: "phobos_dark_rock.png",
    ambientLight: "0.15",
    fogDensity: "0.0",
    marsVisible: "large_red_planet_in_sky.js",
  },
  [locations[9]]: { // Deimos
    skyColor: "rgb(60, 60, 70)",
    groundTexture: "deimos_light_dust_rock.png",
    ambientLight: "0.25",
    fogDensity: "0.0",
    starsVisible: "bright_starfield.js",
  }
};

// World DATA, not world LOGIC. This file describes what islands exist;
// islands.js is what knows how to turn that description into geometry.
// Adding a 6th island means adding an entry here — nothing in islands.js
// needs to change.
//
// lat/lon: position on the planet sphere (see docs/coordinate-system.md)
// size: island radius, in planet-relative units
// forest: whether tree clusters are generated on this island
// mainIsland: slightly denser tree placement + treated as the "primary" island

export const islandData = [
  { lat: 8, lon: 30, size: 0.28, forest: true, mainIsland: true },
  { lat: 22, lon: 55, size: 0.10, forest: true, mainIsland: false },
  { lat: -10, lon: 10, size: 0.07, forest: false, mainIsland: false },
  { lat: 3, lon: -20, size: 0.06, forest: true, mainIsland: false },
  { lat: -25, lon: 60, size: 0.08, forest: false, mainIsland: false },
];

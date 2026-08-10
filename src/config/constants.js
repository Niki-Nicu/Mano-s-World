// Central home for numeric/string constants shared across modules.
// If a value is used in more than one file, or represents a "world fact"
// (planet size, camera limits), it belongs here — not duplicated inline.

export const PLANET_RADIUS = 5;

export const ORBIT = {
  initialRadius: 16,
  minRadius: 6.4,
  maxRadius: 26,
  initialTheta: Math.PI * 0.32,
  initialPhi: Math.PI * 0.42,
  dragSensitivity: 0.0045,
  zoomSensitivity: 0.012,
  pinchSensitivity: 0.02,
  easing: 0.08,
  minPhi: 0.18,
  maxPhiOffset: 0.18, // max phi = PI - this
};

export const STARFIELD = {
  layers: [
    { count: 2200, spread: 140, size: 0.32, color: 0xdfe8f2 },
    { count: 500, spread: 90, size: 0.55, color: 0xbfd4ff },
  ],
};

export const LIGHTING = {
  ambient: { color: 0x1a2a3a, intensity: 0.9 },
  sun: { color: 0xfff2d8, intensity: 1.35, position: [12, 8, 6] },
  rim: { color: 0x4a7fb5, intensity: 0.4, position: [-10, -4, -8] },
};

export const PLANET_MATERIAL = {
  ocean: { color: 0x0b3d5c, emissive: 0x03121d, specular: 0x6fa8c9, shininess: 38 },
  atmosphere: { color: 0x4fa9e0, opacity: 0.14, scale: 1.045 },
  rimGlow: { color: 0x2c6fa0, opacity: 0.06, scale: 1.12 },
};

export const IDLE_ROTATION_SPEED = 0.0009;

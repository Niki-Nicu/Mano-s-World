import * as THREE from 'three';

/**
 * Generates vibrant, crisp Earth-from-orbit planetary surface textures (continents, mountain ranges,
 * irregular polar ice caps with sea ice leads, gradual coastal shelf turquoise transitions, 
 * deep ocean bathymetry, and desert/forest biomes) calibrated for clean WebGL lighting.
 */

function pseudoNoise(x, y) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x, y) {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;

  const smoothX = fx * fx * (3 - 2 * fx);
  const smoothY = fy * fy * (3 - 2 * fy);

  const n00 = pseudoNoise(i, j);
  const n10 = pseudoNoise(i + 1, j);
  const n01 = pseudoNoise(i, j + 1);
  const n11 = pseudoNoise(i + 1, j + 1);

  const nx0 = n00 + smoothX * (n10 - n00);
  const nx1 = n01 + smoothX * (n11 - n01);

  return nx0 + smoothY * (nx1 - nx0);
}

function fbm(x, y, octaves = 6) {
  let val = 0;
  let amp = 0.5;
  let freq = 1.0;
  for (let i = 0; i < octaves; i++) {
    val += smoothNoise(x * freq, y * freq) * amp;
    freq *= 2.02;
    amp *= 0.5;
  }
  return val;
}

// Ridged multifractal noise for sharp alpine mountain ridges
function ridgedNoise(x, y, octaves = 5) {
  let val = 0;
  let amp = 0.5;
  let freq = 1.0;
  for (let i = 0; i < octaves; i++) {
    let n = smoothNoise(x * freq, y * freq);
    n = 1.0 - Math.abs(n * 2.0 - 1.0);
    val += n * n * amp;
    freq *= 2.04;
    amp *= 0.48;
  }
  return val;
}

// Computes elevation at normalized coordinates (u, v)
function getElevation(u, v) {
  const warpX = u * 3.6 + Math.sin(v * 4.2) * 0.42;
  const warpY = v * 2.2 + Math.cos(u * 4.8) * 0.32;

  const baseGeo = fbm(warpX, warpY, 6);
  const detailGeo = fbm(u * 12.0 + 4.1, v * 6.0 + 2.3, 4) * 0.2;
  const coastalFractal = fbm(u * 28.0 + 1.2, v * 14.0 + 7.8, 3) * 0.08;

  let elevation = baseGeo * 0.72 + detailGeo + coastalFractal;

  const lakeNoise = fbm(u * 9.0 + 8.2, v * 4.5 + 3.1, 3);
  if (elevation > 0.48 && elevation < 0.56 && lakeNoise < 0.28) {
    elevation -= 0.12; // Carves inland seas/lakes
  }

  return elevation;
}

/**
 * Generates a vibrant, clear Earth satellite surface texture map with visible oceans,
 * bright continents, turquoise coastal shelves, deserts, green rainforests, and polar caps.
 */
export function createOceanTexture() {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  // Pre-calculate elevation grid
  const elevMap = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    const v = y / height;
    for (let x = 0; x < width; x++) {
      const u = x / width;
      elevMap[y * width + x] = getElevation(u, v);
    }
  }

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const lat = (v - 0.5) * Math.PI; // -PI/2 to PI/2
    const absLat = Math.abs(lat);

    for (let x = 0; x < width; x++) {
      const u = x / width;
      const elevation = elevMap[y * width + x];

      // Subtle terrain slope micro-shading (without pre-darkening the texture)
      const xLeft = x > 0 ? x - 1 : width - 1;
      const xRight = x < width - 1 ? x + 1 : 0;
      const yUp = y > 0 ? y - 1 : 0;
      const yDown = y < height - 1 ? y + 1 : height - 1;

      const dzdx = (elevMap[y * width + xRight] - elevMap[y * width + xLeft]) * 4.0;
      const dzdy = (elevMap[yDown * width + x] - elevMap[yUp * width + x]) * 4.0;

      const slopeDetail = (dzdx - dzdy) * 12.0;

      let r = 0, g = 0, b = 0;

      // 1. Irregular Polar Ice Caps & Sea Ice Leads (lat > ~70 deg)
      const iceNoise = fbm(u * 24.0 + 3.7, v * 12.0 + 9.1, 4);
      const iceFracture = fbm(u * 48.0 + 1.1, v * 24.0 + 4.5, 3);
      const isIceRegion = absLat > 1.22;

      if (isIceRegion && (absLat > 1.34 || iceNoise > 0.38)) {
        if (iceFracture < 0.22 && absLat < 1.45) {
          // Sea ice fracture lead showing clear blue ocean
          r = 20;
          g = 95;
          b = 165;
        } else {
          // Glaciated ice sheet / pack ice (brilliant white)
          r = 242;
          g = 248;
          b = 255;
        }
      }
      // 2. Continental Landmasses (elevation > 0.47)
      else if (elevation > 0.47) {
        const landH = (elevation - 0.47) / 0.53; // 0.0 to 1.0 (land height)

        const ridges = ridgedNoise(u * 14.0, v * 7.0, 5);
        const mountainFactor = Math.pow(ridges, 2.2) * (landH > 0.14 ? (landH - 0.14) * 1.6 : 0.0);

        const moistureNoise = fbm(u * 8.0 + 2.4, v * 4.0 + 6.1, 4);
        const windwardSlope = dzdx * 0.3;
        const moisture = Math.max(0.0, Math.min(1.0, moistureNoise + windwardSlope - absLat * 0.25));

        if (landH + mountainFactor * 0.5 > 0.66) {
          // Snowy Glaciated Mountain Peaks
          const snowT = Math.min(1.0, (landH + mountainFactor * 0.5 - 0.66) / 0.34);
          r = Math.floor(225 + snowT * 30);
          g = Math.floor(232 + snowT * 23);
          b = Math.floor(242 + snowT * 13);
        } else if (mountainFactor > 0.26 || landH > 0.46) {
          // Rocky Alpine Slopes & Highlands
          const rockT = Math.min(1.0, (mountainFactor + landH - 0.28) / 0.5);
          r = Math.floor(138 + rockT * 70);
          g = Math.floor(128 + rockT * 65);
          b = Math.floor(115 + rockT * 60);
        } else if (landH < 0.035) {
          // Coastal Beaches, Sand Bars & Estuaries
          r = 218;
          g = 198;
          b = 152;
        } else {
          // Biomes: Vibrant satellite colors
          if (absLat < 0.38) {
            // Tropical Latitudes: Rainforest vs Arid Scrubland
            if (moisture > 0.45) {
              // Deep Tropical Rainforest
              const t = (moisture - 0.45) / 0.55;
              r = Math.floor(38 + t * 25);
              g = Math.floor(135 + t * 45);
              b = Math.floor(52 + t * 20);
            } else {
              // Savannah / Arid Scrubland
              r = Math.floor(168 - moisture * 50);
              g = Math.floor(175 - moisture * 35);
              b = Math.floor(98 - moisture * 30);
            }
          } else if (absLat >= 0.38 && absLat < 0.64) {
            // Sub-Tropical Desert Belt (Sahara / Atacama golden sand & clay)
            if (moisture < 0.42) {
              const desertT = (0.42 - moisture) / 0.42;
              r = Math.floor(205 + desertT * 35);
              g = Math.floor(172 + desertT * 25);
              b = Math.floor(112 + desertT * 15);
            } else {
              // Woodland & Grassland
              r = Math.floor(78 + landH * 35);
              g = Math.floor(155 + landH * 40);
              b = Math.floor(72 + landH * 30);
            }
          } else if (absLat >= 0.64 && absLat < 1.08) {
            // Temperate Forest & Boreal Taiga
            r = Math.floor(52 + landH * 40);
            g = Math.floor(138 + landH * 45);
            b = Math.floor(62 + landH * 35);
          } else {
            // Sub-Polar Tundra
            const tundraT = (absLat - 1.08) / 0.14;
            r = Math.floor(152 + tundraT * 60);
            g = Math.floor(172 + tundraT * 60);
            b = Math.floor(162 + tundraT * 70);
          }
        }

        // Add fine mountain ridge slope micro-contrast
        r = Math.max(0, Math.min(255, r + slopeDetail));
        g = Math.max(0, Math.min(255, g + slopeDetail));
        b = Math.max(0, Math.min(255, b + slopeDetail));
      } 
      // 3. Gradual Coastal Turquoise Shelf & Lagoon Transitions (0.38 < elevation <= 0.47)
      else if (elevation > 0.38) {
        const shelfT = (elevation - 0.38) / 0.09;
        
        if (shelfT > 0.70) {
          // Very shallow intertidal lagoon / turquoise coral sand shelf
          const t = (shelfT - 0.70) / 0.30;
          r = Math.floor(45 + t * 50);
          g = Math.floor(198 + t * 25);
          b = Math.floor(220 - t * 15);
        } else if (shelfT > 0.35) {
          // Mid coastal shelf teal water
          const t = (shelfT - 0.35) / 0.35;
          r = Math.floor(25 + t * 20);
          g = Math.floor(148 + t * 50);
          b = Math.floor(192 + t * 28);
        } else {
          // Deep coastal slope drop-off
          const t = shelfT / 0.35;
          r = Math.floor(15 + t * 10);
          g = Math.floor(95 + t * 53);
          b = Math.floor(155 + t * 37);
        }
      } 
      // 4. Clear Deep Oceans & Abyssal Trenches (elevation <= 0.38)
      else {
        const oceanDepth = (0.38 - elevation) / 0.38;
        const trenchNoise = fbm(u * 14.0 + 1.7, v * 7.0 + 8.2, 3);
        const depthVal = Math.min(1.0, oceanDepth + trenchNoise * 0.15);

        // Vibrant deep blue ocean palette
        r = Math.floor(12 - depthVal * 6);
        g = Math.floor(72 - depthVal * 32);
        b = Math.floor(142 - depthVal * 42);

        const ripple = (pseudoNoise(x * 0.1, y * 0.1) - 0.5) * 4;
        r = Math.max(0, Math.min(255, r + ripple));
        g = Math.max(0, Math.min(255, g + ripple));
        b = Math.max(0, Math.min(255, b + ripple));
      }

      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Generates planetary specular map with crisp coastal boundaries, lagoons, and matte land.
 */
export function createOceanSpecularMap() {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const lat = (v - 0.5) * Math.PI;
    const absLat = Math.abs(lat);

    for (let x = 0; x < width; x++) {
      const u = x / width;
      const elevation = getElevation(u, v);

      let spec = 235;

      const iceNoise = fbm(u * 24.0 + 3.7, v * 12.0 + 9.1, 3);

      if (absLat > 1.22 && (absLat > 1.34 || iceNoise > 0.38)) {
        spec = 55;
      } else if (elevation > 0.47) {
        spec = 16;
      } else if (elevation > 0.38) {
        const shelfT = (elevation - 0.38) / 0.09;
        spec = Math.floor(140 + shelfT * 70);
      }

      const idx = (y * width + x) * 4;
      data[idx] = spec;
      data[idx + 1] = spec;
      data[idx + 2] = spec;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Generates planetary cloud systems with equatorial ITCZ bands, mid-latitude cyclonic storm spirals,
 * wispy high-altitude cirrus veils, and semi-transparent cloud layers.
 */
export function createCloudTexture() {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, width, height);
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const lat = (v - 0.5) * Math.PI;
    const absLat = Math.abs(lat);

    for (let x = 0; x < width; x++) {
      const u = x / width;

      const equatorialBelt = Math.exp(-lat * lat * 22.0);
      const midLatBelt = Math.exp(-Math.pow(absLat - 0.72, 2) * 16.0);
      const polarBelt = Math.exp(-Math.pow(absLat - 1.25, 2) * 18.0);
      const latitudeWeight = equatorialBelt * 0.90 + midLatBelt * 0.95 + polarBelt * 0.45;

      const cloudNoise1 = fbm(u * 7.0, v * 3.5, 6);
      const cloudNoise2 = fbm(u * 16.0 + 3.4, v * 8.0 + 5.2, 5);
      const cirrusNoise = fbm(u * 36.0 + 8.1, v * 18.0 + 2.7, 4);

      const swirlAngle = Math.atan2(v - 0.5, u - 0.5);
      const swirlDist = Math.hypot(u - 0.5, v - 0.5);
      const swirlX = u * 10.0 + Math.sin(swirlAngle * 4.0 + swirlDist * 12.0 + cloudNoise1 * 3.0) * 0.35;
      const swirlY = v * 5.0 + Math.cos(swirlAngle * 4.0 + swirlDist * 12.0 + cloudNoise2 * 3.0) * 0.28;
      const swirlNoise = fbm(swirlX, swirlY, 5);

      let cumulus = (cloudNoise1 * 0.45 + cloudNoise2 * 0.30 + swirlNoise * 0.25) * latitudeWeight;
      let cirrus = cirrusNoise * 0.35 * (1.0 - cumulus * 0.5);

      let alpha = cumulus + cirrus;

      alpha = Math.pow(Math.max(0.0, alpha - 0.24) / 0.76, 1.35);
      alpha = Math.min(0.88, alpha * 1.55);

      const idx = (y * width + x) * 4;
      const colorVal = Math.floor(238 + cirrusNoise * 17);
      data[idx] = colorVal;
      data[idx + 1] = Math.min(255, colorVal + 4);
      data[idx + 2] = 255;
      data[idx + 3] = Math.floor(alpha * 255);
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

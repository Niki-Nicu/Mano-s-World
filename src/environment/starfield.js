import * as THREE from 'three';
import { STARFIELD } from '../config/constants.js';

function buildStarLayer({ count, spread, size, color }) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const r = spread * (0.6 + Math.random() * 0.4);
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color,
    size,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
  });

  return new THREE.Points(geometry, material);
}

/**
 * Creates the layered starfield and adds it directly to the given scene.
 * @param {THREE.Scene} scene
 */
export function addStarfield(scene) {
  for (const layer of STARFIELD.layers) {
    scene.add(buildStarLayer(layer));
  }
}

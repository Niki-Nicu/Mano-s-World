import * as THREE from 'three';
import { PLANET_RADIUS, PLANET_MATERIAL } from '../config/constants.js';

/**
 * Builds the planetary shell: ocean sphere, atmosphere glow, outer rim glow.
 * Currently this IS the whole planet (Phase I is ocean + islands only),
 * but this module is the long-term home for land/continents/clouds as
 * the planet grows — it is not permanently synonymous with "ocean".
 * Returns a THREE.Group containing everything, so islands.js can add
 * island groups as children of the same group (see islands.js).
 */
export function createPlanet() {
  const planetGroup = new THREE.Group();

  const oceanGeometry = new THREE.SphereGeometry(PLANET_RADIUS, 96, 96);
  const oceanMaterial = new THREE.MeshPhongMaterial(PLANET_MATERIAL.ocean);
  const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
  planetGroup.add(ocean);

  const atmosphereGeometry = new THREE.SphereGeometry(
    PLANET_RADIUS * PLANET_MATERIAL.atmosphere.scale,
    64,
    64
  );
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: PLANET_MATERIAL.atmosphere.color,
    transparent: true,
    opacity: PLANET_MATERIAL.atmosphere.opacity,
    side: THREE.BackSide,
  });
  planetGroup.add(new THREE.Mesh(atmosphereGeometry, atmosphereMaterial));

  const rimGeometry = new THREE.SphereGeometry(
    PLANET_RADIUS * PLANET_MATERIAL.rimGlow.scale,
    48,
    48
  );
  const rimMaterial = new THREE.MeshBasicMaterial({
    color: PLANET_MATERIAL.rimGlow.color,
    transparent: true,
    opacity: PLANET_MATERIAL.rimGlow.opacity,
    side: THREE.BackSide,
  });
  planetGroup.add(new THREE.Mesh(rimGeometry, rimMaterial));

  return planetGroup;
}

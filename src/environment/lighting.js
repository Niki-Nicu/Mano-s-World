import * as THREE from 'three';
import { LIGHTING } from '../config/constants.js';

/**
 * Creates the current lighting setup (ambient + sun + rim) and adds it
 * directly to the given scene.
 * @param {THREE.Scene} scene
 */
export function addLighting(scene) {
  const ambient = new THREE.AmbientLight(LIGHTING.ambient.color, LIGHTING.ambient.intensity);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(LIGHTING.sun.color, LIGHTING.sun.intensity);
  sun.position.set(...LIGHTING.sun.position);
  scene.add(sun);

  const rim = new THREE.DirectionalLight(LIGHTING.rim.color, LIGHTING.rim.intensity);
  rim.position.set(...LIGHTING.rim.position);
  scene.add(rim);
}

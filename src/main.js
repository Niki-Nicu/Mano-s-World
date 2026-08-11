import './styles/main.css';

import { createEngine } from './core/engine.js';
import { createOrbitControls } from './core/orbitControls.js';
import { addStarfield } from './environment/starfield.js';
import { addLighting } from './environment/lighting.js';
import { createPlanet } from './world/planet.js';
import { addIslands } from './world/islands.js';
import { initOverlay } from './ui/overlay.js';
import { IDLE_ROTATION_SPEED } from './config/constants.js';

const canvas = document.getElementById('scene');
const { scene, camera, render } = createEngine(canvas);
const controls = createOrbitControls(canvas);

addStarfield(scene);
addLighting(scene);

const planet = createPlanet();
addIslands(planet);
scene.add(planet);

initOverlay();

let idleRotation = 0;

function animate() {
  requestAnimationFrame(animate);

  controls.applyTo(camera);

  if (!controls.state.isDragging) {
    idleRotation += IDLE_ROTATION_SPEED;
    planet.rotation.y = idleRotation;
  }

  if (planet.userData.cloudsMesh) {
    planet.userData.cloudsMesh.rotation.y += IDLE_ROTATION_SPEED * 0.35;
    if (planet.userData.cloudShadowMesh) {
      planet.userData.cloudShadowMesh.rotation.y = planet.userData.cloudsMesh.rotation.y;
    }
  }

  render();
}

animate();

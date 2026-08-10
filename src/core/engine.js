import * as THREE from 'three';

/**
 * Bootstraps the core Three.js engine: renderer, scene, camera, and
 * resize handling. Knows nothing about the planet, islands, or any
 * world-specific content — it would look identical for any 3D scene.
 * @param {HTMLCanvasElement} canvas
 */
export function createEngine(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070d);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function render() {
    renderer.render(scene, camera);
  }

  return { renderer, scene, camera, render };
}

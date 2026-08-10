import { ORBIT } from '../config/constants.js';

/**
 * Hand-rolled orbit camera controls (drag to rotate, wheel/pinch to zoom),
 * with no external dependency. Attaches listeners to the given canvas and
 * returns an object whose `applyTo(camera)` should be called once per frame.
 * @param {HTMLCanvasElement} canvas
 */
export function createOrbitControls(canvas) {
  const state = {
    radius: ORBIT.initialRadius,
    theta: ORBIT.initialTheta,
    phi: ORBIT.initialPhi,
    targetTheta: ORBIT.initialTheta,
    targetPhi: ORBIT.initialPhi,
    targetRadius: ORBIT.initialRadius,
    isDragging: false,
  };

  let lastX = 0;
  let lastY = 0;
  let pinchDist = null;

  canvas.addEventListener('pointerdown', (e) => {
    state.isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.classList.add('dragging');
  });

  window.addEventListener('pointerup', () => {
    state.isDragging = false;
    canvas.classList.remove('dragging');
  });

  window.addEventListener('pointermove', (e) => {
    if (!state.isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    state.targetTheta -= dx * ORBIT.dragSensitivity;
    state.targetPhi -= dy * ORBIT.dragSensitivity;
    state.targetPhi = clampPhi(state.targetPhi);
  });

  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      state.targetRadius += e.deltaY * ORBIT.zoomSensitivity;
      state.targetRadius = clampRadius(state.targetRadius);
    },
    { passive: false }
  );

  canvas.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length === 1) {
        state.isDragging = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        pinchDist = touchDistance(e.touches);
      }
    },
    { passive: true }
  );

  canvas.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length === 1 && state.isDragging) {
        const dx = e.touches[0].clientX - lastX;
        const dy = e.touches[0].clientY - lastY;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        state.targetTheta -= dx * ORBIT.dragSensitivity;
        state.targetPhi -= dy * ORBIT.dragSensitivity;
        state.targetPhi = clampPhi(state.targetPhi);
      } else if (e.touches.length === 2) {
        const d = touchDistance(e.touches);
        if (pinchDist) {
          state.targetRadius += (pinchDist - d) * ORBIT.pinchSensitivity;
          state.targetRadius = clampRadius(state.targetRadius);
        }
        pinchDist = d;
      }
    },
    { passive: true }
  );

  window.addEventListener('touchend', () => {
    state.isDragging = false;
    pinchDist = null;
  });

  function clampPhi(phi) {
    return Math.max(ORBIT.minPhi, Math.min(Math.PI - ORBIT.maxPhiOffset, phi));
  }

  function clampRadius(radius) {
    return Math.max(ORBIT.minRadius, Math.min(ORBIT.maxRadius, radius));
  }

  function touchDistance(touches) {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  }

  /**
   * Eases current orbit values toward their targets and positions the
   * given camera accordingly. Call once per frame.
   */
  function applyTo(camera) {
    state.theta += (state.targetTheta - state.theta) * ORBIT.easing;
    state.phi += (state.targetPhi - state.phi) * ORBIT.easing;
    state.radius += (state.targetRadius - state.radius) * ORBIT.easing;

    const sinPhi = Math.sin(state.phi);
    camera.position.set(
      state.radius * sinPhi * Math.cos(state.theta),
      state.radius * Math.cos(state.phi),
      state.radius * sinPhi * Math.sin(state.theta)
    );
    camera.lookAt(0, 0, 0);
  }

  return { state, applyTo };
}

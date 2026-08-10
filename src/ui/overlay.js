// The title/subtitle/hint fade behavior is currently pure CSS animation
// (see src/styles/main.css), so there is no timing logic to run from JS
// today. This file exists so that if overlay behavior ever needs to
// respond to world state (e.g. hide the hint once the user has
// interacted, show new text on a location transition), that logic has
// an obvious, DOM-only home that never touches WebGL code.

/**
 * Placeholder init hook for future overlay behavior driven by world state.
 * Currently a no-op — the overlay is fully CSS-driven.
 */
export function initOverlay() {
  // Intentionally empty for Phase I.
}

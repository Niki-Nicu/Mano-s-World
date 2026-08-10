// Single source of truth for resolving paths to files in public/.
//
// WHY THIS EXISTS:
// Vite only rewrites asset URLs it can see statically — in HTML, in CSS
// `url(...)`, or in a JS `import`. A raw string like "/models/tree.glb"
// typed inside application code is invisible to Vite at build time, so
// it is never corrected for the deployed base path. It will work on
// localhost (served from "/") and silently 404 on GitHub Pages (served
// from "/mano-world/").
//
// THE RULE:
// Any loader (GLTFLoader, TextureLoader, AudioLoader, etc.) reading a
// file from public/ must resolve its path through assetUrl() — never
// through a raw "/..." string. This is the only place the repo's base
// path is consulted; nothing else in the codebase should reference it.

/**
 * Resolve a path to a file in public/, honoring Vite's configured base path.
 * @param {string} relativePath - path relative to public/, WITHOUT a leading slash
 *   (e.g. "models/tree.glb", not "/models/tree.glb").
 * @returns {string} a URL that works correctly both in dev and after
 *   deployment to a sub-path (e.g. GitHub Pages).
 */
export function assetUrl(relativePath) {
  if (relativePath.startsWith('/')) {
    throw new Error(
      `assetUrl() expects a relative path without a leading "/". Received: "${relativePath}"`
    );
  }
  return `${import.meta.env.BASE_URL}${relativePath}`;
}

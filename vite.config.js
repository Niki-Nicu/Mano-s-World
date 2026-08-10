import { defineConfig } from 'vite';

// IMPORTANT: `base` must match the GitHub repository name exactly
// (e.g. if the repo is github.com/you/mano-world, base is '/mano-world/').
// Every asset path in the project goes through import.meta.env.BASE_URL
// (see src/config/assetPaths.js) so this is the ONLY place the repo
// name needs to be written. Update it here if the repo is ever renamed.
export default defineConfig({
  base: '/mano-world/',
});

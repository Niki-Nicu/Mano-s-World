# Mano's World — Architecture

Technical documentation only. Creative/lore content lives in `docs/world-bible/` and is intentionally kept separate from this file.

## Current phase

**Phase 0 (foundation) complete → Phase 1 (planet) is the current visual target.**

## Project structure

```
mano-world/
├── index.html            Minimal HTML shell — canvas + overlay markup only
├── package.json
├── vite.config.js         Sets `base` for GitHub Pages deployment
├── .gitignore
│
├── public/                Static assets served as-is (empty for now)
│
├── src/
│   ├── main.js             Entry point — wires everything together, owns the render loop
│   │
│   ├── core/                Engine-level systems, world-agnostic
│   │   ├── engine.js          Renderer, scene, camera, resize handling
│   │   └── orbitControls.js   Hand-rolled drag/wheel/touch camera controls
│   │
│   ├── world/                Defines and builds the planet and its contents
│   │   ├── planet.js           Planetary shell: ocean, atmosphere, rim glow
│   │   ├── islands.js          Island-building LOGIC (reads islandData)
│   │   └── islandData.js       Island DATA — plain objects, no rendering code
│   │
│   ├── environment/          Ambient systems layered over the world
│   │   ├── starfield.js
│   │   └── lighting.js
│   │
│   ├── ui/                   DOM/overlay concerns — deliberately isolated from WebGL
│   │   └── overlay.js
│   │
│   ├── styles/
│   │   └── main.css
│   │
│   ├── config/                Shared constants and conventions
│   │   ├── constants.js         Planet radius, zoom limits, colors, etc.
│   │   └── assetPaths.js        assetUrl() — see "Asset strategy" below
│   │
│   └── assets/                 Small, code-coupled assets loaded via `import`
│                                 (icons, tiny textures) — NOT public/ assets
│
└── docs/
    ├── architecture.md         This file
    ├── coordinate-system.md
    └── world-bible/            Creative lore — kept separate from tech docs
```

## Folders NOT created yet, on purpose

`character/`, `interaction/`, `audio/`, `systems/`, `data/locations`,
`data/characters`, `public/models`, `public/audio`, `public/textures`.

Principle: **design for future expansion, implement only what the current
phase requires.** Each of these gets created the moment its corresponding
system is actually built — never before, since empty folders create
navigation noise without pulling any weight.

## Data vs. logic

`world/islandData.js` (data) is separate from `world/islands.js` (logic).
Adding a new island means adding an entry to the data file — the
rendering code in `islands.js` never has to change. This is the pattern
we'll extend if/when island data eventually migrates to standalone JSON
files under a future `data/world/` directory (not needed yet at 5 islands).

## Asset strategy

Two categories, two rules — no exceptions:

**1. `src/assets/`** — small assets tightly coupled to specific code
(icons, tiny textures used by one module). Reference via a normal JS
`import`:
```js
import treeIconUrl from '../assets/icons/tree.svg';
```
Vite sees `import` statements at build time and rewrites the resulting
URL correctly, including the base path — no manual work needed.

**2. `public/`** — larger, runtime-loaded assets (3D models, audio,
textures loaded via `GLTFLoader`/`TextureLoader`/`AudioLoader`). These
are loaded via a runtime string, which Vite *cannot* see or rewrite.
Every reference to a `public/` asset MUST go through `assetUrl()`:
```js
import { assetUrl } from '../config/assetPaths.js';
loader.load(assetUrl('models/tree.glb'), ...);
```
`assetUrl()` reads `import.meta.env.BASE_URL` — Vite's live reflection
of whatever `base` is set to in `vite.config.js`. This means the repo
name is written in exactly one place (`vite.config.js`); nothing else
in the codebase ever hardcodes it. `assetUrl()` throws if given a path
with a leading `/`, to prevent the exact silent-404 mistake this rule
exists to avoid.

**Never** reference a `public/` asset as a raw `"/whatever/path"` string
anywhere in the codebase.

## Naming conventions

- Variables/functions: `camelCase`
- Classes: `PascalCase` (none exist yet — introduced when a real class,
  e.g. a future `WorldManager`, is needed)
- JS files: `camelCase.js`
- Folders: lowercase
- Markdown files: `kebab-case.md`
- Future asset filenames: `kebab-case`

## Technology choices

- **Vite** — enables real ES module imports across many small files and
  produces a clean static `dist/` for GitHub Pages, without meaningful
  overhead over the previous CDN `<script>` approach.
- **Plain JavaScript, not TypeScript (for now)** — the world's data
  shapes (islands, and later terrain/entities) are still being
  imagined, not yet stable. TypeScript pays off once those shapes settle
  — revisit around Phase 2–3, once island/character/save-state schemas
  exist and stop shifting weekly. JSDoc comments are used where they add
  clarity in the meantime.

## Deployment

`npm run build` → outputs to `dist/` (git-ignored, regenerated) →
deployed to GitHub Pages. `vite.config.js`'s `base` must match the repo
name exactly, or asset/module paths 404 once deployed to a sub-path.
The specific deployment mechanism (GitHub Actions vs. manual `gh-pages`
branch) will be decided when we're actually ready to deploy — not part
of this architecture.

## Future expansion principle

*Design for future expansion, implement only what the current phase
requires.* When a new feature is requested, always consider: where does
it belong, should it be data-driven, will it scale, will it force a
refactor of something already built. If a decision risks real technical
debt, flag it before implementing rather than after.

# Mano's World

A fictional planet, grown slowly — a personal tribute project.

Not a website. A doorway into a world.

## Current phase

**Phase 1 — The Planet.** Space, a spherical ocean planet, a handful of
small islands. No character, no continents, no transition yet — those
come later, deliberately.

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — project structure, tech choices, asset strategy
- [`docs/coordinate-system.md`](docs/coordinate-system.md) — how spatial coordinates work and will scale
- [`docs/world-bible/`](docs/world-bible/) — creative lore (kept separate from technical docs)

## Philosophy

This project is developed slowly and deliberately. Nothing is built
just because it's technically possible. See `docs/architecture.md` for
the full principle: *design for future expansion, implement only what
the current phase requires.*

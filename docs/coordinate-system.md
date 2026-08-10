# Mano's World — Coordinate System

## Current system (Phase 1)

Islands are placed using **latitude/longitude on the planet sphere**,
converted to a Cartesian `Vector3` via `latLonToVector3()` in
`src/world/islands.js`. This is a **planet-surface coordinate system** —
it places and orients a whole island *group* on the sphere, aligning the
island's local "up" direction with the sphere's outward surface normal
at that point.

## The hidden second system, already in use

An island's trees are positioned with small `(tx, tz)` offsets *inside
the island group's own local space* — a flat, local X/Z coordinate
system centered on the island's own origin. This already exists today,
informally, inside `addTrees()` in `islands.js`. It works because
Three.js `Group` objects give every child its own local coordinate
frame for free, inherited from the parent's position/orientation.

## The planned hierarchy

```
Planet coordinates       (lat/lon → Vector3 on sphere)
        ↓  island group's own local origin + orientation
Island-local coordinates  (flat X/Z around island center — exists today)
        ↓  future: terrain chunk offsets
Object/entity coordinates (trees, buildings, characters)
```

## Why this scales without new systems being built now

Because Three.js's group parent/child transforms already provide
separate coordinate frames at each level, **the planet-to-island
transition (Phase 2) is a camera animation problem, not a coordinate-math
problem.** Flying the camera from planet-space into a specific island's
local space doesn't require inventing a new conversion system — the
island group already *is* a local coordinate frame; the camera just
needs to animate into it.

When Phase 3 (real island terrain) arrives, the informal local system
used for trees today gets formalized as: **"meters from island center,
flat ground plane, Y-up."** No new data model, just naming what's
already implicit in the code.

## What is intentionally NOT built yet

- Terrain-chunk coordinate/streaming system
- Object/entity coordinate conventions beyond the simple offsets
  currently used for tree placement
- Any conversion utilities beyond `latLonToVector3()`

These are deferred until the corresponding system (terrain, characters)
is actually being built — this document exists so nobody has to
reverse-engineer the intended hierarchy from code later.

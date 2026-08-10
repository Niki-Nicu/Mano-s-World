import * as THREE from 'three';
import { PLANET_RADIUS } from '../config/constants.js';
import { islandData } from './islandData.js';

const SAND_COLOR = 0xd9c08a;
const GRASS_COLOR = 0x4a8a4f;
const FOREST_COLOR = 0x2f6b3a;
const TRUNK_COLOR = 0x5b3d24;

/**
 * Converts planet-surface latitude/longitude into a Vector3 on the
 * sphere of the given radius. See docs/coordinate-system.md for how
 * this relates to island-local coordinates.
 */
function latLonToVector3(lat, lon, radius) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/** Randomly displaces X/Z vertices of a geometry for an organic, non-perfect silhouette. */
function jitter(geometry, amount) {
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * amount);
    pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * amount);
  }
  geometry.computeVertexNormals();
}

function addTrees(group, size, treeCount) {
  for (let i = 0; i < treeCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * size * 0.5;
    const tx = Math.cos(angle) * r;
    const tz = Math.sin(angle) * r;
    const treeHeight = size * (0.22 + Math.random() * 0.16);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(treeHeight * 0.05, treeHeight * 0.07, treeHeight * 0.35, 5),
      new THREE.MeshPhongMaterial({ color: TRUNK_COLOR })
    );
    trunk.position.set(tx, size * 0.14 + treeHeight * 0.17, tz);

    const foliage = new THREE.Mesh(
      new THREE.ConeGeometry(treeHeight * 0.32, treeHeight * 0.7, 6),
      new THREE.MeshPhongMaterial({ color: FOREST_COLOR })
    );
    foliage.position.set(tx, size * 0.14 + treeHeight * 0.55, tz);

    group.add(trunk, foliage);
  }
}

/**
 * Builds a single island group (sand base + grass core + optional trees),
 * positioned and oriented on the planet surface at the given lat/lon.
 */
function buildIslandGroup({ lat, lon, size, forest, mainIsland }) {
  const position = latLonToVector3(lat, lon, PLANET_RADIUS);
  const normal = position.clone().normalize();

  const group = new THREE.Group();
  group.position.copy(position);
  group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

  const baseGeometry = new THREE.IcosahedronGeometry(size, 1);
  baseGeometry.scale(1, 0.16, 1);
  jitter(baseGeometry, size * 0.12);
  const base = new THREE.Mesh(
    baseGeometry,
    new THREE.MeshPhongMaterial({ color: SAND_COLOR, shininess: 4 })
  );
  base.position.y = size * 0.05;
  group.add(base);

  const coreGeometry = new THREE.IcosahedronGeometry(size * 0.68, 1);
  coreGeometry.scale(1, 0.22, 1);
  jitter(coreGeometry, size * 0.08);
  const core = new THREE.Mesh(
    coreGeometry,
    new THREE.MeshPhongMaterial({ color: GRASS_COLOR, shininess: 2 })
  );
  core.position.y = size * 0.12;
  group.add(core);

  if (forest) {
    addTrees(group, size, mainIsland ? 14 : 6);
  }

  return group;
}

/**
 * Reads islandData and builds every island as a child of the given
 * planet group. This is where data and logic are reunited, at the
 * single point of use.
 * @param {THREE.Group} planetGroup
 */
export function addIslands(planetGroup) {
  for (const island of islandData) {
    planetGroup.add(buildIslandGroup(island));
  }
}

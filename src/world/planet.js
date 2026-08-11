import * as THREE from 'three';
import { PLANET_RADIUS, LIGHTING } from '../config/constants.js';
import {
  createOceanTexture,
  createOceanSpecularMap,
  createCloudTexture,
} from './proceduralTextures.js';

/**
 * Builds the photorealistic Earth-like planetary shell viewed from orbit:
 * - Surface with ocean bathymetry, continental geology, and specular ocean glint
 * - Cloud shadow projection layer casting soft dark shadows onto land & oceans
 * - Procedural multi-layer cloud atmosphere with independent drift
 * - Thin, delicate Rayleigh atmospheric scattering with soft twilight terminator transitions
 */
export function createPlanet() {
  const planetGroup = new THREE.Group();

  // 1. Ocean & Continental Surface with depth color variation and specular map
  const oceanMap = createOceanTexture();
  const oceanSpecularMap = createOceanSpecularMap();

  const oceanGeometry = new THREE.SphereGeometry(PLANET_RADIUS, 96, 96);
  const oceanMaterial = new THREE.MeshPhongMaterial({
    map: oceanMap,
    specularMap: oceanSpecularMap,
    color: 0xffffff,
    specular: 0x5da8d6,
    shininess: 45,
  });
  const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
  planetGroup.add(ocean);

  // Shared high-resolution cloud texture map
  const cloudMap = createCloudTexture();

  // 2. Cloud Shadow Projection Layer (casts realistic 3D shadows onto continents & oceans)
  const shadowGeometry = new THREE.SphereGeometry(PLANET_RADIUS * 1.003, 96, 96);
  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: cloudMap,
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
    side: THREE.FrontSide,
    color: 0x01050d, // Dark shadow color
  });
  const cloudShadow = new THREE.Mesh(shadowGeometry, shadowMaterial);

  // Offset shadow mesh slightly away from sun direction to project 3D cloud depth
  const sunPos = new THREE.Vector3(...LIGHTING.sun.position).normalize();
  cloudShadow.position.set(-sunPos.x * 0.018, -sunPos.y * 0.018, -sunPos.z * 0.018);
  planetGroup.add(cloudShadow);
  planetGroup.userData.cloudShadowMesh = cloudShadow;

  // 3. Procedural Cloud Layer around the planet
  const cloudGeometry = new THREE.SphereGeometry(PLANET_RADIUS * 1.016, 96, 96);
  const cloudMaterial = new THREE.MeshPhongMaterial({
    map: cloudMap,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
  });
  const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
  planetGroup.add(clouds);
  planetGroup.userData.cloudsMesh = clouds;

  // 4. Thin, Delicate Rayleigh Atmospheric Limb Scattering & Soft Twilight Shader
  const atmosphereGeometry = new THREE.SphereGeometry(PLANET_RADIUS * 1.025, 96, 96);

  const atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      uniform vec3 sunPosition;

      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        vec3 norm = normalize(vNormal);

        // Thin, sharp atmospheric rim intensity
        float viewDot = dot(norm, viewDir);
        float rimIntensity = pow(clamp(0.85 - viewDot, 0.0, 1.0), 3.2);

        vec3 sunDir = normalize(sunPosition);
        float sunDot = dot(norm, sunDir);

        // Soft day-night twilight scattering transition along terminator
        float dayFactor = smoothstep(-0.25, 0.30, sunDot);
        float twilightTerm = pow(1.0 - abs(sunDot), 3.8);

        vec3 daySky = vec3(0.24, 0.64, 0.98); // Crisp space blue
        vec3 twilightSky = vec3(0.94, 0.40, 0.16); // Soft Rayleigh amber/coral
        vec3 nightSky = vec3(0.02, 0.06, 0.18);

        vec3 skyColor = mix(nightSky, daySky, dayFactor);
        skyColor = mix(skyColor, twilightSky, twilightTerm * 0.62);

        float alpha = rimIntensity * (0.15 + 0.85 * dayFactor);
        gl_FragColor = vec4(skyColor, alpha);
      }
    `,
    uniforms: {
      sunPosition: { value: new THREE.Vector3(...LIGHTING.sun.position) },
    },
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
  });

  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  planetGroup.add(atmosphere);

  return planetGroup;
}

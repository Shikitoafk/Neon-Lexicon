// src/scene.js
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { initRain } from './rain.js';

let scene, camera, renderer, labelRenderer, controls;
let playerPosition = new THREE.Vector3(0, 1.8, 0);
let flashlight;
let buildingInstanced;
let buildingHolograms = [];
let rainGroup;
let clock = new THREE.Clock();

// Utility: generate a random float in range
const rand = (min, max) => Math.random() * (max - min) + min;

function initScene() {
  // ------- Renderer -------
  const canvas = document.getElementById('webgl-canvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ------- CSS2D Renderer for labels -------
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none';
  document.getElementById('css2d-labels').appendChild(labelRenderer.domElement);

  // ------- Scene & Camera -------
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a1a, 0.02);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 400);
  camera.position.copy(playerPosition);

  // ------- Controls (PointerLock) -------
  controls = new PointerLockControls(camera, document.body);
  document.body.addEventListener('click', () => {
    controls.lock();
  });

  // After lock, we attach a flashlight to the camera
  flashlight = new THREE.SpotLight(0xffffff, 0.8, 30, Math.PI / 6, 0.5, 1);
  flashlight.position.set(0, 0, 0);
  flashlight.target.position.set(0, 0, -1);
  flashlight.castShadow = true;
  camera.add(flashlight);
  camera.add(flashlight.target);

  // ------- Lights ------
  const hemi = new THREE.HemisphereLight(0x223344, 0x111122, 0.6);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xddddff, 0.8);
  dir.position.set(40, 80, 40);
  dir.castShadow = true;
  scene.add(dir);

  // ------- Ground ------
  const groundGeo = new THREE.PlaneGeometry(500, 500);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a12,
    roughness: 0.5,
    metalness: 0.3,
    side: THREE.DoubleSide
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // ------- City Buildings (InstancedMesh) ------
  const bCount = 200; // number of buildings
  const buildingGeo = new THREE.BoxGeometry(1, 1, 1);
  const buildingMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a1a,
    roughness: 0.35,
    metalness: 0.8,
    emissive: 0x001133,
    emissiveIntensity: 0.2
  });
  buildingInstanced = new THREE.InstancedMesh(buildingGeo, buildingMat, bCount);
  buildingInstanced.castShadow = true;
  buildingInstanced.receiveShadow = true;

  const dummy = new THREE.Object3D();
  for (let i = 0; i < bCount; i++) {
    const w = rand(8, 18);
    const h = rand(20, 80);
    const d = rand(8, 18);
    const x = rand(-150, 150);
    const z = rand(-150, 150);
    dummy.scale.set(w, h, d);
    dummy.position.set(x, h / 2, z);
    dummy.updateMatrix();
    buildingInstanced.setMatrixAt(i, dummy.matrix);

    // Store an optional hologram for tall buildings
    if (h > 45) {
      const holoGeo = new THREE.OctahedronGeometry(2.2, 0);
      const holoMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.6
      });
      const holo = new THREE.Mesh(holoGeo, holoMat);
      holo.position.set(x, h + 3, z);
      scene.add(holo);
      buildingHolograms.push(holo);
    }
  }
  scene.add(buildingInstanced);

  // ------- Rain (Particle System) ------
  initRain(); // creates global rainGroup and adds to scene

  // ------- Event Listeners for Movement (Arrow Keys) ------
  const activeKeys = {};
  const speed = 6; // units per second

  document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      activeKeys[e.key] = true;
    }
  });
  document.addEventListener('keyup', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      activeKeys[e.key] = false;
    }
  });

  // ------- Game Loop Hook (called from main.js) ------
  function update(dt) {
    // PLAYER MOVEMENT (logic on XZ plane) ---------------------------------
    const moveVec = new THREE.Vector3();
    if (activeKeys['ArrowUp']) moveVec.z -= 1;
    if (activeKeys['ArrowDown']) moveVec.z += 1;
    if (activeKeys['ArrowLeft']) moveVec.x -= 1;
    if (activeKeys['ArrowRight']) moveVec.x += 1;
    if (moveVec.lengthSq() > 0) {
      moveVec.normalize();
      // Rotate movement according to camera yaw (ignore pitch)
      const yaw = controls.getObject().rotation.y;
      const sin = Math.sin(yaw);
      const cos = Math.cos(yaw);
      const dx = moveVec.x * cos - moveVec.z * sin;
      const dz = moveVec.x * sin + moveVec.z * cos;
      const newPos = playerPosition.clone();
      newPos.x += dx * speed * dt;
      newPos.z += dz * speed * dt;
      // Simple ground plane collision (stay within bounds)
      if (newPos.x > -250 && newPos.x < 250 && newPos.z > -250 && newPos.z < 250) {
        playerPosition.copy(newPos);
      }
    }
    // Keep camera at logical player position (excluding shake)
    camera.position.copy(playerPosition);

    // Update building holograms rotation (slow spin) ----------------------
    buildingHolograms.forEach(h => {
      h.rotation.y += 0.005;
    });
  }

  // expose for main.js
  window.__GAME_UPDATE = update; // hook used by main loop
}

function animate(dt, time) {
  // Render scene and label renderer (called each frame)
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  labelRenderer.setSize(w, h);
}

export { initScene, animate, onResize, playerPosition, buildingInstanced, buildingHolograms, __GAME_UPDATE };

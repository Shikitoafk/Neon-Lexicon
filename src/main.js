import { supabase } from './supabase.js';

// Neon Lexicon: Survival 3D - Three.js FPS Typing Engine with Supabase Auth & Profile Sync

// ==================== SURVIVAL DICTIONARY POOL (Expanded) ====================
const FALLBACK_VOCAB = [
  // Level 1: Beginner (1-2 chars)
  { en: "a", ru: "артикль", level: 1 },
  { en: "an", ru: "артикль", level: 1 },
  { en: "the", ru: "артикль", level: 1 },
  { en: "in", ru: "в", level: 1 },
  { en: "at", ru: "у", level: 1 },
  { en: "to", ru: "к", level: 1 },
  { en: "up", ru: "вверх", level: 1 },
  { en: "do", ru: "делать", level: 1 },
  
  // Level 2: Medium (3-5 chars)
  { en: "time", ru: "время", level: 2 },
  { en: "world", ru: "мир", level: 2 },
  { en: "learn", ru: "учить", level: 2 },
  { en: "help", ru: "помощь", level: 2 },
  { en: "city", ru: "город", level: 2 },
  { en: "ammo", ru: "патроны", level: 2 },
  { en: "fear", ru: "страх", level: 2 },
  { en: "look", ru: "смотреть", level: 2 },

  // Level 3: Hard (6+ chars)
  { en: "polyglot", ru: "полиглот", level: 3 },
  { en: "paraphrase", ru: "парафраз", level: 3 },
  { en: "orthography", ru: "орфография", level: 3 },
  { en: "survival", ru: "выживание", level: 3 },
  { en: "apocalypse", ru: "апокалипсис", level: 3 },
  { en: "infection", ru: "инфекция", level: 3 },
  { en: "building", ru: "здание", level: 3 },
  { en: "adrenaline", ru: "адреналин", level: 3 },

  // Special: Academic Words
  { en: "education", ru: "образование", level: 2, type: 'academic' },
  { en: "research", ru: "исследование", level: 3, type: 'academic' },
  { en: "knowledge", ru: "знание", level: 3, type: 'academic' },

  // Special: Hyper-bot Words
  { en: "disconnect", ru: "отключить", level: 3, type: 'hyperbot' },
  { en: "reboot", ru: "перезагрузка", level: 2, type: 'hyperbot' },
  { en: "delete", ru: "удалить", level: 2, type: 'hyperbot' },

  // Special: Lexicographer Words
  { en: "theophilanthropy", ru: "теофилантропия", level: 3, type: 'lexicographer' },
  { en: "photobiology", ru: "фотобиология", level: 3, type: 'lexicographer' },
  { en: "paralanguage", ru: "паралингвистика", level: 3, type: 'lexicographer' }
];

// ==================== SOUND SYNTH SYSTEM ====================
const SoundSynth = {
  ctx: null,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  resumeContext() {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  playClick() {
    this.resumeContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  },

  playLaser() {
    this.resumeContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  },

  playExplosion() {
    this.resumeContext();
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(30, now + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.4);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noiseNode.start(now);
    noiseNode.stop(now + 0.4);
  },

  playError() {
    this.resumeContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(70, now + 0.25);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  },

  playHurt() {
    this.resumeContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  },

  playVictory() {
    this.resumeContext();
    const now = this.ctx.currentTime;
    const notes = [293.66, 349.23, 440.00, 587.33]; // Arpeggio
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.1);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + index * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + index * 0.1);
      osc.stop(now + index * 0.1 + 0.5);
    });
  }
};

// ==================== LOCAL STORAGE WRAPPER ====================
const storage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  }
};

// ==================== STATE MANAGEMENT ====================
let highScore = 0;
let currentUser = null;
let authListenerActive = true;
let animationFrameId = null;
let selectedCategory = 'all';
let currentLevelTheme = 'city'; // 'forest', 'city', 'factory'

// Progression
let playerXP = 0;
let playerLevel = 1;
let currentWave = 1;

// ==================== THREE.JS 3D VARIABLES ====================
let scene, camera, renderer, labelRenderer;
let controls;
let cityGroup;
let clock = new THREE.Clock();

// ==================== SHARED GEOMETRIES & MATERIALS POOL ====================
let boxGeoShared, octaGeoShared, torusGeoShared, coneGeoShared, ringGeoShared, laserGeoShared;
let buildingBaseMaterials = [];
let neonMaterials = {};
let wallMaterial, wallNeonMaterial;
let droneLegMaterial, droneEyeMaterial;
let droneCoreMaterials = {};
let droneProjMaterials = {};
let laserMatShared;
let explosionMaterials = {};
let holoMaterials = {};

function initSharedAssets() {
  boxGeoShared = new THREE.BoxGeometry(1, 1, 1);
  octaGeoShared = new THREE.OctahedronGeometry(1, 0);
  torusGeoShared = new THREE.TorusGeometry(0.62, 0.06, 6, 18);
  coneGeoShared = new THREE.ConeGeometry(0.06, 0.7, 4);
  ringGeoShared = new THREE.RingGeometry(0.1, 0.65, 16);
  ringGeoShared.rotateX(-Math.PI / 2);
  
  laserGeoShared = new THREE.CylinderGeometry(1, 1, 1, 6);
  laserGeoShared.rotateX(Math.PI / 2);
  laserMatShared = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });

  const buildingBaseColors = [
    0x0a1622, 0x130a24, 0x24061a, 0x0b1c16, 0x101322
  ];
  buildingBaseMaterials = buildingBaseColors.map(color => new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.22,
    metalness: 0.88,
    flatShading: true
  }));

  const neonColors = [0x00f0ff, 0xff007f, 0x39ff14, 0xffcb05, 0xef4444];
  neonColors.forEach(color => {
    neonMaterials[color] = new THREE.MeshBasicMaterial({ color: color });
    explosionMaterials[color] = new THREE.MeshBasicMaterial({ color: color });
    
    holoMaterials[color] = new THREE.MeshBasicMaterial({ 
      color: color, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.65 
    });
  });

  wallMaterial = new THREE.MeshStandardMaterial({ color: 0x04020a, roughness: 0.9 });
  wallNeonMaterial = new THREE.MeshBasicMaterial({ color: 0xff007f });
  
  droneLegMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a24,
    roughness: 0.5,
    metalness: 0.8
  });
  droneEyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const lvlColors = {
    1: 0x39ff14, // Green
    2: 0xffcb05, // Yellow
    3: 0xff007f  // Pink
  };
  Object.entries(lvlColors).forEach(([lvl, color]) => {
    droneCoreMaterials[lvl] = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 1.45,
      roughness: 0.15,
      metalness: 0.9,
      flatShading: true
    });
    droneProjMaterials[lvl] = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
  });
}

// Game settings
let isPlaying = false;
let lives = 3;
let kills = 0;
let currentDifficulty = 1;
let activeTarget = null;
let activeZombies = [];
let activeLasers = [];
let explosionParticles = [];
let activeKeys = {};
let playerPosition = new THREE.Vector3(0, 1.8, 0);

// Camera shake
let shakeTimeLeft = 0;
let shakeIntensity = 0;

// Dictionary
let vocabList = [];
let spawnTimer = 0;
let spawnInterval = 4000;

// Bounding helpers
let buildingBoundingBoxes = [];
let buildingHolograms = [];

// ==================== DEFERRED GAME INITIALIZATION ====================
let isGameInitialized = false;

function initializeGame() {
  if (isGameInitialized) return;
  isGameInitialized = true;
  init3D();
  setupUIListeners();
  startRenderLoop();
}

function startRenderLoop() {
  stopGameLoop();
  animationFrameId = requestAnimationFrame(animate);
}

function resetCameraOrientation() {
  if (!camera) return;
  camera.up.set(0, 1, 0);
  camera.rotation.order = 'YXZ';
  camera.rotation.set(0, 0, 0);
  camera.position.copy(playerPosition);
  if (controls && controls.getObject) {
    controls.getObject().rotation.order = 'YXZ';
    controls.getObject().rotation.set(0, 0, 0);
  }
}

function hideLoadingOverlay() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.classList.add('opacity-0');
    setTimeout(() => {
      loadingOverlay.classList.add('hidden');
    }, 500);
  }
}

// ==================== SECURE SESSION MANAGER ====================
function setupSessionManager() {
  if (!supabase) {
    showAlert("Database not connected. Offline mode.", "bg-amber-950/40 border border-amber-500/30 text-amber-400 font-bold");
    initializeGame();
    transitionToApp(false);
    hideLoadingOverlay();
    return;
  }

  let bootstrapped = false;
  const bootstrapApp = (session) => {
    if (session?.user) {
      currentUser = session.user;
      if (!isGameInitialized) initializeGame();
      transitionToApp(true);
      hideLoadingOverlay();
      bootstrapped = true;
      setTimeout(() => loadUserProfile(), 0);
    } else if (!bootstrapped) {
      currentUser = null;
      if (!isGameInitialized) initializeGame();
      transitionToApp(false);
      hideLoadingOverlay();
      bootstrapped = true;
    }
  };

  const fallbackTimeout = setTimeout(() => {
    if (!bootstrapped) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!bootstrapped) bootstrapApp(session);
      });
    }
  }, 4000);

  supabase.auth.onAuthStateChange((event, session) => {
    if (!authListenerActive) return;
    if (event === 'INITIAL_SESSION') {
      clearTimeout(fallbackTimeout);
      bootstrapApp(session);
      return;
    }
    if (event === 'SIGNED_IN' && session?.user) {
      clearTimeout(fallbackTimeout);
      currentUser = session.user;
      if (!isGameInitialized) initializeGame();
      transitionToApp(true);
      hideLoadingOverlay();
      bootstrapped = true;
      setTimeout(() => loadUserProfile(), 0);
      return;
    }
    if (event === 'SIGNED_OUT') {
      currentUser = null;
      bootstrapped = false;
      transitionToApp(false);
    }
  });
}

function transitionToApp(isAuthenticated) {
  const authScreen = document.getElementById('authScreen');
  const mainMenu = document.getElementById('mainMenu');
  if (isAuthenticated && currentUser) {
    authScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
  } else {
    authScreen.classList.remove('hidden');
    mainMenu.classList.add('hidden');
  }
}

function updateHighScoreUI(score) {
  highScore = Math.max(0, parseInt(score, 10) || 0);
  const highScoreEl = document.getElementById('highScoreCount');
  if (highScoreEl) highScoreEl.innerText = highScore;
}

async function loadUserProfile() {
  if (!currentUser) return;
  const meta = currentUser.user_metadata || {};
  let username = meta.username || (currentUser.email ? currentUser.email.split('@')[0] : 'Runner');
  let avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;

  document.getElementById('userName').innerText = username.toUpperCase();
  document.getElementById('userAvatar').src = avatar;

  const cachedScore = storage.getItem(`highscore_${currentUser.id}`);
  if (cachedScore !== null) updateHighScoreUI(cachedScore);

  if (currentUser.id === 'guest') {
    username = storage.getItem('guest_username') || 'Guest';
    document.getElementById('userName').innerText = username.toUpperCase();
    updateHighScoreUI(storage.getItem('guest_high_score') || '0');
    return;
  }
  if (!supabase) return;
  try {
    const { data } = await supabase.from('profiles').select('username, avatar_url, score').eq('id', currentUser.id).maybeSingle();
    if (data) {
      document.getElementById('userName').innerText = data.username.toUpperCase();
      updateHighScoreUI(data.score);
      storage.setItem(`highscore_${currentUser.id}`, String(highScore));
    }
  } catch (e) {}
}

// ==================== PROCEDURAL INFRASTRUCTURE ====================
function createCity() {
  const css2dContainer = document.getElementById('css2d-renderer');
  if (css2dContainer) {
    css2dContainer.innerHTML = '';
    if (labelRenderer && labelRenderer.domElement) css2dContainer.appendChild(labelRenderer.domElement);
  }

  if (cityGroup) {
    while (cityGroup.children.length > 0) cityGroup.remove(cityGroup.children[0]);
  }

  buildingBoundingBoxes = [];
  buildingHolograms = [];

  // Theme styling
  if (currentLevelTheme === 'forest') {
    scene.background = new THREE.Color(0x0a1a0a);
    scene.fog.color = new THREE.Color(0x0a1a0a);
    scene.fog.density = 0.02;
  } else if (currentLevelTheme === 'factory') {
    scene.background = new THREE.Color(0x1a1a1a);
    scene.fog.color = new THREE.Color(0x1a1a1a);
    scene.fog.density = 0.015;
  } else {
    scene.background = new THREE.Color(0x0f051d);
    scene.fog.color = new THREE.Color(0x0f051d);
    scene.fog.density = 0.011;
  }

  const neonColors = [0x00f0ff, 0xff007f, 0x39ff14, 0xffcb05];
  for (let i = 0; i < 45; i++) {
    const w = 12 + Math.random() * 16;
    const h = 20 + Math.random() * 55;
    const d = 12 + Math.random() * 16;

    const bMat = buildingBaseMaterials[Math.floor(Math.random() * buildingBaseMaterials.length)];
    const building = new THREE.Mesh(boxGeoShared, bMat);
    building.scale.set(w, h, d);

    let bx = (Math.random() - 0.5) * 220;
    let bz = (Math.random() - 0.5) * 220;
    if (Math.abs(bx) < 18 && Math.abs(bz) < 18) {
      bx += bx > 0 ? 25 : -25;
      bz += bz > 0 ? 25 : -25;
    }
    building.position.set(bx, h / 2, bz);
    cityGroup.add(building);
    buildingBoundingBoxes.push(new THREE.Box3().setFromObject(building));

    const pipeColor = neonColors[Math.floor(Math.random() * neonColors.length)];
    const pipeMat = neonMaterials[pipeColor];
    [{ x: -w/2, z: -d/2 }, { x: w/2, z: -d/2 }, { x: -w/2, z: d/2 }, { x: w/2, z: d/2 }].forEach(offset => {
      const pipe = new THREE.Mesh(boxGeoShared, pipeMat);
      pipe.scale.set(0.4, h, 0.4);
      pipe.position.set(bx + offset.x, h / 2, bz + offset.z);
      cityGroup.add(pipe);
    });

    if (h > 45) {
      const holo = new THREE.Mesh(octaGeoShared, holoMaterials[pipeColor]);
      holo.scale.set(2.2, 2.2, 2.2);
      holo.position.set(bx, h + 3.5, bz);
      cityGroup.add(holo);
      buildingHolograms.push(holo);
    }
  }

  const wallParts = [
    { s: [300, 20, 4], p: [0, 10, -150] },
    { s: [300, 20, 4], p: [0, 10, 150] },
    { s: [4, 20, 300], p: [150, 10, 0] },
    { s: [4, 20, 300], p: [-150, 10, 0] }
  ];
  wallParts.forEach(wp => {
    const w = new THREE.Mesh(boxGeoShared, wallMaterial);
    w.scale.set(...wp.s);
    w.position.set(...wp.p);
    cityGroup.add(w);
    buildingBoundingBoxes.push(new THREE.Box3().setFromObject(w));
  });
}

function init3D() {
  const canvasElement = document.getElementById('webgl-canvas');
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0f051d, 0.011);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 300);
  renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  labelRenderer = new THREE.CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none';
  document.getElementById('css2d-renderer').appendChild(labelRenderer.domElement);

  cityGroup = new THREE.Group();
  scene.add(cityGroup);

  scene.add(new THREE.HemisphereLight(0xa855f7, 0x1e1b4b, 1.15));
  const moonLight = new THREE.DirectionalLight(0xf43f5e, 1.6);
  moonLight.position.set(40, 80, 40);
  scene.add(moonLight);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ color: 0x070311, roughness: 0.35, metalness: 0.85 }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  controls = new THREE.PointerLockControls(camera, renderer.domElement);
  window.addEventListener('resize', onWindowResize);
  initSharedAssets();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

// ==================== ENEMY AI & SPAWNING ====================
function spawnZombie() {
  // Balance: Select difficulty based on wave/player level
  let targetLevel = 1;
  if (playerLevel > 3) targetLevel = Math.floor(Math.random() * 3) + 1;
  else if (playerLevel > 1) targetLevel = Math.floor(Math.random() * 2) + 1;

  // Determine Type
  let type = 'grunt';
  const dice = Math.random();
  if (playerLevel >= 3 && dice > 0.8) type = 'hyperbot';
  else if (playerLevel >= 2 && dice > 0.6) type = 'academic';
  else if (playerLevel >= 2 && dice > 0.5) type = 'lexicographer';

  const pool = vocabList.filter(item => item.level === targetLevel && (item.type || 'grunt') === (type === 'grunt' ? undefined : type));
  const wordObj = (pool.length > 0) ? pool[Math.floor(Math.random() * pool.length)] : vocabList[Math.floor(Math.random() * vocabList.length)];

  const angle = Math.random() * Math.PI * 2;
  const dist = 35 + Math.random() * 25;
  const zX = camera.position.x + Math.cos(angle) * dist;
  const zZ = camera.position.z + Math.sin(angle) * dist;

  let zColor = 0x39ff14;
  let speedMultiplier = 1.0;
  if (type === 'academic') { zColor = 0xffcb05; speedMultiplier = 1.6; }
  if (type === 'hyperbot') { zColor = 0x00f0ff; speedMultiplier = 2.2; }
  if (type === 'lexicographer') { zColor = 0xff007f; speedMultiplier = 0.8; }

  const zMesh = new THREE.Group();
  zMesh.position.set(zX, 1.25, zZ);
  
  const coreMesh = new THREE.Mesh(octaGeoShared, droneCoreMaterials[targetLevel]);
  coreMesh.scale.set(0.42, 0.42, 0.42);
  coreMesh.name = "core";
  zMesh.add(coreMesh);

  const ringMesh = new THREE.Mesh(torusGeoShared, neonMaterials[zColor]);
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.name = "halo";
  zMesh.add(ringMesh);

  scene.add(zMesh);

  const labelDiv = document.createElement('div');
  labelDiv.className = 'css2d-word-label';
  labelDiv.innerHTML = `<div class="css2d-pill"><span class="css2d-en-text">${wordObj.en.toUpperCase()}</span></div><span class="css2d-ru-text">${wordObj.ru}</span>`;
  const cssLabel = new THREE.CSS2DObject(labelDiv);
  cssLabel.position.set(0, 1.25, 0);
  zMesh.add(cssLabel);

  activeZombies.push({
    mesh: zMesh,
    label: cssLabel,
    labelElement: labelDiv,
    word: wordObj.en,
    translation: wordObj.ru,
    activeCharIndex: 0,
    speed: (1.6 + (playerLevel * 0.35)) * speedMultiplier,
    type: type
  });
}

function cleanupZombie(z) {
  if (!z) return;
  if (z.label && z.mesh) z.mesh.remove(z.label);
  if (z.mesh) scene.remove(z.mesh);
}

// Collisions
function checkPlayerCollision(newPos) {
  const pBox = new THREE.Box3(new THREE.Vector3(newPos.x - 0.8, 0, newPos.z - 0.8), new THREE.Vector3(newPos.x + 0.8, 10, newPos.z + 0.8));
  return buildingBoundingBoxes.some(box => box.intersectsBox(pBox));
}

// VFX
function spawn3DLaser(endPos) {
  const startPos = new THREE.Vector3(camera.position.x, camera.position.y - 0.25, camera.position.z);
  const distance = startPos.distanceTo(endPos);
  const laserMesh = new THREE.Mesh(laserGeoShared, laserMatShared);
  laserMesh.scale.set(0.04, 0.04, distance);
  laserMesh.position.copy(startPos);
  laserMesh.lookAt(endPos);
  laserMesh.translateZ(distance / 2);
  scene.add(laserMesh);
  activeLasers.push({ mesh: laserMesh, scale: 1.0 });
}

function spawnExplosionVFX(pos, colorHex) {
  for (let i = 0; i < 12; i++) {
    const pMesh = new THREE.Mesh(boxGeoShared, explosionMaterials[colorHex] || neonMaterials[0x39ff14]);
    pMesh.scale.set(0.15, 0.15, 0.15);
    pMesh.position.copy(pos);
    scene.add(pMesh);
    explosionParticles.push({
      mesh: pMesh,
      vx: (Math.random() - 0.5) * 8, vy: Math.random() * 8, vz: (Math.random() - 0.5) * 8,
      scale: 1.0, decay: 0.03
    });
  }
}

// ==================== UI & MATCH LOGIC ====================
function updateHUD() {
  document.getElementById('matchKillsCount').innerText = kills;
  document.getElementById('hudDifficultyLevel').innerText = `LVL ${playerLevel} | WAVE ${currentWave}`;
  
  let heartStr = '';
  for (let i = 0; i < lives; i++) heartStr += '❤️';
  document.getElementById('hudLivesContainer').innerText = heartStr || 'DEFEATED';
  
  // XP Update (assuming exists in HTML)
  const xpBar = document.getElementById('xpStatus');
  if (xpBar) xpBar.innerText = `XP: ${playerXP}/10`;
}

function resetGameState() {
  isPlaying = false;
  lives = 3;
  kills = 0;
  playerXP = 0;
  playerLevel = 1;
  currentWave = 1;
  activeTarget = null;
  spawnTimer = 0;
  spawnInterval = 4000;
  activeZombies.forEach(z => cleanupZombie(z));
  activeZombies = [];
  activeLasers.forEach(l => scene.remove(l.mesh));
  activeLasers = [];
  explosionParticles.forEach(p => scene.remove(p.mesh));
  explosionParticles = [];
}

async function startMatch() {
  resetGameState();
  authListenerActive = false;
  SoundSynth.resumeContext();

  document.getElementById('mainMenu').classList.add('hidden');
  document.getElementById('categoryScreen').classList.add('hidden');
  document.getElementById('matchView').classList.remove('hidden');
  document.getElementById('defeatOverlay').classList.add('hidden');

  createCity();
  playerPosition.set(0, 1.8, 0);
  resetCameraOrientation();

  vocabList = [...FALLBACK_VOCAB];
  isPlaying = true;
  if (controls) controls.lock();
  updateHUD();
}

function endMatch() {
  authListenerActive = true;
  isPlaying = false;
  if (controls) controls.unlock();
  document.getElementById('defeatKillsAmt').innerText = `${kills} Kills`;
  document.getElementById('defeatDifficultyReached').innerText = `Level ${playerLevel}`;
  syncScoreToSupabase();
  document.getElementById('defeatOverlay').classList.remove('hidden');
  SoundSynth.playVictory();
}

async function syncScoreToSupabase() {
  if (!currentUser || currentUser.id === 'guest') return;
  if (kills > highScore) {
    try {
      await supabase.from('profiles').upsert({ id: currentUser.id, score: kills });
      updateHighScoreUI(kills);
    } catch (e) {}
  }
}

// ==================== ENGINE LOOP ====================
function stopGameLoop() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
}

function animate() {
  const dt = clock.getDelta();
  const time = clock.getElapsedTime();
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }
  if (!isPlaying) {
    animationFrameId = requestAnimationFrame(animate);
    return;
  }

  // Movement
  const moveSpeed = 7.0;
  const newPos = playerPosition.clone();
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  forward.y = 0; forward.normalize();
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  right.y = 0; right.normalize();

  if (activeKeys['ArrowUp']) newPos.addScaledVector(forward, moveSpeed * dt);
  if (activeKeys['ArrowDown']) newPos.addScaledVector(forward, -moveSpeed * dt);
  if (activeKeys['ArrowLeft']) newPos.addScaledVector(right, -moveSpeed * dt);
  if (activeKeys['ArrowRight']) newPos.addScaledVector(right, moveSpeed * dt);

  if (!checkPlayerCollision(newPos)) playerPosition.copy(newPos);
  camera.position.copy(playerPosition);

  // Spawning
  spawnTimer += dt * 1000;
  if (spawnTimer >= spawnInterval && activeZombies.length < (5 + playerLevel)) {
    spawnZombie();
    spawnTimer = 0;
  }

  // Update Drones
  for (let i = activeZombies.length - 1; i >= 0; i--) {
    const z = activeZombies[i];
    z.mesh.lookAt(playerPosition.x, z.mesh.position.y, playerPosition.z);
    const dir = new THREE.Vector3().subVectors(playerPosition, z.mesh.position);
    dir.y = 0; dir.normalize();
    z.mesh.position.addScaledVector(dir, z.speed * dt);
    z.mesh.position.y = 1.25 + Math.sin(time * 5 + i) * 0.1;

    if (z.mesh.position.distanceTo(playerPosition) < 2.2) {
      spawnExplosionVFX(z.mesh.position, 0xef4444);
      SoundSynth.playHurt();
      cleanupZombie(z);
      activeZombies.splice(i, 1);
      if (activeTarget === z) activeTarget = null;
      lives--;
      updateHUD();
      if (lives <= 0) endMatch();
    }
  }

  // VFX Updates
  activeLasers.forEach((l, i) => {
    l.scale *= 0.7;
    l.mesh.scale.set(0.04 * l.scale, 0.04 * l.scale, l.mesh.scale.z);
    if (l.scale < 0.05) { scene.remove(l.mesh); activeLasers.splice(i, 1); }
  });
  explosionParticles.forEach((p, i) => {
    p.mesh.position.x += p.vx * dt; p.mesh.position.y += p.vy * dt; p.mesh.position.z += p.vz * dt;
    p.scale -= p.decay; p.mesh.scale.set(p.scale, p.scale, p.scale);
    if (p.scale <= 0) { scene.remove(p.mesh); explosionParticles.splice(i, 1); }
  });

  animationFrameId = requestAnimationFrame(animate);
}

// ==================== TYPING LOGIC ====================
window.addEventListener('keydown', (e) => {
  if (document.activeElement.tagName === 'INPUT') return;
  if (!isPlaying) return;
  if (e.key.startsWith('Arrow')) { activeKeys[e.key] = true; return; }

  const char = e.key.toLowerCase();
  if (char.length !== 1) return;

  if (!activeTarget) {
    const target = activeZombies.find(z => z.word[0] === char);
    if (target) {
      activeTarget = target;
      activeTarget.activeCharIndex = 1;
      SoundSynth.playClick();
      updateLabelsHTML();
    } else {
      SoundSynth.playError();
    }
  } else {
    if (activeTarget.word[activeTarget.activeCharIndex] === char) {
      activeTarget.activeCharIndex++;
      SoundSynth.playClick();
      if (activeTarget.activeCharIndex === activeTarget.word.length) {
        // Kill
        spawn3DLaser(activeTarget.mesh.position);
        spawnExplosionVFX(activeTarget.mesh.position, 0x39ff14);
        SoundSynth.playExplosion();
        
        // Progression
        playerXP++;
        if (z.type === 'lexicographer') { lives = Math.min(5, lives + 1); } // Bonus life/health

        if (playerXP >= 10) {
          playerLevel++;
          playerXP = 0;
          currentWave++;
          spawnInterval = Math.max(1000, spawnInterval - 500);
        }

        kills++;
        cleanupZombie(activeTarget);
        activeZombies.splice(activeZombies.indexOf(activeTarget), 1);
        activeTarget = null;
        updateHUD();
      }
      updateLabelsHTML();
    } else {
      SoundSynth.playError();
    }
  }
});

window.addEventListener('keyup', (e) => { if (e.key.startsWith('Arrow')) activeKeys[e.key] = false; });

function updateLabelsHTML() {
  activeZombies.forEach(z => {
    if (z.labelElement) {
      const span = z.labelElement.querySelector('.css2d-en-text');
      if (activeTarget === z) {
        let h = '';
        for (let i = 0; i < z.word.length; i++) {
          h += `<span style="color:${i < z.activeCharIndex ? '#00f0ff' : '#ffffff'}">${z.word[i].toUpperCase()}</span>`;
        }
        span.innerHTML = h;
      } else {
        span.innerText = z.word.toUpperCase();
        span.style.color = '#ffffff';
      }
    }
  });
}

// ==================== UI LISTENERS ====================
function setupUIListeners() {
  const bind = (id, evt, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(evt, fn); };
  
  bind('authSubmitBtn', 'click', () => handleAuthAction(authMode));
  bind('guestPlayBtn', 'click', () => { currentUser = { id: 'guest' }; transitionToApp(true); initializeGame(); });
  bind('playBtn', 'click', () => document.getElementById('categoryScreen').classList.remove('hidden'));
  bind('startCategoryMatchBtn', 'click', startMatch);
  bind('defeatExitBtn', 'click', () => { document.getElementById('matchView').classList.add('hidden'); document.getElementById('mainMenu').classList.remove('hidden'); });

  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      currentLevelTheme = card.dataset.category === 'city' ? 'city' : (card.dataset.category === 'nature' ? 'forest' : 'factory');
      document.querySelectorAll('.category-card').forEach(c => c.classList.remove('border-brawlCyan'));
      card.classList.add('border-brawlCyan');
    });
  });
}

async function handleAuthAction(mode) {
  const email = document.getElementById('authEmailInput').value;
  const pass = document.getElementById('authPasswordInput').value;
  if (mode === 'register') await supabase.auth.signUp({ email, password: pass });
  else await supabase.auth.signInWithPassword({ email, password: pass });
}

function showAlert(t, c) { const a = document.getElementById('authAlert'); a.innerText = t; a.className = c; a.classList.remove('hidden'); }

window.addEventListener('DOMContentLoaded', setupSessionManager);
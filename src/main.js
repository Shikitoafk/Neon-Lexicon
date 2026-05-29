import { supabase } from './supabase.js';

// City of Words: Survival 3D - Three.js FPS Typing Engine with Supabase Auth & Profile Sync

// ==================== SURVIVAL DICTIONARY POOL (60+ Words) ====================
const FALLBACK_VOCAB = [
  // Easy/Short words (Level 1)
  { en: "run", ru: "бежать", level: 1 },
  { en: "hide", ru: "прятаться", level: 1 },
  { en: "dark", ru: "темный", level: 1 },
  { en: "city", ru: "город", level: 1 },
  { en: "ammo", ru: "патроны", level: 1 },
  { en: "fear", ru: "страх", level: 1 },
  { en: "dead", ru: "мертвый", level: 1 },
  { en: "prey", ru: "добыча", level: 1 },
  { en: "gate", ru: "ворота", level: 1 },
  { en: "look", ru: "смотреть", level: 1 },
  { en: "safe", ru: "безопасный", level: 1 },
  { en: "wall", ru: "стена", level: 1 },
  { en: "door", ru: "дверь", level: 1 },
  { en: "help", ru: "помощь", level: 1 },
  { en: "seek", ru: "искать", level: 1 },
  { en: "trap", ru: "ловушка", level: 1 },
  { en: "cold", ru: "холодный", level: 1 },
  { en: "rust", ru: "ржавчина", level: 1 },
  { en: "kill", ru: "убить", level: 1 },
  { en: "grit", ru: "твердость", level: 1 },

  // Medium words (Level 2)
  { en: "danger", ru: "опасность", level: 2 },
  { en: "escape", ru: "побег", level: 2 },
  { en: "shadow", ru: "тень", level: 2 },
  { en: "zombie", ru: "зомби", level: 2 },
  { en: "horror", ru: "ужас", level: 2 },
  { en: "street", ru: "улица", level: 2 },
  { en: "hunter", ru: "охотник", level: 2 },
  { en: "silent", ru: "тихий", level: 2 },
  { en: "weapon", ru: "оружие", level: 2 },
  { en: "scream", ru: "крик", level: 2 },
  { en: "attack", ru: "атака", level: 2 },
  { en: "corpse", ru: "труп", level: 2 },
  { en: "undead", ru: "нежить", level: 2 },
  { en: "tunnel", ru: "туннель", level: 2 },
  { en: "hazard", ru: "угроза", level: 2 },
  { en: "search", ru: "поиск", level: 2 },
  { en: "signal", ru: "сигнал", level: 2 },
  { en: "broken", ru: "сломанный", level: 2 },
  { en: "siren", ru: "сирена", level: 2 },
  { en: "refuge", ru: "убежище", level: 2 },

  // Long/Hard words (Level 3+)
  { en: "survival", ru: "выживание", level: 3 },
  { en: "apocalypse", ru: "апокалипсис", level: 3 },
  { en: "infection", ru: "инфекция", level: 3 },
  { en: "barricade", ru: "баррикада", level: 3 },
  { en: "creature", ru: "существо", level: 3 },
  { en: "evacuation", ru: "эвакуация", level: 3 },
  { en: "nightmare", ru: "кошмар", level: 3 },
  { en: "darkness", ru: "темнота", level: 3 },
  { en: "building", ru: "здание", level: 3 },
  { en: "ammunition", ru: "боеприпасы", level: 3 },
  { en: "devastated", ru: "опустошенный", level: 3 },
  { en: "infestation", ru: "заражение", level: 3 },
  { en: "abandoned", ru: "заброшенный", level: 3 },
  { en: "laboratory", ru: "лаборатория", level: 3 },
  { en: "quarantine", ru: "карантин", level: 3 },
  { en: "destroyer", ru: "разрушитель", level: 3 },
  { en: "radiation", ru: "радиация", level: 3 },
  { en: "headshot", ru: "выстрел в голову", level: 3 },
  { en: "adrenaline", ru: "адреналин", level: 3 },
  { en: "claustrophobia", ru: "клаустрофобия", level: 3 }
];

// ==================== SOUND SYNTH SYSTEM (Web Audio API) ====================
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

// ==================== THREE.JS 3D VARIABLES ====================
let scene, camera, renderer, labelRenderer;
let controls;
let cityGroup;
let clock = new THREE.Clock();

// ==================== SHARED GEOMETRIES & MATERIALS POOL (Lag Elimination) ====================
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
    
    // Pre-allocate transparent wireframe materials for skyscraper holograms to prevent laggy shader compilations
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
let currentLevel = 1;
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

// ==================== DEFERRED GAME INITIALIZATION (Ref-Lock Resolution) ====================
let isGameInitialized = false;

function initializeGame() {
  if (isGameInitialized) {
    console.log("initializeGame() skipped — already initialized.");
    return;
  }
  isGameInitialized = true;

  console.log("Initializing Three.js WebGL Engine, UI listeners, and game loop.");
  init3D();
  setupUIListeners();
  animate();
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

// ==================== SECURE SESSION MANAGER & PROTECTED APP FLOW ====================
function setupSessionManager() {
  if (!supabase) {
    showAlert("Database not connected. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables in Vercel/Local.", "bg-amber-950/40 border border-amber-500/30 text-amber-400 font-bold");
    initializeGame();
    transitionToApp(false);
    hideLoadingOverlay();
    return;
  }

  let sessionChecked = false;

  // 5-second timeout fallback (no longer calls initializeGame to prevent empty-state race)
  const fallbackTimeout = setTimeout(() => {
    if (!sessionChecked) {
      console.warn("Supabase auth check timed out after 5 seconds. Directing to login screen.");
      sessionChecked = true;
      currentUser = null;
      initializeGame();
      transitionToApp(false);
      hideLoadingOverlay();
    }
  }, 5000);

  // Directly check session and log the exact result
  console.log("Starting Supabase getSession check...");
  supabase.auth.getSession().then(async ({ data, error }) => {
    console.log("Supabase getSession exact result:", { data, error });
    if (sessionChecked) return;
    sessionChecked = true;
    clearTimeout(fallbackTimeout);

    if (error) {
      console.error("Supabase getSession error:", error);
    }

    const session = data ? data.session : null;
    if (session) {
      currentUser = session.user;
      initializeGame();
      transitionToApp(true);
      await loadUserProfile();
    } else {
      currentUser = null;
      // Boot engine + UI listeners for auth/guest; match only starts after they enter
      initializeGame();
      transitionToApp(false);
    }
    hideLoadingOverlay();
  }).catch((err) => {
    console.error("Supabase getSession exception:", err);
    if (!sessionChecked) {
      sessionChecked = true;
      clearTimeout(fallbackTimeout);
      currentUser = null;
      initializeGame();
      transitionToApp(false);
      hideLoadingOverlay();
    }
  });

  // Listen for subsequent authentication changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth State Changed Event:", event, session);

    // Ignore INITIAL_SESSION null entirely — wait for getSession() or SIGNED_IN
    if (event === 'INITIAL_SESSION' && !session) {
      console.log("Ignoring INITIAL_SESSION null event to prevent double-init.");
      return;
    }

    const shouldBootstrapSession =
      session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION');

    if (shouldBootstrapSession) {
      if (!sessionChecked) {
        sessionChecked = true;
        clearTimeout(fallbackTimeout);
        hideLoadingOverlay();
      }
      currentUser = session.user;
      initializeGame();
      transitionToApp(true);
      await loadUserProfile();
      return;
    }

    if (event === 'SIGNED_OUT') {
      if (!sessionChecked) {
        sessionChecked = true;
        clearTimeout(fallbackTimeout);
        hideLoadingOverlay();
      }
      currentUser = null;
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

    // Defeat HUD Status bar text
    document.getElementById('scoreSyncStatus').innerText = "PROGRESS AUTO-SYNCED TO PROFILE";
    document.getElementById('scoreSyncStatus').className = "text-[10px] uppercase tracking-widest text-emerald-400 font-bold bg-[#071611] px-3 py-2 rounded-lg text-center mt-3 border border-emerald-500/20 select-none";
  } else {
    authScreen.classList.remove('hidden');
    mainMenu.classList.add('hidden');
  }
}

async function loadUserProfile() {
  if (!currentUser) return;
  
  // Set temporary fallback values based on metadata first so UI isn't empty while loading
  const meta = currentUser.user_metadata || {};
  let username = meta.username || currentUser.email.split('@')[0] || 'Runner';
  let avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;
  
  document.getElementById('userName').innerText = username.toUpperCase();
  document.getElementById('userAvatar').src = avatar;

  if (currentUser.id === 'guest') {
    username = storage.getItem('guest_username') || 'Guest';
    avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;
    document.getElementById('userName').innerText = username.toUpperCase();
    document.getElementById('userAvatar').src = avatar;
    highScore = parseInt(storage.getItem('guest_high_score') || '0', 10);
    document.getElementById('highScoreCount').innerText = highScore;
    return;
  }

  try {
    // Load complete profile from profiles table by user.id as strictly requested
    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar_url, score')
      .eq('id', currentUser.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (data) {
      username = data.username || username;
      avatar = data.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;
      highScore = data.score || 0;

      // Update UI panels with data loaded from profiles table
      document.getElementById('userName').innerText = username.toUpperCase();
      document.getElementById('userAvatar').src = avatar;
      document.getElementById('highScoreCount').innerText = highScore;
    }
  } catch (e) {
    console.warn("Failed retrieving profiles record:", e.message);
  }
}

// ==================== PROCEDURAL INFRASTRUCTURE BUILDER ====================
function createCity() {
  // Clear CSS2D labels DOM to avoid memory leak build-ups
  const css2dContainer = document.getElementById('css2d-renderer');
  if (css2dContainer) {
    css2dContainer.innerHTML = '';
    if (labelRenderer && labelRenderer.domElement) {
      css2dContainer.appendChild(labelRenderer.domElement);
    }
  }

  // Clear cityGroup elements safely
  if (cityGroup) {
    while (cityGroup.children.length > 0) {
      cityGroup.remove(cityGroup.children[0]);
    }
  }

  buildingBoundingBoxes = [];
  buildingHolograms = [];

  const neonColors = [0x00f0ff, 0xff007f, 0x39ff14, 0xffcb05];
  
  for (let i = 0; i < 45; i++) {
    const w = 12 + Math.random() * 16;
    const h = 20 + Math.random() * 55;
    const d = 12 + Math.random() * 16;

    // Reuse shared base material and box geometry
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

    // Bounding Box (recomputes based on current scale)
    const box = new THREE.Box3().setFromObject(building);
    buildingBoundingBoxes.push(box);

    // Neon pillars - Reuse boxGeoShared and pre-created neonMaterials
    const pipeColor = neonColors[Math.floor(Math.random() * neonColors.length)];
    const pipeMat = neonMaterials[pipeColor];

    const offsets = [
      { x: -w/2, z: -d/2 }, { x: w/2, z: -d/2 },
      { x: -w/2, z: d/2 }, { x: w/2, z: d/2 }
    ];

    offsets.forEach(offset => {
      const pipe = new THREE.Mesh(boxGeoShared, pipeMat);
      pipe.scale.set(0.4, h, 0.4);
      pipe.position.set(bx + offset.x, h / 2, bz + offset.z);
      cityGroup.add(pipe);
    });

    // Window bands - Reuse boxGeoShared and neonMaterials
    const windowColor = neonColors[Math.floor(Math.random() * neonColors.length)];
    const winMat = neonMaterials[windowColor];

    const bandCount = 3 + Math.floor(Math.random() * 4);
    for (let b = 0; b < bandCount; b++) {
      const bandHeight = (h / (bandCount + 1)) * (b + 1);
      const band = new THREE.Mesh(boxGeoShared, winMat);
      band.scale.set(w + 0.1, 0.45, d + 0.1);
      band.position.set(bx, bandHeight, bz);
      cityGroup.add(band);
    }

    // Top Holograms - Reuse octaGeoShared and pre-allocated holoMaterials
    if (h > 45) {
      const holoMat = holoMaterials[pipeColor];
      const holo = new THREE.Mesh(octaGeoShared, holoMat);
      holo.scale.set(2.2, 2.2, 2.2);
      holo.position.set(bx, h + 3.5, bz);
      cityGroup.add(holo);
      buildingHolograms.push(holo);
    }
  }

  // Border Walls - Reuse boxGeoShared, wallMaterial, and wallNeonMaterial
  const northWall = new THREE.Mesh(boxGeoShared, wallMaterial);
  northWall.scale.set(300, 20, 4);
  northWall.position.set(0, 10, -150);
  cityGroup.add(northWall);
  buildingBoundingBoxes.push(new THREE.Box3().setFromObject(northWall));

  const northWallNeon = new THREE.Mesh(boxGeoShared, wallNeonMaterial);
  northWallNeon.scale.set(300, 0.6, 4.2);
  northWallNeon.position.set(0, 18, -150);
  cityGroup.add(northWallNeon);

  const southWall = new THREE.Mesh(boxGeoShared, wallMaterial);
  southWall.scale.set(300, 20, 4);
  southWall.position.set(0, 10, 150);
  cityGroup.add(southWall);
  buildingBoundingBoxes.push(new THREE.Box3().setFromObject(southWall));

  const southWallNeon = new THREE.Mesh(boxGeoShared, wallNeonMaterial);
  southWallNeon.scale.set(300, 0.6, 4.2);
  southWallNeon.position.set(0, 18, 150);
  cityGroup.add(southWallNeon);

  const eastWall = new THREE.Mesh(boxGeoShared, wallMaterial);
  eastWall.scale.set(4, 20, 300);
  eastWall.position.set(150, 10, 0);
  cityGroup.add(eastWall);
  buildingBoundingBoxes.push(new THREE.Box3().setFromObject(eastWall));

  const eastWallNeon = new THREE.Mesh(boxGeoShared, wallNeonMaterial);
  eastWallNeon.scale.set(4.2, 0.6, 300);
  eastWallNeon.position.set(150, 18, 0);
  cityGroup.add(eastWallNeon);

  const westWall = new THREE.Mesh(boxGeoShared, wallMaterial);
  westWall.scale.set(4, 20, 300);
  westWall.position.set(-150, 10, 0);
  cityGroup.add(westWall);
  buildingBoundingBoxes.push(new THREE.Box3().setFromObject(westWall));

  const westWallNeon = new THREE.Mesh(boxGeoShared, wallNeonMaterial);
  westWallNeon.scale.set(4.2, 0.6, 300);
  westWallNeon.position.set(-150, 18, 0);
  cityGroup.add(westWallNeon);
}

// ==================== ENGINE SETUP ====================
function init3D() {
  const canvasElement = document.getElementById('webgl-canvas');
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f051d);
  scene.fog = new THREE.FogExp2(0x0f051d, 0.011);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 300);
  camera.position.set(0, 1.8, 0);
  camera.up.set(0, 1, 0);
  camera.rotation.set(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // CSS2D
  labelRenderer = new THREE.CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none';
  document.getElementById('css2d-renderer').appendChild(labelRenderer.domElement);

  // Initialize Persistent City Group
  cityGroup = new THREE.Group();
  scene.add(cityGroup);

  // Set up environmental lights once globally (prevents memory leak compile lag)
  const hemiLight = new THREE.HemisphereLight(0xa855f7, 0x1e1b4b, 1.15);
  scene.add(hemiLight);

  const moonLight = new THREE.DirectionalLight(0xf43f5e, 1.6);
  moonLight.position.set(40, 80, 40);
  scene.add(moonLight);

  const floorGeo = new THREE.PlaneGeometry(300, 300);
  const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x070311, 
    roughness: 0.35, 
    metalness: 0.85 
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const gridHelper = new THREE.GridHelper(300, 60, 0x00f0ff, 0xa855f7);
  gridHelper.position.y = 0.02;
  scene.add(gridHelper);

  // Controls
  controls = new THREE.PointerLockControls(camera, renderer.domElement);
  resetCameraOrientation();

  controls.addEventListener('lock', () => {
    document.getElementById('blockerOverlay').classList.add('hidden');
  });

  controls.addEventListener('unlock', () => {
    if (isPlaying) {
      document.getElementById('blockerOverlay').classList.remove('hidden');
    }
  });

  window.addEventListener('resize', onWindowResize);

  // Pre-allocate shared geometries and materials once on startup
  initSharedAssets();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

// ==================== ALIEN SENTINEL DRONES AI ====================
function spawnZombie() {
  const levelFiltered = vocabList.filter(item => item.level === Math.min(3, currentLevel));
  const pool = levelFiltered.length > 0 ? levelFiltered : vocabList;
  const wordObj = pool[Math.floor(Math.random() * pool.length)];

  const angle = Math.random() * Math.PI * 2;
  const dist = 35 + Math.random() * 25;
  const zX = camera.position.x + Math.cos(angle) * dist;
  const zZ = camera.position.z + Math.sin(angle) * dist;

  const zColor = currentLevel === 1 ? 0x39ff14 : (currentLevel === 2 ? 0xffcb05 : 0xff007f);
  
  const zMesh = new THREE.Group();
  zMesh.position.set(zX, 1.25, zZ);
  
  // Core - Reuse octaGeoShared and droneCoreMaterials
  const zLvlKey = Math.min(3, currentLevel);
  const coreMat = droneCoreMaterials[zLvlKey];
  const coreMesh = new THREE.Mesh(octaGeoShared, coreMat);
  coreMesh.scale.set(0.42, 0.42, 0.42);
  coreMesh.name = "core";
  zMesh.add(coreMesh);

  // Torus Halo ring - Reuse torusGeoShared and neonMaterials
  const ringMat = neonMaterials[zColor];
  const ringMesh = new THREE.Mesh(torusGeoShared, ringMat);
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.name = "halo";
  zMesh.add(ringMesh);

  // Arachnid mechanical spikes - Reuse coneGeoShared and droneLegMaterial
  const legCount = 4;
  for (let i = 0; i < legCount; i++) {
    const angleOffset = (i / legCount) * Math.PI * 2;
    const leg = new THREE.Mesh(coneGeoShared, droneLegMaterial);
    leg.position.set(Math.cos(angleOffset) * 0.32, -0.38, Math.sin(angleOffset) * 0.32);
    leg.rotation.z = Math.cos(angleOffset) * 0.25;
    leg.rotation.x = Math.sin(angleOffset) * 0.25;
    zMesh.add(leg);
  }

  // visors - Reuse octaGeoShared (scaled down) and droneEyeMaterial
  const eye = new THREE.Mesh(octaGeoShared, droneEyeMaterial);
  eye.scale.set(0.09, 0.09, 0.09);
  eye.position.set(0, 0.05, 0.4);
  zMesh.add(eye);

  // Floor Projection targeting ring - Reuse ringGeoShared and droneProjMaterials
  const projMat = droneProjMaterials[zLvlKey];
  const projMesh = new THREE.Mesh(ringGeoShared, projMat);
  projMesh.name = "projection";
  projMesh.position.set(0, -1.23, 0);
  zMesh.add(projMesh);

  scene.add(zMesh);

  // CSS2D HTML label
  const labelDiv = document.createElement('div');
  labelDiv.className = 'css2d-word-label';
  labelDiv.innerHTML = `
    <div class="css2d-pill">
      <span class="css2d-en-text">${wordObj.en.toUpperCase()}</span>
    </div>
    <span class="css2d-ru-text">${wordObj.ru}</span>
  `;

  const cssLabel = new THREE.CSS2DObject(labelDiv);
  cssLabel.position.set(0, 1.25, 0);
  zMesh.add(cssLabel);

  const baseSpeed = 1.6 + (currentLevel * 0.35);

  activeZombies.push({
    mesh: zMesh,
    label: cssLabel,
    labelElement: labelDiv,
    word: wordObj.en,
    translation: wordObj.ru,
    activeCharIndex: 0,
    speed: baseSpeed
  });
}

function cleanupZombie(z) {
  if (!z) return;
  
  if (z.label) {
    if (z.mesh) {
      z.mesh.remove(z.label);
    }
    if (z.label.element && z.label.element.parentNode) {
      z.label.element.parentNode.removeChild(z.label.element);
    }
  } else if (z.labelElement && z.labelElement.parentNode) {
    z.labelElement.parentNode.removeChild(z.labelElement);
  }

  if (z.mesh) {
    scene.remove(z.mesh);
    z.mesh.traverse(child => {
      if (child.isMesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }
}

// Collisions
function checkPlayerCollision(newPos) {
  const pSize = 0.8;
  const pBox = new THREE.Box3(
    new THREE.Vector3(newPos.x - pSize, 0, newPos.z - pSize),
    new THREE.Vector3(newPos.x + pSize, 10, newPos.z + pSize)
  );

  for (let box of buildingBoundingBoxes) {
    if (box.intersectsBox(pBox)) {
      return true;
    }
  }
  return false;
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
  const pCount = 18;
  const mat = explosionMaterials[colorHex] || neonMaterials[colorHex] || new THREE.MeshBasicMaterial({ color: colorHex });
  for (let i = 0; i < pCount; i++) {
    const pMesh = new THREE.Mesh(boxGeoShared, mat);
    pMesh.scale.set(0.15, 0.15, 0.15);
    pMesh.position.copy(pos);
    scene.add(pMesh);

    explosionParticles.push({
      mesh: pMesh,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 8,
      vz: (Math.random() - 0.5) * 8,
      scale: 1.0,
      decay: 0.02 + Math.random() * 0.025
    });
  }
}

function triggerCameraShake(intensity, duration) {
  shakeIntensity = intensity;
  shakeTimeLeft = duration;
}

// ==================== AUTHENTICATION ACTIONS ====================
async function handleAuthAction(mode) {
  if (!supabase) {
    showAlert("Database not connected. Cannot perform auth actions.", "bg-red-950/40 border border-red-500/35 text-red-400 font-bold");
    return;
  }

  const email = document.getElementById('authEmailInput').value.trim();
  const password = document.getElementById('authPasswordInput').value.trim();
  const username = document.getElementById('authUsernameInput').value.trim();
  const alertEl = document.getElementById('authAlert');

  if (!email || !password) {
    showAlert("Email and Password fields are required.", "bg-red-950/40 border border-red-500/35 text-red-400");
    return;
  }

  showAlert("Accessing matrix...", "bg-purple-950/30 border border-purple-500/20 text-purple-400 animate-pulse");

  if (mode === 'register') {
    if (!username) {
      showAlert("Alias Username is required for profile index.", "bg-red-950/40 border border-red-500/35 text-red-400");
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) {
      showAlert(`Reg Failed: ${error.message}`, "bg-red-950/40 border border-red-500/35 text-red-400");
    } else {
      if (data && data.session) {
        showAlert("Sign Up Successful! Authorizing profile...", "bg-emerald-950/40 border border-emerald-500/35 text-emerald-400");
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username: username,
            score: 0
          });
        } catch (e) {
          console.warn("Failed profiles upsert (trigger might have handled it):", e);
        }
      } else {
        showAlert("Registration successful! Please check your email to confirm your account, then log in.", "bg-amber-950/40 border border-amber-500/30 text-amber-400 font-bold");
      }
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      showAlert(`Access Denied: ${error.message}`, "bg-red-950/40 border border-red-500/35 text-red-400");
    } else {
      showAlert("Access Authorized! Decrypting city grids...", "bg-emerald-950/40 border border-emerald-500/35 text-emerald-400");
    }
  }
}

function showAlert(text, cssClass) {
  const alertEl = document.getElementById('authAlert');
  alertEl.innerText = text;
  alertEl.className = `text-xs p-2.5 text-center font-bold rounded-lg transition-all duration-200 ${cssClass}`;
  alertEl.classList.remove('hidden');
}

// ==================== GLOBAL LEADERBOARD INTEGRATION ====================
function renderLeaderboardRows(data) {
  const rowsContainer = document.getElementById('leaderboardRows');
  if (!rowsContainer) return;
  
  rowsContainer.innerHTML = '';
  data.forEach((row, index) => {
    const rank = index + 1;
    const username = row.username || 'Anonymous Runner';
    const avatar = row.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;
    const highestScore = row.highest_score || 0;

    let rankColorClass = 'text-slate-500';
    let rowBorderClass = 'border-slate-900 bg-slate-950/40';
    if (rank === 1) {
      rankColorClass = 'text-brawlYellow font-logo text-xl';
      rowBorderClass = 'border-brawlYellow/30 bg-amber-950/10 shadow-[0_0_10px_rgba(255,203,5,0.05)]';
    } else if (rank === 2) {
      rankColorClass = 'text-slate-200';
      rowBorderClass = 'border-slate-400/25 bg-slate-900/20';
    } else if (rank === 3) {
      rankColorClass = 'text-amber-600';
      rowBorderClass = 'border-amber-700/25 bg-orange-950/10';
    }

    const rowHtml = `
      <div class="grid grid-cols-12 items-center px-4 py-2.5 border ${rowBorderClass} rounded-xl transition-all duration-200 hover:scale-[1.01] hover:bg-slate-900/30">
        <div class="col-span-2 font-logo text-lg ${rankColorClass}">#${rank}</div>
        <div class="col-span-6 flex items-center gap-3">
          <img src="${avatar}" class="w-7 h-7 rounded-full border border-purple-500/20 shadow-md select-none">
          <span class="font-bold text-white text-sm truncate max-w-[160px] select-all">${username}</span>
        </div>
        <div class="col-span-4 text-right font-logo text-brawlYellow text-lg">${highestScore}</div>
      </div>
    `;
    rowsContainer.insertAdjacentHTML('beforeend', rowHtml);
  });
}

function renderLeaderboardEmpty() {
  const rowsContainer = document.getElementById('leaderboardRows');
  if (!rowsContainer) return;
  rowsContainer.innerHTML = `
    <div class="text-center py-8 text-slate-500 text-xs uppercase tracking-widest border border-slate-900 rounded-xl p-4 bg-slate-950/20">
      No records found. Complete a match to set your score!
    </div>
  `;
}

function renderLeaderboardError(message) {
  const rowsContainer = document.getElementById('leaderboardRows');
  if (!rowsContainer) return;
  rowsContainer.innerHTML = `
    <div class="text-center py-8 text-brawlRed text-xs uppercase tracking-widest border border-brawlRed/20 rounded-xl p-4 bg-red-950/5">
      ${message}
    </div>
  `;
}

async function queryLeaderboardTable(table, select, orderColumn) {
  const res = await supabase
    .from(table)
    .select(select)
    .order(orderColumn, { ascending: false })
    .limit(10);
  console.log(`Supabase '${table}' query response data:`, res.data);
  console.log(`Supabase '${table}' query response error:`, res.error);
  return res;
}

function normalizeLeaderboardRows(rows, scoreKey = 'highest_score') {
  return (rows || []).map((item) => ({
    username: item.username || 'Anonymous Runner',
    avatar_url: item.avatar_url,
    highest_score: item[scoreKey] ?? item.score ?? item.highest_score ?? 0,
  }));
}

async function fetchAndRenderLeaderboard() {
  const rowsContainer = document.getElementById('leaderboardRows');
  if (!rowsContainer) return;

  rowsContainer.innerHTML = `
    <div class="text-center py-8 text-slate-500 text-sm">
      <span class="animate-pulse">RETRIEVING LEADERBOARD DATA...</span>
    </div>
  `;

  // Fallback to guest offline mock leaderboard if Supabase is offline
  if (!supabase) {
    console.log("Supabase not connected. Rendering offline local leaderboard fallback.");
    const guestHighScore = parseInt(storage.getItem('guest_high_score') || '0', 10);
    const guestUsername = storage.getItem('guest_username') || 'Guest Runner';
    const mockData = [
      { username: guestUsername, highest_score: guestHighScore },
      { username: "CYBER_NINJA", highest_score: 120 },
      { username: "NEON_HUNTER", highest_score: 95 },
      { username: "MATRIX_GLITCH", highest_score: 70 }
    ].sort((a, b) => b.highest_score - a.highest_score);

    renderLeaderboardRows(mockData);
    return;
  }

  try {
    console.log("Fetching view leaderboard from 'leaderboard'...");
    const primaryRes = await queryLeaderboardTable(
      'leaderboard',
      'username, avatar_url, highest_score',
      'highest_score'
    );

    let data = null;

    if (!primaryRes.error && primaryRes.data) {
      data = normalizeLeaderboardRows(primaryRes.data, 'highest_score');
    } else {
      console.warn(
        "Leaderboard view/table 'leaderboard' query failed, falling back to 'profiles'. Error:",
        primaryRes.error
      );

      const profilesRes = await queryLeaderboardTable(
        'profiles',
        'username, avatar_url, score',
        'score'
      );

      if (!profilesRes.error && profilesRes.data) {
        data = normalizeLeaderboardRows(profilesRes.data, 'score');
      } else {
        console.warn(
          "Profiles fallback failed, trying 'scores' table. Error:",
          profilesRes.error
        );

        const scoresRes = await queryLeaderboardTable(
          'scores',
          'username, avatar_url, score',
          'score'
        );

        if (!scoresRes.error && scoresRes.data) {
          data = normalizeLeaderboardRows(scoresRes.data, 'score');
        } else {
          const errParts = [
            primaryRes.error?.message,
            profilesRes.error?.message,
            scoresRes.error?.message,
          ].filter(Boolean);
          throw new Error(errParts.join(' | ') || 'All leaderboard queries failed');
        }
      }
    }

    if (data && data.length > 0) {
      renderLeaderboardRows(data);
    } else {
      renderLeaderboardEmpty();
    }
  } catch (err) {
    console.error("Leaderboard exception caught:", err);
    renderLeaderboardError(
      `Failed to fetch leaderboard: ${err.message || 'Unknown network error'}`
    );
  }
}

// ==================== SECURE PROGRESS SYNCHRONIZER ====================
async function syncScoreToSupabase() {
  const syncStatus = document.getElementById('scoreSyncStatus');
  const finalScore = kills;

  if (!currentUser || currentUser.id === 'guest') {
    const guestHighScore = parseInt(storage.getItem('guest_high_score') || '0', 10);
    if (finalScore > guestHighScore) {
      storage.setItem('guest_high_score', finalScore);
      highScore = finalScore;
      const hsCountEl = document.getElementById('highScoreCount');
      if (hsCountEl) hsCountEl.innerText = highScore;
    }
    syncStatus.innerText = "GUEST SCORE SAVED LOCALLY";
    syncStatus.className = "text-[10px] uppercase tracking-widest text-emerald-400 font-bold bg-[#071611] px-3 py-2 rounded-lg text-center mt-3 border border-emerald-500/20 select-none";
    return;
  }

  // Only sync if finalScore is higher than the current highScore
  if (finalScore <= highScore) {
    console.log(`Skipping Supabase score sync: current match score (${finalScore}) is not greater than high score (${highScore})`);
    syncStatus.innerText = "PROFILE SCORE AUTO-SYNCED";
    syncStatus.className = "text-[10px] uppercase tracking-widest text-emerald-400 font-bold bg-[#071611] px-3 py-2 rounded-lg text-center mt-3 border border-emerald-500/20 select-none";
    return;
  }

  syncStatus.innerText = "SYNCHRONIZING SCORE...";
  syncStatus.className = "text-[10px] uppercase tracking-widest text-brawlCyan font-bold bg-[#050f16] px-3 py-2 rounded-lg text-center mt-3 border border-brawlCyan/20 select-none animate-pulse";

  const meta = currentUser.user_metadata || {};
  const username = meta.username || currentUser.email.split('@')[0] || 'Runner';

  // Run this in Supabase SQL Editor if profiles upsert returns 403 (RLS):
  // CREATE POLICY "Users can update own profile" ON profiles
  // FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: currentUser.id,
        username: username,
        score: finalScore
      });

    if (error) throw error;

    console.log("Successfully upserted player profile scores to Supabase:", finalScore);
    syncStatus.innerText = "PROFILE SCORE UPSERTED SUCCESS!";
    syncStatus.className = "text-[10px] uppercase tracking-widest text-emerald-400 font-bold bg-[#071611] px-3 py-2 rounded-lg text-center mt-3 border border-emerald-500/20 select-none";

    highScore = finalScore;
    document.getElementById('highScoreCount').innerText = highScore;
  } catch (err) {
    console.warn("Score sync error:", err);
  }
}

// ==================== HUD & RUN STATE CONTROLS ====================
function updateHUD() {
  document.getElementById('matchKillsCount').innerText = kills;
  document.getElementById('hudDifficultyLevel').innerText = `LEVEL ${currentLevel}`;

  let heartStr = '';
  for (let i = 0; i < lives; i++) {
    heartStr += '❤️';
  }
  if (heartStr === '') heartStr = 'DEFEATED';
  document.getElementById('hudLivesContainer').innerText = heartStr;
}

async function startMatch() {
  SoundSynth.resumeContext();

  document.getElementById('mainMenu').classList.add('hidden');
  document.getElementById('matchView').classList.remove('hidden');
  document.getElementById('defeatOverlay').classList.add('hidden');

  lives = 3;
  kills = 0;
  currentLevel = 1;
  activeTarget = null;
  activeZombies = [];
  activeLasers = [];
  explosionParticles = [];
  spawnInterval = 4000;
  vocabList = [...FALLBACK_VOCAB];
  spawnTimer = 0;
  createCity();

  playerPosition.set(0, 1.8, 0);
  resetCameraOrientation();

  controls.lock();

  // Load vocabulary
  try {
    const { data, error } = await supabase
      .from('vocabulary')
      .select('*');

    if (error) throw error;
    if (data && data.length > 0) {
      console.log('Vocabulary columns:', Object.keys(data[0]));
      vocabList = data.map(item => {
        const enRaw = item.en_word ?? item.en ?? item.english ?? item.word ?? '';
        const ruRaw = item.ru_word ?? item.ru ?? item.russian ?? item.translation ?? '';
        const en = String(enRaw).toLowerCase().trim();
        const ru = String(ruRaw).trim();
        return {
          en,
          ru,
          level: (en.length <= 4) ? 1 : ((en.length <= 7) ? 2 : 3)
        };
      }).filter(item => item.en && item.ru);
    } else {
      vocabList = FALLBACK_VOCAB;
    }
  } catch (e) {
    vocabList = FALLBACK_VOCAB;
  }

  isPlaying = true;

  clock.getDelta();
  triggerAnnounce("SURVIVE THE CITY!");
  updateHUD();
}

function triggerAnnounce(text) {
  const el = document.getElementById('matchAnnounceText');
  el.innerText = text;
  el.className = "font-logo text-4xl md:text-6xl text-brawlRed tracking-wider scale-100 opacity-100 transition-all duration-300 z-10 select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]";
  
  setTimeout(() => {
    el.className = "font-logo text-4xl md:text-6xl text-brawlRed tracking-wider scale-75 opacity-0 transition-all duration-300 z-10 select-none";
  }, 1600);
}

function endMatch() {
  isPlaying = false;
  controls.unlock();
  SoundSynth.playVictory();

  // Sync Defeat Screen info
  document.getElementById('defeatKillsAmt').innerText = `${kills} Kills`;
  document.getElementById('defeatDifficultyReached').innerText = `Level ${currentLevel}`;

  // Upsert progress score to Supabase
  syncScoreToSupabase();

  activeZombies.forEach(z => cleanupZombie(z));
  activeZombies = [];

  document.getElementById('defeatOverlay').classList.remove('hidden');
}

function exitMatchToMenu() {
  isPlaying = false;
  controls.unlock();
  activeZombies.forEach(z => cleanupZombie(z));
  activeZombies = [];

  document.getElementById('matchView').classList.add('hidden');
  document.getElementById('defeatOverlay').classList.add('hidden');
  document.getElementById('mainMenu').classList.remove('hidden');
}

// ==================== 3D SURVIVAL LOOP ====================
function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();
  const time = clock.getElapsedTime();

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }

  if (!isPlaying) return;

  // 1. Movement handling (Arrow Keys)
  const speed = 7.0;
  const newPos = playerPosition.clone();
  
  const forwardVec = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  forwardVec.y = 0;
  forwardVec.normalize();

  const rightVec = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  rightVec.y = 0;
  rightVec.normalize();

  if (activeKeys['ArrowUp']) {
    newPos.addScaledVector(forwardVec, speed * dt);
  }
  if (activeKeys['ArrowDown']) {
    newPos.addScaledVector(forwardVec, -speed * dt);
  }
  if (activeKeys['ArrowLeft']) {
    newPos.addScaledVector(rightVec, -speed * dt);
  }
  if (activeKeys['ArrowRight']) {
    newPos.addScaledVector(rightVec, speed * dt);
  }

  if (!checkPlayerCollision(newPos)) {
    playerPosition.copy(newPos);
  } else {
    // slide
    const slideX = playerPosition.clone();
    slideX.x = newPos.x;
    if (!checkPlayerCollision(slideX)) {
      playerPosition.copy(slideX);
    } else {
      const slideZ = playerPosition.clone();
      slideZ.z = newPos.z;
      if (!checkPlayerCollision(slideZ)) {
        playerPosition.copy(slideZ);
      }
    }
  }

  playerPosition.y = 1.8;
  camera.position.copy(playerPosition);

  // 2. Camera Shakes
  if (shakeTimeLeft > 0) {
    shakeTimeLeft -= dt;
    camera.position.x += (Math.random() - 0.5) * shakeIntensity;
    camera.position.y += (Math.random() - 0.5) * shakeIntensity;
    camera.position.z += (Math.random() - 0.5) * shakeIntensity;
  }

  // 3. Spawner
  const maxActive = currentLevel === 1 ? 3 : (currentLevel === 2 ? 5 : 8);
  spawnTimer += dt * 1000;
  if (spawnTimer >= spawnInterval && activeZombies.length < maxActive) {
    spawnZombie();
    spawnTimer = 0;
  }

  // 4. Update Zombies AI
  for (let i = activeZombies.length - 1; i >= 0; i--) {
    const z = activeZombies[i];
    const bobOffset = Math.sin(time * 5 + i) * 0.14;
    
    z.mesh.lookAt(playerPosition.x, z.mesh.position.y, playerPosition.z);
    
    const halo = z.mesh.getObjectByName("halo");
    if (halo) {
      halo.rotation.z = time * 3.5 + i;
      halo.rotation.y = Math.sin(time + i) * 0.4;
    }
    const coreObj = z.mesh.getObjectByName("core");
    if (coreObj) {
      coreObj.rotation.y = -time * 2.0;
      coreObj.rotation.x = Math.cos(time) * 0.2;
    }
    const proj = z.mesh.getObjectByName("projection");
    if (proj) {
      proj.position.y = -(1.25 + bobOffset) + 0.02;
    }
    
    const direction = new THREE.Vector3().subVectors(playerPosition, z.mesh.position);
    direction.y = 0;
    direction.normalize();
    
    z.mesh.position.addScaledVector(direction, z.speed * dt);
    z.mesh.position.y = 1.25 + bobOffset;

    const dist = z.mesh.position.distanceTo(playerPosition);
    if (dist <= 2.2) {
      spawnExplosionVFX(z.mesh.position, 0xef4444);
      SoundSynth.playHurt();
      triggerCameraShake(0.8, 0.4);

      cleanupZombie(z);
      activeZombies.splice(i, 1);

      if (activeTarget === z) {
        activeTarget = null;
        updateWordInputHUD();
      }

      lives--;
      updateHUD();

      if (lives <= 0) {
        endMatch();
        break;
      }
    }
  }

  // 5. Update Lasers
  for (let i = activeLasers.length - 1; i >= 0; i--) {
    const laser = activeLasers[i];
    laser.scale *= 0.65;
    laser.mesh.scale.set(0.04 * laser.scale, 0.04 * laser.scale, laser.mesh.scale.z);
    if (laser.scale < 0.04) {
      scene.remove(laser.mesh);
      activeLasers.splice(i, 1);
    }
  }

  // 6. Update Explosion Particles
  for (let i = explosionParticles.length - 1; i >= 0; i--) {
    const p = explosionParticles[i];
    p.mesh.position.x += p.vx * dt;
    p.mesh.position.y += p.vy * dt;
    p.mesh.position.z += p.vz * dt;

    p.scale -= p.decay;
    p.mesh.scale.set(p.scale, p.scale, p.scale);

    if (p.scale <= 0) {
      scene.remove(p.mesh);
      explosionParticles.splice(i, 1);
    }
  }

  // 7. Skyscrapers Holograms
  buildingHolograms.forEach(h => {
    h.rotation.y += 0.015;
    h.rotation.x += 0.007;
  });
}

// ==================== TYPING COMBAT CONTROLLER ====================
window.addEventListener('keydown', (e) => {
  // Ignore typing inside auth inputs!
  if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    return;
  }

  if (!isPlaying) return;

  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    activeKeys[e.key] = true;
    e.preventDefault();
    return;
  }

  const key = e.key.toLowerCase();
  if (key.length !== 1 || key < 'a' || key > 'z') {
    return;
  }

  if (!activeTarget) {
    const matches = activeZombies.filter(z => z.word[z.activeCharIndex] === key);
    if (matches.length > 0) {
      matches.sort((a, b) => a.mesh.position.distanceTo(playerPosition) - b.mesh.position.distanceTo(playerPosition));
      
      activeTarget = matches[0];
      activeTarget.activeCharIndex = 1;
      SoundSynth.playClick();

      activeTarget.mesh.traverse(child => {
        if (child.isMesh && child.name === "core") {
          child.material.color.setHex(0xffcb05); // Highlight locked yellow
        }
      });

      updateLabelsHTML();
      updateWordInputHUD();
    } else {
      SoundSynth.playError();
      triggerCameraShake(0.18, 0.15);
      flashActiveInputBorder();
    }
  } else {
    const nextChar = activeTarget.word[activeTarget.activeCharIndex];
    if (key === nextChar) {
      activeTarget.activeCharIndex++;
      SoundSynth.playClick();

      if (activeTarget.activeCharIndex === activeTarget.word.length) {
        const zombiePos = activeTarget.mesh.position.clone();
        zombiePos.y += 0.5;
        
        spawn3DLaser(zombiePos);
        spawnExplosionVFX(zombiePos, 0x39ff14);
        SoundSynth.playLaser();
        SoundSynth.playExplosion();

        cleanupZombie(activeTarget);
        const idx = activeZombies.indexOf(activeTarget);
        if (idx !== -1) {
          activeZombies.splice(idx, 1);
        }

        activeTarget = null;
        kills++;

        if (kills > 0 && kills % 10 === 0) {
          currentLevel++;
          spawnInterval = Math.max(1500, spawnInterval - 700);
          triggerAnnounce(`LEVEL ${currentLevel}: HAZARD INCREASES!`);
          syncScoreToSupabase();
        } else if (kills > 0 && kills % 5 === 0) {
          syncScoreToSupabase();
        }

        updateHUD();
        updateWordInputHUD();
      } else {
        updateLabelsHTML();
        updateWordInputHUD();
      }
    } else {
      SoundSynth.playError();
      triggerCameraShake(0.18, 0.15);
      flashActiveInputBorder();
    }
  }
});

window.addEventListener('keyup', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    activeKeys[e.key] = false;
  }
});

function updateLabelsHTML() {
  activeZombies.forEach(z => {
    if (z.labelElement) {
      const pill = z.labelElement.querySelector('.css2d-pill');
      const textSpan = pill.querySelector('span');

      if (activeTarget === z) {
        pill.classList.add('locked-target');
        
        let htmlStr = '';
        const w = z.word.toUpperCase();
        for (let i = 0; i < w.length; i++) {
          if (i < z.activeCharIndex) {
            htmlStr += `<span class="letter-correct">${w[i]}</span>`;
          } else {
            htmlStr += `<span class="letter-remaining">${w[i]}</span>`;
          }
        }
        textSpan.innerHTML = htmlStr;
      } else {
        pill.classList.remove('locked-target');
        textSpan.innerText = z.word.toUpperCase();
      }
    }
  });
}

function updateWordInputHUD() {
  const container = document.getElementById('activeInputContainer');
  if (activeTarget) {
    container.style.opacity = '1';
    container.style.transform = 'scale(1)';
    
    const display = document.getElementById('targetWordDisplay');
    let htmlStr = '';
    const w = activeTarget.word.toUpperCase();
    for (let i = 0; i < w.length; i++) {
      if (i < activeTarget.activeCharIndex) {
        htmlStr += `<span class="letter-correct">${w[i]}</span>`;
      } else {
        htmlStr += `<span class="letter-remaining">${w[i]}</span>`;
      }
    }
    display.innerHTML = htmlStr;
    document.getElementById('targetTransDisplay').innerText = activeTarget.translation;
  } else {
    container.style.opacity = '0';
    container.style.transform = 'scale(0.9)';
  }
}

function flashActiveInputBorder() {
  const container = document.getElementById('activeInputContainer');
  if (container) {
    container.classList.remove('border-white/15');
    container.classList.add('border-red-500/80');
    setTimeout(() => {
      container.classList.remove('border-red-500/80');
      container.classList.add('border-white/15');
    }, 180);
  }
}

// ==================== BIND UI CLICKS & EVENT TRIGGERS ====================
let authMode = 'login'; // 'login' or 'register'

function setupUIListeners() {
  // Auth Tab Toggles
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const usernameInputWrapper = document.getElementById('usernameInputWrapper');
  const authSubmitBtn = document.getElementById('authSubmitBtn');

  if (tabLoginBtn) {
    tabLoginBtn.addEventListener('click', () => {
      SoundSynth.playClick();
      authMode = 'login';
      tabLoginBtn.className = "flex-1 pb-2 border-b-2 border-brawlCyan text-brawlCyan text-sm font-bold tracking-wider uppercase text-center focus:outline-none";
      if (tabRegisterBtn) tabRegisterBtn.className = "flex-1 pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-300 text-sm font-bold tracking-wider uppercase text-center focus:outline-none";
      if (usernameInputWrapper) usernameInputWrapper.classList.add('hidden');
      if (authSubmitBtn) authSubmitBtn.innerText = "AUTHENTICATE ACCESS";
    });
  }

  if (tabRegisterBtn) {
    tabRegisterBtn.addEventListener('click', () => {
      SoundSynth.playClick();
      authMode = 'register';
      tabRegisterBtn.className = "flex-1 pb-2 border-b-2 border-brawlCyan text-brawlCyan text-sm font-bold tracking-wider uppercase text-center focus:outline-none";
      if (tabLoginBtn) tabLoginBtn.className = "flex-1 pb-2 border-b-2 border-transparent text-slate-500 hover:text-slate-300 text-sm font-bold tracking-wider uppercase text-center focus:outline-none";
      if (usernameInputWrapper) usernameInputWrapper.classList.remove('hidden');
      if (authSubmitBtn) authSubmitBtn.innerText = "INITIALIZE PROFILE";
    });
  }

  // Submit credentials button
  if (authSubmitBtn) {
    authSubmitBtn.addEventListener('click', () => {
      SoundSynth.playClick();
      handleAuthAction(authMode);
    });
  }

  // Guest Play Button
  const guestPlayBtn = document.getElementById('guestPlayBtn');
  if (guestPlayBtn) {
    guestPlayBtn.addEventListener('click', () => {
      SoundSynth.playClick();
      currentUser = {
        id: 'guest',
        email: 'guest@matrix.net',
        user_metadata: { username: 'Guest Runner' }
      };
      initializeGame();
      transitionToApp(true);
      loadUserProfile();
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      SoundSynth.playClick();
      if (!supabase || (currentUser && currentUser.id === 'guest')) {
        currentUser = null;
        transitionToApp(false);
        return;
      }
      const { error } = await supabase.auth.signOut();
      if (error) console.error("SignOut error:", error.message);
    });
  }

  // Interactive profile username customizer (allows editing guest or auth usernames on click)
  const userProfileBadge = document.getElementById('userProfileBadge');
  if (userProfileBadge) {
    userProfileBadge.style.cursor = 'pointer';
    userProfileBadge.title = "Click to change cyber alias";
    userProfileBadge.addEventListener('click', async () => {
      const nameEl = document.getElementById('userName');
      const avatarEl = document.getElementById('userAvatar');
      if (!nameEl) return;
      
      const currentName = nameEl.innerText;
      const newName = prompt("Enter your new cyber alias:", currentName);
      if (newName && newName.trim() !== '' && newName.trim().toUpperCase() !== currentName) {
        const cleanedName = newName.trim().substring(0, 15);
        nameEl.innerText = cleanedName.toUpperCase();
        if (avatarEl) {
          avatarEl.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanedName)}`;
        }
        
        if (supabase && currentUser && currentUser.id !== 'guest') {
          try {
            // Update in Supabase Auth user_metadata (always allowed for authenticated users)
            const { data, error } = await supabase.auth.updateUser({
              data: { username: cleanedName }
            });
            if (error) throw error;
            currentUser = data.user;
            
            // Also attempt to upsert to profiles table (in case RLS permits writes)
            await supabase.from('profiles').upsert({
              id: currentUser.id,
              username: cleanedName,
              score: highScore
            });
          } catch (e) {
            console.warn("Failed to update database profile record (metadata fallback updated):", e.message);
          }
        } else {
          // Store guest username prefix locally in localStorage
          storage.setItem('guest_username', cleanedName);
        }
      }
    });
  }

  // Leaderboard togglers
  const leaderboardBtn = document.getElementById('leaderboardBtn');
  if (leaderboardBtn) {
    leaderboardBtn.addEventListener('click', () => {
      const leaderboardModal = document.getElementById('leaderboardModal');
      if (leaderboardModal) leaderboardModal.classList.remove('hidden');
      SoundSynth.playClick();
      fetchAndRenderLeaderboard();
    });
  }

  const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
  if (closeLeaderboardBtn) {
    closeLeaderboardBtn.addEventListener('click', () => {
      const leaderboardModal = document.getElementById('leaderboardModal');
      if (leaderboardModal) leaderboardModal.classList.add('hidden');
      SoundSynth.playClick();
    });
  }

  // Enter city / Start Match
  const playBtn = document.getElementById('playBtn');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      startMatch();
    });
  }

  // Resume blocker lock button
  const resumeLockBtn = document.getElementById('resumeLockBtn');
  if (resumeLockBtn) {
    resumeLockBtn.addEventListener('click', () => {
      controls.lock();
    });
  }

  // surrenders
  const exitMatchBtn = document.getElementById('exitMatchBtn');
  if (exitMatchBtn) {
    exitMatchBtn.addEventListener('click', () => {
      exitMatchToMenu();
    });
  }

  document.getElementById('defeatExitBtn').addEventListener('click', () => {
    document.getElementById('defeatOverlay').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
    SoundSynth.playClick();
  });
}

// ==================== INITIALIZATION ====================
window.addEventListener('DOMContentLoaded', () => {
  // Establish Secure Session hooks (which will trigger initializeGame() once session is checked)
  setupSessionManager();
});

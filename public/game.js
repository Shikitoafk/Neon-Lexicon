// City of Words: Survival 3D - Three.js FPS Typing Engine

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
    const notes = [293.66, 349.23, 440.00, 587.33]; // D Minor Arpeggio
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
      console.warn("localStorage.getItem blocked:", e);
      return null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("localStorage.setItem blocked:", e);
    }
  }
};

// ==================== STATE MANAGEMENT ====================
let highScore = 0;
let currentUser = null; // Supabase OAuth logged-in user profile
let dbSettings = {
  url: 'https://libevuarffovwgwggvar.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpYmV2dWFyZmZvdndnd2dndmFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNzg3NTYsImV4cCI6MjA5NDg1NDc1Nn0.OmIvH_RVA9iQ4k7zcBRewT7-aZSlR2Zi8BI4rMdy7Lg'
};
let supabaseClient = null;

// ==================== THREE.JS 3D VARIABLES ====================
let scene, camera, renderer, labelRenderer;
let controls; // PointerLockControls
let clock = new THREE.Clock();

// Game settings
let isPlaying = false;
let lives = 3;
let kills = 0;
let currentLevel = 1;
let activeTarget = null;
let activeZombies = [];
let activeLasers = [];
let explosionParticles = [];
let activeKeys = {}; // Keyboard keys map (Arrow Keys)
let playerPosition = new THREE.Vector3(0, 1.8, 0); // Player logical XZ coordinate

// Spooky camera shake parameters
let shakeTimeLeft = 0;
let shakeIntensity = 0;

// Spawning and dictionary cache
let vocabList = [];
let spawnTimer = 0;
let spawnInterval = 4000; // spawn enemy every 4s base

// Cities infrastructure / collision helpers
let buildingBoundingBoxes = [];
let buildingHolograms = []; // Spinning holographic wireframes on tall skyscrapers

// ==================== SUPABASE INITIALIZATION ====================
function initSupabase() {
  const savedUrl = storage.getItem('supabase_url');
  const savedKey = storage.getItem('supabase_key');
  
  if (savedUrl) dbSettings.url = savedUrl;
  if (savedKey) dbSettings.key = savedKey;

  document.getElementById('supabaseUrlInput').value = dbSettings.url;
  document.getElementById('supabaseKeyInput').value = dbSettings.key;

  const statusAlert = document.getElementById('dbStatusAlert');

  if (dbSettings.url && dbSettings.key) {
    try {
      supabaseClient = window.supabase.createClient(dbSettings.url, dbSettings.key);
      statusAlert.innerText = "SUPABASE CLIENT CONNECTED";
      statusAlert.className = "text-xs p-2 bg-emerald-950 border border-emerald-500/30 text-emerald-400 rounded-lg text-center font-bold";
      
      // Wire up Auth state change listeners
      setupAuthListener();
    } catch (e) {
      console.error("Supabase failed initialization:", e);
      statusAlert.innerText = "CLIENT CONFIGURATION ERROR";
      statusAlert.className = "text-xs p-2 bg-red-950 border border-red-500/30 text-red-500 rounded-lg text-center font-bold";
      supabaseClient = null;
    }
  } else {
    statusAlert.innerText = "FALLBACK MOCK ACTIVE";
    statusAlert.className = "text-xs p-2 bg-slate-800 border border-slate-700 text-gray-400 rounded-lg text-center font-bold";
    supabaseClient = null;
  }
}

// Fetch vocabulary with an Async Promise Wrapper
async function fetchVocabulary() {
  if (!supabaseClient) {
    console.log("Using local mock dictionary pool.");
    return Promise.resolve(FALLBACK_VOCAB);
  }
  try {
    const { data, error } = await supabaseClient
      .from('vocabulary')
      .select('en_word, ru_word, theme');
    
    if (error) throw error;
    if (data && data.length > 0) {
      console.log(`Loaded ${data.length} words from Supabase.`);
      return Promise.resolve(data.map(item => ({
        en: item.en_word.toLowerCase().trim(),
        ru: item.ru_word.trim(),
        level: (item.en_word.length <= 4) ? 1 : ((item.en_word.length <= 7) ? 2 : 3)
      })));
    } else {
      return Promise.resolve(FALLBACK_VOCAB);
    }
  } catch (err) {
    console.error("Supabase fetch failed, utilizing fallbacks:", err);
    return Promise.resolve(FALLBACK_VOCAB);
  }
}

// ==================== SUPABASE AUTHENTICATION SYSTEM ====================
function setupAuthListener() {
  if (!supabaseClient) return;

  // Listen for auth events (Sign In, Sign Out, etc.)
  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    console.log("Supabase Auth event:", event);
    if (session) {
      currentUser = session.user;
      updateAuthUI(true);
    } else {
      currentUser = null;
      updateAuthUI(false);
    }
  });

  // Check initial session state on load
  supabaseClient.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      currentUser = session.user;
      updateAuthUI(true);
    } else {
      currentUser = null;
      updateAuthUI(false);
    }
  }).catch(err => {
    console.warn("Failed checking initial session:", err);
  });
}

function updateAuthUI(isLoggedIn) {
  const loggedOutView = document.getElementById('loggedOutView');
  const loggedInView = document.getElementById('loggedInView');
  const playBtnContainer = document.getElementById('playBtnContainer');

  if (isLoggedIn && currentUser) {
    loggedOutView.classList.add('hidden');
    loggedInView.classList.remove('hidden');
    playBtnContainer.classList.remove('hidden');

    // Extract user profile metadata
    const meta = currentUser.user_metadata || {};
    const username = meta.full_name || meta.user_name || meta.preferred_username || meta.name || currentUser.email || 'Cyber Runner';
    const avatar = meta.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;

    document.getElementById('userName').innerText = username;
    document.getElementById('userAvatar').src = avatar;

    // Sync match-defeat sync HUD status label
    document.getElementById('scoreSyncStatus').innerText = "SCORE SAVING SYNCED TO LEADERBOARD";
    document.getElementById('scoreSyncStatus').className = "text-[10px] uppercase tracking-widest text-emerald-400 font-bold bg-[#071611] px-3 py-2 rounded-lg text-center mt-3 border border-emerald-500/20 select-none";
  } else {
    loggedOutView.classList.remove('hidden');
    loggedInView.classList.add('hidden');
    
    // Play button remains hidden for guests until they select "Play as Guest"
    playBtnContainer.classList.add('hidden');

    document.getElementById('scoreSyncStatus').innerText = "LOG IN TO SYNC SCORE GLOBAL";
    document.getElementById('scoreSyncStatus').className = "text-[10px] uppercase tracking-widest text-slate-400 font-bold bg-[#090518] px-3 py-2 rounded-lg text-center mt-3 border border-purple-500/20 select-none";
  }
}

// ==================== GLOBAL LEADERBOARD INTEGRATION ====================
async function fetchAndRenderLeaderboard() {
  const rowsContainer = document.getElementById('leaderboardRows');
  rowsContainer.innerHTML = `
    <div class="text-center py-8 text-slate-500 text-sm">
      <span class="animate-pulse">RETRIEVING LEADERBOARD DATA...</span>
    </div>
  `;

  if (!supabaseClient) {
    rowsContainer.innerHTML = `
      <div class="text-center py-8 text-slate-500 text-xs uppercase tracking-widest border border-slate-900 rounded-xl p-4 bg-slate-950/20">
        Supabase is not connected. Configure client settings to sync the leaderboard.
      </div>
    `;
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from('leaderboard')
      .select('*')
      .limit(10);

    if (error) throw error;

    if (data && data.length > 0) {
      rowsContainer.innerHTML = '';
      data.forEach((row, index) => {
        const rank = index + 1;
        const username = row.username || 'Anonymous Runner';
        const avatar = row.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;
        const highestScore = row.highest_score || 0;

        // Visual medals for Top 3
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
    } else {
      rowsContainer.innerHTML = `
        <div class="text-center py-8 text-slate-500 text-xs uppercase tracking-widest border border-slate-900 rounded-xl p-4 bg-slate-950/20">
          No records found. Complete a match to set your score!
        </div>
      `;
    }
  } catch (err) {
    console.error("Leaderboard error:", err);
    rowsContainer.innerHTML = `
      <div class="text-center py-8 text-brawlRed text-xs uppercase tracking-widest border border-brawlRed/20 rounded-xl p-4 bg-red-950/5">
        Failed to fetch leaderboard: ${err.message || 'Unknown network error'}
      </div>
    `;
  }
}

// ==================== SCORE WRITER SYSTEM ====================
async function syncScoreToSupabase() {
  const syncStatus = document.getElementById('scoreSyncStatus');
  if (!supabaseClient || !currentUser) {
    console.log("Playing as Guest: score not synchronized.");
    syncStatus.innerText = "PLAYING AS GUEST: SCORE NOT SYNCED";
    syncStatus.className = "text-[10px] uppercase tracking-widest text-slate-400 font-bold bg-[#090518] px-3 py-2 rounded-lg text-center mt-3 border border-purple-500/20 select-none";
    return;
  }

  syncStatus.innerText = "SYNCING SCORE TO LEADERBOARD...";
  syncStatus.className = "text-[10px] uppercase tracking-widest text-brawlCyan font-bold bg-[#050f16] px-3 py-2 rounded-lg text-center mt-3 border border-brawlCyan/20 select-none animate-pulse";

  try {
    const finalScore = kills;
    const totalWords = kills;
    const { error } = await supabaseClient
      .from('scores')
      .insert([
        {
          user_id: currentUser.id,
          score: finalScore,
          words_typed: totalWords
        }
      ]);

    if (error) throw error;

    console.log("Successfully synchronized score to Supabase:", finalScore);
    syncStatus.innerText = "SCORE SYNCED SUCCESSFULLY!";
    syncStatus.className = "text-[10px] uppercase tracking-widest text-emerald-400 font-bold bg-[#071611] px-3 py-2 rounded-lg text-center mt-3 border border-emerald-500/20 select-none";
  } catch (err) {
    console.error("Score sync error:", err);
    syncStatus.innerText = "FAILED TO SYNC SCORE";
    syncStatus.className = "text-[10px] uppercase tracking-widest text-brawlRed font-bold bg-[#1a080f] px-3 py-2 rounded-lg text-center mt-3 border border-brawlRed/20 select-none";
  }
}


// ==================== PROCEDURAL INFRASTRUCTURE BUILDER ====================
function createCity() {
  // Clear scene
  while (scene.children.length > 0) { 
    scene.remove(scene.children[0]); 
  }
  buildingBoundingBoxes = [];
  buildingHolograms = [];

  // Hemisphere light: Sky purple, ground blue/indigo for gorgeous cyberpunk ambient
  const hemiLight = new THREE.HemisphereLight(0xa855f7, 0x1e1b4b, 1.15);
  scene.add(hemiLight);

  // Directional moonlight (Vibrant Hot Cyber Pink)
  const moonLight = new THREE.DirectionalLight(0xf43f5e, 1.6);
  moonLight.position.set(40, 80, 40);
  scene.add(moonLight);

  // Floor plane (Dark metallic cyber asphalt)
  const floorGeo = new THREE.PlaneGeometry(300, 300);
  const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x070311, 
    roughness: 0.35, 
    metalness: 0.85 
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Cyberpunk Grid Helper (Vibrant Cyan and Violet)
  const gridHelper = new THREE.GridHelper(300, 60, 0x00f0ff, 0xa855f7);
  gridHelper.position.y = 0.02;
  scene.add(gridHelper);

  // Spawning 45 neon outline skyscrapers
  const neonColors = [0x00f0ff, 0xff007f, 0x39ff14, 0xffcb05];
  
  for (let i = 0; i < 45; i++) {
    const w = 12 + Math.random() * 16;
    const h = 20 + Math.random() * 55;
    const d = 12 + Math.random() * 16;

    // Main building geometry
    const bGeo = new THREE.BoxGeometry(w, h, d);
    const buildingBaseColors = [
      0x0a1622, // Metallic Cyber Teal
      0x130a24, // Dark Cyber Purple
      0x24061a, // Dark Cyber Pink/Magenta
      0x0b1c16, // Toxic Emerald
      0x101322  // Deep Space Indigo
    ];
    const baseColor = buildingBaseColors[Math.floor(Math.random() * buildingBaseColors.length)];

    const bMat = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: 0.22,
      metalness: 0.88,
      flatShading: true
    });
    const building = new THREE.Mesh(bGeo, bMat);

    // Place building
    let bx = (Math.random() - 0.5) * 220;
    let bz = (Math.random() - 0.5) * 220;

    // Avoid immediate center player spawn area
    if (Math.abs(bx) < 18 && Math.abs(bz) < 18) {
      bx += bx > 0 ? 25 : -25;
      bz += bz > 0 ? 25 : -25;
    }

    building.position.set(bx, h / 2, bz);
    scene.add(building);

    // Store bounding box for player collision
    const box = new THREE.Box3().setFromObject(building);
    buildingBoundingBoxes.push(box);

    // 1. ADD NEON PIPING/EDGES to the skyscraper
    // We'll place 4 vertical glowing neon pillars at the corners of the building
    const pipeColor = neonColors[Math.floor(Math.random() * neonColors.length)];
    const pipeGeo = new THREE.BoxGeometry(0.4, h, 0.4);
    const pipeMat = new THREE.MeshBasicMaterial({ color: pipeColor });

    // Corner offsets
    const offsets = [
      { x: -w/2, z: -d/2 },
      { x: w/2, z: -d/2 },
      { x: -w/2, z: d/2 },
      { x: w/2, z: d/2 }
    ];

    offsets.forEach(offset => {
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.position.set(bx + offset.x, h / 2, bz + offset.z);
      scene.add(pipe);
    });

    // 2. ADD GLOWING WINDOW GRIDS on skyscraper sides (horizontal stripes)
    const windowColor = neonColors[Math.floor(Math.random() * neonColors.length)];
    const winMat = new THREE.MeshBasicMaterial({ color: windowColor });

    const bandCount = 3 + Math.floor(Math.random() * 4);
    for (let b = 0; b < bandCount; b++) {
      const bandHeight = (h / (bandCount + 1)) * (b + 1);
      const bandGeo = new THREE.BoxGeometry(w + 0.1, 0.45, d + 0.1);
      const band = new THREE.Mesh(bandGeo, winMat);
      band.position.set(bx, bandHeight, bz);
      scene.add(band);
    }

    // 3. ADD FLOATING WIREFRAME HOLOGRAM ON TOP OF TALL SKYSCRAPERS
    if (h > 45) {
      const holoGeo = new THREE.OctahedronGeometry(2.2, 0); // wireframe diamond
      const holoMat = new THREE.MeshBasicMaterial({ 
        color: pipeColor, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.65 
      });
      const holo = new THREE.Mesh(holoGeo, holoMat);
      holo.position.set(bx, h + 3.5, bz);
      scene.add(holo);
      buildingHolograms.push(holo);
    }
  }

  // Boundary walls with glowing neon borders
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x04020a, roughness: 0.9 });
  const wGeo = new THREE.BoxGeometry(300, 20, 4);
  const wallNeonMat = new THREE.MeshBasicMaterial({ color: 0xff007f });

  const northWall = new THREE.Mesh(wGeo, wallMat);
  northWall.position.set(0, 10, -150);
  scene.add(northWall);
  buildingBoundingBoxes.push(new THREE.Box3().setFromObject(northWall));

  const northWallNeon = new THREE.Mesh(new THREE.BoxGeometry(300, 0.6, 4.2), wallNeonMat);
  northWallNeon.position.set(0, 18, -150);
  scene.add(northWallNeon);

  const southWall = new THREE.Mesh(wGeo, wallMat);
  southWall.position.set(0, 10, 150);
  scene.add(southWall);
  buildingBoundingBoxes.push(new THREE.Box3().setFromObject(southWall));

  const southWallNeon = new THREE.Mesh(new THREE.BoxGeometry(300, 0.6, 4.2), wallNeonMat);
  southWallNeon.position.set(0, 18, 150);
  scene.add(southWallNeon);

  const wGeoSide = new THREE.BoxGeometry(4, 20, 300);
  const eastWall = new THREE.Mesh(wGeoSide, wallMat);
  eastWall.position.set(150, 10, 0);
  scene.add(eastWall);
  buildingBoundingBoxes.push(new THREE.Box3().setFromObject(eastWall));

  const eastWallNeon = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.6, 300), wallNeonMat);
  eastWallNeon.position.set(150, 18, 0);
  scene.add(eastWallNeon);

  const westWall = new THREE.Mesh(wGeoSide, wallMat);
  westWall.position.set(-150, 10, 0);
  scene.add(westWall);
  buildingBoundingBoxes.push(new THREE.Box3().setFromObject(westWall));

  const westWallNeon = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.6, 300), wallNeonMat);
  westWallNeon.position.set(-150, 18, 0);
  scene.add(westWallNeon);
}

// ==================== ENGINE SETUP ====================
function init3D() {
  const canvasElement = document.getElementById('webgl-canvas');
  scene = new THREE.Scene();
  
  // Cyberpunk Violet fog backdrop
  scene.background = new THREE.Color(0x0f051d);
  scene.fog = new THREE.FogExp2(0x0f051d, 0.011);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 300);
  camera.position.set(0, 1.8, 0); // Player height 1.8 meters

  renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // CSS2DRenderer setup
  labelRenderer = new THREE.CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none'; // click-through
  document.getElementById('css2d-renderer').appendChild(labelRenderer.domElement);

  // PointerLockControls
  controls = new THREE.PointerLockControls(camera, renderer.domElement);
  
  controls.addEventListener('lock', () => {
    document.getElementById('blockerOverlay').classList.add('hidden');
  });

  controls.addEventListener('unlock', () => {
    if (isPlaying) {
      document.getElementById('blockerOverlay').classList.remove('hidden');
    }
  });

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

// ==================== ZOMBIE ALIENS AI ====================
function spawnZombie() {
  // Select word based on Level
  const levelFiltered = vocabList.filter(item => item.level === Math.min(3, currentLevel));
  const pool = levelFiltered.length > 0 ? levelFiltered : vocabList;
  const wordObj = pool[Math.floor(Math.random() * pool.length)];

  // Spawn position - out of sight/far away
  const angle = Math.random() * Math.PI * 2;
  const dist = 35 + Math.random() * 25; // Spawn 35-60m away
  const zX = camera.position.x + Math.cos(angle) * dist;
  const zZ = camera.position.z + Math.sin(angle) * dist;

  // Outer glowing emissive neon colors based on Level
  const zColor = currentLevel === 1 ? 0x39ff14 : (currentLevel === 2 ? 0xffcb05 : 0xff007f);
  
  // Create beautiful composite alien sentinel drone group
  const zMesh = new THREE.Group();
  zMesh.position.set(zX, 1.25, zZ); // Hovering baseline height
  
  // 1. Core glowing energy diamond (Octahedron)
  const coreGeo = new THREE.OctahedronGeometry(0.42, 1);
  const coreMat = new THREE.MeshStandardMaterial({
    color: zColor,
    emissive: zColor,
    emissiveIntensity: 1.45,
    roughness: 0.15,
    metalness: 0.9,
    flatShading: true
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreMesh.name = "core";
  zMesh.add(coreMesh);

  // 2. Rotating outer wireframe halo (Torus)
  const ringGeo = new THREE.TorusGeometry(0.62, 0.06, 6, 18);
  const ringMat = new THREE.MeshBasicMaterial({ color: zColor, wireframe: true });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.name = "halo";
  zMesh.add(ringMesh);

  // 3. Creepy mechanical spikes/legs pointing downwards
  const legGeo = new THREE.ConeGeometry(0.06, 0.7, 4);
  const legMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a24,
    roughness: 0.5,
    metalness: 0.8
  });

  const legCount = 4;
  for (let i = 0; i < legCount; i++) {
    const angleOffset = (i / legCount) * Math.PI * 2;
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(Math.cos(angleOffset) * 0.32, -0.38, Math.sin(angleOffset) * 0.32);
    leg.rotation.z = Math.cos(angleOffset) * 0.25;
    leg.rotation.x = Math.sin(angleOffset) * 0.25;
    zMesh.add(leg);
  }

  // 4. Glowing visor/eye in the front center
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const eyeGeo = new THREE.SphereGeometry(0.09, 8, 8);
  const eye = new THREE.Mesh(eyeGeo, eyeMat);
  eye.position.set(0, 0.05, 0.4);
  zMesh.add(eye);

  // 5. Flat glowing projection ring on the floor
  const projGeo = new THREE.RingGeometry(0.1, 0.65, 16);
  projGeo.rotateX(-Math.PI / 2);
  const projMat = new THREE.MeshBasicMaterial({
    color: zColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4
  });
  const projMesh = new THREE.Mesh(projGeo, projMat);
  projMesh.name = "projection";
  projMesh.position.set(0, -1.23, 0); // stays on floor y=0.02
  zMesh.add(projMesh);

  scene.add(zMesh);

  // Floating HTML UI label
  const labelDiv = document.createElement('div');
  labelDiv.className = 'css2d-word-label';
  labelDiv.innerHTML = `
    <div class="css2d-pill">
      <span class="css2d-en-text">${wordObj.en.toUpperCase()}</span>
    </div>
    <span class="css2d-ru-text">${wordObj.ru}</span>
  `;

  const cssLabel = new THREE.CSS2DObject(labelDiv);
  cssLabel.position.set(0, 1.25, 0); // Position directly above drone core
  zMesh.add(cssLabel);

  // Setup speed based on difficulty level
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

// Clean up a zombie mesh and its floating CSS2D HTML label to prevent memory/DOM leaks
function cleanupZombie(z) {
  if (!z) return;
  
  // 1. Remove CSS2D label from hierarchy and document body
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

  // 2. Remove mesh from Three.js scene and dispose resources
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

// Player collision checking
function checkPlayerCollision(newPos) {
  const pSize = 0.8;
  const pBox = new THREE.Box3(
    new THREE.Vector3(newPos.x - pSize, 0, newPos.z - pSize),
    new THREE.Vector3(newPos.x + pSize, 10, newPos.z + pSize)
  );

  for (let box of buildingBoundingBoxes) {
    if (box.intersectsBox(pBox)) {
      return true; // Collision detected
    }
  }
  return false;
}

// ==================== VISUAL EFFECTS (LASERS & EXPLOSIONS) ====================
function spawn3DLaser(endPos) {
  const startPos = new THREE.Vector3(camera.position.x, camera.position.y - 0.25, camera.position.z);
  
  // Calculate distance & rotation
  const distance = startPos.distanceTo(endPos);
  const geom = new THREE.CylinderGeometry(0.04, 0.04, distance, 6);
  geom.rotateX(Math.PI / 2); // Align cylinder along z-axis

  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
  const laserMesh = new THREE.Mesh(geom, mat);
  
  // Point laser from camera to zombie
  laserMesh.position.copy(startPos);
  laserMesh.lookAt(endPos);
  laserMesh.translateZ(distance / 2); // Move cylinder center forward

  scene.add(laserMesh);
  activeLasers.push({ mesh: laserMesh, scale: 1.0 });
}

function spawnExplosionVFX(pos, colorHex) {
  const pCount = 18;
  for (let i = 0; i < pCount; i++) {
    const geo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    const mat = new THREE.MeshBasicMaterial({ color: colorHex });
    const pMesh = new THREE.Mesh(geo, mat);
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

// Camera shake trigger
function triggerCameraShake(intensity, duration) {
  shakeIntensity = intensity;
  shakeTimeLeft = duration;
}

// ==================== GAME HUD & RUN STATE CONTROLS ====================
function updateHUD() {
  document.getElementById('matchKillsCount').innerText = kills;
  document.getElementById('hudDifficultyLevel').innerText = `LEVEL ${currentLevel}`;

  // Lives (Shield hearts display)
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

  // Build Scene
  createCity();
  
  // Position player at origin center
  playerPosition.set(0, 1.8, 0);
  camera.position.copy(playerPosition);

  // Request pointer lock
  controls.lock();

  // Load Vocabs
  vocabList = await fetchVocabulary();

  // Reset clock delta
  clock.getDelta();

  triggerAnnounce("SURVIVE THE CITY!");
  isPlaying = true;
  updateHUD();
}

function triggerAnnounce(text) {
  const el = document.getElementById('matchAnnounceText');
  el.innerText = text;
  el.className = "font-logo text-4xl md:text-6xl text-red-500 tracking-wider scale-100 opacity-100 transition-all duration-300 z-10 select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]";
  
  setTimeout(() => {
    el.className = "font-logo text-4xl md:text-6xl text-red-500 tracking-wider scale-75 opacity-0 transition-all duration-300 z-10 select-none";
  }, 1600);
}

function endMatch() {
  isPlaying = false;
  controls.unlock();
  SoundSynth.playVictory();

  // Update Highscore
  if (kills > highScore) {
    highScore = kills;
    storage.setItem('vocab_stars_highscore', highScore);
    document.getElementById('highScoreCount').innerText = highScore;
  }

  // Sync Defeat Screen info
  document.getElementById('defeatKillsAmt').innerText = `${kills} Kills`;
  document.getElementById('defeatDifficultyReached').innerText = `Level ${currentLevel}`;

  // Synchronize result to Supabase leaderboard
  syncScoreToSupabase();

  // Clear zombies from scene
  activeZombies.forEach(z => cleanupZombie(z));
  activeZombies = [];

  document.getElementById('defeatOverlay').classList.remove('hidden');
}

// Exit match/Surrender
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

  // Unconditional render
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }

  if (!isPlaying) return;

  // 1. Movement handling (Arrow Keys Translation)
  const speed = 7.0; // move speed units per second
  const newPos = playerPosition.clone();
  
  // Forward/Backward vectors based on camera orientation
  const forwardVec = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  forwardVec.y = 0; // lock height level
  forwardVec.normalize();

  // Strafe vectors
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

  // Apply collision checking before committing position
  if (!checkPlayerCollision(newPos)) {
    playerPosition.copy(newPos);
  } else {
    // Try slide movement along X-axis only
    const slideX = playerPosition.clone();
    slideX.x = newPos.x;
    if (!checkPlayerCollision(slideX)) {
      playerPosition.copy(slideX);
    } else {
      // Try slide movement along Z-axis only
      const slideZ = playerPosition.clone();
      slideZ.z = newPos.z;
      if (!checkPlayerCollision(slideZ)) {
        playerPosition.copy(slideZ);
      }
    }
  }

  // Force height level constraint (1.8m height above floor y=0)
  playerPosition.y = 1.8;

  // Copy playerPosition to camera.position
  camera.position.copy(playerPosition);

  // 2. Camera Shakes (applies random offset to camera.position only, does not shift playerPosition)
  if (shakeTimeLeft > 0) {
    shakeTimeLeft -= dt;
    camera.position.x += (Math.random() - 0.5) * shakeIntensity;
    camera.position.y += (Math.random() - 0.5) * shakeIntensity;
    camera.position.z += (Math.random() - 0.5) * shakeIntensity;
  }

  // 3. Spawning Timer checks
  // Limit max zombies active to avoid clutters: level 1 max 3, level 2 max 5, level 3 max 8
  const maxActive = currentLevel === 1 ? 3 : (currentLevel === 2 ? 5 : 8);
  spawnTimer += dt * 1000;
  if (spawnTimer >= spawnInterval && activeZombies.length < maxActive) {
    spawnZombie();
    spawnTimer = 0;
  }

  // 4. Update Zombies Pathing & Floating Animation
  for (let i = activeZombies.length - 1; i >= 0; i--) {
    const z = activeZombies[i];
    
    // Smooth hover bobbing animation
    const bobOffset = Math.sin(time * 5 + i) * 0.14;
    
    // Look at player position
    z.mesh.lookAt(playerPosition.x, z.mesh.position.y, playerPosition.z);
    
    // Spin child objects of the sentinel drone
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
    // Ground projection stays flat on the floor at y=0.02
    const proj = z.mesh.getObjectByName("projection");
    if (proj) {
      proj.position.y = -(1.25 + bobOffset) + 0.02;
    }
    
    // Walk directly towards player
    const direction = new THREE.Vector3().subVectors(playerPosition, z.mesh.position);
    direction.y = 0; // Lock pathing to ground level
    direction.normalize();
    
    z.mesh.position.addScaledVector(direction, z.speed * dt);
    z.mesh.position.y = 1.25 + bobOffset; // base hover center + bob

    // Check collision / melee range with player
    const dist = z.mesh.position.distanceTo(playerPosition);
    if (dist <= 2.2) {
      // Intrude player radius: explode, subtract life, trigger camera shake
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

  // 5. Update Lasers (scale decay)
  for (let i = activeLasers.length - 1; i >= 0; i--) {
    const laser = activeLasers[i];
    laser.mesh.scale.x *= 0.65;
    laser.mesh.scale.y *= 0.65;
    if (laser.mesh.scale.x < 0.04) {
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

  // 7. Update Building Holograms
  buildingHolograms.forEach(h => {
    h.rotation.y += 0.015;
    h.rotation.x += 0.007;
  });
}

// ==================== TYPING COMBAT CONTROLLER ====================
window.addEventListener('keydown', (e) => {
  if (!isPlaying) return;

  // Handle arrow key controls
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    activeKeys[e.key] = true;
    e.preventDefault();
    return;
  }

  // Handle combat typing (A-Z)
  const key = e.key.toLowerCase();
  if (key.length !== 1 || key < 'a' || key > 'z') {
    return;
  }

  // Case A: No target locked
  if (!activeTarget) {
    // Find threat containing this key as the first character
    const matches = activeZombies.filter(z => z.word[z.activeCharIndex] === key);
    if (matches.length > 0) {
      // Pick threat closest to player
      matches.sort((a, b) => a.mesh.position.distanceTo(playerPosition) - b.mesh.position.distanceTo(playerPosition));
      
      activeTarget = matches[0];
      activeTarget.activeCharIndex = 1;
      SoundSynth.playClick();

      // Highlight target mesh in yellow
      activeTarget.mesh.traverse(child => {
        if (child.isMesh) {
          child.material.color.setHex(0xffcb05); // yellow
        }
      });

      updateLabelsHTML();
      updateWordInputHUD();
    } else {
      SoundSynth.playError();
      triggerCameraShake(0.18, 0.15);
      flashActiveInputBorder();
    }
  }
  // Case B: Active target locked
  else {
    const nextChar = activeTarget.word[activeTarget.activeCharIndex];
    if (key === nextChar) {
      activeTarget.activeCharIndex++;
      SoundSynth.playClick();

      if (activeTarget.activeCharIndex === activeTarget.word.length) {
        // Shoot zombie!
        const zombiePos = activeTarget.mesh.position.clone();
        zombiePos.y += 0.5; // aim for center body
        
        spawn3DLaser(zombiePos);
        spawnExplosionVFX(zombiePos, 0x39ff14);
        SoundSynth.playLaser();
        SoundSynth.playExplosion();

        // Remove zombie
        cleanupZombie(activeTarget);
        const idx = activeZombies.indexOf(activeTarget);
        if (idx !== -1) {
          activeZombies.splice(idx, 1);
        }

        activeTarget = null;
        kills++;

        // Speed up spawn interval and increment levels
        if (kills > 0 && kills % 10 === 0) {
          currentLevel++;
          spawnInterval = Math.max(1500, spawnInterval - 700);
          triggerAnnounce(`LEVEL ${currentLevel}: HAZARD INCREASES!`);
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

// Update borders and highlights inside CSS2D labels
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

// Update the bottom target input HUD
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
function setupUIListeners() {
  // Settings gear
  document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.remove('hidden');
    SoundSynth.playClick();
  });

  document.getElementById('closeSettingsBtn').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.add('hidden');
    SoundSynth.playClick();
  });

  // Settings Save/Reset
  document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    const url = document.getElementById('supabaseUrlInput').value.trim();
    const key = document.getElementById('supabaseKeyInput').value.trim();
    storage.setItem('supabase_url', url);
    storage.setItem('supabase_key', key);
    initSupabase();
    document.getElementById('settingsModal').classList.add('hidden');
    SoundSynth.playClick();
  });

  document.getElementById('resetSettingsBtn').addEventListener('click', () => {
    storage.setItem('supabase_url', '');
    storage.setItem('supabase_key', '');
    initSupabase();
    document.getElementById('settingsModal').classList.add('hidden');
    SoundSynth.playClick();
  });

  // OAuth Authentication buttons
  document.getElementById('discordLoginBtn').addEventListener('click', async () => {
    SoundSynth.playClick();
    if (!supabaseClient) return alert("Supabase is not connected!");
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: window.location.origin }
    });
    if (error) alert("Discord Login Error: " + error.message);
  });

  document.getElementById('githubLoginBtn').addEventListener('click', async () => {
    SoundSynth.playClick();
    if (!supabaseClient) return alert("Supabase is not connected!");
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin }
    });
    if (error) alert("GitHub Login Error: " + error.message);
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    SoundSynth.playClick();
    if (!supabaseClient) return;
    const { error } = await supabaseClient.auth.signOut();
    if (error) console.error("SignOut error:", error.message);
  });

  // Play as Guest trigger
  document.getElementById('playAsGuestBtn').addEventListener('click', () => {
    SoundSynth.playClick();
    document.getElementById('playBtnContainer').classList.remove('hidden');
  });

  // Leaderboard togglers
  document.getElementById('leaderboardBtn').addEventListener('click', () => {
    document.getElementById('leaderboardModal').classList.remove('hidden');
    SoundSynth.playClick();
    fetchAndRenderLeaderboard();
  });

  document.getElementById('closeLeaderboardBtn').addEventListener('click', () => {
    document.getElementById('leaderboardModal').classList.add('hidden');
    SoundSynth.playClick();
  });

  // Enter city / Start Match
  document.getElementById('playBtn').addEventListener('click', () => {
    startMatch();
  });

  // Resume blocker lock button
  document.getElementById('resumeLockBtn').addEventListener('click', () => {
    controls.lock();
  });

  // surrenders
  document.getElementById('exitMatchBtn').addEventListener('click', () => {
    exitMatchToMenu();
  });

  document.getElementById('defeatExitBtn').addEventListener('click', () => {
    document.getElementById('defeatOverlay').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
    SoundSynth.playClick();
  });
}

// ==================== INITIALIZATION ====================
window.addEventListener('DOMContentLoaded', () => {
  // Prefill settings if empty
  if (!storage.getItem('supabase_url')) {
    storage.setItem('supabase_url', dbSettings.url);
  }
  if (!storage.getItem('supabase_key')) {
    storage.setItem('supabase_key', dbSettings.key);
  }

  // Load Highscore
  const savedHigh = storage.getItem('vocab_stars_highscore');
  if (savedHigh) {
    highScore = parseInt(savedHigh);
    document.getElementById('highScoreCount').innerText = highScore;
  }

  initSupabase();
  init3D();
  setupUIListeners();
  animate();
});

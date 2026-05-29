// src/main.js
import { initScene, animate, onResize } from './scene.js';
import { spawnEnemy, updateEnemies, getActiveEnemies, cleanupAllEnemies } from './entities.js';
import { initUI, updateHUD, enableTyping, disableTyping, getCurrentInput } from './ui.js';
import { initAudio, playLaser, playExplosion } from './audio.js';
import { initRain } from './rain.js';

let clock = new THREE.Clock();
let isRunning = false;

function startGame() {
  document.getElementById('start-btn').remove();
  document.getElementById('word-input').disabled = false;
  initUI();
  initAudio();
  initRain();
  initScene();
  enableTyping();
  isRunning = true;
  clock.start();
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  if (!isRunning) return;
  const dt = clock.getDelta();
  const time = clock.elapsedTime;

  // Update environment (rain, etc.)
  // (rain module updates internally via animate if needed)

  // Enemy logic
  updateEnemies(dt, time);

  // Render scene
  animate(dt, time);

  // UI updates (score, lives are updated by enemy module when they die)
  updateHUD();

  requestAnimationFrame(gameLoop);
}

// Start button handler
document.getElementById('start-btn').addEventListener('click', startGame);

// Resize handling
window.addEventListener('resize', onResize);

export { startGame };

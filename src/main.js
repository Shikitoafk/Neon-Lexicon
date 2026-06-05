function initializeGame() {
  // Set up Three.js scene, camera, renderer
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Load assets and initialize game objects
  loadAssets();
  setupControls();

  // Start the rendering loop
  animate();
}
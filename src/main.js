import { ThreeScene } from './threeScene.js';
import { setupAnimations } from './animations.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  // Initialize Three.js 3D WebGL scene
  const threeScene = new ThreeScene(canvas);

  // Initialize GSAP choreographies and ScrollTrigger
  setupAnimations(threeScene);

  // Setup UI HUD Controls
  const toggleMeshBtn = document.getElementById('toggle-mesh-btn');
  toggleMeshBtn?.addEventListener('click', () => {
    const isWireframe = threeScene.toggleWireframe();
    toggleMeshBtn.textContent = isWireframe ? 'Solid Surface' : 'Toggle Wireframe';
  });

  const speedSlider = document.getElementById('speed-slider');
  const speedVal = document.getElementById('speed-val');
  speedSlider?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    threeScene.uniforms.uWaveSpeed.value = val;
    if (speedVal) speedVal.textContent = val.toFixed(1);
  });

  const elevationSlider = document.getElementById('elevation-slider');
  const elevationVal = document.getElementById('elevation-val');
  elevationSlider?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    threeScene.uniforms.uWaveElevation.value = val;
    if (elevationVal) elevationVal.textContent = val.toFixed(2);
  });

  const frequencySlider = document.getElementById('frequency-slider');
  const frequencyVal = document.getElementById('frequency-val');
  frequencySlider?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    threeScene.uniforms.uWaveFrequency.value = val;
    if (frequencyVal) frequencyVal.textContent = val.toFixed(1);
  });

  const cyberBtn = document.getElementById('color-cyber-btn');
  cyberBtn?.addEventListener('click', () => threeScene.setPalette('cyber'));

  const sunsetBtn = document.getElementById('color-sunset-btn');
  sunsetBtn?.addEventListener('click', () => threeScene.setPalette('sunset'));
});

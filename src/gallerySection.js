/**
 * gallerySection.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Section 05: Archival Gallery — Four vintage Darjeeling photographs rendered
 * on individual Three.js planes inside a single shared WebGL renderer.
 * Each card reacts to mouse hover with a realistic GLSL water-ripple distortion.
 *
 * Architecture:
 *  - One THREE.WebGLRenderer shared across all cards (performance)
 *  - Each card owns its own Scene + Camera + ShaderMaterial
 *  - GSAP ticker drives the animation loop
 *  - On hover: GSAP tweens uStrength 0 → 1 (ripple intensity)
 *  - On leave: GSAP tweens uStrength back to 0
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as THREE from 'three';
import gsap from 'gsap';
import vertexShader   from './shaders/gallery/vertex.glsl';
import fragmentShader from './shaders/gallery/fragment.glsl';

// ── Gallery data ─────────────────────────────────────────────────────────────
const GALLERY_ITEMS = [
  {
    src:   '/landing-pages/gallery/bazaar.jpg',
    title: 'Darjeeling Bazaar',
    year:  'c. 1890',
    desc:  'The bustling heart of colonial Darjeeling, where hill traders gathered beneath timber facades.',
  },
  {
    src:   '/landing-pages/gallery/loop.jpg',
    title: 'The Loop — No. 3',
    year:  'c. 1895',
    desc:  'Agony Point near Tindharia — the legendary spiral where the DHR climbs its own track.',
  },
  {
    src:   '/landing-pages/gallery/kanchenjunga.jpg',
    title: 'Kanchenjunga Vista',
    year:  'c. 1900',
    desc:  'The world\'s third-highest peak rising behind dense Himalayan pine, eternal and immovable.',
  },
  {
    src:   '/landing-pages/gallery/market.jpg',
    title: 'Chowk Bazaar',
    year:  'c. 1905',
    desc:  'Open-air trading at Darjeeling\'s lower market — a mosaic of traders, monks, and merchants.',
  },
];

// ── State ─────────────────────────────────────────────────────────────────────
const cards = []; // { canvas, renderer, scene, camera, mesh, uniforms }

// ── Helpers ──────────────────────────────────────────────────────────────────
function createCard(item, index) {
  // ── DOM canvas element ────────────────────────────────────────────────────
  const canvas = document.getElementById(`gallery-canvas-${index}`);
  if (!canvas) return null;

  const w = canvas.clientWidth  || canvas.offsetWidth  || 600;
  const h = canvas.clientHeight || canvas.offsetHeight || 400;

  // ── Three.js primitives ───────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);

  const scene  = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
  camera.position.z = 1;

  // ── Texture ───────────────────────────────────────────────────────────────
  const loader  = new THREE.TextureLoader();
  const texture = loader.load(item.src, (tex) => {
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
  });

  // ── Uniforms ──────────────────────────────────────────────────────────────
  const uniforms = {
    uTexture:  { value: texture },
    uMouse:    { value: new THREE.Vector2(0.5, 0.5) },
    uTime:     { value: 0 },
    uStrength: { value: 0 },
    uAspect:   { value: w / h },
  };

  // ── Mesh ──────────────────────────────────────────────────────────────────
  const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // ── Resize handling ───────────────────────────────────────────────────────
  const resizeObserver = new ResizeObserver(() => {
    const nw = canvas.clientWidth;
    const nh = canvas.clientHeight;
    if (!nw || !nh) return;
    renderer.setSize(nw, nh);
    uniforms.uAspect.value = nw / nh;
  });
  resizeObserver.observe(canvas);

  return { canvas, renderer, scene, camera, mesh, uniforms };
}

// ── Mouse tracking per card ───────────────────────────────────────────────────
function attachMouseHandlers(cardObj, index) {
  const { canvas, uniforms } = cardObj;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height; // flip Y for GL
    uniforms.uMouse.value.set(x, y);
  });

  canvas.addEventListener('mouseenter', () => {
    gsap.to(uniforms.uStrength, {
      value: 1.0,
      duration: 0.55,
      ease: 'power2.out',
      overwrite: true,
    });
  });

  canvas.addEventListener('mouseleave', () => {
    gsap.to(uniforms.uStrength, {
      value: 0.0,
      duration: 0.9,
      ease: 'power3.out',
      overwrite: true,
    });
  });

  // Touch support
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect  = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width;
    const y = 1.0 - (touch.clientY - rect.top) / rect.height;
    uniforms.uMouse.value.set(x, y);
    if (uniforms.uStrength.value < 0.3) {
      gsap.to(uniforms.uStrength, { value: 0.85, duration: 0.4, ease: 'power2.out', overwrite: true });
    }
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    gsap.to(uniforms.uStrength, { value: 0, duration: 1.2, ease: 'power3.out', overwrite: true });
  });
}

// ── Public init ───────────────────────────────────────────────────────────────
export function initGallerySection() {
  const section = document.getElementById('gallery-section');
  if (!section) return;

  // Create each card
  GALLERY_ITEMS.forEach((item, i) => {
    const cardObj = createCard(item, i);
    if (!cardObj) return;
    cards.push(cardObj);
    attachMouseHandlers(cardObj, i);
  });

  if (cards.length === 0) return;

  // ── Shared animation loop via GSAP ticker ─────────────────────────────────
  gsap.ticker.add((time) => {
    cards.forEach(({ renderer, scene, camera, uniforms }) => {
      uniforms.uTime.value = time;
      renderer.render(scene, camera);
    });
  });
}

/**
 * gallerySection.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Section 05: "Darjeeling, Now" — Four modern photographs rendered on individual
 * Three.js WebGL planes with a GLSL water-ripple distortion shader.
 *
 * Effect: hover cursor → concentric sine-wave rings radiate from the exact
 * cursor position, distorting the image like a water surface.
 *
 * Architecture:
 *  - One THREE.WebGLRenderer per card (isolated contexts)
 *  - Each card owns Scene + OrthographicCamera + ShaderMaterial
 *  - GSAP tweens uStrength 0→1 on hover, 1→0 on leave
 *  - GSAP ticker drives shared render loop
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as THREE from 'three';
import gsap from 'gsap';
import vertexShader   from './shaders/gallery/vertex.glsl';
import fragmentShader from './shaders/gallery/fragment.glsl';

// ── Gallery data ─────────────────────────────────────────────────────────────
const GALLERY_ITEMS = [
  {
    src:   '/landing-pages/img/darjeeling1.jpg',
    title: 'Darjeeling & Kanchenjunga',
    year:  'Present Day',
    desc:  'The colourful hillside town glows beneath the eternal white crown of Kanchenjunga at golden hour.',
  },
  {
    src:   '/landing-pages/img/ghum station n.jpg',
    title: 'Ghum Station at Dawn',
    year:  'Present Day',
    desc:  'Amber headlights pierce the monsoon mist at India\'s highest railway station — Ghum, 2,258 m.',
  },
  {
    src:   '/landing-pages/img/kursiyong.jpg',
    title: 'Kurseong by Night',
    year:  'Present Day',
    desc:  'The city of white orchids sparkles against the Himalayan dark — a galaxy pinned to the hillside.',
  },
  {
    src:   '/landing-pages/img/siliguri.jpg',
    title: 'The Golden Monastery',
    year:  'Present Day',
    desc:  'Druk Sangag Choling monastery blazes at dusk, its gilded rooftops catching the last rays of the valley sun.',
  },
];

// ── State ─────────────────────────────────────────────────────────────────────
const cards = [];

// ── Create one WebGL card ────────────────────────────────────────────────────
function createCard(item, index) {
  const canvas = document.getElementById(`gallery-canvas-${index}`);
  if (!canvas) return null;

  const w = canvas.clientWidth  || canvas.offsetWidth  || 400;
  const h = canvas.clientHeight || canvas.offsetHeight || 500;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);

  const scene  = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
  camera.position.z = 1;

  const loader  = new THREE.TextureLoader();
  const texture = loader.load(item.src, (tex) => {
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
  });

  const uniforms = {
    uTexture:  { value: texture },
    uMouse:    { value: new THREE.Vector2(0.5, 0.5) },
    uTime:     { value: 0 },
    uStrength: { value: 0 },
    uAspect:   { value: w / h },
  };

  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
  scene.add(new THREE.Mesh(geometry, material));

  new ResizeObserver(() => {
    const nw = canvas.clientWidth;
    const nh = canvas.clientHeight;
    if (!nw || !nh) return;
    renderer.setSize(nw, nh);
    uniforms.uAspect.value = nw / nh;
  }).observe(canvas);

  return { canvas, renderer, scene, camera, uniforms };
}

// ── Mouse handlers ───────────────────────────────────────────────────────────
function attachMouseHandlers(cardObj) {
  const { canvas, uniforms } = cardObj;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;
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

  GALLERY_ITEMS.forEach((item, i) => {
    const cardObj = createCard(item, i);
    if (!cardObj) return;
    cards.push(cardObj);
    attachMouseHandlers(cardObj);
  });

  if (cards.length === 0) return;

  // ── Shared render loop via GSAP ticker ────────────────────────────────────
  gsap.ticker.add((time) => {
    cards.forEach(({ renderer, scene, camera, uniforms }) => {
      uniforms.uTime.value = time;
      renderer.render(scene, camera);
    });
  });
}

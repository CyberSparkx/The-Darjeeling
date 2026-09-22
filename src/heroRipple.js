/**
 * heroRipple.js — Interactive Water Ripple Shader for Hero Character (Uncle.png)
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders the prominent Himalayan local greeting illustration onto an alpha-enabled
 * Three.js WebGL plane. Hovering or moving across the character produces realistic
 * fluid water ripple waves and liquid refraction.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as THREE from 'three';
import gsap from 'gsap';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2      uMouse;
  uniform float     uTime;
  uniform float     uStrength;
  uniform float     uAspect;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // Aspect-correct distance from mouse epicenter
    vec2 diff = uv - uMouse;
    diff.x *= uAspect;
    float dist = length(diff);

    // Primary concentric water ripple wave
    float rippleFreq  = 30.0;
    float rippleSpeed = 3.8;
    float decay       = 7.0;
    float ring = sin(dist * rippleFreq - uTime * rippleSpeed)
                 * exp(-dist * decay)
                 * uStrength;

    // Secondary dimensional cross-ripple
    float dist2 = abs(diff.x) * 1.1 + abs(diff.y) * 0.9;
    float ring2 = sin(dist2 * 22.0 - uTime * 2.8)
                  * exp(-dist2 * 8.5)
                  * uStrength * 0.35;

    float totalRipple = ring + ring2;

    // Fluid UV refraction distortion
    float distortAmt = 0.03;
    vec2 distortDir  = normalize(diff + vec2(0.0001));
    vec2 distortedUV = uv + distortDir * totalRipple * distortAmt;
    distortedUV = clamp(distortedUV, 0.0, 1.0);

    vec4 color = texture2D(uTexture, distortedUV);

    // Subtle liquid surface reflection shimmer on wave peaks
    color.rgb += totalRipple * 0.05 * color.a;

    gl_FragColor = color;
  }
`;

export function initHeroRipple() {
  const canvas = document.getElementById('hero-uncle-canvas');
  if (!canvas) return;

  const w = canvas.clientWidth || canvas.offsetWidth || 600;
  const h = canvas.clientHeight || canvas.offsetHeight || 560;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
  camera.position.z = 1;

  const loader = new THREE.TextureLoader();
  const texture = loader.load('/landing-pages/img/uncle.png', (tex) => {
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    renderer.render(scene, camera);
  });

  const uniforms = {
    uTexture:  { value: texture },
    uMouse:    { value: new THREE.Vector2(0.5, 0.5) },
    uTime:     { value: 0 },
    uStrength: { value: 0 },
    uAspect:   { value: w / h }
  };

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true
  });

  const geometry = new THREE.PlaneGeometry(1, 1);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Hover & Pointer Interaction
  let isHovered = false;

  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;

    gsap.to(uniforms.uMouse.value, {
      x,
      y,
      duration: 0.25,
      ease: 'power2.out',
      overwrite: 'auto'
    });

    if (!isHovered) {
      isHovered = true;
      gsap.to(uniforms.uStrength, { value: 1.0, duration: 0.4, ease: 'power2.out' });
    }
  }

  function onPointerEnter() {
    isHovered = true;
    gsap.to(uniforms.uStrength, { value: 1.0, duration: 0.4, ease: 'power2.out' });
  }

  function onPointerLeave() {
    isHovered = false;
    gsap.to(uniforms.uStrength, { value: 0.0, duration: 1.2, ease: 'power3.out' });
  }

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerenter', onPointerEnter);
  canvas.addEventListener('pointerleave', onPointerLeave);

  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      onPointerMove(e.touches[0]);
    }
  }, { passive: true });
  canvas.addEventListener('touchend', onPointerLeave);

  // Resize handling
  new ResizeObserver(() => {
    const nw = canvas.clientWidth;
    const nh = canvas.clientHeight;
    if (!nw || !nh) return;
    renderer.setSize(nw, nh);
    uniforms.uAspect.value = nw / nh;
    renderer.render(scene, camera);
  }).observe(canvas);

  // GSAP Ticker Render Loop
  gsap.ticker.add((time) => {
    uniforms.uTime.value = time;
    renderer.render(scene, camera);
  });
}

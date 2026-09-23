/**
 * footerRipple.js — Interactive Water Ripple Shader for Footer "DARJEELING"
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders the oversized architectural "DARJEELING" typography onto a Three.js
 * WebGL canvas with an interactive GLSL water-ripple distortion shader.
 * Moving the mouse over the text causes fluid concentric water waves and liquid
 * refraction to ripple across the letters.
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

    // Aspect-correct distance from mouse epicentre
    vec2 diff = uv - uMouse;
    diff.x *= uAspect;
    float dist = length(diff);

    // Primary concentric water ripple waves
    float rippleFreq  = 32.0;
    float rippleSpeed = 4.0;
    float decay       = 6.5;
    float ring = sin(dist * rippleFreq - uTime * rippleSpeed)
                 * exp(-dist * decay)
                 * uStrength;

    // Secondary subtle cross-wave for liquid depth
    float dist2 = abs(diff.x) * 1.2 + abs(diff.y) * 0.8;
    float ring2 = sin(dist2 * 24.0 - uTime * 3.0)
                  * exp(-dist2 * 8.0)
                  * uStrength * 0.4;

    float totalRipple = ring + ring2;

    // Liquid refraction distortion
    float distortAmt = 0.035;
    vec2 distortDir  = normalize(diff + vec2(0.0001));
    vec2 distortedUV = uv + distortDir * totalRipple * distortAmt;
    distortedUV = clamp(distortedUV, 0.0, 1.0);

    vec4 color = texture2D(uTexture, distortedUV);

    // Subtle water surface shimmer highlight at wave peaks
    color.rgb += totalRipple * 0.05 * color.a;

    gl_FragColor = color;
  }
`;

export function initFooterRipple() {
  const container = document.getElementById('footer-typography-container');
  const canvas = document.getElementById('footer-ripple-canvas');
  if (!container || !canvas) return;

  // 1. Offscreen Canvas for Crisp Dynamic Typography Texture
  const textCanvas = document.createElement('canvas');
  const textCtx = textCanvas.getContext('2d');

  function renderTextTexture() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || 200;

    textCanvas.width = w * dpr;
    textCanvas.height = h * dpr;

    textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
    textCtx.scale(dpr, dpr);

    // Auto-fit "DARJEELING" precisely with generous 12% horizontal margins so edges are never cut off
    const maxTextWidth = w * 0.86;
    let fontSize = Math.min(w * 0.12, 180);
    textCtx.font = `900 ${fontSize}px 'Space Grotesk', -apple-system, sans-serif`;
    let measuredWidth = textCtx.measureText('DARJEELING').width;

    if (measuredWidth > maxTextWidth && measuredWidth > 0) {
      fontSize = fontSize * (maxTextWidth / measuredWidth);
    }
    const maxTextHeight = h * 0.72;
    if (fontSize > maxTextHeight) {
      fontSize = maxTextHeight;
    }

    textCtx.font = `900 ${fontSize}px 'Space Grotesk', -apple-system, sans-serif`;
    textCtx.textAlign = 'center';
    textCtx.textBaseline = 'middle';
    textCtx.fillStyle = '#2b2721';
    textCtx.fillText('DARJEELING', w / 2, h / 2);
  }

  renderTextTexture();
  let texture;
  if (document.fonts) {
    document.fonts.ready.then(() => {
      renderTextTexture();
      if (texture) texture.needsUpdate = true;
    });
  }

  // 2. Three.js Scene Setup
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || 200;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
  camera.position.z = 1;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);

  texture = new THREE.CanvasTexture(textCanvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const uniforms = {
    uTexture:  { value: texture },
    uMouse:    { value: new THREE.Vector2(0.5, 0.5) },
    uTime:     { value: 0 },
    uStrength: { value: 0 },
    uAspect:   { value: width / height }
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

  // 3. Pointer & Hover Event Listeners
  let isHovered = false;

  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height; // Invert for WebGL UV

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

  // Touch Support
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      onPointerMove(e.touches[0]);
    }
  }, { passive: true });
  canvas.addEventListener('touchend', onPointerLeave);

  // 4. Resize Handler
  function onResize() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || 200;
    renderTextTexture();
    texture.needsUpdate = true;
    renderer.setSize(w, h);
    uniforms.uAspect.value = w / h;
  }

  window.addEventListener('resize', onResize);

  // 5. GSAP Ticker Render Loop
  gsap.ticker.add((time) => {
    uniforms.uTime.value = time;
    renderer.render(scene, camera);
  });
}

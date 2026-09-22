import * as THREE from 'three';
import gsap from 'gsap';
import vertexShader from './shaders/reveal/vertex.glsl';
import fragmentShader from './shaders/reveal/fragment.glsl';

/**
 * Calculates UV scale transform to preserve aspect ratio (cover mode)
 */
function getCoverUV(imageWidth, imageHeight, containerWidth, containerHeight) {
  if (!imageWidth || !imageHeight) return new THREE.Vector4(1, 1, 0, 0);
  const imageAspect = imageWidth / imageHeight;
  const containerAspect = containerWidth / containerHeight;

  let scaleX = 1;
  let scaleY = 1;

  if (containerAspect > imageAspect) {
    scaleY = imageAspect / containerAspect;
  } else {
    scaleX = containerAspect / imageAspect;
  }
  return new THREE.Vector4(scaleX, scaleY, 0, 0);
}

/**
 * Initializes the WebGL organic mask reveal section
 */
export function initRevealSection() {
  const container = document.getElementById('reveal-canvas-container');
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene & Orthographic Camera
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // High performance WebGL Renderer
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.className = 'w-full h-full object-cover block select-none pointer-events-none';
  container.appendChild(renderer.domElement);

  // Textures
  const textureLoader = new THREE.TextureLoader();
  const flagsTexture = textureLoader.load('/landing-pages/img/flags.jpg', () => updateCoverUV());
  const ghumTexture = textureLoader.load('/landing-pages/img/ghum station.jpg', () => updateCoverUV());

  flagsTexture.generateMipmaps = true;
  flagsTexture.minFilter = THREE.LinearMipmapLinearFilter;
  ghumTexture.generateMipmaps = true;
  ghumTexture.minFilter = THREE.LinearMipmapLinearFilter;

  // Interaction State & GSAP Lerp targets
  const mouse = {
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
    radius: 0.0,
    targetRadius: 0.0,
    hover: 0.0,
    isHovered: false
  };

  // Shader Material with imported GLSL shaders
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTextureTop: { value: flagsTexture },
      uTextureBottom: { value: ghumTexture },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uRadius: { value: 0.0 },
      uHover: { value: 0.0 },
      uTime: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uTopUvTransform: { value: new THREE.Vector4(1, 1, 0, 0) },
      uBottomUvTransform: { value: new THREE.Vector4(1, 1, 0, 0) }
    },
    transparent: true
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  function updateCoverUV() {
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    material.uniforms.uResolution.value.set(cw, ch);

    if (flagsTexture.image) {
      material.uniforms.uTopUvTransform.value = getCoverUV(
        flagsTexture.image.width,
        flagsTexture.image.height,
        cw,
        ch
      );
    }
    if (ghumTexture.image) {
      material.uniforms.uBottomUvTransform.value = getCoverUV(
        ghumTexture.image.width,
        ghumTexture.image.height,
        cw,
        ch
      );
    }
  }

  // Pointer position normalizer
  const updatePointer = (clientX, clientY) => {
    const rect = container.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = 1.0 - (clientY - rect.top) / rect.height; // Inverted Y for WebGL UV

    mouse.targetX = Math.max(0, Math.min(1, x));
    mouse.targetY = Math.max(0, Math.min(1, y));
  };

  // Desktop Pointer Events
  container.addEventListener('pointerenter', (e) => {
    mouse.isHovered = true;
    updatePointer(e.clientX, e.clientY);
    mouse.x = mouse.targetX;
    mouse.y = mouse.targetY;

    gsap.to(mouse, {
      targetRadius: 0.42,
      hover: 1.0,
      duration: 0.65,
      ease: 'power3.out',
      overwrite: 'auto'
    });
  });

  container.addEventListener('pointermove', (e) => {
    if (!mouse.isHovered) {
      mouse.isHovered = true;
      gsap.to(mouse, {
        targetRadius: 0.42,
        hover: 1.0,
        duration: 0.65,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    }
    updatePointer(e.clientX, e.clientY);
  });

  container.addEventListener('pointerleave', () => {
    mouse.isHovered = false;
    gsap.to(mouse, {
      targetRadius: 0.0,
      hover: 0.0,
      duration: 0.8,
      ease: 'power3.inOut',
      overwrite: 'auto'
    });
  });

  // Mobile Touch Support
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      mouse.isHovered = true;
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      mouse.x = mouse.targetX;
      mouse.y = mouse.targetY;
      gsap.to(mouse, {
        targetRadius: 0.46,
        hover: 1.0,
        duration: 0.5,
        ease: 'back.out(1.5)',
        overwrite: 'auto'
      });
    }
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  container.addEventListener('touchend', () => {
    mouse.isHovered = false;
    gsap.to(mouse, {
      targetRadius: 0.0,
      hover: 0.0,
      duration: 0.7,
      ease: 'power2.inOut',
      overwrite: 'auto'
    });
  });

  // Handle Resize
  function handleResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    updateCoverUV();
  }
  window.addEventListener('resize', handleResize);

  // Render & Animation Loop with GSAP spring lerp
  let animationId = null;
  const clock = new THREE.Clock();

  function animate() {
    animationId = requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Smooth inertia lerp on cursor coordinates
    const lerpFactor = 0.12;
    mouse.x += (mouse.targetX - mouse.x) * lerpFactor;
    mouse.y += (mouse.targetY - mouse.y) * lerpFactor;
    mouse.radius += (mouse.targetRadius - mouse.radius) * lerpFactor;

    material.uniforms.uMouse.value.set(mouse.x, mouse.y);
    material.uniforms.uRadius.value = mouse.radius;
    material.uniforms.uHover.value = mouse.hover;
    material.uniforms.uTime.value = elapsedTime;

    renderer.render(scene, camera);
  }

  animate();

  return () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', handleResize);
    renderer.dispose();
  };
}

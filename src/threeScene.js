import * as THREE from 'three';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

export class ThreeScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouse = new THREE.Vector2(0, 0);
    this.targetMouse = new THREE.Vector2(0, 0);
    this.clock = new THREE.Clock();

    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initMesh();
    this.initEvents();
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030712, 0.08);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 3.5, 5);
    this.camera.lookAt(0, 0, 0);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
  }

  initMesh() {
    // High-resolution plane geometry for smooth vertex displacement
    this.geometry = new THREE.PlaneGeometry(8, 8, 128, 128);
    this.geometry.rotateX(-Math.PI / 2);

    this.uniforms = {
      uTime: { value: 0 },
      uWaveSpeed: { value: 1.2 },
      uWaveFrequency: { value: 1.8 },
      uWaveElevation: { value: 0.6 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorA: { value: new THREE.Color('#0284c7') }, // Vibrant Sky Blue
      uColorB: { value: new THREE.Color('#6366f1') }, // Indigo
      uGlowColor: { value: new THREE.Color('#22d3ee') } // Cyan Fresnel Glow
    };

    this.material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: this.uniforms,
      wireframe: false,
      transparent: true,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.y = -0.5;
    this.scene.add(this.mesh);

    // Subtle ambient particle dust
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 12;
      positions[i + 1] = Math.random() * 4;
      positions[i + 2] = (Math.random() - 0.5) * 12;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6
    });

    this.particles = new THREE.Points(particleGeo, particleMat);
    this.scene.add(this.particles);
  }

  initEvents() {
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  onMouseMove(event) {
    // Normalized coordinates (-1 to 1)
    this.targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  toggleWireframe() {
    this.material.wireframe = !this.material.wireframe;
    return this.material.wireframe;
  }

  setPalette(preset) {
    if (preset === 'cyber') {
      this.uniforms.uColorA.value.set('#0284c7');
      this.uniforms.uColorB.value.set('#6366f1');
      this.uniforms.uGlowColor.value.set('#22d3ee');
    } else if (preset === 'sunset') {
      this.uniforms.uColorA.value.set('#db2777');
      this.uniforms.uColorB.value.set('#f59e0b');
      this.uniforms.uGlowColor.value.set('#fb7185');
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const elapsedTime = this.clock.getElapsedTime();

    // Uniform updates
    this.uniforms.uTime.value = elapsedTime;

    // Smooth mouse lerp
    this.mouse.lerp(this.targetMouse, 0.05);
    this.uniforms.uMouse.value.copy(this.mouse);

    // Subtle gentle floating rotation
    this.mesh.rotation.y = Math.sin(elapsedTime * 0.1) * 0.1;

    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.02;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

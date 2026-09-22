# 3D WebGL Application (Three.js + GLSL + GSAP + Tailwind CSS)

A 3D WebGL starter and interactive showcase created with **Vite (Vanilla JS)**, **Three.js**, **GLSL Shaders** (`vite-plugin-glsl`), **GSAP (with ScrollTrigger)**, and **Tailwind CSS**.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🛠️ Project Structure

```
├── index.html               # Main HTML with UI overlay and canvas container
├── package.json             # Project dependencies and build scripts
├── vite.config.js           # Vite config with Tailwind CSS & GLSL shader plugin
├── src/
│   ├── style.css            # Tailwind CSS styling and glassmorphic UI utilities
│   ├── main.js              # Application entry point linking 3D scene & controls
│   ├── threeScene.js        # Three.js scene, camera, lighting, and render loop
│   ├── animations.js        # GSAP timeline and ScrollTrigger choreography
│   └── shaders/
│       ├── vertex.glsl      # Custom vertex shader with 3D Perlin noise & ripple
│       └── fragment.glsl    # Custom fragment shader with elevation blending & fresnel glow
```

---

## 🌟 Features Included

1. **Vite & Vanilla JS**: Rapid HMR and lightweight setup.
2. **Native GLSL Shaders**: `.glsl`, `.vert`, and `.frag` files can be imported directly as modules via `vite-plugin-glsl`.
3. **Three.js Scene**: Perspective camera, high-resolution plane with custom `ShaderMaterial`, dynamic mouse ripple uniforms, and floating particle dust.
4. **GSAP & ScrollTrigger**:
   - Camera moves dynamically based on page scroll position.
   - Smooth staggered entrance animations for hero text and cards.
5. **Tailwind CSS (v4)**: Modern glassmorphism HUD, control sliders, color palette togglers, and wireframe switch.
6. **WebGi Ready**: Package installed and ready for photorealistic WebGi / ThreePipe workflows.

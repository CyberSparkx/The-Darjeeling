uniform sampler2D uTextureTop;
uniform sampler2D uTextureBottom;
uniform vec2 uMouse;
uniform float uRadius;
uniform float uHover;
uniform float uTime;
uniform vec2 uResolution;
uniform vec4 uTopUvTransform;
uniform vec4 uBottomUvTransform;

varying vec2 vUv;

// Simplex 2D noise helper functions
vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  // Correct aspect ratio so mask remains circular regardless of viewport dimensions
  float aspect = uResolution.x / uResolution.y;
  vec2 aspectUv = vUv;
  aspectUv.x *= aspect;

  vec2 aspectMouse = uMouse;
  aspectMouse.x *= aspect;

  // Compute distance from cursor in aspect-corrected UV space
  float dist = distance(aspectUv, aspectMouse);

  // Multi-frequency organic procedural noise for fluid boundary fluttering
  vec2 noiseCoord = aspectUv * 3.2 + vec2(uTime * 0.55, uTime * 0.42);
  float n1 = snoise(noiseCoord) * 0.12;
  float n2 = snoise(noiseCoord * 2.4 - vec2(uTime * 0.35)) * 0.06;
  float totalNoise = n1 + n2;

  // Modulate the radius by noise
  float effectiveRadius = uRadius + totalNoise;
  
  // Smooth organic liquid mask with anti-aliased edge
  float mask = 1.0 - smoothstep(effectiveRadius - 0.08, effectiveRadius + 0.02, dist);
  mask *= uHover;

  // Apply object-fit: cover texture matrices
  vec2 topUv = (vUv - 0.5) * uTopUvTransform.xy + 0.5;
  vec2 bottomUv = (vUv - 0.5) * uBottomUvTransform.xy + 0.5;

  // Subtle glass/liquid refraction along mask rim
  float rim = smoothstep(0.0, 0.06, mask) * (1.0 - smoothstep(0.06, 0.14, mask));
  vec2 offset = normalize(aspectUv - aspectMouse + 0.001) * rim * 0.025;

  vec4 colorTop = texture2D(uTextureTop, topUv + offset * 0.3);
  vec4 colorBottom = texture2D(uTextureBottom, bottomUv - offset * 0.5);

  // Chromatic dispersion fringe along reveal perimeter
  float fringeR = texture2D(uTextureBottom, bottomUv - offset * 0.6).r;
  float fringeB = texture2D(uTextureBottom, bottomUv - offset * 0.4).b;
  colorBottom.r = mix(colorBottom.r, fringeR, rim * 0.4);
  colorBottom.b = mix(colorBottom.b, fringeB, rim * 0.4);

  // Blend top (prayer flags) with inner (Ghum Station)
  vec4 finalColor = mix(colorTop, colorBottom, mask);

  gl_FragColor = finalColor;
}

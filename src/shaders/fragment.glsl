uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uGlowColor;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vElevation;

void main() {
  // Color gradient based on vertex wave elevation
  float mixStrength = (vElevation + 0.3) * 1.5;
  mixStrength = clamp(mixStrength, 0.0, 1.0);

  vec3 baseColor = mix(uColorA, uColorB, mixStrength);

  // Fresnel rim lighting glow
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = dot(viewDir, vNormal);
  fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
  fresnel = pow(fresnel, 2.5);

  vec3 finalColor = baseColor + uGlowColor * fresnel * 0.8;

  // Subtle grid pulse lines
  vec2 grid = abs(fract(vUv * 20.0 - 0.5) - 0.5) / fwidth(vUv * 20.0);
  float line = min(grid.x, grid.y);
  float c = 1.0 - min(line, 1.0);
  finalColor += vec3(c * 0.15);

  gl_FragColor = vec4(finalColor, 0.95);
}

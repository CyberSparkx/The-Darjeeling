// ─────────────────────────────────────────────────────────────────────────────
// Water Ripple Fragment Shader
// Simulates realistic concentric water ripples emanating from mouse position.
// Uses sine-wave rings with exponential decay from the epicentre, combined
// with a secondary cross-ripple to give dimensional depth.
// ─────────────────────────────────────────────────────────────────────────────

uniform sampler2D uTexture;   // The image texture
uniform vec2      uMouse;     // Mouse position in UV space [0..1]
uniform float     uTime;      // Elapsed time in seconds
uniform float     uStrength;  // Ripple strength [0..1], animated on hover
uniform float     uAspect;    // Plane width / height

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // ── Aspect-correct distance from mouse epicentre ──────────────────────────
  vec2 diff = uv - uMouse;
  diff.x *= uAspect;               // correct for non-square planes
  float dist = length(diff);

  // ── Primary concentric ripple ─────────────────────────────────────────────
  //    High-frequency ring wave that travels outward from the epicentre.
  float rippleFreq  = 28.0;        // rings per unit distance
  float rippleSpeed = 3.5;         // outward travel speed
  float decay       = 8.0;         // how fast amplitude falls with distance
  float ring = sin(dist * rippleFreq - uTime * rippleSpeed)
               * exp(-dist * decay)
               * uStrength;

  // ── Secondary subtle cross-ripple for realism ────────────────────────────
  float dist2  = abs(diff.x) + abs(diff.y);          // L1 / Manhattan distance
  float ring2  = sin(dist2 * 20.0 - uTime * 2.5)
                 * exp(-dist2 * 10.0)
                 * uStrength * 0.35;

  float totalRipple = ring + ring2;

  // ── Distort UV by ripple normal (tangent approximation) ──────────────────
  //    We nudge UV along the gradient direction of the ripple field.
  float distortAmt = 0.022;
  vec2 distortDir  = normalize(diff + vec2(0.0001));  // avoid NaN at centre
  vec2 distortedUV = uv + distortDir * totalRipple * distortAmt;

  // ── Clamp to prevent sampling outside image ───────────────────────────────
  distortedUV = clamp(distortedUV, 0.001, 0.999);

  // ── Final colour ─────────────────────────────────────────────────────────
  vec4 color = texture2D(uTexture, distortedUV);

  // Very subtle brightness boost at the wave crest for a wet-glass shimmer
  color.rgb += totalRipple * 0.04;

  gl_FragColor = color;
}

/**
 * routeSection.js — Mountain Route Journey (Siliguri → Kurseong → Darjeeling)
 * ─────────────────────────────────────────────────────────────────────────────
 * Pinned scroll-driven interactive highway animation on archival parchment canvas.
 * TVS Ntorq vehicle navigates the winding Himalayan road SVG path,
 * dynamically illuminating the path and triggering waypoint pins & live telemetry.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

export function initRouteSection() {
  const section = document.getElementById('route-journey-section');
  const stage = document.getElementById('route-stage');
  const vehicleGroup = document.getElementById('route-vehicle-g');
  const activePath = document.getElementById('route-path-active');
  const bgPath = document.getElementById('route-path-bg');

  if (!section || !stage || !vehicleGroup || !activePath || !bgPath) return;

  // ── 1. Setup SVG Path Dash Array for Dynamic Drawing ───────────────────────
  const pathLength = activePath.getTotalLength();
  gsap.set(activePath, {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength,
  });

  // ── 2. Telemetry DOM elements ──────────────────────────────────────────────
  const altValue = document.getElementById('route-hud-altitude');
  const distValue = document.getElementById('route-hud-distance');
  const progressValue = document.getElementById('route-hud-progress');

  // Waypoint groups
  const wpSiliguri = document.getElementById('svg-wp-siliguri');
  const wpKurseong = document.getElementById('svg-wp-kurseong');
  const wpDarjeeling = document.getElementById('svg-wp-darjeeling');

  // ── 3. Main Pinned Scroll Timeline ─────────────────────────────────────────
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=350%',
      pin: true,
      scrub: 1.2,
      anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress;

        // Dynamic Telemetry Calculation
        // Distance: 0 to 76.5 km (Google Maps / NH 110 Hill Cart Road length)
        const dist = (p * 76.5).toFixed(1);
        if (distValue) distValue.textContent = `${dist} KM`;

        // Altitude: 120m (Siliguri) to 2,042m (Darjeeling)
        const alt = Math.round(120 + p * (2042 - 120));
        if (altValue) altValue.textContent = `${alt.toLocaleString()} M`;

        // Progress percentage
        if (progressValue) progressValue.textContent = `${Math.round(p * 100)}%`;

        // Waypoint Active States
        if (wpSiliguri) {
          wpSiliguri.classList.toggle('active-wp', p >= 0 && p < 0.2);
        }
        if (wpKurseong) {
          wpKurseong.classList.toggle('active-wp', p >= 0.32 && p <= 0.6);
        }
        if (wpDarjeeling) {
          wpDarjeeling.classList.toggle('active-wp', p >= 0.85);
        }
      }
    }
  });

  // A. Vehicle Motion along the SVG Highway Path
  tl.to(vehicleGroup, {
    motionPath: {
      path: '#route-path-bg',
      align: '#route-path-bg',
      autoRotate: true,
      alignOrigin: [0.5, 0.5],
    },
    ease: 'none',
    duration: 1,
  }, 0);

  // B. Draw Illuminated Progress Trail
  tl.to(activePath, {
    strokeDashoffset: 0,
    ease: 'none',
    duration: 1,
  }, 0);
}

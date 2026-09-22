/**
 * preloader.js — Archival 5-Column Staggered Curtain Preloader
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Step 1: Shows cultural greeting "नमस्ते / NAMASTE" cleanly centered.
 * 2. Step 2: Smoothly transitions exclusively to the percentage counter
 *    "0% -> 100%" and author tribute "DESIGNED. CODED. LOVED. BY NAREN ROY."
 * 3. Step 3: Once 100% and window assets are ready, lifts 5 vertical curtain
 *    columns upward with staggered, independent speeds, unveiling the hero.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import gsap from 'gsap';

export function initPreloader(onCompleteCallback) {
  const preloader = document.getElementById('preloader');
  const percentEl = document.getElementById('preloader-percent');
  const greetingEl = document.getElementById('preloader-greeting');
  const counterWrapperEl = document.getElementById('preloader-counter-wrapper');
  const columns = document.querySelectorAll('.preloader-col');

  if (!preloader || !percentEl || !greetingEl || !counterWrapperEl || columns.length === 0) {
    if (typeof onCompleteCallback === 'function') onCompleteCallback();
    return;
  }

  // Prevent scroll during loading
  document.body.style.overflow = 'hidden';

  const progressObj = { value: 0 };
  let isLoaded = false;

  // Track window load
  if (document.readyState === 'complete') {
    isLoaded = true;
  } else {
    window.addEventListener('load', () => {
      isLoaded = true;
    });
  }

  // Ensure initial clean state
  greetingEl.style.display = 'flex';
  counterWrapperEl.style.display = 'none';
  gsap.set(greetingEl, { autoAlpha: 0, y: 15 });
  gsap.set(counterWrapperEl, { autoAlpha: 0, y: 15 });

  const tl = gsap.timeline();

  // ── Step 1: Greeting "नमस्ते / NAMASTE" ───────────────────────────────
  tl.to(greetingEl, {
    autoAlpha: 1,
    y: 0,
    duration: 0.6,
    ease: 'power3.out'
  })
  .to(greetingEl, {
    autoAlpha: 0,
    y: -15,
    duration: 0.45,
    ease: 'power2.in',
    delay: 0.5,
    onComplete: () => {
      // Completely hide greeting element to avoid layout overlap
      greetingEl.style.display = 'none';
      counterWrapperEl.style.display = 'flex';
    }
  })

  // ── Step 2: Percentage Counter & Attribution ───────────────────────────
  .to(counterWrapperEl, {
    autoAlpha: 1,
    y: 0,
    duration: 0.5,
    ease: 'power3.out'
  })
  .to(progressObj, {
    value: 100,
    duration: 1.5,
    ease: 'power1.inOut',
    onUpdate: () => {
      const current = Math.floor(progressObj.value);
      percentEl.textContent = current;
    }
  });

  // ── Step 3: Exit Curtain Lift Reveal ──────────────────────────────────
  tl.call(() => {
    const triggerExit = () => {
      const exitTl = gsap.timeline({
        onComplete: () => {
          preloader.style.display = 'none';
          document.body.style.overflow = '';
          if (typeof onCompleteCallback === 'function') {
            onCompleteCallback();
          }
        }
      });

      // Fade out counter
      exitTl.to(counterWrapperEl, {
        autoAlpha: 0,
        y: -15,
        duration: 0.35,
        ease: 'power2.in'
      });

      // Staggered independent 5-column curtain reveal (as seen in reference)
      const colDelays = [0.08, 0.22, 0.0, 0.28, 0.14];
      const colDurations = [1.05, 1.18, 0.95, 1.22, 1.1];

      columns.forEach((col, idx) => {
        exitTl.to(col, {
          yPercent: -100,
          duration: colDurations[idx] || 1.1,
          ease: 'power4.inOut'
        }, `<+=${colDelays[idx] || 0.05}`);
      });
    };

    if (isLoaded) {
      triggerExit();
    } else {
      window.addEventListener('load', triggerExit, { once: true });
      setTimeout(triggerExit, 2500);
    }
  });
}

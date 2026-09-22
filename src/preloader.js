/**
 * preloader.js — Archival 5-Column Staggered Curtain Preloader
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Shows cultural greeting "नमस्ते / NAMASTE" followed by smooth percentage
 *    loading progress and author tribute "DESIGNED. CODED. LOVED. BY NAREN ROY."
 * 2. Tracks window load and critical page assets.
 * 3. On 100% completion, lifts 5 vertical curtain columns upward at independent
 *    paces, revealing the hero section underneath.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import gsap from 'gsap';

export function initPreloader(onCompleteCallback) {
  const preloader = document.getElementById('preloader');
  const percentEl = document.getElementById('preloader-percent');
  const greetingEl = document.getElementById('preloader-greeting');
  const counterWrapperEl = document.getElementById('preloader-counter-wrapper');
  const columns = document.querySelectorAll('.preloader-col');

  if (!preloader || !percentEl || columns.length === 0) {
    if (typeof onCompleteCallback === 'function') onCompleteCallback();
    return;
  }

  // Disable page scroll during loading
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

  // Preloader GSAP Timeline
  const tl = gsap.timeline();

  // 1. Initial State: Greeting visible, Counter hidden or staggered in
  gsap.set(greetingEl, { autoAlpha: 0, y: 15 });
  gsap.set(counterWrapperEl, { autoAlpha: 0, y: 15 });

  tl.to(greetingEl, {
    autoAlpha: 1,
    y: 0,
    duration: 0.7,
    ease: 'power3.out',
    delay: 0.1
  })
  .to(greetingEl, {
    autoAlpha: 0,
    y: -15,
    duration: 0.5,
    ease: 'power2.in',
    delay: 0.6
  })
  .to(counterWrapperEl, {
    autoAlpha: 1,
    y: 0,
    duration: 0.5,
    ease: 'power3.out'
  }, '-=0.1');

  // 2. Animate counter to 100%
  // Individual column delays matching reference image 3
  const colDelays = [0.08, 0.22, 0.0, 0.28, 0.14];
  const colDurations = [1.0, 1.15, 0.95, 1.2, 1.05];

  tl.to(progressObj, {
    value: 100,
    duration: 1.6,
    ease: 'power1.inOut',
    onUpdate: () => {
      const current = Math.floor(progressObj.value);
      percentEl.textContent = current;
    }
  });

  // Ensure window is loaded before triggering exit
  tl.call(() => {
    const triggerExit = () => {
      // 3. Fade out counter text
      const exitTl = gsap.timeline({
        onComplete: () => {
          preloader.style.display = 'none';
          document.body.style.overflow = '';
          if (typeof onCompleteCallback === 'function') {
            onCompleteCallback();
          }
        }
      });

      exitTl.to(counterWrapperEl, {
        autoAlpha: 0,
        y: -20,
        duration: 0.4,
        ease: 'power2.in'
      });

      // 4. Reveal in 5 separate vertical columns, each moving at its own pace
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
      // Fallback timer if load event is delayed
      setTimeout(triggerExit, 2500);
    }
  });
}

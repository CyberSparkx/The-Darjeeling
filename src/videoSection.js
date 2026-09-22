import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Initializes Section 04: Scroll-driven video expanding to full screen, autoplaying muted.
 * Video plays absolutely continuously — it never stops regardless of scroll position.
 */
export function initVideoSection() {
  const section = document.getElementById('video-expand-section');
  const videoWrapper = document.getElementById('video-expand-wrapper');
  const video = document.getElementById('darjeeling-scroll-video');
  const header = document.getElementById('video-header-block');

  if (!section || !videoWrapper || !video) return;

  // ── Fix: prevent any horizontal overflow that causes white strip on right ──
  section.style.overflowX = 'hidden';
  const stageContainer = document.getElementById('video-stage-container');
  if (stageContainer) stageContainer.style.overflowX = 'hidden';

  // ─────────────────────────────────────────────────────────────────────────
  // 1. BULLETPROOF CONTINUOUS PLAYBACK
  //    The video must NEVER stop — not at scroll end, not on tab switch.
  // ─────────────────────────────────────────────────────────────────────────
  const ensurePlaying = () => {
    if (video.paused || video.ended) {
      video.muted = true;
      const p = video.play();
      if (p !== undefined) p.catch(() => {});
    }
  };

  // Initial play attempt
  video.muted = true;
  const initialPlay = video.play();
  if (initialPlay !== undefined) initialPlay.catch(() => {});

  // Heartbeat: check every 500ms and restart if paused
  setInterval(ensurePlaying, 500);

  // On tab refocus
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) ensurePlaying();
  });

  // On user interaction (browser autoplay policy unlock)
  document.addEventListener('click', ensurePlaying, { once: true });
  document.addEventListener('scroll', ensurePlaying, { once: true });

  // ScrollTrigger hook to re-play whenever section enters view
  ScrollTrigger.create({
    trigger: section,
    start: 'top 80%',
    end: 'max',
    onEnter: ensurePlaying,
    onEnterBack: ensurePlaying,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. SCROLL-DRIVEN EXPANSION — pinned, scrubbed, edge-to-edge
  // ─────────────────────────────────────────────────────────────────────────
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=200%',
      pin: true,
      pinSpacing: true,
      scrub: 1.2,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      // Keep video playing when scrubber moves to end
      onUpdate: ensurePlaying,
    },
  });

  tl
    // Expand wrapper to full viewport — use vw/vh to ensure no gaps
    .to(
      videoWrapper,
      {
        width: '100vw',
        maxWidth: '100vw',
        height: '100vh',
        maxHeight: '100vh',
        borderRadius: '0px',
        boxShadow: 'none',
        ease: 'power2.inOut',
        duration: 1,
      },
      0
    )
    // Fade out section header text
    .to(
      header,
      {
        y: -60,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
      },
      0
    )
    // Fade out scroll hint badge
    .to(
      '.video-inner-badge',
      {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: 'power1.out',
      },
      0.15
    );
}

/**
 * audioManager.js — Ambient Background Audio Controller
 * ─────────────────────────────────────────────────────────────────────────────
 * Plays ambient mountain music in an infinite loop once the preloader completes
 * and the landing page appears.
 * Features:
 *  - Automatic fade-in upon page landing
 *  - Seamless looping (`loop = true` and `ended` event safety)
 *  - Subtle, interactive mute / play toggle button in the header
 *  - Browser autoplay policy handler (unlocks gracefully on first gesture if restricted)
 * ─────────────────────────────────────────────────────────────────────────────
 */

class AudioManager {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.targetVolume = 0.55;
    this.isMuted = false;
    this.hasStarted = false;
    this.toggleBtn = null;
  }

  init() {
    this.audio = new Audio('/landing-pages/bgm/deuslower-dark-ambient-emotions-music-259996.mp3');
    this.audio.loop = true;
    this.audio.preload = 'auto';
    this.audio.volume = 0;

    // Redundant loop safety
    this.audio.addEventListener('ended', () => {
      this.audio.currentTime = 0;
      this.audio.play().catch(() => {});
    });

    this.toggleBtn = document.getElementById('bgm-toggle-btn');
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggleSound());
    }

    // Browser autoplay policy unlocking mechanism
    const unlockAudio = () => {
      if (this.hasStarted && !this.isPlaying && !this.isMuted) {
        this.playWithFade();
      }
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
  }

  startLandingPageAudio() {
    this.hasStarted = true;
    this.playWithFade();
  }

  playWithFade() {
    if (!this.audio) return;

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          this.updateUi(true);
          this.fadeVolume(0, this.targetVolume, 2200);
        })
        .catch(() => {
          // Blocked by browser autoplay policy until user interaction
          this.isPlaying = false;
          this.updateUi(false);
        });
    }
  }

  toggleSound() {
    if (!this.audio) return;

    if (this.isPlaying) {
      this.fadeVolume(this.audio.volume, 0, 400, () => {
        this.audio.pause();
        this.isPlaying = false;
        this.isMuted = true;
        this.updateUi(false);
      });
    } else {
      this.isMuted = false;
      this.playWithFade();
    }
  }

  fadeVolume(from, to, durationMs, onComplete) {
    if (!this.audio) return;
    const start = performance.now();
    this.audio.volume = from;

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      // Smooth sine curve fade
      this.audio.volume = from + (to - from) * (0.5 - 0.5 * Math.cos(progress * Math.PI));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this.audio.volume = to;
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(step);
  }

  updateUi(playing) {
    if (!this.toggleBtn) return;
    const waves = this.toggleBtn.querySelectorAll('.sound-wave');
    const label = this.toggleBtn.querySelector('.sound-label');

    if (playing) {
      this.toggleBtn.setAttribute('aria-label', 'Mute background audio');
      this.toggleBtn.classList.add('is-playing');
      if (label) label.textContent = 'Audio On';
      waves.forEach(w => w.classList.remove('paused'));
    } else {
      this.toggleBtn.setAttribute('aria-label', 'Play background audio');
      this.toggleBtn.classList.remove('is-playing');
      if (label) label.textContent = 'Audio Off';
      waves.forEach(w => w.classList.add('paused'));
    }
  }
}

export const audioManager = new AudioManager();

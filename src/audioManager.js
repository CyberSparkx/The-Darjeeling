/**
 * audioManager.js — Ambient Background Audio Controller
 * ─────────────────────────────────────────────────────────────────────────────
 * Plays ambient mountain music in an infinite loop once the preloader completes
 * and the landing page appears.
 * Handles modern browser autoplay policies cleanly:
 *  - Sets audible volume immediately (target 0.50) without silent fade issues
 *  - Binds to any first gesture (scroll, click, touch, mousemove, keydown)
 *  - Reflects real playing state on the UI toggle button
 * ─────────────────────────────────────────────────────────────────────────────
 */

class AudioManager {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.targetVolume = 0.50;
    this.isMuted = false;
    this.hasRequestedStart = false;
    this.toggleBtn = null;
  }

  init() {
    this.audio = new Audio('/landing-pages/bgm/deuslower-dark-ambient-emotions-music-259996.mp3');
    this.audio.loop = true;
    this.audio.preload = 'auto';
    this.audio.volume = this.targetVolume;

    // Loop fallback
    this.audio.addEventListener('ended', () => {
      if (!this.isMuted) {
        this.audio.currentTime = 0;
        this.audio.play().catch(() => {});
      }
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.updateUi(true);
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updateUi(false);
    });

    this.toggleBtn = document.getElementById('bgm-toggle-btn');
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleSound();
      });
    }

    // Modern browser autoplay unlock listeners:
    // If the browser blocks autoplay before a user gesture, the very first
    // gesture (click, scroll, key, touch) immediately starts the audio.
    const unlockHandler = () => {
      if (this.hasRequestedStart && !this.isPlaying && !this.isMuted) {
        this.tryPlay();
      }
    };

    ['pointerdown', 'touchstart', 'click', 'keydown', 'wheel', 'scroll'].forEach((evt) => {
      window.addEventListener(evt, unlockHandler, { passive: true });
    });
  }

  startLandingPageAudio() {
    this.hasRequestedStart = true;
    this.tryPlay();
  }

  tryPlay() {
    if (!this.audio || this.isMuted) return;

    this.audio.volume = this.targetVolume;
    const promise = this.audio.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          this.isPlaying = true;
          this.updateUi(true);
        })
        .catch(() => {
          // Autoplay restricted by browser: UI correctly shows waiting/off
          this.isPlaying = false;
          this.updateUi(false);
        });
    }
  }

  toggleSound() {
    if (!this.audio) return;

    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
      this.isMuted = true;
      this.updateUi(false);
    } else {
      this.isMuted = false;
      this.hasRequestedStart = true;
      this.tryPlay();
    }
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


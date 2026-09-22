import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initRevealSection } from './revealSection.js';
import { initVideoSection } from './videoSection.js';
import { initGallerySection } from './gallerySection.js';
import { initGalleryModal } from './galleryModal.js';
import { initRouteSection } from './routeSection.js';
import { initFooterRipple } from './footerRipple.js';
import { initHeroRipple } from './heroRipple.js';

gsap.registerPlugin(ScrollTrigger);

window.addEventListener('DOMContentLoaded', () => {
  // Initialize Hero Character WebGL Water Ripple
  initHeroRipple();

  // Initialize WebGL Organic Mask Reveal Section
  initRevealSection();

  // Initialize Scroll-Driven Expanding Fullscreen Video Section
  initVideoSection();

  // Initialize WebGL Water Ripple Gallery Section
  initGallerySection();

  // Initialize Gallery Detail Modal
  initGalleryModal();

  // Initialize Scroll-Driven Mountain Route Journey Section
  initRouteSection();

  // Initialize Footer Typography WebGL Water Ripple Effect
  initFooterRipple();

  const header = document.getElementById('main-header');

  // 1. Initial Page Entrance Stagger Animation (Text & nav only; Hero Character is visible from start)
  const entranceTl = gsap.timeline({
    defaults: {
      ease: 'power3.out',
    }
  });

  entranceTl
    .from('.nav-elem', {
      y: -25,
      autoAlpha: 0,
      duration: 0.9,
      stagger: 0.12,
      clearProps: 'transform,opacity,visibility'
    })
    .from(['.hero-sub', '.hero-heading', '.hero-desc', '.hero-badges'], {
      y: 35,
      autoAlpha: 0,
      duration: 1.0,
      stagger: 0.12,
      clearProps: 'transform,opacity,visibility'
    }, '-=0.4');

  // 2. Hide navbar upward on scroll down, show on scroll up
  if (header) {
    let lastScrollY = window.scrollY;

    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const currentScrollY = self.scroll();

        // If scrolling down past threshold (60px), slide header up out of view
        if (self.direction === 1 && currentScrollY > 60) {
          gsap.to(header, {
            y: -100,
            duration: 0.8,
            ease: 'power3.inOut',
            overwrite: 'auto'
          });
        } 
        // If scrolling up even slightly, bring header smoothly back to original position (y: 0)
        else if (self.direction === -1) {
          gsap.to(header, {
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            overwrite: 'auto'
          });
        }

        lastScrollY = currentScrollY;
      }
    });
  }
});

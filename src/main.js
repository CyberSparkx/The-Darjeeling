import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initRevealSection } from './revealSection.js';
import { initVideoSection } from './videoSection.js';
import { initGallerySection } from './gallerySection.js';
import { initGalleryModal } from './galleryModal.js';
import { initRouteSection } from './routeSection.js';
import { initFooterRipple } from './footerRipple.js';

gsap.registerPlugin(ScrollTrigger);

window.addEventListener('DOMContentLoaded', () => {
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

  // 1. Initial Page Entrance Stagger Animation
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
    }, '-=0.4')
    .from('.hero-portrait-wrapper', {
      scale: 0.88,
      y: 40,
      autoAlpha: 0,
      duration: 1.2,
      ease: 'power3.out',
      clearProps: 'transform,opacity,visibility'
    }, '-=0.8');

  // Hero Uncle Interactive Floating & Mouse Parallax
  const uncleImg = document.getElementById('hero-uncle-img');
  if (uncleImg) {
    gsap.to(uncleImg, {
      y: -8,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    window.addEventListener('mousemove', (e) => {
      const xNorm = (e.clientX / window.innerWidth - 0.5) * 2;
      const yNorm = (e.clientY / window.innerHeight - 0.5) * 2;

      gsap.to(uncleImg, {
        x: xNorm * 12,
        y: yNorm * 8 - 4,
        rotation: xNorm * 1.5,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
  }

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

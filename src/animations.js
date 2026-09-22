import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function setupAnimations(threeScene) {
  // 1. Initial Hero Entrance Animation
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.2 } });

  heroTl
    .from('.hero-badge', { y: -20, autoAlpha: 0, delay: 0.2 })
    .from('.hero-title', { y: 40, autoAlpha: 0 }, '-=0.9')
    .from('.hero-subtitle', { y: 30, autoAlpha: 0 }, '-=0.9')
    .from('.hero-cta', { y: 20, autoAlpha: 0 }, '-=0.8');

  // 2. Camera Choreography and Shader parameters via ScrollTrigger
  const scrollTl = gsap.timeline({
    scrollTrigger: {
      trigger: 'main',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5
    }
  });

  // Section 1 -> Section 2: Move camera closer and tilt down
  scrollTl.to(threeScene.camera.position, {
    x: 1.5,
    y: 2.2,
    z: 3.8,
    ease: 'none'
  }, 0);

  scrollTl.to(threeScene.uniforms.uWaveElevation, {
    value: 0.9,
    ease: 'none'
  }, 0);

  // Section 2 -> Section 3: High overhead panoramic view
  scrollTl.to(threeScene.camera.position, {
    x: -2.0,
    y: 4.8,
    z: 2.5,
    ease: 'none'
  }, 0.33);

  scrollTl.to(threeScene.uniforms.uWaveFrequency, {
    value: 2.8,
    ease: 'none'
  }, 0.33);

  // Section 3 -> Section 4: Return to dramatic perspective
  scrollTl.to(threeScene.camera.position, {
    x: 0,
    y: 1.8,
    z: 4.2,
    ease: 'none'
  }, 0.66);

  scrollTl.to(threeScene.uniforms.uWaveElevation, {
    value: 0.5,
    ease: 'none'
  }, 0.66);

  // 3. Section Reveal Animations
  const cards = [
    { el: '.shader-card', trigger: '#shaders' },
    { el: '.gsap-card', trigger: '#animations' },
    { el: '.specs-card', trigger: '#specs' }
  ];

  cards.forEach(({ el, trigger }) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: trigger,
        start: 'top 75%',
        end: 'top 30%',
        toggleActions: 'play reverse play reverse'
      },
      y: 60,
      autoAlpha: 0,
      scale: 0.95,
      duration: 1,
      ease: 'power2.out'
    });
  });
}

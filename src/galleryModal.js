/**
 * galleryModal.js — Parchment Editorial Overlay
 * ─────────────────────────────────────────────────────────────────────────────
 * Design reference: warm cream background, large serif title left,
 * portrait image centered, body text right — inspired by the reference.
 * Top nav: Collection | History | Location tabs + "A project by Naren Roy"
 * ─────────────────────────────────────────────────────────────────────────────
 */

import gsap from 'gsap';

// ── Data ──────────────────────────────────────────────────────────────────────
export const MODAL_DATA = [
  {
    imageLayout:  'left',
    src:          '/landing-pages/img/darjeeling1.jpg',
    indexDisplay: '01',
    titleLine1:   'Darjeeling',
    titleLine2:   '& Kanchenjunga',
    subtitle:     'The Queen of the Hills',
    coordinates:  '27.0360° N · 88.2627° E',
    overview:     'Perched at 2,042 metres in the Eastern Himalayan foothills, Darjeeling is a living palimpsest — colonial ambition, Tibetan Buddhist culture, and the world\'s most celebrated teas, layered across a mist-wrapped ridge above Bengal.',
    history:      'In 1835 the East India Company leased this ridge from the Chogyal of Sikkim. A sanatorium became a summer capital. The narrow-gauge railway arrived in 1881, threading 88 km of switchbacks and spirals up the mountain — now a UNESCO World Heritage Site. Kanchenjunga at 8,586 m has watched over all of it.',
    location:     'Darjeeling District, West Bengal, India. Gateway to Sikkim, Bhutan and the Tibetan Plateau. The Observatory Hill promenade offers the most celebrated view of Kanchenjunga in the world — best seen at 5 AM in January, when the peak turns rose-gold before the sun clears the horizon.',
    stats: [
      { value: '2,042 m', label: 'elevation' },
      { value: '1835',    label: 'founded' },
      { value: '8,586 m', label: 'Kanchenjunga' },
    ],
    badge: 'UNESCO · DHR · 1999',
    year:  '1835 — Present',
  },
  {
    imageLayout:  'right',
    src:          '/landing-pages/img/ghum station n.jpg',
    indexDisplay: '02',
    titleLine1:   'Ghum',
    titleLine2:   'Station',
    subtitle:     'India\'s Highest Railway Station',
    coordinates:  '26.9800° N · 88.2600° E',
    overview:     'At 2,258 metres, Ghum is where time slows to the pace of a narrow-gauge steam engine. Before dawn the fog is so thick the stationmaster\'s lamp is the only fixed star in the valley. A scene unchanged for a hundred and forty years.',
    history:      'Ghum Station was built in 1881 by the British as part of the Darjeeling Himalayan Railway — the highest railway station in India at 7,407 feet. The nearby Batasia Loop is an engineering marvel: the train spirals around a war memorial garden to gain altitude. UNESCO declared the DHR a World Heritage Site in 1999.',
    location:     'Ghum, Darjeeling District, West Bengal. 8 km from Darjeeling town on the DHR route. The Batasia Loop viewpoint nearby offers the most dramatic morning view of Kanchenjunga from the railway line.',
    stats: [
      { value: '2,258 m',  label: 'altitude' },
      { value: '1881',     label: 'built' },
      { value: '#1 India', label: 'highest stn' },
    ],
    badge: 'UNESCO · Mountain Railways · 1999',
    year:  '1881 — Present',
  },
  {
    imageLayout:  'left',
    src:          '/landing-pages/img/kursiyong.jpg',
    indexDisplay: '03',
    titleLine1:   'Kurseong',
    titleLine2:   'by Night',
    subtitle:     'The White Orchid Town',
    coordinates:  '26.8800° N · 88.2800° E',
    overview:     '"Kurseong" — Lepcha for Land of White Orchids. After dark the town sheds its quiet hill-station demeanour and becomes a fallen constellation, its lights cascading down the ridge above the Teesta valley like a mirror of the sky.',
    history:      'The Lepcha people named this ridge Kharsang — meaning short-creeper flat land — which British cartographers transmuted into Kurseong on survey maps. The town grew alongside the tea industry and the DHR. Its elevation of 1,458 m keeps it cooler than the plains and mistier than Darjeeling.',
    location:     'Kurseong Sub-Division, Darjeeling District. Eagle\'s Craig viewpoint offers an unobstructed panorama from Kanchenjunga in the north to the Terai plains — a 1,000 m vertical sweep best experienced at first light.',
    stats: [
      { value: '1,458 m',  label: 'elevation' },
      { value: 'Kharsang', label: 'Lepcha name' },
      { value: '~44,000',  label: 'population' },
    ],
    badge: 'Sub-Div · Darjeeling District · W.B.',
    year:  'Ancient — Present',
  },
  {
    imageLayout:  'right',
    src:          '/landing-pages/img/siliguri.jpg',
    indexDisplay: '04',
    titleLine1:   'The Golden',
    titleLine2:   'Monastery',
    subtitle:     'Druk Sangag Choling',
    coordinates:  '26.7271° N · 88.3953° E',
    overview:     'Rising without warning from the flat Siliguri Terai, the Druk Sangag Choling Monastery blazes at dusk with a gilded pagoda roof visible for miles — a Tibetan Buddhist anchor point at the convergence of Bengal, Bhutan, Nepal and Sikkim.',
    history:      'The Drukpa Kagyu lineage traces to Tsangpa Gyare in the 12th century. The Siliguri monastery, established in the 1970s and renovated through the 2000s, houses over 200 monks. Its Maitreya (the future Buddha) — 18 feet of hammered gold — presides over the main prayer hall.',
    location:     'Salugara, Siliguri, West Bengal. Near the famous Chicken\'s Neck corridor — the narrow strip of land connecting Northeast India to the mainland. One of the most photographed monasteries in the Himalayan foothills.',
    stats: [
      { value: 'Drukpa Kagyu', label: 'lineage' },
      { value: '200+',         label: 'monks' },
      { value: '12th c.',      label: 'tradition' },
    ],
    badge: 'Drukpa Kagyu · Siliguri, W.B.',
    year:  'Est. 1970s',
  },
];

// ── State ─────────────────────────────────────────────────────────────────────
let isOpen    = false;
let currentTl = null;
let activeTab = 'overview';

const q  = s => document.querySelector(s);
const qa = s => [...document.querySelectorAll(s)];

// ── Build the entire modal layout via innerHTML ───────────────────────────────
function buildModal(data) {
  // We completely take over #gallery-modal-inner
  q('#gallery-modal-inner').innerHTML = `

    <!-- ── Top navigation bar ── -->
    <div class="gm-topbar">
      <div class="gm-topbar-left">
        <nav class="gm-tabs" role="tablist">
          <button class="gm-tab active" data-tab="overview" role="tab">Collection</button>
          <button class="gm-tab"        data-tab="history"  role="tab">History</button>
          <button class="gm-tab"        data-tab="location" role="tab">Location</button>
        </nav>
      </div>
      <div class="gm-topbar-right">
        <span class="gm-credit">A project by <strong>Naren Roy</strong></span>
        <span class="gm-topbar-sep">·</span>
        <button class="gm-close-btn" id="gallery-modal-close-btn" aria-label="Close detail" title="Back to gallery">
          <svg class="gm-close-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span>CLOSE</span>
        </button>
      </div>
    </div>

    <!-- ── Main stage: title | portrait | text ── -->
    <div class="gm-stage">

      <!-- Left: oversized serif title -->
      <div class="gm-stage-left">
        <div class="gm-index-mark">${data.indexDisplay}</div>
        <h2 class="gm-mega-title">
          <span class="gm-t1">${data.titleLine1}</span>
          <span class="gm-t2">${data.titleLine2}</span>
        </h2>
        <p class="gm-sub-label">${data.subtitle}</p>
      </div>

      <!-- Center: portrait card -->
      <div class="gm-stage-center">
        <div class="gm-portrait-frame">
          <img class="gm-portrait-img" src="${data.src}" alt="${data.titleLine1} ${data.titleLine2}" />
        </div>
      </div>

      <!-- Right: body content (tab-driven) -->
      <div class="gm-stage-right">
        <div class="gm-tab-content active" data-panel="overview">
          <p class="gm-body-p">${data.overview}</p>
          <div class="gm-stats-row">
            ${data.stats.map((s, i) => `
              <span class="gm-stat-item"><strong>${s.value}</strong> <small>${s.label}</small></span>
              ${i < data.stats.length - 1 ? '<span class="gm-stat-dot">·</span>' : ''}
            `).join('')}
          </div>
        </div>
        <div class="gm-tab-content" data-panel="history">
          <p class="gm-body-p">${data.history}</p>
        </div>
        <div class="gm-tab-content" data-panel="location">
          <p class="gm-body-p">${data.location}</p>
          <p class="gm-coords-display">${data.coordinates}</p>
        </div>
      </div>

    </div>

    <!-- ── Bottom strip ── -->
    <div class="gm-bottombar">
      <span class="gm-bb-badge">${data.badge}</span>
      <span class="gm-bb-year">${data.year}</span>
    </div>
  `;

  // Wire up close button inside modal
  const closeBtn = q('#gallery-modal-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Wire up tab clicks
  qa('.gm-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      qa('.gm-tab').forEach(b => b.classList.remove('active'));
      qa('.gm-tab-content').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = q(`.gm-tab-content[data-panel="${btn.dataset.tab}"]`);
      if (panel) {
        panel.classList.add('active');
        gsap.fromTo(panel, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
      }
    });
  });
}

// ── Open ──────────────────────────────────────────────────────────────────────
export function openModal(index) {
  if (isOpen) return;
  const data = MODAL_DATA[index];
  if (!data) return;
  isOpen = true;

  const modal = q('#gallery-modal');

  buildModal(data);
  gsap.set(modal, { display: 'flex', pointerEvents: 'all' });

  requestAnimationFrame(() => {
    const topbar  = q('.gm-topbar');
    const left    = q('.gm-stage-left');
    const center  = q('.gm-portrait-frame');
    const right   = q('.gm-stage-right');
    const bottom  = q('.gm-bottombar');
    const t1      = q('.gm-t1');
    const t2      = q('.gm-t2');
    const sub     = q('.gm-sub-label');
    const idx     = q('.gm-index-mark');

    // Set initial states
    gsap.set(modal,   { opacity: 0 });
    gsap.set(topbar,  { y: -20, opacity: 0 });
    gsap.set(t1,      { y: 40, opacity: 0 });
    gsap.set(t2,      { y: 40, opacity: 0 });
    gsap.set(sub,     { y: 20, opacity: 0 });
    gsap.set(idx,     { opacity: 0 });
    gsap.set(center,  { scale: 0.9, opacity: 0, y: 20 });
    gsap.set(right,   { x: 30, opacity: 0 });
    gsap.set(bottom,  { y: 20, opacity: 0 });

    if (currentTl) currentTl.kill();

    currentTl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      .to(modal,   { opacity: 1, duration: 0.4 })
      .to(topbar,  { y: 0, opacity: 1, duration: 0.6 }, '-=0.2')
      .to(t1,      { y: 0, opacity: 1, duration: 0.8 }, '-=0.3')
      .to(t2,      { y: 0, opacity: 1, duration: 0.8 }, '-=0.65')
      .to(sub,     { y: 0, opacity: 1, duration: 0.6 }, '-=0.6')
      .to(idx,     { opacity: 1, duration: 0.5 },       '-=0.6')
      .to(center,  { scale: 1, opacity: 1, y: 0, duration: 0.9 }, '-=0.7')
      .to(right,   { x: 0, opacity: 1, duration: 0.7 },           '-=0.6')
      .to(bottom,  { y: 0, opacity: 1, duration: 0.5 },           '-=0.4');
  });
}

// ── Close ─────────────────────────────────────────────────────────────────────
export function closeModal() {
  if (!isOpen) return;
  isOpen = false;
  const modal = q('#gallery-modal');

  gsap.timeline({ ease: 'power3.in' })
    .to(q('.gm-stage-right'), { x: 30, opacity: 0, duration: 0.3 })
    .to(q('.gm-portrait-frame'), { scale: 0.92, opacity: 0, duration: 0.35 }, '-=0.2')
    .to([q('.gm-t1'), q('.gm-t2'), q('.gm-sub-label')], { y: 20, opacity: 0, duration: 0.3, stagger: 0.05 }, '-=0.25')
    .to([q('.gm-topbar'), q('.gm-bottombar')], { opacity: 0, duration: 0.3 }, '-=0.2')
    .to(modal, { opacity: 0, duration: 0.3 }, '-=0.15')
    .set(modal, { display: 'none', pointerEvents: 'none' });
}

// ── Init ──────────────────────────────────────────────────────────────────────
export function initGalleryModal() {
  document.addEventListener('keydown', e => e.key === 'Escape' && closeModal());
}

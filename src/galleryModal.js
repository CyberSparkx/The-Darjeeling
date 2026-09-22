/**
 * galleryModal.js — Archival Editorial Gallery View
 * ─────────────────────────────────────────────────────────────────────────────
 * Matches the reference aesthetic:
 * • Background: Archival paper wash texture with ambient warmth
 * • Top left: Collection · History · Making Of (clean underline on active)
 * • Top right: "A project by Naren Roy" stacked with "✕ CLOSE"
 * • Left: Large classical serif title (Instrument Serif)
 * • Center: Portrait image card with delicate framing
 * • Right: Pure editorial narrative (Newsreader)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import gsap from 'gsap';

// ── Editorial Content ────────────────────────────────────────────────────────
export const MODAL_DATA = [
  {
    src:         '/landing-pages/img/darjeeling1.jpg',
    titleLine1:  'Darjeeling &',
    titleLine2:  'Kanchenjunga',
    collection:  'Perched at 2,042 metres in the Eastern Himalayan foothills, Darjeeling is a living palimpsest — colonial ambition, Tibetan Buddhist culture, and the world\'s most celebrated teas, layered across a mist-wrapped ridge above Bengal. Kanchenjunga at 8,586 metres has watched over all of it, catching the rose-gold rays of dawn before the plains awaken.',
    history:     'In 1835 the East India Company leased this ridge from the Chogyal of Sikkim. What began as a remote mountain sanatorium grew into the summer capital of the empire. The narrow-gauge railway arrived in 1881, threading 88 kilometres of switchbacks and spirals up the mountain — now a UNESCO World Heritage Site.',
    making:      'Captured in the crisp light of winter dawn from the Observatory Hill promenade. The exposure preserves the deep indigo shadows of the Teesta gorge below, balanced against the pristine white summit of the world\'s third highest peak.',
  },
  {
    src:         '/landing-pages/img/ghum station n.jpg',
    titleLine1:  'Ghum',
    titleLine2:  'Station',
    collection:  'At 2,258 metres, Ghum is where time slows to the pace of a narrow-gauge steam engine. Before dawn the mountain fog is so dense the stationmaster\'s kerosene lantern is the only fixed star in the valley. A scene preserved virtually unchanged for a hundred and forty years.',
    history:     'Constructed in 1881 as the summit point of the Darjeeling Himalayan Railway, Ghum is India\'s highest railway station at 7,407 feet. The nearby Batasia Loop is an engineering triumph where locomotives complete a 360-degree descent around a manicured war memorial garden.',
    making:      'Photographed during the autumn monsoon transition when low-hanging cloud banks engulf the tracks. The coal steam merges seamlessly into the Himalayan mist, capturing the timeless serenity of the heritage sanctuary.',
  },
  {
    src:         '/landing-pages/img/kursiyong.jpg',
    titleLine1:  'Kurseong',
    titleLine2:  'by Night',
    collection:  '"Kurseong" originates from the Lepcha name Kharsang — the Land of White Orchids. After twilight settles, the hillside sheds its quiet demeanor and becomes a fallen constellation, its warm lights cascading down the precipitous ridge toward the plains.',
    history:     'Inhabited by the indigenous Lepcha people for centuries and developed alongside the tea trade and the mountain railway, Kurseong enjoys a gentle climate at 1,458 metres, nestled midway between the humid Terai plains and the high Himalayan ridge.',
    making:      'A twilight exposure taken from the Eagle\'s Craig vantage point, holding the gentle gradient of evening sky against the golden incandescent glow of the town settlement.',
  },
  {
    src:         '/landing-pages/img/siliguri.jpg',
    titleLine1:  'The Golden',
    titleLine2:  'Monastery',
    collection:  'Rising without warning from the flat Siliguri Terai, the Druk Sangag Choling Monastery blazes at dusk with a gilded pagoda roof visible across the valley — a Tibetan Buddhist anchor point at the convergence of Bengal, Bhutan, Nepal and Sikkim.',
    history:     'Rooted in the 12th-century Drukpa Kagyu lineage of Himalayan Buddhism, the monastery houses over two hundred monks and features an 18-foot gilded statue of Maitreya, the future Buddha, consecrated in the main prayer sanctuary.',
    making:      'Captured during the evening butter-lamp prayer ceremonies when the fading ambient light contrasts with the hammered gold eaves and sacred prayer wheels.',
  },
];

// ── State ─────────────────────────────────────────────────────────────────────
let isOpen    = false;
let currentTl = null;

const q  = s => document.querySelector(s);
const qa = s => [...document.querySelectorAll(s)];

// ── Build Modal Layout ────────────────────────────────────────────────────────
function buildModal(data) {
  q('#gallery-modal-inner').innerHTML = `
    <!-- ── Top navigation bar ── -->
    <div class="gm-topbar">
      <nav class="gm-tabs" role="tablist">
        <button class="gm-tab active" data-tab="collection" role="tab">Collection</button>
        <button class="gm-tab"        data-tab="history"    role="tab">History</button>
        <button class="gm-tab"        data-tab="making"     role="tab">Making Of</button>
      </nav>
      <div class="gm-top-right">
        <div class="gm-author">A project by <span class="gm-author-name">Naren Roy</span></div>
        <button class="gm-close-text-btn" id="gallery-modal-close-btn" aria-label="Close modal">✕ CLOSE</button>
      </div>
    </div>

    <!-- ── Main stage: Title | Portrait | Narrative ── -->
    <div class="gm-stage">

      <!-- Left: Oversized Classical Serif Title -->
      <div class="gm-stage-left">
        <h2 class="gm-mega-title">
          <span class="gm-t1">${data.titleLine1}</span>
          <span class="gm-t2">${data.titleLine2}</span>
        </h2>
      </div>

      <!-- Center: Portrait Card Frame -->
      <div class="gm-stage-center">
        <div class="gm-portrait-frame">
          <img class="gm-portrait-img" src="${data.src}" alt="${data.titleLine1} ${data.titleLine2}" />
        </div>
      </div>

      <!-- Right: Editorial Narrative Paragraph -->
      <div class="gm-stage-right">
        <div class="gm-tab-content active" data-panel="collection">
          <p class="gm-body-p">${data.collection}</p>
        </div>
        <div class="gm-tab-content" data-panel="history">
          <p class="gm-body-p">${data.history}</p>
        </div>
        <div class="gm-tab-content" data-panel="making">
          <p class="gm-body-p">${data.making}</p>
        </div>
      </div>

    </div>
  `;

  // Wire up close button
  const closeBtn = q('#gallery-modal-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Wire up tabs
  qa('.gm-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      qa('.gm-tab').forEach(b => b.classList.remove('active'));
      qa('.gm-tab-content').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = q(`.gm-tab-content[data-panel="${btn.dataset.tab}"]`);
      if (panel) {
        panel.classList.add('active');
        gsap.fromTo(panel, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
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
    const topbar = q('.gm-topbar');
    const t1     = q('.gm-t1');
    const t2     = q('.gm-t2');
    const center = q('.gm-portrait-frame');
    const right  = q('.gm-stage-right');

    gsap.set(modal,  { opacity: 0 });
    gsap.set(topbar, { opacity: 0, y: -15 });
    gsap.set(t1,     { opacity: 0, y: 35 });
    gsap.set(t2,     { opacity: 0, y: 35 });
    gsap.set(center, { opacity: 0, scale: 0.94, y: 15 });
    gsap.set(right,  { opacity: 0, x: 25 });

    if (currentTl) currentTl.kill();

    currentTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      .to(modal,  { opacity: 1, duration: 0.4 })
      .to(topbar, { opacity: 1, y: 0, duration: 0.6 }, '-=0.2')
      .to(t1,     { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
      .to(t2,     { opacity: 1, y: 0, duration: 0.7 }, '-=0.55')
      .to(center, { opacity: 1, scale: 1, y: 0, duration: 0.8 }, '-=0.6')
      .to(right,  { opacity: 1, x: 0, duration: 0.6 }, '-=0.5');
  });
}

// ── Close ─────────────────────────────────────────────────────────────────────
export function closeModal() {
  if (!isOpen) return;
  isOpen = false;
  const modal = q('#gallery-modal');

  gsap.timeline({ ease: 'power2.in' })
    .to([q('.gm-topbar'), q('.gm-stage')], { opacity: 0, duration: 0.25 })
    .to(modal, { opacity: 0, duration: 0.25 }, '-=0.1')
    .set(modal, { display: 'none', pointerEvents: 'none' });
}

// ── Init ──────────────────────────────────────────────────────────────────────
export function initGalleryModal() {
  document.addEventListener('keydown', e => e.key === 'Escape' && closeModal());
}

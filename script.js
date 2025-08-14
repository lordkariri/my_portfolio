/* ========= Elements ========= */
const wrapper    = document.querySelector('.wrapper');
const scrollArea = document.querySelector('.scroll-area');
const labels     = document.querySelectorAll('.label'); // order: writing, code, home, music, contact
const bgImg      = document.getElementById('bg-img');

const hintLeft   = document.querySelector('.edge-hint.left');
const hintRight  = document.querySelector('.edge-hint.right');

/* ========= Section mapping (must match label order) ========= */
const sectionIndex = {
  writing: 0,
  code:    1,
  home:    2,
  music:   3,
  contact: 4
};

/* ========= Helpers: section centering ========= */
function getSectionOffsetByName(name) {
  const idx = sectionIndex[name];
  if (idx == null || !labels[idx]) return 0;

  // Read the anchor’s left % directly from inline style
  const leftPercent = parseFloat(labels[idx].style.left || '0');
  const totalWidth  = scrollArea.scrollWidth; // width of the long canvas
  const targetX     = (leftPercent / 100) * totalWidth - (window.innerWidth / 2);

  return Math.max(0, targetX);
}

function scrollToSectionByName(name) {
  const x = getSectionOffsetByName(name);
  wrapper.scrollTo({ left: x, behavior: 'smooth' });
}

/* ========= Buttons that scroll to sections ========= */
function wireSectionButtons() {
  document.querySelectorAll('.button[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target; // 'home' | 'code' | 'writing' | 'music' | 'contact'
      if (target) scrollToSectionByName(target);
    }, { passive: true });
  });

  // Legacy unique IDs (safe no-ops if missing)
  [
    { id: 'btn-code',    target: 'code'    },
    { id: 'btn-home',    target: 'home'    },
    { id: 'btn-music',   target: 'music'   },
    { id: 'btn-contact', target: 'contact' },
    { id: 'btn-writing', target: 'writing' }
  ].forEach(({ id, target }) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => scrollToSectionByName(target), { passive: true });
  });
}

/* ========= Overlay system ========= */
const overlayEl  = document.getElementById('overlay');
const contentEl  = overlayEl ? overlayEl.querySelector('.overlay-content') : null;

function getOverlayHTML(id) {
  // Looks for <template id="tmpl-<id>">…</template>
  const tpl = document.getElementById(`tmpl-${id}`);
  return tpl ? tpl.innerHTML : '';
}

function openOverlay({ title = 'Coming Soon', html = '' } = {}) {
  if (!overlayEl || !contentEl) return;

  // Build fresh content; keep the close button at top-right
  const close = document.createElement('button');
  close.className = 'overlay-close';
  close.type = 'button';
  close.setAttribute('aria-label', 'Close');
  close.textContent = '✕';

  const frag = document.createDocumentFragment();
  frag.appendChild(close);

  const h2 = document.createElement('h2');
  h2.id = 'overlay-title';
  h2.textContent = title;
  frag.appendChild(h2);

  if (html) {
    const bodyWrap = document.createElement('div');
    bodyWrap.innerHTML = html;
    frag.appendChild(bodyWrap);
  } else {
    const p = document.createElement('p');
    p.textContent = 'I’ll fill this with images/text later.';
    frag.appendChild(p);
  }

  contentEl.innerHTML = '';
  contentEl.appendChild(frag);

  overlayEl.classList.add('is-open');
  overlayEl.setAttribute('aria-hidden', 'false');
}

function closeOverlay() {
  if (!overlayEl) return;
  overlayEl.classList.remove('is-open');
  overlayEl.setAttribute('aria-hidden', 'true');
}

// Close on X
if (overlayEl) {
  overlayEl.addEventListener('click', (e) => {
    if (e.target.closest('.overlay-close')) closeOverlay();
  });

  // Click outside the white box
  overlayEl.addEventListener('click', (e) => {
    const inside = e.target.closest('.overlay-content');
    if (!inside) closeOverlay();
  });
}

// Close on Esc
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlayEl && overlayEl.classList.contains('is-open')) {
    closeOverlay();
  }
});

// Buttons that open overlays
function wireOverlayButtons() {
  document.querySelectorAll('.button[data-overlay]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id    = btn.dataset.overlay; // e.g., "professional-experience"
      const title = btn.dataset.title || id?.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Coming Soon';
      const html  = getOverlayHTML(id) || btn.dataset.content || '';
      openOverlay({ title, html });
    });
  });
}

/* ========= Data-wvw → % of background width =========
   Keeps button width consistent across devices:
   - You set data-wvw="N" (what the width would be in vw on your screen)
   - JS converts that to a percentage of the background image width
*/
function applyButtonWidths() {
  if (!bgImg) return;

  const bgW = bgImg.getBoundingClientRect().width || scrollArea.scrollWidth;
  const vpW = window.innerWidth || document.documentElement.clientWidth;

  if (!bgW || !vpW) return;

  document.querySelectorAll('.button[data-wvw]').forEach(btn => {
    const vw = parseFloat(btn.dataset.wvw || '0');
    if (!vw) return;

    const px  = (vw / 100) * vpW;   // width this would be if set in vw
    const pct = (px / bgW) * 100;   // convert to % of the background’s width
    btn.style.width = `${pct}%`;
  });
}

/* ========= Edge arrows (scroll hints) ========= */
function showArrows() {
  hintLeft  && hintLeft.classList.remove('hidden');
  hintRight && hintRight.classList.remove('hidden');
}
function hideArrows() {
  hintLeft  && hintLeft.classList.add('hidden');
  hintRight && hintRight.classList.add('hidden');
}

function updateEdgeHints() {
  if (!hintLeft || !hintRight) return;

  const max = Math.max(0, wrapper.scrollWidth - wrapper.clientWidth);
  const x   = wrapper.scrollLeft;

  if (max <= 1) {
    hideArrows();
    return;
  }

  showArrows();
  hintLeft.classList.toggle('hidden', x <= 2);
  hintRight.classList.toggle('hidden', x >= max - 2);
}

function nudge(amount) {
  wrapper.scrollBy({ left: amount, behavior: 'smooth' });
  setTimeout(updateEdgeHints, 250);
}

// Arrow click amount: 20% of viewport width (gentle)
const NUDGE = () => Math.round(window.innerWidth * 0.2);

hintLeft  && hintLeft.addEventListener('click',  () => nudge(-NUDGE()));
hintRight && hintRight.addEventListener('click', () => nudge( NUDGE()));

// Keep hints in sync
wrapper.addEventListener('scroll', updateEdgeHints, { passive: true });
window.addEventListener('resize', () => {
  applyButtonWidths();
  updateEdgeHints();
});

/* ========= Initial layout ========= */

// Wire interactions immediately
wireSectionButtons();
wireOverlayButtons();

// Apply widths as soon as DOM is ready (in case image is cached)
applyButtonWidths();

// Center “home” early (some browsers draw before image fires "load")
scrollToSectionByName('home');
showArrows();          // ensure visible on first paint
updateEdgeHints();

// When the background image finishes sizing, re-apply widths & recenter
function onImageReady() {
  applyButtonWidths();
  // Recenter home after layout stabilizes (important on other devices)
  requestAnimationFrame(() => {
    scrollToSectionByName('home');
    updateEdgeHints();
  });
}

// If already loaded, run immediately; else wait for load
if (bgImg && (bgImg.complete || bgImg.naturalWidth)) {
  onImageReady();
} else if (bgImg) {
  bgImg.addEventListener('load', onImageReady, { once: true });
}

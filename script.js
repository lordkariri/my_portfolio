/* ========= Sections / scrolling ========= */

const wrapper    = document.querySelector('.wrapper');
const scrollArea = document.querySelector('.scroll-area'); // wide content
const labels     = document.querySelectorAll('.label');    // order: writing, code, home, music, contact

// Map section name -> label index (must match your HTML order)
const sectionIndex = {
  writing: 0,
  code:    1,
  home:    2,
  music:   3,
  contact: 4
};

function getSectionOffsetByName(name) {
  const idx = sectionIndex[name];
  if (idx == null || !labels[idx]) return 0;

  const leftPercent = parseFloat(labels[idx].style.left || '0');
  const sw = scrollArea.scrollWidth || wrapper.scrollWidth;
  return (leftPercent / 100) * sw - (window.innerWidth / 2);
}

function scrollToSectionByName(name, behavior = 'smooth') {
  const offset = getSectionOffsetByName(name);
  wrapper.scrollTo({ left: offset, behavior });
}

// Back-compat if you ever call by index
function scrollToSection(idx) {
  const name = Object.keys(sectionIndex).find(k => sectionIndex[k] === idx);
  if (name) scrollToSectionByName(name);
}

/* ========= Overlay ========= */

const overlayEl  = document.getElementById('overlay');
const contentEl  = overlayEl ? overlayEl.querySelector('.overlay-content') : null;

function toTitleCaseFromId(id) {
  return String(id)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function getOverlayHTML(id) {
  const tpl = document.getElementById(`tmpl-${id}`);
  return tpl ? tpl.innerHTML : '';
}

function openOverlay({ title = 'Coming Soon', html = '' } = {}) {
  if (!overlayEl || !contentEl) return;

  // Build fresh content with a top-right close button
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
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    frag.appendChild(wrap);
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

// Close on X and click-outside
if (overlayEl) {
  overlayEl.addEventListener('click', (e) => {
    if (e.target.closest('.overlay-close')) return closeOverlay();
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

// Any .button with data-overlay opens overlay
document.querySelectorAll('.button[data-overlay]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id    = btn.dataset.overlay;                    // e.g., "professional-experience"
    const title = btn.dataset.title || toTitleCaseFromId(id || 'Coming Soon');
    const html  = getOverlayHTML(id) || btn.dataset.content || '';
    openOverlay({ title, html });
  });
});

/* ========= Buttons to sections ========= */

// Any .button with data-target="home|code|writing|music|contact"
document.querySelectorAll('.button[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    if (target) scrollToSectionByName(target);
  });
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
  if (el) el.addEventListener('click', () => scrollToSectionByName(target));
});

/* ========= Data-wvw → % of background width ========= */

function applyButtonWidths() {
  const bg = document.getElementById('bg-img');
  if (!bg) return;

  const rect = bg.getBoundingClientRect();
  const bgW  = rect.width;          // displayed background width
  const bgH  = rect.height;         // displayed background height (≈ 100vh)
  const ratio = bgW / bgH;          // background aspect ratio

  // We keep using your existing data-wvw values,
  // but interpret them relative to viewport HEIGHT * ratio,
  // so sizes track the background image, not raw viewport width.
  document.querySelectorAll('.button[data-wvw]').forEach(btn => {
    const vw = parseFloat(btn.dataset.wvw || '0');
    if (!vw) return;

    // Convert "vw-like" number into pixels based on bg height instead of viewport width.
    const px  = (vw / 100) * window.innerHeight * ratio;
    const pct = (px / bgW) * 100;   // percent of background width

    btn.style.width = `${pct}%`;
  });
}


/* ========= Edge arrows ========= */

const hintLeft  = document.querySelector('.edge-hint.left');
const hintRight = document.querySelector('.edge-hint.right');

function showArrows() {
  if (hintLeft)  hintLeft.classList.remove('hidden');
  if (hintRight) hintRight.classList.remove('hidden');
}

function hideArrows() {
  if (hintLeft)  hintLeft.classList.add('hidden');
  if (hintRight) hintRight.classList.add('hidden');
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

function nudge(amount = window.innerWidth * 0.2) {
  wrapper.scrollBy({ left: amount, behavior: 'smooth' });
  setTimeout(updateEdgeHints, 250);
}

// Arrow clicks (guard for nulls)
if (hintLeft)  hintLeft.addEventListener('click',  () => nudge(-window.innerWidth * 0.2));
if (hintRight) hintRight.addEventListener('click', () => nudge( window.innerWidth * 0.2));

// Update arrows on scroll/resize
wrapper.addEventListener('scroll', updateEdgeHints, { passive: true });

let resizeTO;
window.addEventListener('resize', () => {
  clearTimeout(resizeTO);
  resizeTO = setTimeout(() => {
    applyButtonWidths();
    updateEdgeHints();
  }, 120);
});

/* ========= Initial layout ========= */

// After everything loaded, compute widths, center "home", and show arrows
window.addEventListener('load', () => {
  applyButtonWidths();

  // Try to center 'home'; if labels are missing, center the canvas
  if (labels.length && sectionIndex.home != null) {
    // instant jump so users start centered
    scrollToSectionByName('home', 'instant');
  } else {
    const mid = (wrapper.scrollWidth - wrapper.clientWidth) / 2;
    wrapper.scrollTo({ left: mid, behavior: 'instant' });
  }

  showArrows();
  requestAnimationFrame(updateEdgeHints);
});
window.addEventListener('load', () => {
  applyButtonWidths();
  requestAnimationFrame(() => {
    updateEdgeHints();
    // Center home without animation on very first paint
    const mid = Math.max(0, (scrollArea.scrollWidth - window.innerWidth) / 2);
    wrapper.scrollTo({ left: mid, behavior: 'auto' });
    // Or: scrollToSectionByName('home');  // if you prefer your anchor logic
  });
});

window.addEventListener('resize', () => {
  applyButtonWidths();
  updateEdgeHints();
});


// Also ensure arrows start visible before any scroll
if (hintLeft)  hintLeft.classList.remove('hidden');
if (hintRight) hintRight.classList.remove('hidden');

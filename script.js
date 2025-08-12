// ===== Sections / scrolling =====
const wrapper    = document.querySelector('.wrapper');
const scrollArea = document.querySelector('.scroll-area');
const labels     = document.querySelectorAll('.label'); // order: writing, code, home, music, contact

// Map section name -> label index
const sectionIndex = {
  writing: 0,
  code:    1,
  home:    2,
  music:   3,
  contact: 4
};

function scrollToSectionByName(name) {
  const idx = sectionIndex[name];
  if (idx == null || !labels[idx]) return;

  const leftPercent = parseFloat(labels[idx].style.left);
  const sw = scrollArea.scrollWidth; // recalc each time
  const offset = (leftPercent / 100) * sw - (window.innerWidth / 2);

  scrollArea.scrollTo({ left: offset, behavior: 'smooth' });
}

function scrollToSection(idx) {
  const name = Object.keys(sectionIndex).find(k => sectionIndex[k] === idx);
  if (name) scrollToSectionByName(name);
}

// Center "home" on load
window.addEventListener('load', () => {
  scrollToSectionByName('home');
  updateEdgeHints();
});

// Wire click for target buttons
document.querySelectorAll('.button[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    if (target) scrollToSectionByName(target);
  });
});

// ===== Overlay =====
const overlayEl  = document.getElementById('overlay');
const contentEl  = overlayEl ? overlayEl.querySelector('.overlay-content') : null;
const closeBtnEl = overlayEl ? overlayEl.querySelector('.overlay-close') : null;

function toTitleCaseFromId(id) {
  return String(id)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function openOverlay({ title = 'Coming Soon', html = '' } = {}) {
  if (!overlayEl || !contentEl || !closeBtnEl) return;

  const closeClone = closeBtnEl.cloneNode(true);

  const frag = document.createDocumentFragment();
  frag.appendChild(closeClone);

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

if (overlayEl) {
  overlayEl.addEventListener('click', (e) => {
    if (e.target.closest('.overlay-close')) closeOverlay();
  });
  overlayEl.addEventListener('click', (e) => {
    const inside = e.target.closest('.overlay-content');
    if (!inside) closeOverlay();
  });
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlayEl && overlayEl.classList.contains('is-open')) {
    closeOverlay();
  }
});

document.querySelectorAll('.button[data-overlay]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.overlay;
    const title = toTitleCaseFromId(id || 'Coming Soon');
    openOverlay({ title });
  });
});

// ===== Legacy IDs =====
const legacyMap = [
  { id: 'btn-code',    target: 'code'    },
  { id: 'btn-home',    target: 'home'    },
  { id: 'btn-music',   target: 'music'   },
  { id: 'btn-contact', target: 'contact' },
  { id: 'btn-writing', target: 'writing' }
];

legacyMap.forEach(({ id, target }) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', () => scrollToSectionByName(target));
});

// ===== Button width scaling =====
window.addEventListener('load', () => {
  const bg = document.getElementById('bg-img');

  requestAnimationFrame(() => {
    const bgW = bg.getBoundingClientRect().width;
    const vpW = window.innerWidth;

    document.querySelectorAll('.button[data-wvw]').forEach(btn => {
      const vw = parseFloat(btn.dataset.wvw);
      const px = (vw / 100) * vpW;
      const pct = (px / bgW) * 100;
      btn.style.width = `${pct}%`;
    });
  });
});

// ===== Arrows for scrolling =====
const hintLeft  = document.querySelector('.edge-hint.left');
const hintRight = document.querySelector('.edge-hint.right');

function updateEdgeHints() {
  const max = scrollArea.scrollWidth - scrollArea.clientWidth;
  const x   = scrollArea.scrollLeft;
  hintLeft.classList.toggle('hidden', x <= 2);
  hintRight.classList.toggle('hidden', x >= max - 2);
}

function nudge(amount = window.innerWidth * 0.8) {
  scrollArea.scrollBy({ left: amount, behavior: 'smooth' });
  setTimeout(updateEdgeHints, 300);
}

hintLeft.addEventListener('click',  () => nudge(-window.innerWidth * 0.8));
hintRight.addEventListener('click', () => nudge(window.innerWidth * 0.8));

scrollArea.addEventListener('scroll', updateEdgeHints, { passive: true });
window.addEventListener('resize', updateEdgeHints);

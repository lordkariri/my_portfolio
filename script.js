// ===== Sections / scrolling =====
const wrapper    = document.querySelector('.wrapper');
const scrollArea = document.querySelector('.scroll-area');
const labels     = document.querySelectorAll('.label'); // order: writing, code, home, music, contact

// Map section name -> label index (based on your HTML order)
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
  const sw = scrollArea.scrollWidth; // recalc each time (responsive)
  const offset = (leftPercent / 100) * sw - (window.innerWidth / 2);

  wrapper.scrollTo({ left: offset, behavior: 'smooth' });
}

// Back-compat helper (if you ever call by index)
function scrollToSection(idx) {
  const name = Object.keys(sectionIndex).find(k => sectionIndex[k] === idx);
  if (name) scrollToSectionByName(name);
}

// Center "home" on load
window.addEventListener('load', () => {
  scrollToSectionByName('home');
});

// Recenter on resize (optional)
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // You can re-center the current section if you track it.
    // For now we leave it alone.
  }, 150);
});

// Wire click for target buttons
document.querySelectorAll('.button[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target; // 'home' | 'code' | 'writing' | 'music' | 'contact'
    if (target) scrollToSectionByName(target);
  });
});

// ===== Overlay =====
const overlayEl      = document.getElementById('overlay');
const contentEl      = overlayEl ? overlayEl.querySelector('.overlay-content') : null;
const closeBtnEl     = overlayEl ? overlayEl.querySelector('.overlay-close') : null;

function toTitleCaseFromId(id) {
  return String(id)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function openOverlay({ title = 'Coming Soon', html = '' } = {}) {
  if (!overlayEl || !contentEl || !closeBtnEl) return;

  // Keep the existing close button at the top-right
  // (detach, rebuild content, re-attach)
  const closeClone = closeBtnEl.cloneNode(true);

  // Build new content
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

  // Replace content
  contentEl.innerHTML = '';
  contentEl.appendChild(frag);

  // Show
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

  // Close on click-outside (any click not inside the white box)
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

// Wire click for overlay buttons
document.querySelectorAll('.button[data-overlay]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.overlay; // e.g., 'coding-projects'
    const title = toTitleCaseFromId(id || 'Coming Soon');
    openOverlay({ title });
  });
});

// ===== Legacy (optional): unique IDs if you still have them =====
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

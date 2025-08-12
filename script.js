/* ========= Sections / scrolling ========= */

const wrapper    = document.querySelector('.wrapper');
const scrollArea = document.querySelector('.scroll-area');
const labels     = document.querySelectorAll('.label'); // order: writing, code, home, music, contact

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
  const sw = scrollArea.scrollWidth;
  return (leftPercent / 100) * sw - (window.innerWidth / 2);
}

function scrollToSectionByName(name) {
  const offset = getSectionOffsetByName(name);
  wrapper.scrollTo({ left: offset, behavior: 'smooth' });
}

// Back-compat if you ever call by index
function scrollToSection(idx) {
  const name = Object.keys(sectionIndex).find(k => sectionIndex[k] === idx);
  if (name) scrollToSectionByName(name);
}

/* ========= Overlay ========= */

const overlayEl  = document.getElementById('overlay');
const contentEl  = overlayEl ? overlayEl.querySelector('.overlay-content') : null;
const closeBtnEl = overlayEl ? overlayEl.querySelector('.overlay-close') : null;

function toTitleCaseFromId(id) {
  return String(id)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function openOverlay({ title = 'Coming Soon', html = '' } = {}) {
  if (!overlayEl || !contentEl) return;

  // Preserve the close button at top-right
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

  // Click outside white box
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

// Any .button with data-overlay opens overlay
document.querySelectorAll('.button[data-overlay]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.overlay;
    const title = toTitleCaseFromId(id || 'Coming Soon');
    openOverlay({ title });
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

  const bgW = bg.getBoundingClientRect().width || scrollArea.scrollWidth;
  const vpW = window.innerWidth || document.documentElement.clientWidth;

  document.querySelectorAll('.button[data-wvw]').forEach(btn => {
    const vw = parseFloat(btn.dataset.wvw || '0');
    if (!vw) return;
    const px = (vw / 100) * vpW;     // size based on viewport width
    const pct = (px / bgW) * 100;    // convert to % of background width
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
  
}

function updateEdgeHints() {
  if (!hintLeft || !hintRight) return;

  const max = Math.max(0, wrapper.scrollWidth - wrapper.clientWidth);
  const x   = wrapper.scrollLeft;

  // If no horizontal overflow, hide both
  if (max <= 1) {
    hideArrows();
    return;
  }

  // Ensure arrows are visible first
  showArrows();

  // Hide as needed at hard edges
  hintLeft.classList.toggle('hidden', x <= 2);
  hintRight.classList.toggle('hidden', x >= max - 2);
}

function nudge(amount = window.innerWidth * 0.2) {
  wrapper.scrollBy({ left: amount, behavior: 'smooth' });
  // Wait a bit then update visibility
  setTimeout(updateEdgeHints, 300);
}

// Wire clicks (guard for nulls)
if (hintLeft)  hintLeft.addEventListener('click',  () => nudge(-window.innerWidth * 0.2));
if (hintRight) hintRight.addEventListener('click', () => nudge( window.innerWidth * 0.2));

wrapper.addEventListener('scroll', updateEdgeHints, { passive: true });
window.addEventListener('resize', () => {
  applyButtonWidths();/* ========= Sections / scrolling ========= */

  const wrapper    = document.querySelector('.wrapper');
  const scrollArea = document.querySelector('.scroll-area');
  const labels     = document.querySelectorAll('.label'); // order: writing, code, home, music, contact
  
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
    const sw = scrollArea.scrollWidth;
    return (leftPercent / 100) * sw - (window.innerWidth / 2);
  }
  
  function scrollToSectionByName(name) {
    const offset = getSectionOffsetByName(name);
    wrapper.scrollTo({ left: offset, behavior: 'smooth' });
  }
  
  // Back-compat if you ever call by index
  function scrollToSection(idx) {
    const name = Object.keys(sectionIndex).find(k => sectionIndex[k] === idx);
    if (name) scrollToSectionByName(name);
  }
  
  /* ========= Overlay ========= */
  
  const overlayEl  = document.getElementById('overlay');
  const contentEl  = overlayEl ? overlayEl.querySelector('.overlay-content') : null;
  const closeBtnEl = overlayEl ? overlayEl.querySelector('.overlay-close') : null;
  
  function toTitleCaseFromId(id) {
    return String(id)
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
  
  function openOverlay({ title = 'Coming Soon', html = '' } = {}) {
    if (!overlayEl || !contentEl) return;
  
    // Preserve the close button at top-right
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
  
    // Click outside white box
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
  
  // Any .button with data-overlay opens overlay
  document.querySelectorAll('.button[data-overlay]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.overlay;
      const title = toTitleCaseFromId(id || 'Coming Soon');
      openOverlay({ title });
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
  
    const bgW = bg.getBoundingClientRect().width || scrollArea.scrollWidth;
    const vpW = window.innerWidth || document.documentElement.clientWidth;
  
    document.querySelectorAll('.button[data-wvw]').forEach(btn => {
      const vw = parseFloat(btn.dataset.wvw || '0');
      if (!vw) return;
      const px = (vw / 100) * vpW;     // size based on viewport width
      const pct = (px / bgW) * 100;    // convert to % of background width
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
  
    // If no horizontal overflow, hide both
    if (max <= 1) {
      hideArrows();
      return;
    }
  
    // Ensure arrows are visible first
    showArrows();
  
    // Hide as needed at hard edges
    hintLeft.classList.toggle('hidden', x <= 2);
    hintRight.classList.toggle('hidden', x >= max - 2);
  }
  
  function nudge(amount = window.innerWidth * 0.2) {
    wrapper.scrollBy({ left: amount, behavior: 'smooth' });
    // Wait a bit then update visibility
    setTimeout(updateEdgeHints, 300);
  }
  
  // Wire clicks (guard for nulls)
  if (hintLeft)  hintLeft.addEventListener('click',  () => nudge(-window.innerWidth * 0.2));
  if (hintRight) hintRight.addEventListener('click', () => nudge( window.innerWidth * 0.2));
  
  wrapper.addEventListener('scroll', updateEdgeHints, { passive: true });
  window.addEventListener('resize', () => {
    applyButtonWidths();
    updateEdgeHints();
  });
  
  /* ========= Initial layout ========= */
  
  // 1) After DOM parsed (script is defer), center "home" quickly
  scrollToSectionByName('home');
  
  // 2) After everything (images) loaded, compute widths and update arrows again
  window.addEventListener('load', () => {
    applyButtonWidths();
    // force-show first so users notice them, then evaluate edges
    showArrows();
    // Slight delay to ensure layout settles (SVGs/images)
    requestAnimationFrame(() => {
      updateEdgeHints();
    });
  });
  
  // Force arrows visible on load
  if (hintLeft)  hintLeft.classList.remove('hidden');
  if (hintRight) hintRight.classList.remove('hidden');
  
  updateEdgeHints();
});

/* ========= Initial layout ========= */

// 1) After DOM parsed (script is defer), center "home" quickly
scrollToSectionByName('home');

// 2) After everything (images) loaded, compute widths and update arrows again
window.addEventListener('load', () => {
  applyButtonWidths();
  // force-show first so users notice them, then evaluate edges
  showArrows();
  // Slight delay to ensure layout settles (SVGs/images)
  requestAnimationFrame(() => {
    updateEdgeHints();
  });
});

// Force arrows visible on load
if (hintLeft)  hintLeft.classList.remove('hidden');
if (hintRight) hintRight.classList.remove('hidden');

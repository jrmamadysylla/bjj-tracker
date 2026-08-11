// ── PAGE ORDER for swipe ──────────────────────────────────────────────────────
const PAGE_ORDER = ['dashboard','lift','bjj','mobility','weight','measurements','overload','history','export','programme'];
let currentPageIndex = 0;

// ── NAV ───────────────────────────────────────────────────────────────────────
function nav(page, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');
  if (btn) btn.classList.add('active');
  currentPageIndex = PAGE_ORDER.indexOf(page);
  syncBottomNav(page);
  closeMobileNav();
  // Render page data
  if (page === 'dashboard') renderDashboard();
  if (page === 'history') renderHistory();
  if (page === 'weight') renderBWHistory();
  if (page === 'overload') renderProgressionPage();
  if (page === 'measurements') renderMeasurementsHistory();
  if (page === 'mobility') renderMobilityStreak();
  if (page === 'programme') renderProgrammePage();
}

// ── BOTTOM NAV ─────────────────────────────────────────────────────────────────
function syncBottomNav(page) {
  if (!isMobile()) return;
  const map = { dashboard:'bn-dashboard', lift:'bn-lift', bjj:'bn-bjj', mobility:'bn-mobility' };
  document.querySelectorAll('.bn-item').forEach(b => b.classList.remove('active'));
  if (map[page]) document.getElementById(map[page])?.classList.add('active');
  else document.getElementById('bn-more')?.classList.add('active');
}

function toggleMoreMenu() {
  document.getElementById('more-menu')?.classList.toggle('open');
}

function closeMobileNav() {
  document.getElementById('more-menu')?.classList.remove('open');
}

// ── SWIPE NAVIGATION ──────────────────────────────────────────────────────────
let swipeStartX = 0;
let swipeStartY = 0;

function initSwipe() {
  const main = document.querySelector('.main');
  if (!main) return;

  main.addEventListener('touchstart', e => {
    swipeStartX = e.touches[0].clientX;
    swipeStartY = e.touches[0].clientY;
  }, { passive: true });

  main.addEventListener('touchend', e => {
    if (!isMobile()) return;
    const dx = e.changedTouches[0].clientX - swipeStartX;
    const dy = e.changedTouches[0].clientY - swipeStartY;
    // Only trigger on predominantly horizontal swipes > 60px
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) * 0.8) return;
    // Don't swipe when inside an input or select
    if (['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if (dx < 0 && currentPageIndex < PAGE_ORDER.length - 1) {
      // Swipe left → next page
      nav(PAGE_ORDER[currentPageIndex + 1], null);
    } else if (dx > 0 && currentPageIndex > 0) {
      // Swipe right → previous page
      nav(PAGE_ORDER[currentPageIndex - 1], null);
    }
    haptic(30);
  }, { passive: true });
}

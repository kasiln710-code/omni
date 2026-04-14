// ============================================================
//  OmniConnect – main.js
// ============================================================

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile menu toggle
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}
// Close menu on outside click
document.addEventListener('click', e => {
  const menu = document.getElementById('mobileMenu');
  const ham = document.getElementById('hamburger');
  if (menu.classList.contains('open') && !menu.contains(e.target) && !ham.contains(e.target)) {
    menu.classList.remove('open');
  }
});

// Pricing toggle
function switchPricing(mode) {
  currentPricing = mode;
  document.querySelectorAll('.pricing-tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && mode === 'm') || (i === 1 && mode === 'y'));
  });
  document.querySelectorAll('.price-val').forEach(el => {
    const m = parseInt(el.dataset.m);
    const y = parseInt(el.dataset.y);
    if (mode === 'y') {
      el.textContent = y.toLocaleString();
    } else {
      el.textContent = m.toLocaleString();
    }
  });
}

// AI Agent Tab Switch
function switchAITab(tab) {
  // update tab button styles
  document.querySelectorAll('.ai-tab').forEach(btn => {
    btn.classList.remove('active');
  });
  const tabMap = { sales: 0, service: 1, ops: 2, marketing: 3 };
  const tabs = document.querySelectorAll('.ai-tab');
  if (tabs[tabMap[tab]]) tabs[tabMap[tab]].classList.add('active');

  // show correct panel
  document.querySelectorAll('.ai-tab-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(`ai-panel-${tab}`);
  if (panel) {
    panel.classList.add('active');
    // re-trigger reveal for newly shown cards
    panel.querySelectorAll('.reveal').forEach((el, idx) => {
      el.classList.remove('visible');
      setTimeout(() => el.classList.add('visible'), idx * 80);
    });
  }
}

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), idx * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Count-up animation for hero stats
function animateCount(el, target, suffix, duration = 1800) {
  const isFloat = String(target).includes('.');
  const start = performance.now();
  const update = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const val = isFloat ? (target * ease).toFixed(1) : Math.floor(target * ease);
    el.textContent = val + suffix;
    if (p < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// Trigger count animation when hero is visible
const statsObs = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    const configs = [
      { sel: '.hero-stat:nth-child(1) .hero-stat-num', val: 10, suf: 'K+' },
      { sel: '.hero-stat:nth-child(2) .hero-stat-num', val: 200, suf: '+' },
      { sel: '.hero-stat:nth-child(3) .hero-stat-num', val: 99.9, suf: '%' },
      { sel: '.hero-stat:nth-child(4) .hero-stat-num', val: 5, suf: 'B+' }
    ];
    configs.forEach(c => {
      const el = document.querySelector(c.sel);
      if (el) animateCount(el, c.val, c.suf);
    });
    statsObs.disconnect();
  }
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObs.observe(heroStats);

// Highlight active nav on scroll
const sections = ['home','products','ai-agents','why','global','pricing','testimonials','contact'];
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${id}`
          ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,.75)';
      });
    }
  });
}, { threshold: 0.35 });

sections.forEach(id => {
  const el = document.getElementById(id);
  if (el) sectionObs.observe(el);
});

// Init: apply default language
switchLang('zh');

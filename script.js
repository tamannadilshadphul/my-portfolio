/* =========================================================
   Tamanna's Digital Wonderland  -  script.js
   ---------------------------------------------------------
   Everything you might want to edit is in the CONFIG block.
   The rest of the file makes the website interactive.
   ========================================================= */

/* ---------------- EDIT ME ---------------- */
const CONFIG = {
  // Phrases in the typing animation. They appear after "I'm currently ..."
  typingPhrases: [
    "learning C++, Python & JavaScript",
    "practicing object-oriented programming",
    "working with SQL and databases",
    "building academic software projects",
    "improving my problem-solving skills"
  ],
  typingSpeed: 60,         // ms per letter typed
  deleteSpeed: 30,         // ms per letter deleted
  pauseAfterTyping: 1800,  // ms to wait when a phrase is complete
  pauseAfterDeleting: 400, // ms to wait before the next phrase

  sparkleCount: 16,        // floating sparkles in the hero (lower = lighter)

  // Message shown when someone clicks a link that is still href="#"
  placeholderMessage: "This is a placeholder link. Add your real URL in index.html \u2728"
};
/* ------------- END OF EDIT AREA ------------- */

(() => {
  'use strict';

  /* ---------- Small helpers ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Toast (little pop-up message) ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
  }

  /* ---------- 1. Mobile navigation menu ---------- */
  function initNav() {
    const toggle = $('#nav-toggle');
    const links  = $('#nav-links');
    const header = $('.site-header');
    if (!toggle || !links) return;

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      links.classList.toggle('open', open);
    };

    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    links.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    // Close the menu when clicking outside of it
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav') && toggle.getAttribute('aria-expanded') === 'true') setOpen(false);
    });
    // Reset when the window becomes wide again
    window.matchMedia('(min-width: 821px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });

    // Glass background on the header after scrolling a little
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Highlight the link of the section currently on screen
    const navLinks = $$('a', links);
    const sections = navLinks
      .map(a => $(a.getAttribute('href')))
      .filter(Boolean);

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          navLinks.forEach(a => {
            const active = a.getAttribute('href') === '#' + entry.target.id;
            if (active) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(s => io.observe(s));
    }
  }

  /* ---------- 2. Typing animation ---------- */
  function initTyping() {
    const el = $('#typing');
    const phrases = CONFIG.typingPhrases;
    if (!el || !phrases.length || reduceMotion) return; // keep the static text

    let phraseIndex = 0;
    let charIndex = phrases[0].length; // start with the first phrase already shown
    let deleting = true;
    el.textContent = phrases[0];

    function tick() {
      const current = phrases[phraseIndex];
      let delay;

      if (deleting) {
        charIndex--;
        delay = CONFIG.deleteSpeed;
        if (charIndex <= 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          delay = CONFIG.pauseAfterDeleting;
        }
      } else {
        charIndex++;
        delay = CONFIG.typingSpeed;
        if (charIndex >= current.length) {
          deleting = true;
          delay = CONFIG.pauseAfterTyping;
        }
      }
      el.textContent = phrases[deleting || charIndex === 0 ? phraseIndex : phraseIndex].slice(0, charIndex);
      setTimeout(tick, delay);
    }
    setTimeout(tick, CONFIG.pauseAfterTyping + 600);
  }

  /* ---------- 3. Scroll reveal ---------- */
  function initReveal() {
    const items = $$('.reveal');

    // Small stagger for items that share a parent (cards in a grid)
    const counters = new Map();
    items.forEach(item => {
      const parent = item.parentElement;
      const n = counters.get(parent) || 0;
      item.style.transitionDelay = Math.min(n, 4) * 90 + 'ms';
      counters.set(parent, n + 1);
    });

    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach(i => i.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(i => io.observe(i));
  }

  /* ---------- 4. Floating sparkles in the hero ---------- */
  function initSparkles() {
    const box = $('#hero-sparkles');
    if (!box || reduceMotion) return;

    const star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C12 7 17 12 24 12C17 12 12 17 12 24C12 17 7 12 0 12C7 12 12 7 12 0Z"/></svg>';
    const colors = ['#a78bfa', '#ee8db7', '#c4b0fb', '#f5a9cb'];
    const count = window.innerWidth < 600 ? Math.round(CONFIG.sparkleCount * 0.6) : CONFIG.sparkleCount;

    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      const size = 10 + Math.random() * 22;
      s.className = 'hero-sparkle';
      s.innerHTML = star;
      s.style.cssText =
        `left:${Math.random() * 100}%;top:${Math.random() * 100}%;` +
        `width:${size}px;height:${size}px;color:${colors[i % colors.length]};` +
        `--dur:${4 + Math.random() * 5}s;--delay:${-Math.random() * 6}s;`;
      box.appendChild(s);
    }
  }

  /* ---------- 5. Image fallback ----------
     If an image file exists, it fades in and covers the placeholder.
     If it is missing, the image is removed and the pretty placeholder stays. */
  function initImages() {
    $$('img[data-fallback]').forEach(img => {
      const frame = img.closest('.img-frame');
      const ok = () => {
        img.classList.add('loaded');
        if (frame) frame.classList.add('has-image');
      };
      const fail = () => img.remove();

      img.addEventListener('load', () => (img.naturalWidth > 0 ? ok() : fail()));
      img.addEventListener('error', fail);
      if (img.complete) (img.naturalWidth > 0 ? ok() : fail());
    });
  }

  /* ---------- 6. Placeholder links ----------
     Any link that still has href="#" shows a friendly message
     instead of jumping to the top of the page. */
  function initPlaceholderLinks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.getAttribute('href') === '#') {
        e.preventDefault();
        showToast(CONFIG.placeholderMessage);
      }
    });
  }

  /* ---------- 7. Project card tilt (desktop only) ---------- */
  function initTilt() {
    if (!finePointer || reduceMotion) return;
    $$('[data-tilt]').forEach(card => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- 8. Custom cursor (desktop only) ----------
     Your normal cursor stays visible - this just adds a soft follower. */
  function initCursor() {
    if (!finePointer || reduceMotion) return;

    const dot  = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    dot.setAttribute('aria-hidden', 'true');
    ring.setAttribute('aria-hidden', 'true');
    document.body.append(dot, ring);

    let mx = 0, my = 0, rx = 0, ry = 0, running = false;

    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    }

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      if (!running) {
        running = true;
        rx = mx; ry = my;
        document.body.classList.add('cursor-on');
        requestAnimationFrame(loop);
      }
    }, { passive: true });

    document.addEventListener('mouseover', (e) => {
      document.body.classList.toggle('cursor-hover', !!e.target.closest('a, button, [data-tilt], .skill-card, .info-card, .tl-card'));
    });
    document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-on'));
    document.addEventListener('mouseenter', () => { if (running) document.body.classList.add('cursor-on'); });
  }

  /* ---------- 9. Footer year ---------- */
  function initYear() {
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- Start everything ---------- */
  function init() {
    initNav();
    initTyping();
    initReveal();
    initSparkles();
    initImages();
    initPlaceholderLinks();
    initTilt();
    initCursor();
    initYear();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

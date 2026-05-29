/* ─── WEDDING INVITATION SCRIPT ─────────────────────────────── */

(function () {
  'use strict';

  // ─── OPENING OVERLAY ────────────────────────────────────────
  const overlay    = document.getElementById('openingOverlay');
  const openBtn    = document.getElementById('openBtn');
  const content    = document.getElementById('invitationContent');
  const bgMusic    = document.getElementById('bgMusic');

  openBtn.addEventListener('click', function () {
    overlay.classList.add('hidden-overlay');

    // Try to play background music on first interaction
    bgMusic.play().catch(function () { });

    // Trigger scroll-reveal for hero elements once overlay is dismissed
    setTimeout(triggerReveal, 800);
  });

  // ─── COUNTDOWN TIMER ────────────────────────────────────────
  var weddingDate = new Date('2026-10-31T08:00:00+07:00').getTime();

  function updateCountdown() {
    var now  = Date.now();
    var diff = weddingDate - now;

    if (diff <= 0) {
      document.getElementById('cd-days').textContent    = '00';
      document.getElementById('cd-hours').textContent   = '00';
      document.getElementById('cd-minutes').textContent = '00';
      document.getElementById('cd-seconds').textContent = '00';
      return;
    }

    var days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('cd-days').textContent    = String(days).padStart(2, '0');
    document.getElementById('cd-hours').textContent   = String(hours).padStart(2, '0');
    document.getElementById('cd-minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('cd-seconds').textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ─── SCROLL REVEAL ──────────────────────────────────────────
  function triggerReveal() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  // Start observing immediately (for users who skip the overlay, or on reload)
  triggerReveal();

  // Stagger child reveals within grids for a nicer effect
  document.querySelectorAll('.couple-card, .event-card, .gallery-item, .timeline-item').forEach(function (el, i) {
    el.style.transitionDelay = (i * 0.1) + 's';
  });

  // ─── MUSIC TOGGLE ───────────────────────────────────────────
  var musicToggle = document.getElementById('musicToggle');
  var playIcon    = musicToggle.querySelector('.music-icon--play');
  var pauseIcon   = musicToggle.querySelector('.music-icon--pause');
  var isPlaying   = false;

  musicToggle.addEventListener('click', function () {
    if (!bgMusic) return;
    if (isPlaying) {
      bgMusic.pause();
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
      isPlaying = false;
    } else {
      bgMusic.play().then(function () {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
        isPlaying = true;
      }).catch(function () {
        // Autoplay blocked — user must interact first (already handled by openBtn)
      });
    }
  });

  // Sync toggle icon if music auto-started (e.g. after openBtn click)
  if (bgMusic) {
    bgMusic.addEventListener('play', function () {
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');
      isPlaying = true;
    });
    bgMusic.addEventListener('pause', function () {
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
      isPlaying = false;
    });
  }

  // ─── GALLERY LIGHTBOX ───────────────────────────────────────
  var lightbox      = document.getElementById('lightbox');
  var lightboxImg   = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');

  document.querySelectorAll('.gallery-item').forEach(function (item) {
    item.addEventListener('click', function () {
      var src = item.dataset.src;
      if (!src) return;
      lightboxImg.src = src;
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
  });

  // ─── RSVP FORM + WISHES WALL ────────────────────────────────
  var rsvpForm   = document.getElementById('rsvpForm');
  var wishesWall = document.getElementById('wishesWall');
  var WISHES_KEY = 'weddingWishes_rizkaSolace';

  function renderWishes() {
    var stored = [];
    try { stored = JSON.parse(localStorage.getItem(WISHES_KEY)) || []; } catch (e) { stored = []; }

    if (stored.length === 0) {
      wishesWall.innerHTML = '<p style="text-align:center;color:var(--muted);font-size:0.85rem;padding:1rem;">No messages yet. Be the first! 🌸</p>';
      return;
    }

    wishesWall.innerHTML = stored.slice().reverse().map(function (w) {
      return '<div class="wish-card">' +
        '<div class="wish-name">' + escapeHtml(w.name) + '</div>' +
        (w.message ? '<div class="wish-text">' + escapeHtml(w.message) + '</div>' : '') +
        '<div class="wish-attendance">' + escapeHtml(w.attendance) + '</div>' +
        '</div>';
    }).join('');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  renderWishes();

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (e) {
      // Save wish to localStorage (works offline; Formspree handles real submission)
      var name       = (rsvpForm.querySelector('#rsvp-name').value || '').trim();
      var attendance = (rsvpForm.querySelector('input[name="attendance"]:checked') || {}).value || '';
      var message    = (rsvpForm.querySelector('#rsvp-message').value || '').trim();

      if (name) {
        var stored = [];
        try { stored = JSON.parse(localStorage.getItem(WISHES_KEY)) || []; } catch (err) { stored = []; }
        stored.push({ name: name, attendance: attendance, message: message, time: Date.now() });
        // Keep at most 50 wishes in localStorage
        if (stored.length > 50) stored = stored.slice(stored.length - 50);
        try { localStorage.setItem(WISHES_KEY, JSON.stringify(stored)); } catch (err) { /* storage full */ }
        renderWishes();
      }

      // If Formspree is not configured, prevent default to avoid error page
      var action = rsvpForm.getAttribute('action') || '';
      if (action.includes('YOUR_FORM_ID')) {
        e.preventDefault();
        rsvpForm.reset();
        showToast('Your message has been saved! 🌸');
      }
      // If real Formspree ID is set, let form submit normally
    });
  }

  // ─── TOAST NOTIFICATION ─────────────────────────────────────
  function showToast(message) {
    var toast = document.createElement('div');
    toast.textContent = message;
    Object.assign(toast.style, {
      position:     'fixed',
      bottom:       '5rem',
      left:         '50%',
      transform:    'translateX(-50%)',
      background:   'var(--dark)',
      color:        'var(--white)',
      padding:      '0.75rem 1.5rem',
      borderRadius: '2rem',
      fontSize:     '0.85rem',
      fontFamily:   'var(--font-sans)',
      zIndex:       '9999',
      boxShadow:    '0 4px 16px rgba(0,0,0,0.25)',
      opacity:      '0',
      transition:   'opacity 0.3s ease',
      whiteSpace:   'nowrap',
      pointerEvents:'none',
    });
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.style.opacity = '1'; });
    setTimeout(function () {
      toast.style.opacity = '0';
      setTimeout(function () { toast.remove(); }, 400);
    }, 3000);
  }

})();

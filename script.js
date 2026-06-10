/* ============================================
   LA HAUT Energy — script.js
   Interactions : popup, confettis, navbar,
   scroll reveal, compteurs, burger menu
============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── POPUP ─────────────────────────────── */
  const overlay = document.getElementById('popup-overlay');
  const btnYes  = document.getElementById('btn-yes');
  const btnNo   = document.getElementById('btn-no');

  // Show only once per session
  if (!sessionStorage.getItem('popup-dismissed')) {
    overlay.classList.remove('hidden');

    // ── Bouton "Non" qui fuit ──
    let noW, noH, containerRect;

    function getMetrics() {
      noW  = btnNo.offsetWidth;
      noH  = btnNo.offsetHeight;
      containerRect = overlay.getBoundingClientRect();
    }
    getMetrics();

    // Positionner le bouton "Non" initialement
    btnNo.style.position = 'fixed';
    const initialRect = btnNo.getBoundingClientRect();
    btnNo.style.left = initialRect.left + 'px';
    btnNo.style.top  = initialRect.top  + 'px';

    function escapeFrom(cursorX, cursorY) {
      getMetrics();
      const margin = 20;
      const maxX   = window.innerWidth  - noW  - margin;
      const maxY   = window.innerHeight - noH  - margin;

      // Direction opposée au curseur
      const btnCx = parseFloat(btnNo.style.left) + noW / 2;
      const btnCy = parseFloat(btnNo.style.top)  + noH / 2;
      const dx = btnCx - cursorX;
      const dy = btnCy - cursorY;
      const dist = Math.sqrt(dx*dx + dy*dy) || 1;

      let nx = parseFloat(btnNo.style.left) + (dx / dist) * 160;
      let ny = parseFloat(btnNo.style.top)  + (dy / dist) * 160;

      // Rester dans la fenêtre
      nx = Math.max(margin, Math.min(maxX, nx));
      ny = Math.max(margin, Math.min(maxY, ny));

      // Anti-collision : si proche du bord, choisir coin opposé
      if (nx <= margin + 5 || nx >= maxX - 5 || ny <= margin + 5 || ny >= maxY - 5) {
        nx = Math.random() * (maxX - margin*2) + margin;
        ny = Math.random() * (maxY - margin*2) + margin;
      }

      btnNo.style.left = nx + 'px';
      btnNo.style.top  = ny + 'px';
    }

    // Mouse
    document.addEventListener('mousemove', (e) => {
      const rect = btnNo.getBoundingClientRect();
      const dist = Math.hypot(
        e.clientX - (rect.left + rect.width/2),
        e.clientY - (rect.top  + rect.height/2)
      );
      if (dist < 120) escapeFrom(e.clientX, e.clientY);
    });

    // Touch (mobile)
    document.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      const rect = btnNo.getBoundingClientRect();
      const dist = Math.hypot(
        t.clientX - (rect.left + rect.width/2),
        t.clientY - (rect.top  + rect.height/2)
      );
      if (dist < 140) escapeFrom(t.clientX, t.clientY);
    }, { passive: true });

    btnNo.addEventListener('click', () => {
      escapeFrom(
        parseFloat(btnNo.style.left) + noW / 2,
        parseFloat(btnNo.style.top)  + noH / 2
      );
    });
  }

  // Bouton "Oui"
  btnYes.addEventListener('click', () => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity .4s ease';
    setTimeout(() => {
      overlay.classList.add('hidden');
      sessionStorage.setItem('popup-dismissed', '1');
    }, 400);
    launchConfetti();
  });

  /* ─── CONFETTIS ──────────────────────────── */
  function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#0066CC','#38B000','#FFD700','#FF6B6B','#A8EDEA','#FFFFFF'];
    const particles = [];

    for (let i = 0; i < 160; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 200,
        r: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - .5) * 6,
        vy: Math.random() * 5 + 2,
        angle: Math.random() * Math.PI * 2,
        angV: (Math.random() - .5) * .2,
        shape: Math.random() > .5 ? 'rect' : 'circle'
      });
    }

    let frame;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r*.6);
        else { ctx.beginPath(); ctx.arc(0, 0, p.r/2, 0, Math.PI*2); ctx.fill(); }
        ctx.restore();
        p.x += p.vx; p.y += p.vy;
        p.angle += p.angV;
        p.vy += .08; // gravity
      });

      const stillAlive = particles.some(p => p.y < canvas.height + 20);
      if (stillAlive) frame = requestAnimationFrame(draw);
      else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
        cancelAnimationFrame(frame);
      }
    }
    draw();
  }

  /* ─── NAVBAR ─────────────────────────────── */
  const navbar  = document.getElementById('navbar');
  const burger  = document.querySelector('.nav-burger');
  const navMenu = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else                      navbar.classList.remove('scrolled');
    updateActiveLink();
  }, { passive: true });

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navMenu.classList.toggle('open');
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
  });

  navMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active link highlight
  const sections = document.querySelectorAll('section[id]');
  function updateActiveLink() {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 100) current = s.id;
    });
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  /* ─── SCROLL REVEAL ─────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const observer  = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: .15, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach(el => observer.observe(el));

  /* ─── COMPTEURS ANIMÉS ───────────────────── */
  const counters = document.querySelectorAll('[data-count]');
  const countObserver = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); countObserver.unobserve(e.target); } }),
    { threshold: .5 }
  );
  counters.forEach(c => countObserver.observe(c));

  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const duration = 2000;
    const start  = performance.now();
    const suffix = el.dataset.suffix || '';

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(ease * target);
      el.querySelector('.count-num').textContent = value;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ─── FORMULAIRE ─────────────────────────── */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      btn.textContent = '✅ Message envoyé !';
      btn.style.background = 'linear-gradient(135deg, #38B000, #2a8600)';
      setTimeout(() => {
        btn.innerHTML = '🚀 Envoyer le message';
        btn.style.background = '';
        form.reset();
      }, 3000);
    });
  }

  /* ─── PARALLAXE LÉGÈRE SUR LE HERO ──────── */
  const heroSection = document.getElementById('hero');
  document.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight && heroSection) {
      heroSection.style.setProperty('--parallax', scrolled * .3 + 'px');
    }
  }, { passive: true });

  /* ─── PARTICLES HERO ─────────────────────── */
  createParticles();
  function createParticles() {
    const container = document.querySelector('.hero-particles');
    if (!container) return;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 10 + 4;
      p.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random()*100}%;
        top:${Math.random()*100}%;
        opacity:${Math.random()*.6+.2};
        animation-duration:${Math.random()*4+3}s;
        animation-delay:${Math.random()*3}s;
      `;
      container.appendChild(p);
    }
  }

});

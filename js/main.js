/* ============================================================
   SarcoOS — Main JavaScript
   Author: Ziad Mohammed Fathy
   ============================================================ */

(function () {
  'use strict';

  // ==================== PARTICLE CANVAS ====================
  function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = 0;
    let mouseY = 0;
    let animationId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticles(count) {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.1,
          hue: Math.random() > 0.5 ? 190 : 45,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const density = Math.min(1, canvas.width / 1920);

      particles.forEach((p) => {
        p.x += p.vx * density;
        p.y += p.vy * density;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.vx -= dx / dist * 0.005;
          p.vy -= dy / dist * 0.005;
        }

        p.vx *= 0.999;
        p.vy *= 0.999;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${p.opacity})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    }

    function onMouseMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    function onTouchMove(e) {
      if (e.touches[0]) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      }
    }

    resize();
    createParticles(Math.min(120, Math.floor(canvas.width / 16)));
    draw();

    window.addEventListener('resize', () => {
      resize();
      createParticles(Math.min(120, Math.floor(canvas.width / 16)));
    });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }

  // ==================== NAVBAR ====================
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    const navLinkEls = document.querySelectorAll('.nav-link');

    function updateNav() {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    function toggleMenu() {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
      document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
    }

    function closeMenu() {
      toggle.classList.remove('active');
      links.classList.remove('open');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', toggleMenu);
    navLinkEls.forEach((link) => link.addEventListener('click', closeMenu));

    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();

    // Active link highlight
    function highlightActive() {
      const sections = document.querySelectorAll('section[id]');
      let current = '';

      sections.forEach((section) => {
        const top = section.offsetTop - 150;
        const bottom = top + section.offsetHeight;
        if (window.scrollY >= top && window.scrollY < bottom) {
          current = section.getAttribute('id');
        }
      });

      navLinkEls.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
      });
    }

    window.addEventListener('scroll', highlightActive, { passive: true });
    highlightActive();
  }

  // ==================== SCROLL ANIMATIONS (AOS-style) ====================
  function initScrollAnimations() {
    const els = document.querySelectorAll('[data-aos]');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('aos-animate');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );

      els.forEach((el) => observer.observe(el));
    } else {
      els.forEach((el) => el.classList.add('aos-animate'));
    }
  }

  // ==================== COUNTER ANIMATION ====================
  function initCounters() {
    const selectors = ['.stat-num', '.stats-banner-num'];
    let allCounters = [];
    selectors.forEach((s) => {
      document.querySelectorAll(s).forEach((c) => allCounters.push(c));
    });

    if (!allCounters.length) return;

    function animateCounter(el) {
      const target = parseInt(el.dataset.count, 10);
      if (!target) { el.textContent = el.dataset.count || '0'; return; }
      const duration = 1500;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
    }

    if (!('IntersectionObserver' in window)) {
      allCounters.forEach((c) => { c.textContent = c.dataset.count || '0'; });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -20px 0px' }
    );

    allCounters.forEach((c) => observer.observe(c));

    // Hero counters are visible immediately — start them after preloader
    setTimeout(() => {
      document.querySelectorAll('.hero-stats .stat-num, .hero-stats .stats-banner-num').forEach((c) => {
        if (c.textContent === '0' || c.textContent === '') {
          animateCounter(c);
        }
      });
    }, 2800);

    // Fallback: if counters still show 0 after 5s (or after preloader), force-set them
    function forceCounters() {
      allCounters.forEach((c) => {
        if (c.textContent === '0' || c.textContent === '') {
          c.textContent = c.dataset.count || '0';
        }
      });
    }
    setTimeout(forceCounters, 5000);
    // Also try again shortly after preloader hides (preloader hides ~2.5s in)
    setTimeout(forceCounters, 3500);
  }

  // ==================== SMOOTH SCROLL FOR ANCHOR LINKS ====================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ==================== PARALLAX ON HERO ====================
  function initParallax() {
    const hero = document.querySelector('.hero-content');
    if (!hero) return;

    let ticking = false;

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            const opacity = Math.max(0, 1 - scrollY / 600);
            const transform = scrollY * 0.4;

            hero.style.opacity = opacity;
            hero.style.transform = `translateY(${transform}px)`;
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  // ==================== TYPING EFFECT FOR SUBTITLE ====================
  function initTypingEffect() {
    const subtitle = document.querySelector('.hero-subtitle');
    if (!subtitle) return;

    const text = subtitle.textContent;
    subtitle.textContent = '';
    subtitle.style.visibility = 'visible';

    let i = 0;
    const speed = 25;

    function type() {
      if (i < text.length) {
        subtitle.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }

    setTimeout(type, 800);
  }

  // ==================== PRELOADER ====================
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    const fill = document.querySelector('.preloader-fill');
    const text = document.querySelector('.preloader-text');
    if (!preloader) return;

    let progress = 0;
    const messages = [
      'Initializing SarcoOS...',
      'Loading modules...',
      'Calibrating sensors...',
      'Establishing MQTT link...',
      'Ready!'
    ];

    function updatePreloader() {
      progress += Math.random() * 15 + 5;
      if (progress > 100) progress = 100;
      fill.style.width = progress + '%';

      const msgIdx = Math.min(Math.floor(progress / 25), messages.length - 1);
      text.textContent = messages[msgIdx];

      if (progress < 100) {
        setTimeout(updatePreloader, 150 + Math.random() * 200);
      } else {
        setTimeout(() => preloader.classList.add('hidden'), 300);
        document.body.style.overflow = '';
      }
    }

    document.body.style.overflow = 'hidden';
    setTimeout(updatePreloader, 400);
  }

  // ==================== PROGRESS BAR ====================
  function initProgressBar() {
    const bar = document.getElementById('progressBar');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      bar.style.width = scrollPercent + '%';
    }, { passive: true });
  }

  // ==================== BACK TO TOP ====================
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==================== GALLERY LIGHTBOX ====================
  function initGallery() {
    const items = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.querySelector('.lightbox-close');
    if (!items.length || !lightbox) return;

    items.forEach((item) => {
      item.addEventListener('click', () => {
        const src = item.dataset.img || item.querySelector('img').src;
        lightboxImg.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  // ==================== TIMELINE ANIMATION ====================
  function initTimeline() {
    const items = document.querySelectorAll('.timeline-item');
    if (!items.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateX(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      item.style.transition = `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`;
      observer.observe(item);
    });
  }

  // ==================== FOOTER YEAR ====================
  function initFooterYear() {
    const yearEls = document.querySelectorAll('.footer-bottom p:first-child');
    yearEls.forEach((el) => {
      el.textContent = el.textContent.replace('2026', new Date().getFullYear());
    });
  }

  // ==================== INIT ====================
  function init() {
    initPreloader();
    initParticles();
    initNavbar();
    initScrollAnimations();
    initCounters();
    initSmoothScroll();
    initParallax();
    initTypingEffect();
    initProgressBar();
    initBackToTop();
    initGallery();
    initTimeline();
    initFooterYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

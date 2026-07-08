/* ==========================================================================
   MOTO REFACCIONES GAEL — Interacciones de la landing page
   Sin dependencias externas: nav móvil, header dinámico, scroll reveal,
   link activo por sección, botón "volver arriba" y formulario -> WhatsApp.
   ========================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WHATSAPP_NUMBER = '525641131906';

  /* Habilita las animaciones de scroll-reveal solo si JS corre de verdad;
     sin esta clase, .reveal permanece visible (ver styles.css). */
  if (!prefersReducedMotion) {
    document.documentElement.classList.add('js-reveal');
  }

  /* ---------- Pantalla de carga ---------- */
  var preloader = document.getElementById('preloader');
  if (preloader) {
    document.documentElement.classList.add('is-loading');
    var preloaderStart = Date.now();
    var MIN_PRELOADER_TIME = 600;

    var hidePreloader = function () {
      var elapsed = Date.now() - preloaderStart;
      var wait = Math.max(0, MIN_PRELOADER_TIME - elapsed);
      setTimeout(function () {
        preloader.classList.add('is-hidden');
        document.documentElement.classList.remove('is-loading');
        setTimeout(function () {
          if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
        }, 700);
      }, wait);
    };

    if (document.readyState === 'complete') {
      hidePreloader();
    } else {
      window.addEventListener('load', hidePreloader);
    }
  }

  /* ---------- Header height -> CSS var (mantiene el scroll-padding exacto) ---------- */
  var header = document.getElementById('header');

  function syncHeaderHeight() {
    if (!header) return;
    document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
  }
  syncHeaderHeight();
  window.addEventListener('resize', debounce(syncHeaderHeight, 150));

  /* ---------- Header: estado "scrolled" ---------- */
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  onScrollHeader();
  document.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- Navegación móvil ---------- */
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  var navOverlay = document.getElementById('navOverlay');

  function openNav() {
    nav.classList.add('is-open');
    navOverlay.classList.add('is-visible');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeNav() {
    nav.classList.remove('is-open');
    navOverlay.classList.remove('is-visible');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (navToggle && nav && navOverlay) {
    navToggle.addEventListener('click', function () {
      var isOpen = nav.classList.contains('is-open');
      isOpen ? closeNav() : openNav();
    });
    navOverlay.addEventListener('click', closeNav);
    nav.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ---------- Link activo según sección visible ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            var match = link.getAttribute('href') === '#' + id;
            link.classList.toggle('is-active', match);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (revealEls.length) {
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      var revealObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
      );
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  /* ---------- Partículas del hero ---------- */
  var particlesCanvas = document.getElementById('heroParticles');
  if (particlesCanvas && particlesCanvas.getContext && !prefersReducedMotion) {
    var pCtx = particlesCanvas.getContext('2d');
    var heroEl = particlesCanvas.closest('.hero');

    if (heroEl) {
      var particles = [];
      var pWidth = 0, pHeight = 0, pDpr = 1, pRunning = true, pFrame = null;

      var pTime = 0;

      var makeParticle = function () {
        return {
          x: Math.random() * pWidth,
          y: Math.random() * pHeight,
          r: Math.random() * 1.8 + 1,
          vx: (Math.random() - .5) * .16,
          vy: -Math.random() * .22 - .04,
          baseAlpha: Math.random() * .4 + .4,
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * .02 + .012
        };
      };

      var resizeParticles = function () {
        pDpr = window.devicePixelRatio || 1;
        pWidth = heroEl.offsetWidth;
        pHeight = heroEl.offsetHeight;
        particlesCanvas.width = pWidth * pDpr;
        particlesCanvas.height = pHeight * pDpr;
        particlesCanvas.style.width = pWidth + 'px';
        particlesCanvas.style.height = pHeight + 'px';
        pCtx.setTransform(pDpr, 0, 0, pDpr, 0, 0);
        var count = Math.max(50, Math.min(140, Math.round((pWidth * pHeight) / 8500)));
        particles = [];
        for (var i = 0; i < count; i++) particles.push(makeParticle());
      };

      var stepParticles = function () {
        if (!pRunning) return;
        pTime++;
        pCtx.clearRect(0, 0, pWidth, pHeight);
        particles.forEach(function (p) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -8) { p.y = pHeight + 8; p.x = Math.random() * pWidth; }
          if (p.x < -8) p.x = pWidth + 8;
          if (p.x > pWidth + 8) p.x = -8;

          var pulse = (Math.sin(pTime * p.pulseSpeed + p.phase) + 1) / 2;
          var radius = p.r * (.55 + pulse * .9);
          var alpha = p.baseAlpha * (.35 + pulse * .65);

          pCtx.beginPath();
          pCtx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          pCtx.fillStyle = 'rgba(140, 197, 255, ' + alpha.toFixed(3) + ')';
          pCtx.shadowColor = 'rgba(120, 185, 255, ' + (alpha * .8).toFixed(3) + ')';
          pCtx.shadowBlur = 4 + pulse * 7;
          pCtx.fill();
        });
        pCtx.shadowBlur = 0;
        pFrame = window.requestAnimationFrame(stepParticles);
      };

      resizeParticles();
      pFrame = window.requestAnimationFrame(stepParticles);
      window.addEventListener('resize', debounce(resizeParticles, 200));
      document.addEventListener('visibilitychange', function () {
        pRunning = document.visibilityState === 'visible';
        if (pRunning && !pFrame) pFrame = window.requestAnimationFrame(stepParticles);
      });
    }
  }

  /* ---------- Efecto de máquina de escribir en el título del hero ---------- */
  var typewriterEl = document.getElementById('heroTypewriter');
  if (typewriterEl && !prefersReducedMotion) {
    var twWords = ['lo vale!', 'lo merece!', 'nos importa!'];
    var twIndex = 0;
    var twCaret = document.createElement('span');
    twCaret.className = 'hero__caret';
    twCaret.setAttribute('aria-hidden', 'true');
    typewriterEl.textContent = '';
    typewriterEl.parentNode.insertBefore(twCaret, typewriterEl.nextSibling);

    var twType = function (charIndex) {
      var word = twWords[twIndex];
      typewriterEl.textContent = word.slice(0, charIndex);
      if (charIndex < word.length) {
        setTimeout(function () { twType(charIndex + 1); }, 85);
      } else {
        setTimeout(function () { twErase(word.length); }, 1600);
      }
    };

    var twErase = function (charIndex) {
      typewriterEl.textContent = twWords[twIndex].slice(0, charIndex);
      if (charIndex > 0) {
        setTimeout(function () { twErase(charIndex - 1); }, 40);
      } else {
        twIndex = (twIndex + 1) % twWords.length;
        setTimeout(function () { twType(0); }, 350);
      }
    };

    setTimeout(function () { twType(0); }, 550);
  }

  /* ---------- Botón volver arriba ---------- */
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    document.addEventListener(
      'scroll',
      debounce(function () {
        backToTop.classList.toggle('is-visible', window.scrollY > 700);
      }, 100),
      { passive: true }
    );
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Formulario de cotización -> WhatsApp ---------- */
  var quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('qfName').value.trim();
      var phone = document.getElementById('qfPhone').value.trim();
      var category = document.getElementById('qfCategory').value;
      var message = document.getElementById('qfMessage').value.trim();

      var lines = ['Hola, soy ' + name + '.'];
      if (category) lines.push('Me interesa: ' + category + '.');
      if (message) lines.push(message);
      lines.push('Mi teléfono es ' + phone + '.');

      var text = encodeURIComponent(lines.join(' '));
      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + text;
      window.open(url, '_blank', 'noopener');
    });
  }

  /* ---------- Año dinámico en el footer ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Utils ---------- */
  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      var args = arguments;
      var ctx = this;
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }
})();

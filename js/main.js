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

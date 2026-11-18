// Весь интерактив сайта. Каждый блок проверяет, что нужные элементы есть на странице.
(function () {
  'use strict';

  // ── Год в футере ──────────────────────────────────────────────────────────
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  // ── Мобильное меню в шапке ────────────────────────────────────────────────
  var menuToggle = document.getElementById('menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      var hidden = mobileMenu.classList.toggle('hidden');
      menuToggle.setAttribute('aria-expanded', String(!hidden));
    });
  }

  // ── Бургер на главной (мобильная версия) ──────────────────────────────────
  var burger = document.getElementById('burger');
  var burgerMenu = document.getElementById('burger-menu');
  var burgerClose = document.getElementById('burger-close');
  if (burger && burgerMenu) {
    burger.addEventListener('click', function () { burgerMenu.classList.remove('hidden'); });
    if (burgerClose) burgerClose.addEventListener('click', function () { burgerMenu.classList.add('hidden'); });
  }

  // ── Общие правила для <dialog>: закрытие по кнопке и по клику на фон ──────
  function wireDialog(dialog, onClose) {
    dialog.querySelectorAll('[data-dialog-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { dialog.close(); });
    });
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', function () {
      document.body.style.overflow = '';
      if (onClose) onClose();
    });
  }

  function openDialog(dialog) {
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  }

  // ── «Записаться» / «Хочу получить» → окно с контактом в Telegram ─────────
  var contact = document.getElementById('contact-dialog');
  if (contact) {
    var title = contact.querySelector('[data-contact-title]');
    var product = contact.querySelector('[data-contact-product]');
    var text = contact.querySelector('[data-contact-text]');
    wireDialog(contact);

    document.querySelectorAll('[data-contact]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var productTitle = btn.getAttribute('data-product');
        if (productTitle) {
          title.textContent = 'Получить материал';
          product.textContent = '«' + productTitle + '»';
          product.classList.remove('hidden');
          text.textContent = 'Чтобы получить материал, напишите мне в Telegram — расскажу, как оплатить и получить его.';
        } else {
          title.textContent = 'Записаться на консультацию';
          product.classList.add('hidden');
          text.textContent = 'Чтобы записаться, напишите мне в Telegram — отвечу и подберём удобное время.';
        }
        if (mobileMenu) mobileMenu.classList.add('hidden');
        openDialog(contact);
      });
    });
  }

  // ── Просмотр дипломов (страница «Обо мне») ────────────────────────────────
  var diploma = document.getElementById('diploma-dialog');
  if (diploma) {
    var diplomaImg = diploma.querySelector('[data-diploma-img]');
    wireDialog(diploma, function () { diplomaImg.removeAttribute('src'); });

    document.querySelectorAll('[data-diploma]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        diplomaImg.src = btn.getAttribute('data-diploma');
        openDialog(diploma);
      });
    });
  }

  // ── Оглавление с подсветкой текущего раздела (страница «Обо мне») ────────
  var desktopLinks = document.querySelectorAll('[data-toc-link]');
  var mobileLinks = document.querySelectorAll('[data-toc-mobile-link]');
  if ((desktopLinks.length || mobileLinks.length) && 'IntersectionObserver' in window) {
    var activate = function (href) {
      desktopLinks.forEach(function (l) {
        var active = l.getAttribute('href') === href;
        l.classList.toggle('text-beige-700', active);
        l.classList.toggle('font-medium', active);
        l.classList.toggle('text-gray-400', !active);
      });
      mobileLinks.forEach(function (l) {
        var active = l.getAttribute('href') === href;
        l.classList.toggle('bg-beige-100', active);
        l.classList.toggle('text-beige-700', active);
        l.classList.toggle('font-medium', active);
        l.classList.toggle('text-gray-500', !active);
        if (active && l.offsetParent !== null) {
          l.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) activate('#' + entry.target.id);
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    ['about', 'requests', 'how', 'formats', 'education', 'reviews', 'experience'].forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    activate('#about');
  }

  // ── Видео-виджет в углу (страница «Обо мне») ─────────────────────────────
  var vwWrapper = document.getElementById('vw-wrapper');
  var vwContainer = document.getElementById('vw-container');
  var vwVideo = document.getElementById('vw-video');
  var vwClose = document.getElementById('vw-close');
  var vwIconClose = document.getElementById('vw-icon-close');
  var vwIconCollapse = document.getElementById('vw-icon-collapse');
  if (vwWrapper && vwContainer && vwVideo && vwClose) {
    var expanded = false;

    var collapse = function () {
      expanded = false;
      vwContainer.classList.remove('is-expanded');
      vwVideo.muted = true;
      vwVideo.loop = true;
      vwVideo.play();
      vwIconClose.classList.remove('hidden');
      vwIconCollapse.classList.add('hidden');
    };

    var expand = function () {
      expanded = true;
      vwContainer.classList.add('is-expanded');
      vwVideo.muted = false;
      vwVideo.loop = false;
      vwVideo.currentTime = 0;
      vwVideo.play();
      vwIconClose.classList.add('hidden');
      vwIconCollapse.classList.remove('hidden');
    };

    vwContainer.addEventListener('click', function (e) {
      if (vwClose.contains(e.target)) return;
      if (expanded) collapse(); else expand();
    });

    vwClose.addEventListener('click', function () {
      if (expanded) {
        collapse();
      } else {
        vwVideo.pause();
        vwWrapper.classList.add('hidden');
      }
    });
  }

  // ── Calendly → событие в GTM при успешной записи (лендинг /podrostki) ────
  if (document.querySelector('.calendly-inline-widget')) {
    window.addEventListener('message', function (e) {
      if (e.origin !== 'https://calendly.com') return;
      var data = e.data;
      if (data && data.event === 'calendly.event_scheduled') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'calendly_booking',
          calendly_event_name: (data.payload && data.payload.event_type && data.payload.event_type.name) || '',
        });
      }
    });
  }
})();

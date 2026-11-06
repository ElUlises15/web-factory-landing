'use strict';
(() => {
  const $ = s => document.querySelector(s);
  const menu = $('#menu');
  const toggle = $('.menu-toggle');
  function closeMenu(returnFocus = false) {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('open', open);
  });
  menu.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu(true); });
  document.addEventListener('click', e => { if (!e.target.closest('.header')) closeMenu(); });
  const wide = matchMedia('(min-width:960px)');
  wide.addEventListener('change', () => closeMenu());
  const header = $('.header');
  const updateHeader = () => header.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    const revealer = new IntersectionObserver((entries, io) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => revealer.observe(el));

    const float = $('.wa-float');
    new IntersectionObserver(([entry]) => float.classList.toggle('is-away', entry.isIntersecting))
      .observe($('.hero'));
  }

  // Enhance the static gallery. Without JS every demo and price stays visible.
  const filters = $('.demo-filters');
  if (filters) {
    const cards = [...document.querySelectorAll('#demos .demo-card')];
    const categories = [...document.querySelectorAll('#demos .demo-cat')];
    const buttons = [...filters.querySelectorAll('[data-filter]')];
    const results = $('.demo-results');
    filters.hidden = false;
    filters.addEventListener('click', event => {
      const button = event.target.closest('[data-filter]');
      if (!button || !filters.contains(button)) return;
      const plan = button.dataset.filter;
      buttons.forEach(chip => chip.setAttribute('aria-pressed', String(chip === button)));
      cards.forEach(card => { card.hidden = plan !== 'todas' && card.dataset.plan !== plan; });
      categories.forEach(category => {
        category.hidden = ![...category.querySelectorAll('.demo-card')].some(card => !card.hidden);
      });
      const count = cards.filter(card => !card.hidden).length;
      const label = { todas: 'todos los planes', basica: 'plan Básica', intermedia: 'plan Intermedia', completa: 'plan Completa' }[plan];
      results.textContent = `${count} ${count === 1 ? 'demo' : 'demos'} · ${label}`;
    });
  }

  const error = message => {
    const el = $('#load-error');
    if (!el) return;
    el.hidden = false;
    const p = document.createElement('p');
    p.textContent = message;
    el.append(p);
  };

  fetch('data/config.json')
    .then(r => { if (!r.ok) throw new Error('config'); return r.json(); })
    .then(config => {
      const wa = text => 'https://wa.me/' + config.waNumber + '?text=' + encodeURIComponent(text);
      document.querySelectorAll('[data-wa]').forEach(a => {
        if (!a.getAttribute('href') || a.getAttribute('href') === '#') {
          a.href = wa('Hola, quiero una web para mi negocio');
        }
      });
      const waDisplay = $('[data-wa-display]');
      if (waDisplay) waDisplay.textContent = 'WhatsApp · ' + config.waDisplay;
      const ig = $('[data-instagram]');
      if (ig) ig.href = config.instagram || '#';
      const area = $('[data-area]');
      if (area) area.textContent = config.area;
      const robots = $('meta[name="robots"]');
      if (robots) robots.content = config.noindex ? 'noindex, nofollow' : 'index, follow';
      if (config.canonical) {
        const can = $('link[rel="canonical"]');
        if (can) can.href = config.canonical;
        const ogUrl = $('meta[property="og:url"]');
        if (ogUrl) ogUrl.content = config.canonical;
        const ogImage = new URL('assets/og.png', config.canonical).href;
        const ogImg = $('meta[property="og:image"]');
        if (ogImg) ogImg.content = ogImage;
        const tw = $('meta[name="twitter:image"]');
        if (tw) tw.content = ogImage;
      }
    })
    .catch(() => error('No pudimos refrescar los datos de contacto. Los botones de WhatsApp de la página siguen activos.'));
})();

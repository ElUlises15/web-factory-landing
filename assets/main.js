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
  const node = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  const money = value => '$' + new Intl.NumberFormat('es-AR').format(value);
  const load = async file => {
    const response = await fetch('data/' + file + '.json');
    if (!response.ok) throw new Error(file);
    return response.json();
  };
  const error = message => {
    const el = $('#load-error'); el.hidden = false;
    el.append(node('p', '', message + ' Si estás abriendo los archivos en tu compu, usá un servidor local. Cloudflare Pages los sirve por HTTPS.'));
  };
  const configPromise = load('config');
  const packagesPromise = load('paquetes');
  const demosPromise = load('demos');
  // Attach handlers immediately so independent failures never become unhandled rejections.
  const results = Promise.allSettled([configPromise, packagesPromise, demosPromise]);
  results.then(([configResult, packageResult, demoResult]) => {
    const config = configResult.status === 'fulfilled' ? configResult.value : null;
    const wa = text => 'https://wa.me/' + config.waNumber + '?text=' + encodeURIComponent(text);
    if (config) {
      document.querySelectorAll('[data-wa]').forEach(a => { a.href = wa('Hola, quiero una web para mi negocio'); });
      $('[data-wa-display]').textContent = 'WhatsApp · ' + config.waDisplay;
      $('[data-instagram]').href = config.instagram || '#';
      $('[data-area]').textContent = config.area;
      $('meta[name="robots"]').content = config.noindex ? 'noindex, nofollow' : 'index, follow';
      $('link[rel="canonical"]').href = config.canonical;
      $('meta[property="og:url"]').content = config.canonical;
      const ogImage = new URL('assets/og.png', config.canonical).href;
      $('meta[property="og:image"]').content = ogImage;
      $('meta[name="twitter:image"]').content = ogImage;
      const schema = JSON.parse($('#service-schema').textContent);
      schema.url = config.canonical; schema.telephone = '+' + config.waNumber;
      $('#service-schema').textContent = JSON.stringify(schema);
    } else error('No pudimos cargar los datos de contacto. Recargá la página para intentarlo de nuevo.');
    if (packageResult.status === 'fulfilled') {
      const packages = packageResult.value;
      const grid = $('#price-grid'); grid.replaceChildren();
      $('[data-starting-price]').textContent = 'Desde ' + money(Math.min(...packages.map(p => p.price)));
      packages.forEach(p => {
        const card = node('article', 'price-card' + (p.featured ? ' featured' : ''));
        if (p.featured) card.append(node('span', 'badge', p.badge));
        card.append(node('h3', '', p.name), node('p', 'subtitle', p.subtitle), node('p', 'price', money(p.price)), node('p', 'maintenance', '+ ' + money(p.maintenance) + '/mes de mantenimiento'));
        const list = node('ul', 'includes');
        p.includes.forEach(item => list.append(node('li', '', item)));
        const button = node('a', 'btn' + (p.featured ? '' : ' btn-outline'), 'Quiero esta');
        button.setAttribute('aria-label', 'Quiero esta: ' + p.name);
        if (config) button.href = wa(p.waText);
        else button.textContent = 'Contacto no disponible';
        card.append(list, node('p', 'days', 'Entrega: ' + p.days), button); grid.append(card);
      });
    } else { $('#price-grid').textContent = 'No pudimos cargar los precios. Probá recargar la página.'; $('[data-starting-price]').textContent = 'Consultá nuestros paquetes'; error('Los paquetes no están disponibles por el momento.'); }
    if (demoResult.status === 'fulfilled') {
      const grid = $('#demo-grid'); grid.replaceChildren();
      demoResult.value.forEach(d => {
        const card = node('article', 'demo-card');
        const visual = node('div', 'demo-image');
        const img = node('img'); img.src = d.image; img.alt = 'Vista de la demo ' + d.name; img.width = 720; img.height = 1465; img.loading = 'lazy'; img.decoding = 'async'; visual.append(img);
        const info = node('div', 'demo-info');
        const link = node('a', '', 'Ver demo ↗'); link.href = d.url; link.target = '_blank'; link.rel = 'noopener'; link.setAttribute('aria-label', 'Ver demo de ' + d.name + ' (abre en otra pestaña)');
        info.append(node('h3', '', d.name), node('p', '', d.rubro), link); card.append(visual, info); grid.append(card);
      });
    } else { $('#demo-grid').textContent = 'No pudimos cargar las demos. Probá recargar la página.'; error('Las demos no están disponibles por el momento.'); }
  }).catch(() => error('No pudimos completar la carga. Recargá la página para intentarlo de nuevo.'));
})();

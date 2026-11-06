// Static gallery: data/demos.json is the source of truth, including prices.
// Run `node scripts/render-demos.mjs` after editing data; --check detects drift.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const demos = JSON.parse(readFileSync(root + 'data/demos.json', 'utf8'));
const plans = {
  'Básica': { id: 'basica', setup: 150000, maint: 30000 },
  'Intermedia': { id: 'intermedia', setup: 280000, maint: 45000 },
  'Completa': { id: 'completa', setup: 450000, maint: 60000 }
};
const categories = ['Clientes', 'Landings', 'Multipágina', 'Webapps', 'Bonus'];
const categoryPlan = { Clientes: 'Intermedia', Landings: 'Básica', Multipágina: 'Intermedia', Webapps: 'Completa', Bonus: 'Completa' };
const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const pesos = n => '$' + new Intl.NumberFormat('es-AR').format(n);
const counts = Object.fromEntries(Object.keys(plans).map(p => [p, demos.filter(d => d.plan === p).length]));
const slugs = new Set();
for (const d of demos) {
  if (!d.plan && categoryPlan[d.category]) d.plan = categoryPlan[d.category];
  const plan = plans[d.plan];
  if (!plan || d.priceSetup !== plan.setup || d.priceMaint !== plan.maint) throw new Error('Invalid plan/prices: ' + d.slug);
  if (slugs.has(d.slug)) throw new Error('Duplicate demo: ' + d.slug);
  slugs.add(d.slug);
  if (!d.url.startsWith('https://')) throw new Error('Invalid URL: ' + d.slug);
}
const card = (d, featured) => `      <article class="demo-card${featured ? ' featured-demo' : ''}" data-plan="${plans[d.plan].id}" data-demo="${escape(d.slug)}">
        <div class="demo-image"><span class="demo-tag">${escape(d.tag)}</span><img src="${escape(d.image)}?v=${d.category === 'Clientes' ? 2 : 1}" alt="Portada de la demo de ${escape(d.name)}" width="960" height="600" loading="lazy" decoding="async"></div>
        <div class="demo-info">
          <h4>${escape(d.name)}</h4>
          <p>${escape(d.description || d.rubro)}</p>
          <div class="demo-plan"><span class="plan-badge plan-badge--${plans[d.plan].id}">${escape(d.plan)}</span><span class="demo-setup">${pesos(d.priceSetup)} <small>de armado</small></span><span class="demo-maint">+ ${pesos(d.priceMaint)}/mes de mantenimiento</span></div>
          <a href="${escape(d.url)}" target="_blank" rel="noopener" aria-label="Ver demo de ${escape(d.name)} (abre en otra pestaña)">Ver demo <span aria-hidden="true">↗</span></a>
        </div>
      </article>`;
const html = `<section class="section demos-section" id="demos" aria-labelledby="demos-title"><div class="wrap">
  <div class="section-heading split" data-reveal><h2 id="demos-title">Así puede verse tu negocio.</h2><p>Landings, sitios multipágina y webapps de muestra. Algunas son propuestas para negocios de la zona; otras, ejemplos de rubro. Son demos con imágenes ilustrativas, no las webs oficiales.</p></div>
  <div class="demo-toolbar">
    <div class="demo-filters" role="group" aria-label="Filtrar demos por plan" hidden>
      <button type="button" class="plan-filter" data-filter="todas" aria-pressed="true">Todas <span>${demos.length}</span></button>
${Object.entries(plans).map(([name, p]) => `      <button type="button" class="plan-filter" data-filter="${p.id}" aria-pressed="false">${name} <span>${counts[name]}</span></button>`).join('\n')}
    </div>
    <p class="demo-plan-note">Precios en pesos. Elegí por plan y compará con tu idea. <a href="#precios">Ver qué incluye cada plan</a></p>
    <p class="demo-results" role="status" aria-live="polite" aria-atomic="true">${demos.length} demos · todos los planes</p>
  </div>
${categories.map((c, i) => `  <section class="demo-cat" aria-labelledby="demo-category-${i}">
    <div class="demo-cat-heading"><h3 class="demo-cat-title" id="demo-category-${i}">${c === 'Clientes' ? 'Negocios de la zona' : c}</h3><p>${({ Clientes: 'Propuestas con identidad propia.', Landings: 'Una página, lo importante a mano.', 'Multipágina': 'Más lugar para contar lo que hacés.', Webapps: 'Herramientas para probar, no solo para mirar.', Bonus: 'Una muestra de lo que se puede hacer jugando.' })[c]}</p></div>
    <div class="demo-grid${c === 'Clientes' ? '" id="demo-grid' : ' demo-grid--cat'}">
${demos.filter(d => d.category === c).map((d, index) => card(d, c === 'Clientes' && index === 0)).join('\n')}
    </div>
  </section>`).join('\n')}
</div></section>`;
const path = root + 'index.html';
const before = readFileSync(path, 'utf8');
const after = before.replace(/<section class="section demos-section"[\s\S]*?(?=\s*<section class="section steps-section")/, html);
// Delimit by the next top-level section, not a nested category section.
if (before === after && !before.includes(html)) throw new Error('Gallery section delimiter not found');
if (process.argv.includes('--check')) {
  if (before !== after) throw new Error('Gallery HTML is out of sync; run node scripts/render-demos.mjs');
  console.log('Gallery in sync:', demos.length, 'demos;', counts);
} else { writeFileSync(path, after); console.log('Rendered', demos.length, 'demos;', counts); }

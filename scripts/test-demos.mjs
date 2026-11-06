import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('../', import.meta.url));
const html = readFileSync(root + 'index.html', 'utf8');
const data = JSON.parse(readFileSync(root + 'data/demos.json', 'utf8'));
const noop = () => {};
const el = (dataset = {}) => ({ dataset, hidden: false, attributes: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false }, setAttribute(k, v) { this.attributes[k] = v; }, getAttribute(k) { return this.attributes[k]; }, addEventListener(k, cb) { this[k] = cb; } });
const cards = [...html.matchAll(/<article class="demo-card[^>]*data-plan="([^"]+)" data-demo="([^"]+)">/g)].map(m => el({ plan: m[1], demo: m[2] }));
const categorySlugs = [...new Set(data.map(d => d.category))];
const categories = categorySlugs.map(category => ({ hidden: false, querySelectorAll: () => cards.filter(c => data.find(d => d.slug === c.dataset.demo).category === category) }));
const buttons = ['todas', 'basica', 'intermedia', 'completa'].map(filter => el({ filter }));
const results = el();
const filters = { ...el(), hidden: true, querySelectorAll: () => buttons, contains: b => buttons.includes(b) };
const elements = { '#menu': el(), '.menu-toggle': el(), '.header': el(), '.demo-filters': filters, '.demo-results': results };
const context = {
  document: { querySelector: s => elements[s] || null, querySelectorAll: s => s === '#demos .demo-card' ? cards : s === '#demos .demo-cat' ? categories : [], addEventListener: noop },
  window: {}, matchMedia: () => ({ addEventListener: noop }), addEventListener: noop, scrollY: 0,
  fetch: () => Promise.reject(new Error('Offline test: static gallery remains usable'))
};
vm.runInNewContext(readFileSync(root + 'assets/main.js', 'utf8'), context);
assert.equal(cards.length, 26);
assert.equal(filters.hidden, false);
for (const [plan, count, groups] of [['basica', 5, 1], ['intermedia', 15, 2], ['completa', 6, 2], ['todas', 26, 5]]) {
  const button = buttons.find(b => b.dataset.filter === plan);
  filters.click({ target: { closest: () => button } }); // Also models clicking a count span.
  assert.equal(cards.filter(c => !c.hidden).length, count);
  assert.equal(categories.filter(c => !c.hidden).length, groups);
  assert.equal(button.attributes['aria-pressed'], 'true');
  assert.equal(buttons.filter(b => b.attributes['aria-pressed'] === 'true').length, 1);
  assert.ok(results.textContent.startsWith(`${count} demos · `));
}
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML IDs');
for (const demo of data) {
  const match = html.match(new RegExp(`<article[^>]*data-demo="${demo.slug}">([\\s\\S]*?)<\\/article>`));
  assert.ok(match, demo.slug + ' card missing');
  const card = match[1];
  assert.ok(card.includes(demo.url), 'URL drift: ' + demo.slug);
  assert.ok(card.includes('>' + demo.plan + '</span>'), 'Plan missing: ' + demo.slug);
  for (const price of [demo.priceSetup, demo.priceMaint]) assert.ok(card.includes('$' + new Intl.NumberFormat('es-AR').format(price)), 'Price missing: ' + demo.slug);
  assert.ok(readFileSync(root + demo.image).length > 0, 'Missing thumbnail');
}
assert.match(readFileSync(root + 'robots.txt', 'utf8'), /Allow: \/\s/);
assert.ok(html.includes('complejo-aylen-kit-demo/'));
assert.ok(html.includes('el-origen-eventos-kit-demo/'));
assert.ok(!html.includes('Demo Ulises testing'));
assert.match(html, /class="demo-filters"[^>]*hidden>/, 'Filters hidden until enhanced');
console.log('PASS: 26 static cards, real plan prices, all filters/category collapse, aria states, IDs, assets, kit URLs, robots, offline fallback.');

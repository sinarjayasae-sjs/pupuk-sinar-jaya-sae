import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const config = JSON.parse(await readFile('site.config.json', 'utf8'));
const siteUrl = (process.env.SITE_URL ?? config.siteUrl ?? '').replace(/\/$/, '');
const routes = ['/', '/tentang-kami/', '/produk/', '/produk/sp-36/', '/produk/sjs-multy-blanding/', '/produk/sjs-agrophos/', '/produk/phoska-sjs/', '/produk/sawit-mas-13-6-27-te/', '/produk/golden-premium/', '/solusi/', '/distribusi/', '/artikel/', '/kontak/'];

async function files(dir) { const entries = await readdir(dir, { withFileTypes: true }); return (await Promise.all(entries.map(e => e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]))).flat(); }
const htmlFiles = (await files('public')).filter(f => f.endsWith('.html'));
const failures = [];
const expectedFiles = new Set(routes.map(r => r === '/' ? 'public/index.html' : `public${r}index.html`));
for (const file of htmlFiles) if (!expectedFiles.has(file)) failures.push(`${file}: unexpected or duplicate HTML route`);
for (const file of expectedFiles) if (!htmlFiles.includes(file)) failures.push(`${file}: missing expected clean URL page`);
for (const file of htmlFiles) {
  const content = await readFile(file, 'utf8');
  for (const required of ['<title>', 'name="description"', 'property="og:type"', 'property="og:title"', 'property="og:description"', 'name="twitter:card"', 'application/ld+json', '<main id="konten">', 'class="skip"']) if (!content.includes(required)) failures.push(`${file}: missing ${required}`);
  if ((content.match(/<h1[ >]/g) ?? []).length !== 1) failures.push(`${file}: must contain exactly one h1`);
  if (siteUrl && !content.includes(`rel="canonical" href="${siteUrl}`)) failures.push(`${file}: missing production canonical`);
  if (!siteUrl && content.includes('rel="canonical"')) failures.push(`${file}: canonical requires SITE_URL or site.config.json`);
  if (/target="_blank"(?! rel="noopener")/.test(content)) failures.push(`${file}: target=_blank link missing rel=noopener`);
}
const assets = ['public/logo-sinar-jaya-sae.png','public/SP-36.png','public/sjs-multy-blanding.png','public/sjs-agrophos.jpeg','public/phoska-sjs.png','public/sawit-mas-13-6-27-TE.png','public/golden-premium.png'];
for (const asset of assets) { try { await readFile(asset); } catch { failures.push(`${asset}: missing required original asset`); } }
const sitemap = await readFile('public/sitemap.xml', 'utf8');
const robots = await readFile('public/robots.txt', 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
if (new Set(sitemapUrls).size !== sitemapUrls.length) failures.push('sitemap.xml: duplicate URL');
if (siteUrl) {
  const expectedUrls = routes.map(r => `${siteUrl}${r}`);
  if (sitemapUrls.length !== expectedUrls.length || expectedUrls.some(u => !sitemapUrls.includes(u))) failures.push('sitemap.xml: routes do not match production URL configuration');
  if (!robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) failures.push('robots.txt: missing configured production sitemap URL');
} else if (sitemapUrls.length || /^Sitemap:/m.test(robots)) failures.push('sitemap/robots: requires SITE_URL before publishing production URLs');
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`Validated SEO baseline in ${htmlFiles.length} HTML pages and verified 7 original image assets.`);

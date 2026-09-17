import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const config = JSON.parse(await readFile('site.config.json', 'utf8'));
const siteUrl = (process.env.SITE_URL ?? config.siteUrl ?? '').replace(/\/$/, '');
const routes = ['/', '/tentang-kami/', '/produk/', '/produk/sjs-multy-blanding/', '/produk/sp-36/', '/produk/sjs-agrophos/', '/produk/sawit-mas-13-6-27-te/', '/produk/golden-premium/', '/solusi/', '/distribusi/', '/artikel/', '/kontak/'];

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]))).flat();
}
const htmlFiles = (await files('public')).filter((file) => file.endsWith('.html'));
const failures = [];
const expectedFiles = new Set(routes.map((route) => route === '/' ? 'public/index.html' : `public${route}index.html`));
for (const file of htmlFiles) if (!expectedFiles.has(file)) failures.push(`${file}: unexpected or duplicate HTML route`);
for (const file of expectedFiles) if (!htmlFiles.includes(file)) failures.push(`${file}: missing expected clean URL page`);
for (const file of htmlFiles) {
  const content = await readFile(file, 'utf8');
  for (const required of ['<title>', 'name="description"', 'property="og:type"', 'property="og:title"', 'property="og:description"', 'name="twitter:card"', 'name="twitter:title"', 'name="twitter:description"', 'application/ld+json', '<main id="konten">', 'class="skip"']) {
    if (!content.includes(required)) failures.push(`${file}: missing ${required}`);
  }
  if ((content.match(/<h1[ >]/g) ?? []).length !== 1) failures.push(`${file}: must contain exactly one h1`);
  if (siteUrl && !content.includes(`rel="canonical" href="${siteUrl}`)) failures.push(`${file}: missing production canonical`);
  if (!siteUrl && content.includes('rel="canonical"')) failures.push(`${file}: canonical requires SITE_URL or site.config.json`);
  if (/target="_blank"(?! rel="noopener")/.test(content)) failures.push(`${file}: target=_blank link missing rel=noopener`);
}
const sitemap = await readFile('public/sitemap.xml', 'utf8');
const robots = await readFile('public/robots.txt', 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (new Set(sitemapUrls).size !== sitemapUrls.length) failures.push('sitemap.xml: duplicate URL');
if (siteUrl) {
  const expectedUrls = routes.map((route) => `${siteUrl}${route}`);
  if (sitemapUrls.length !== expectedUrls.length || expectedUrls.some((url) => !sitemapUrls.includes(url))) failures.push('sitemap.xml: routes do not match production URL configuration');
  if (!robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) failures.push('robots.txt: missing configured production sitemap URL');
} else {
  if (sitemapUrls.length) failures.push('sitemap.xml: requires SITE_URL or site.config.json before publishing URLs');
  if (/^Sitemap:/m.test(robots)) failures.push('robots.txt: sitemap URL requires SITE_URL or site.config.json');
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Validated SEO baseline in ${htmlFiles.length} HTML pages.`);

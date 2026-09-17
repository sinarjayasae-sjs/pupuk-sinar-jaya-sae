import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const config = JSON.parse(await readFile('site.config.json', 'utf8'));
const siteUrl = (process.env.SITE_URL ?? config.siteUrl ?? '').replace(/\/$/, '');

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]))).flat();
}
const htmlFiles = (await files('public')).filter((file) => file.endsWith('.html'));
const failures = [];
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
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Validated SEO baseline in ${htmlFiles.length} HTML pages.`);

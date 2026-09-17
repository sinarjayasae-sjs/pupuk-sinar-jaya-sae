import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]))).flat();
}
const htmlFiles = (await files('public')).filter((file) => file.endsWith('.html'));
const failures = [];
for (const file of htmlFiles) {
  const content = await readFile(file, 'utf8');
  for (const required of ['<title>', 'name="description"', 'rel="canonical"', 'application/ld+json']) {
    if (!content.includes(required)) failures.push(`${file}: missing ${required}`);
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Validated SEO baseline in ${htmlFiles.length} HTML pages.`);

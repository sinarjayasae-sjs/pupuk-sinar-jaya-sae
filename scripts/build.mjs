import { cp, mkdir, rm } from 'node:fs/promises';
import './generate-pages.mjs';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('public', 'dist', { recursive: true });
console.log('Built static Cloudflare Pages output in dist/.');

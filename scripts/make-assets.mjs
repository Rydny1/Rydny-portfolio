// One-off asset pipeline. Run: node scripts/make-assets.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const out = 'public/img';
mkdirSync(out, { recursive: true });

async function emit(input, name, { width, height, position = 'centre' }, q = { avif: 50, webp: 72, jpg: 74 }, formats = ['avif', 'webp']) {
  const base = sharp(input).resize({ width, height, fit: 'cover', position, withoutEnlargement: true });
  const jobs = [];
  if (formats.includes('avif')) jobs.push(base.clone().avif({ quality: q.avif, effort: 6 }).toFile(`${out}/${name}.avif`));
  if (formats.includes('webp')) jobs.push(base.clone().webp({ quality: q.webp }).toFile(`${out}/${name}.webp`));
  if (formats.includes('jpg')) jobs.push(base.clone().jpeg({ quality: q.jpg, mozjpeg: true }).toFile(`${out}/${name}.jpg`));
  await Promise.all(jobs);
}

// Poster (LCP): 1600 wide, all three formats
await emit('_brief/assets/wall-light-poster.jpg', 'wall-poster', { width: 1600 }, { avif: 38, webp: 55, jpg: 60 }, ['avif', 'webp', 'jpg']);
await emit('_brief/assets/wall-light-poster.jpg', 'wall-poster-800', { width: 800 }, { avif: 38, webp: 55, jpg: 60 }, ['avif', 'webp', 'jpg']);

// Pre-blurred wall for the scroll blur: opacity is scrubbed, filter is never animated
await sharp('_brief/assets/wall-light-poster.jpg').resize({ width: 800 }).blur(22).webp({ quality: 55 }).toFile(`${out}/wall-blur.webp`);

// Portrait 4:5 (source is 1254 square, so 1003x1254 is the largest honest crop)
const crop = await sharp('_brief/assets/portfolio-picture.png').extract({ left: 125, top: 0, width: 1003, height: 1254 }).toBuffer();
for (const w of [480, 960]) await emit(crop, `portrait-${w}`, { width: w, height: Math.round(w * 1.25) }, { avif: 50, webp: 70, jpg: 74 });

// Project screenshots, native width (no upscaling)
await emit('_brief/old-assets/plateshare-dashboard.png', 'plateshare', { width: 1440 });
await emit('_brief/old-assets/APEX_hompage.webp', 'apex', { width: 1200 });
await emit('_brief/old-assets/ALTAYS_heroimg.webp', 'altays', { width: 1200 });
console.log('done');

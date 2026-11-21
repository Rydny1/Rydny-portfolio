// Builds side-by-side before | after images from _brief/report/before and /after.
import sharp from 'sharp';

const dir = '_brief/report';
for (const name of ['hero', 'about', 'contact', 'footer']) {
  for (const w of [1440, 390]) {
    const scaleW = w === 1440 ? 900 : 390;
    const [a, b] = await Promise.all(
      ['before', 'after'].map(async (k) => {
        const buf = await sharp(`${dir}/${k}/${name}-${w}.png`).resize({ width: scaleW }).png().toBuffer();
        const m = await sharp(buf).metadata();
        return { buf, h: m.height ?? 0 };
      }),
    );
    const H = Math.max(a.h, b.h);
    const gap = 24;
    await sharp({ create: { width: scaleW * 2 + gap, height: H, channels: 3, background: '#888888' } })
      .composite([{ input: a.buf, left: 0, top: 0 }, { input: b.buf, left: scaleW + gap, top: 0 }])
      .png({ compressionLevel: 9 })
      .toFile(`${dir}/compare-${name}-${w}.png`);
  }
}
console.log('compare done');

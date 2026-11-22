// Social card (1200x630) and touch icon, from the wall poster and the portrait.
import sharp from 'sharp';
const W = 1200, H = 630;
const wall = await sharp('_brief/assets/wall-light-poster.jpg').resize(W, H, { fit: 'cover' }).modulate({ brightness: 1.12, saturation: 0.7 }).toBuffer();
const portrait = await sharp('_brief/assets/portfolio-picture.png').resize(300, 375, { fit: 'cover', position: 'top' }).toBuffer();
const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<rect width="${W}" height="${H}" fill="#e8e8e0" fill-opacity=".72"/>
<text x="64" y="100" font-family="Georgia, serif" font-size="34" fill="#1f2023" font-weight="700">Rydny Ihims</text>
<text x="64" y="300" font-family="Georgia, serif" font-size="104" fill="#2e4636" font-weight="700" letter-spacing="-4">Find the problem.</text>
<text x="64" y="420" font-family="Georgia, serif" font-size="104" fill="#2e4636" font-weight="700" font-style="italic" letter-spacing="-4">Build the fix.</text>
<circle cx="745" cy="262" r="9" fill="#e4572e"/>
<text x="64" y="540" font-family="Arial, sans-serif" font-size="30" fill="#1f2023">Software and automation, Riga</text>
</svg>`);
await sharp(wall).composite([{ input: svg }, { input: portrait, left: 836, top: 195 }]).jpeg({ quality: 82 }).toFile('public/og.jpg');
await sharp('_brief/assets/portfolio-picture.png').resize(180, 180, { fit: 'cover', position: 'top' }).png().toFile('public/apple-touch-icon.png');
console.log('og done');

import opentype from 'opentype.js';
import fs from 'node:fs';

const buf = fs.readFileSync('public/assets/fonts/KUNSTLER.TTF');
const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const font = opentype.parse(arrayBuffer);

const fontSize = 180;
const rawPath = font.getPath('Anttonias', 0, 0, fontSize);
const box = rawPath.getBoundingBox();

const padding = 20;
const width = Math.ceil(box.x2 - box.x1 + padding * 2);
const height = Math.ceil(box.y2 - box.y1 + padding * 2);

// Re-render with origin adjusted so the glyphs fit perfectly in the viewBox
const adjustedPath = font.getPath('Anttonias', -box.x1 + padding, -box.y1 + padding, fontSize);
const pathData = adjustedPath.toPathData(2);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="currentColor" aria-label="Anttonias">
  <path d="${pathData}" />
</svg>`;

fs.mkdirSync('public/assets/vectors', { recursive: true });
fs.writeFileSync('public/assets/vectors/anttonias-official-logo.svg', svg);
console.log(`Generated pure mathematical SVG: public/assets/vectors/anttonias-official-logo.svg (${width}x${height})`);

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SIZES = [2560, 1600, 800];

const GALLERY_PHOTOS = [
  { id: 'anttonias-cementerio-01', file: 'public/assets/images/anttonias-cementerio-01.jpg' },
  { id: 'anttonias-cementerio-03', file: 'public/assets/images/anttonias-cementerio-03.jpg' },
  { id: 'anttonias-cementerio-04', file: 'public/assets/images/anttonias-cementerio-04.jpg' },
  { id: 'anttonias-cementerio-103', file: 'public/assets/images/anttonias-cementerio-103.jpg' },
  { id: 'anttonias-debut-rod-659', file: 'public/assets/images/anttonias-debut-rod-659.jpg' }
];

const OUT_DIR = 'public/assets/images/gallery';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function processPhoto(item) {
  console.log(`\n=== Procesando ${item.id} ===`);
  const inputBuffer = fs.readFileSync(item.file);
  const meta = await sharp(inputBuffer).metadata();
  console.log(`Original: ${meta.width}x${meta.height} (${(inputBuffer.length / 1024 / 1024).toFixed(2)} MB)`);

  const isVertical = (meta.height || 0) > (meta.width || 0);

  for (const size of SIZES) {
    // Si la dimensión mayor original es menor que el tamaño objetivo, no agrandar
    const maxDim = Math.max(meta.width || 0, meta.height || 0);
    const targetSize = Math.min(size, maxDim);

    const resizeOpts = isVertical 
      ? { height: targetSize, withoutEnlargement: true, fit: 'inside' }
      : { width: targetSize, withoutEnlargement: true, fit: 'inside' };

    const pipeline = sharp(inputBuffer)
      .rotate() // Respeta orientación EXIF
      .resize(resizeOpts);

    // 1. AVIF (Calidad 85, preservación de grano y contraste)
    const avifPath = path.join(OUT_DIR, `${item.id}-${size}.avif`);
    await pipeline
      .clone()
      .avif({ quality: 85, effort: 6 })
      .toFile(avifPath);
    const avifSize = (fs.statSync(avifPath).size / 1024).toFixed(1);

    // 2. WebP (Calidad 88)
    const webpPath = path.join(OUT_DIR, `${item.id}-${size}.webp`);
    await pipeline
      .clone()
      .webp({ quality: 88, effort: 5 })
      .toFile(webpPath);
    const webpSize = (fs.statSync(webpPath).size / 1024).toFixed(1);

    // 3. JPEG Progresivo optimizado (Fallback universal)
    const jpgPath = path.join(OUT_DIR, `${item.id}-${size}.jpg`);
    await pipeline
      .clone()
      .jpeg({ quality: 86, progressive: true, mozjpeg: true })
      .toFile(jpgPath);
    const jpgSize = (fs.statSync(jpgPath).size / 1024).toFixed(1);

    console.log(`  -> ${size}px: AVIF ${avifSize} KB | WebP ${webpSize} KB | JPG ${jpgSize} KB`);
  }
}

async function run() {
  for (const p of GALLERY_PHOTOS) {
    await processPhoto(p);
  }
  console.log('\n[SUCCESS] Pirámide Retina 2x generada exitosamente en', OUT_DIR);
}

run().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});

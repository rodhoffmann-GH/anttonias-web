import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SIZES = [2560, 1600, 800];

const ALL_PHOTOS = [
  { id: 'photo-01', file: 'raw-masters/anttonias-cementerio-01.jpg', credits: 'FOTOGRAFÍA: CLAUDIA ARDID (2026)', alt: 'Anttonias en el Cementerio General de Recoleta' },
  { id: 'photo-02', file: 'public/assets/images/anttonias-cementerio-03.jpg', credits: 'FOTOGRAFÍA: CLAUDIA ARDID (2026)', alt: 'Antonia Holzapfel en primer plano' },
  { id: 'photo-03', file: 'raw-masters/anttonias-cementerio-04.jpg', credits: 'FOTOGRAFÍA: CLAUDIA ARDID (2026)', alt: 'Banda entre sepulcros y cruces de hierro' },
  { id: 'photo-04', file: 'raw-masters/anttonias-cementerio-103.jpg', credits: 'FOTOGRAFÍA: CLAUDIA ARDID (2026)', alt: 'Detalle de lápidas y perspectiva fúnebre' },
  { id: 'photo-05', file: 'raw-masters/dropbox-image00003.jpg', credits: 'FOTOGRAFÍA: CLAUDIA ARDID (2026)', alt: 'Retrato de banda frente al mausoleo' },
  { id: 'photo-06', file: 'raw-masters/dropbox-5.jpg', credits: 'FOTOGRAFÍA: CLAUDIA ARDID (2026)', alt: 'Guitarras y arquitectura del Cementerio General' },
  { id: 'photo-07', file: 'raw-masters/dropbox-image00005.jpg', credits: 'FOTOGRAFÍA: CLAUDIA ARDID (2026)', alt: 'Perspectiva diagonal entre tumbas' },
  { id: 'photo-08', file: 'raw-masters/dropbox-image00006.jpg', credits: 'FOTOGRAFÍA: CLAUDIA ARDID (2026)', alt: 'Atmósfera de niebla y luz de cementerio' },
  { id: 'photo-09', file: 'raw-masters/dropbox-9.jpg', credits: 'FOTOGRAFÍA: CLAUDIA ARDID (2026)', alt: 'Retrato coral de Anttonias en el pasaje de criptas' },
  { id: 'photo-10', file: 'raw-masters/dropbox-12.jpg', credits: 'FOTOGRAFÍA: CLAUDIA ARDID (2026)', alt: 'Composición fúnebre en blanco y negro' },
  { id: 'photo-11', file: 'public/assets/images/anttonias-debut-rod-659.jpg', credits: 'FOTOGRAFÍA: ROD HOFFMANN', alt: 'Anttonias en vivo - Era debut' }
];

const OUT_DIR = 'public/assets/images/gallery';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function processPhoto(item) {
  // Verificar si ya existen los 3 tamaños en avif, webp y jpg
  const checkFile = path.join(OUT_DIR, `${item.id}-800.webp`);
  if (fs.existsSync(checkFile)) {
    console.log(`[SKIP] ${item.id} ya existe.`);
    return;
  }

  console.log(`\n=== Procesando ${item.id}: ${item.file} ===`);
  const inputBuffer = fs.readFileSync(item.file);
  const meta = await sharp(inputBuffer).metadata();
  console.log(`  Original: ${meta.width}x${meta.height} (${(inputBuffer.length / 1024 / 1024).toFixed(2)} MB)`);

  const isVertical = (meta.height || 0) > (meta.width || 0);

  for (const size of SIZES) {
    const maxDim = Math.max(meta.width || 0, meta.height || 0);
    const targetSize = Math.min(size, maxDim);

    const resizeOpts = isVertical 
      ? { height: targetSize, withoutEnlargement: true, fit: 'inside' }
      : { width: targetSize, withoutEnlargement: true, fit: 'inside' };

    const pipeline = sharp(inputBuffer)
      .rotate()
      .resize(resizeOpts);

    const avifPath = path.join(OUT_DIR, `${item.id}-${size}.avif`);
    await pipeline
      .clone()
      .avif({ quality: 85, effort: 6 })
      .toFile(avifPath);

    const webpPath = path.join(OUT_DIR, `${item.id}-${size}.webp`);
    await pipeline
      .clone()
      .webp({ quality: 88, effort: 5 })
      .toFile(webpPath);

    const jpgPath = path.join(OUT_DIR, `${item.id}-${size}.jpg`);
    await pipeline
      .clone()
      .jpeg({ quality: 86, progressive: true, mozjpeg: true })
      .toFile(jpgPath);

    console.log(`  -> ${size}px listo.`);
  }
}

async function run() {
  for (const p of ALL_PHOTOS) {
    await processPhoto(p);
  }
  console.log('\n[SUCCESS] Pirámide Retina 2x de las 11 fotos generada exitosamente.');
}

run().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});

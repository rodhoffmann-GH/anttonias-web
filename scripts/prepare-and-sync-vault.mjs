import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

// 1. Cargar .env
function loadEnv() {
  const envPath = path.resolve('.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
      }
    }
  });
  return env;
}

const env = loadEnv();
const CJXL_BIN = 'F:/Antigravity/Tools/libjxl/cjxl.exe';
const SOURCE_DIR = 'public/assets/images/gallery';
const STAGING_DIR = 'vault-staging/gallery';

if (!fs.existsSync(STAGING_DIR)) {
  fs.mkdirSync(STAGING_DIR, { recursive: true });
}

console.log('--- 1. PREPARACIÓN DE PIRÁMIDE MULTIFORMATO (JXL, AVIF, WEBP, JPG) ---');

// Copiar archivos existentes y generar JXL
const files = fs.readdirSync(SOURCE_DIR);
console.log(`Encontrados ${files.length} archivos base en ${SOURCE_DIR}`);

for (const file of files) {
  const src = path.join(SOURCE_DIR, file);
  const dest = path.join(STAGING_DIR, file);
  fs.copyFileSync(src, dest);

  // Si es un JPG, generar su correspondiente .jxl si no existe
  if (file.endsWith('.jpg')) {
    const jxlFile = file.replace(/\.jpg$/, '.jxl');
    const jxlDest = path.join(STAGING_DIR, jxlFile);
    if (!fs.existsSync(jxlDest)) {
      try {
        console.log(`[JXL] Codificando ${jxlFile} con cjxl (d=1.0, e=7)...`);
        execFileSync(CJXL_BIN, [src, jxlDest, '--lossless_jpeg=0', '-d', '1.0', '-e', '7', '--quiet']);
      } catch (err) {
        console.error(`Error codificando JXL para ${file}:`, err.message);
      }
    }
  }
}

const stagingFiles = fs.readdirSync(STAGING_DIR);
console.log(`\nTotal de archivos listos en staging: ${stagingFiles.length}`);

// 2. Conectar a Cloudflare R2
console.log('\n--- 2. CONEXIÓN A CLOUDFLARE R2 (anttonias-vault) ---');
const s3 = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = env.R2_BUCKET_NAME || 'anttonias-vault';
const PUBLIC_BASE = env.R2_PUBLIC_URL || 'https://vault-anttonias.rod.cl';

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jxl': return 'image/jxl';
    case '.avif': return 'image/avif';
    case '.webp': return 'image/webp';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    default: return 'application/octet-stream';
  }
}

// Obtener lista existente en R2 para omitir los ya subidos
let existingKeys = new Set();
try {
  let continuationToken = undefined;
  do {
    const listCmd = new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: 'gallery/',
      ContinuationToken: continuationToken,
    });
    const listRes = await s3.send(listCmd);
    if (listRes.Contents) {
      listRes.Contents.forEach(obj => existingKeys.add(obj.Key));
    }
    continuationToken = listRes.NextContinuationToken;
  } while (continuationToken);
  console.log(`Ya existen ${existingKeys.size} objetos en R2.`);
} catch (e) {
  console.log('No se pudo listar R2 previamente:', e.message);
}

const toUpload = stagingFiles.filter(f => !existingKeys.has(`gallery/${f}`));
console.log(`Subiendo ${toUpload.length} archivos nuevos hacia R2 [${BUCKET}/gallery/]...`);

for (const file of toUpload) {
  const filePath = path.join(STAGING_DIR, file);
  const fileBuffer = fs.readFileSync(filePath);
  const mimeType = getMimeType(file);
  const r2Key = `gallery/${file}`;

  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: r2Key,
    Body: fileBuffer,
    ContentType: mimeType,
    CacheControl: 'public, max-age=31536000, immutable',
  });

  await s3.send(cmd);
  process.stdout.write('.');
}

console.log('\n\n✅ Subida a R2 completada exitosamente.');

// 3. Verificación
const listCmd = new ListObjectsV2Command({
  Bucket: BUCKET,
  Prefix: 'gallery/',
});
const listed = await s3.send(listCmd);
console.log(`Total de objetos verificados en R2 [${BUCKET}/gallery/]: ${listed.KeyCount}`);
console.log(`URL Base pública: ${PUBLIC_BASE}/gallery/`);

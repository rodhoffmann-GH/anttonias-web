// scripts/process-and-sync-audio.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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
const WAV_DIR = 'C:/Users/Rod/Desktop/QTRSLM';
const PREVIEW_DIR = 'vault-staging/audio/preview';

if (!fs.existsSync(PREVIEW_DIR)) {
  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
}

const TRACKS = [
  { num: "01", file: "1 Verlos morir.wav", title: "Verlos morir", start: 97, dur: "3:17" },
  { num: "02", file: "2 El dolor.wav", title: "El dolor", start: 19, dur: "3:01" },
  { num: "03", file: "3 Por los siglos de los siglos.wav", title: "Por los siglos de los siglos", start: 93, dur: "3:55" },
  { num: "04", file: "4 Honestidad.wav", title: "Honestidad", start: 45, dur: "3:37" },
  { num: "05", file: "5 Última palabra.wav", title: "Última palabra", start: 231, dur: "4:50" },
  { num: "06", file: "6 Espíritu_.wav", title: "Espíritu", start: 142, dur: "4:31" },
  { num: "07", file: "7 Te obsesionas con sentir.wav", title: "Te obsesionas con sentir", start: 77, dur: "4:04" },
  { num: "08", file: "8 Hoy un ángel disparó.wav", title: "Un ángel disparó", start: 110, dur: "4:06" },
  { num: "09", file: "9 Azul.wav", title: "Azul", start: 43, dur: "2:39" },
  { num: "10", file: "10 Almas contra el tiempo.wav", title: "Almas contra el tiempo", start: 54, dur: "3:07" },
  { num: "11", file: "11 ¿Qué tan romántica será la muerte.wav", title: "¿Qué tan romántica será la muerte?", start: 173, dur: "4:33" }
];

console.log('--- 1. PROCESAMIENTO QUIRÚRGICO DE AUDIOS (15s con Fade In/Out y Loudnorm) ---');

for (const t of TRACKS) {
  const wavPath = path.join(WAV_DIR, t.file);
  const outMp3 = path.join(PREVIEW_DIR, `preview-${t.num}.mp3`);

  if (!fs.existsSync(wavPath)) {
    console.error(`❌ Archivo WAV no encontrado: ${wavPath}`);
    continue;
  }

  console.log(`[FFmpeg] Generando snippet 15s para Track ${t.num}: "${t.title}" (Inicio: ${t.start}s)...`);
  
  // 15 segundos exactos con 0.8s fade in y fade out, normalización EBU R128 (-16 LUFS)
  const filter = 'afade=t=in:ss=0:d=0.8,afade=t=out:st=14.2:d=0.8,loudnorm=I=-16:TP=-1.5:LRA=11';
  
  execFileSync('ffmpeg', [
    '-y',
    '-ss', String(t.start),
    '-t', '15',
    '-i', wavPath,
    '-af', filter,
    '-b:a', '192k',
    outMp3
  ], { stdio: 'ignore' });

  const stats = fs.statSync(outMp3);
  console.log(`  ✓ preview-${t.num}.mp3 listo (${(stats.size / 1024).toFixed(1)} KB)`);
}

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

// Subir previews MP3
console.log(`\nSubiendo 11 previews hacia R2 [${BUCKET}/audio/preview/]...`);
for (const t of TRACKS) {
  const previewPath = path.join(PREVIEW_DIR, `preview-${t.num}.mp3`);
  if (!fs.existsSync(previewPath)) continue;

  const fileBuffer = fs.readFileSync(previewPath);
  const r2Key = `audio/preview/preview-${t.num}.mp3`;

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: r2Key,
    Body: fileBuffer,
    ContentType: 'audio/mpeg',
    CacheControl: 'public, max-age=31536000, immutable',
  }));
  console.log(`  ✓ Subido: ${r2Key} -> ${PUBLIC_BASE}/${r2Key}`);
}

// Subir masters WAV completos como respaldo
console.log(`\nSubiendo 11 masters WAV originales hacia R2 [${BUCKET}/masters/] (Respaldo en frío)...`);
for (const t of TRACKS) {
  const wavPath = path.join(WAV_DIR, t.file);
  if (!fs.existsSync(wavPath)) continue;

  const r2Key = `masters/${t.file}`;
  const fileStream = fs.createReadStream(wavPath);
  const stats = fs.statSync(wavPath);

  console.log(`[R2] Subiendo master: ${t.file} (${(stats.size / (1024 * 1024)).toFixed(1)} MB)...`);
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: r2Key,
    Body: fileStream,
    ContentLength: stats.size,
    ContentType: 'audio/wav',
    CacheControl: 'private, max-age=31536000, immutable',
  }));
  console.log(`  ✓ Respaldado en R2: ${r2Key}`);
}

console.log('\n✅ Proceso de audio y respaldo completado al 100%.');

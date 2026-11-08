// scripts/download-self-hosted-fonts.mjs
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const FONTS_DIR = path.resolve('public/fonts');
if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
  });
}

function downloadBinary(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    });
  });
}

async function main() {
  console.log('--- DESCARGA DE TIPOGRAFÍAS WOFF2 (PILAR 17 VANGUARD) ---');
  const cssUrl = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@300;400;600&family=JetBrains+Mono:wght@300;400;600&display=swap';
  const rawCss = await fetchText(cssUrl);

  // Parsear bloques @font-face
  const blocks = rawCss.split('@font-face').slice(1).map(b => '@font-face' + b);
  let localCss = '';
  let count = 0;

  for (let block of blocks) {
    // Solo latin y latin-ext para mantenerlo ultraligero
    const isLatin = block.includes('/* latin */') || block.includes('/* latin-ext */') || !block.includes('/* ');
    if (!isLatin && (block.includes('cyrillic') || block.includes('greek') || block.includes('vietnamese'))) {
      continue;
    }

    const urlMatch = block.match(/url\((https:\/\/fonts\.gstatic\.com\/[^\)]+)\)/);
    if (!urlMatch) continue;

    const remoteUrl = urlMatch[1];
    const familyMatch = block.match(/font-family:\s*['"]?([^'";]+)['"]?/);
    const weightMatch = block.match(/font-weight:\s*([^;]+);/);
    const familyName = familyMatch ? familyMatch[1].replace(/\s+/g, '') : 'font';
    const weight = weightMatch ? weightMatch[1].trim() : '400';
    const isExt = block.includes('/* latin-ext */') ? '-ext' : '';

    count++;
    const filename = `${familyName.toLowerCase()}-${weight}${isExt}.woff2`;
    const destPath = path.join(FONTS_DIR, filename);

    if (!fs.existsSync(destPath)) {
      console.log(`Descargando ${filename}...`);
      await downloadBinary(remoteUrl, destPath);
    }

    // Reemplazar URL remota por local
    const rewrittenBlock = block.replace(remoteUrl, `/fonts/${filename}`);
    localCss += rewrittenBlock + '\n';
  }

  const cssPath = path.join(FONTS_DIR, 'fonts.css');
  fs.writeFileSync(cssPath, localCss, 'utf8');
  console.log(`✅ ${count} fuentes WOFF2 descargadas y fonts.css generado exitosamente.`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

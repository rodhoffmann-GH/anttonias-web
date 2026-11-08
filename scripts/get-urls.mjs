import { execSync } from 'node:child_process';
import fs from 'node:fs';

fs.mkdirSync('public/assets/video/samples', { recursive: true });

console.log('Fetching stream URLs...');
const urlHonestidad = execSync('py -m yt_dlp --no-check-certificate -f "bestvideo[height<=720]" -g "https://www.youtube.com/watch?v=sDQbBprqsaE"', { encoding: 'utf8' }).trim();
console.log('Got Honestidad URL');

const urlEspiritu = execSync('py -m yt_dlp --no-check-certificate -f "bestvideo[height<=720]" -g "https://www.youtube.com/watch?v=n5TbnH5s3FE"', { encoding: 'utf8' }).trim();
console.log('Got Espiritu URL');

fs.writeFileSync('scripts/stream-urls.json', JSON.stringify({ honestidad: urlHonestidad, espiritu: urlEspiritu }, null, 2));

import { execSync } from 'node:child_process';
import fs from 'node:fs';

const urls = JSON.parse(fs.readFileSync('scripts/stream-urls.json', 'utf8'));

fs.mkdirSync('public/assets/video/samples', { recursive: true });

const times = [10, 30, 60, 90, 120, 150, 180];

console.log('Sampling Honestidad...');
for (const t of times) {
  try {
    execSync(`ffmpeg -y -tls_verify 0 -ss ${t} -i "${urls.honestidad}" -vframes 1 -q:v 3 "public/assets/video/samples/honestidad-${t}.jpg"`, { stdio: 'ignore' });
  } catch (e) {}
}

console.log('Sampling Espiritu...');
for (const t of times) {
  try {
    execSync(`ffmpeg -y -tls_verify 0 -ss ${t} -i "${urls.espiritu}" -vframes 1 -q:v 3 "public/assets/video/samples/espiritu-${t}.jpg"`, { stdio: 'ignore' });
  } catch (e) {}
}

console.log('Done sampling.');

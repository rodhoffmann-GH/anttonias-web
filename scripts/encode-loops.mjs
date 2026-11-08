import { execSync } from 'node:child_process';
import fs from 'node:fs';

const urls = JSON.parse(fs.readFileSync('scripts/stream-urls.json', 'utf8'));

console.log('Encoding loop-honestidad.mp4 (Bosque Blair Witch Project, 55s a 63s)...');
execSync(`ffmpeg -y -tls_verify 0 -ss 55 -t 8 -i "${urls.honestidad}" -an -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,format=yuv420p" -c:v libx264 -b:v 1100k -maxrate 1300k -bufsize 1600k -preset medium -movflags +faststart "public/assets/video/loop-honestidad.mp4"`, { stdio: 'inherit' });
console.log('Honestidad encoded successfully');

console.log('Encoding loop-espiritu.mp4 (Espíritu, 148s a 156s)...');
execSync(`ffmpeg -y -tls_verify 0 -ss 148 -t 8 -i "${urls.espiritu}" -an -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,format=yuv420p" -c:v libx264 -b:v 1100k -maxrate 1300k -bufsize 1600k -preset medium -movflags +faststart "public/assets/video/loop-espiritu.mp4"`, { stdio: 'inherit' });
console.log('Espiritu encoded successfully');

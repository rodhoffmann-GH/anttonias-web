import fs from 'fs';
import potrace from 'potrace';
import sharp from 'sharp';

async function main() {
  const inputPng = 'f:/Antigravity/Anttonias WEB/public/assets/images/anttonias-logo-clean.png';
  const bwJpg = 'f:/Antigravity/Anttonias WEB/public/assets/images/anttonias-logo-bw.jpg';
  const outputPath = 'f:/Antigravity/Anttonias WEB/public/assets/vectors/anttonias-logo.svg';

  // Invert: Text black on white background
  await sharp(inputPng)
    .flatten({ background: { r: 0, g: 0, b: 0 } }) // transparent -> black
    .negate() // white text -> black text, black background -> white background
    .toFile(bwJpg);

  console.log('Created bw inverted image for potrace');

  potrace.trace(bwJpg, {
    color: 'currentColor',
    optCurve: true,
    threshold: 128,
    turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
    turdSize: 4
  }, (err, svg) => {
    if (err) throw err;
    fs.writeFileSync(outputPath, svg);
    console.log('Pure vector SVG written, length:', svg.length);
  });
}

main();

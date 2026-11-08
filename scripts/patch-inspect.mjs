import fs from 'node:fs';

const svg = fs.readFileSync('public/assets/vectors/anttonias-official-logo.svg', 'utf8');
let html = fs.readFileSync('public/inspect.html', 'utf8');

const svgWhite = svg.replace('fill="currentColor"', 'fill="#F0EDE6"');
const svgCobalt = svg.replace('fill="currentColor"', 'fill="#6BA3DB"');
const svgBlood = svg.replace('fill="currentColor"', 'fill="#C44030"');

html = html.replace(
  '<img src="/assets/vectors/anttonias-official-logo.svg" alt="Anttonias Blanco" style="width: 100%; filter: invert(0);" />',
  svgWhite
);
html = html.replace(
  '<img src="/assets/vectors/anttonias-official-logo.svg" alt="Anttonias Azul" style="width: 100%; filter: invert(56%) sepia(48%) saturate(542%) hue-rotate(170deg) brightness(97%) contrast(88%);" />',
  svgCobalt
);
html = html.replace(
  '<img src="/assets/vectors/anttonias-official-logo.svg" alt="Anttonias Sangre" style="width: 100%; filter: invert(28%) sepia(74%) saturate(2220%) hue-rotate(341deg) brightness(85%) contrast(98%);" />',
  svgBlood
);

fs.writeFileSync('public/inspect.html', html);
console.log('inspect.html patched successfully');

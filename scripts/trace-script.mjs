import fs from 'fs';
import potrace from 'potrace';

potrace.trace('f:/Antigravity/Anttonias WEB/public/assets/images/logo-wide-negate.png', {
  color: 'currentColor',
  optCurve: true,
  threshold: 128,
  turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
  turdSize: 6
}, (err, svg) => {
  if (err) throw err;
  fs.writeFileSync('f:/Antigravity/Anttonias WEB/public/assets/vectors/anttonias-script-traced.svg', svg);
  console.log('anttonias-script-traced.svg created, bytes:', svg.length);
});

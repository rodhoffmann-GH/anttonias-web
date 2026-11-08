import sharp from 'sharp';

async function analyzeLogoPixels() {
  const { data, info } = await sharp('f:/Antigravity/Anttonias WEB/public/assets/images/logo-wide-300-1500.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });
    
  console.log('Crop info:', info.width, info.height);

  // Let's create multiple thresholds:
  // 1. High contrast grayscale
  await sharp('f:/Antigravity/Anttonias WEB/public/assets/images/logo-wide-300-1500.jpg')
    .grayscale()
    .normalise()
    .toFile('f:/Antigravity/Anttonias WEB/public/assets/images/logo-wide-norm.jpg');

  // 2. Threshold 160
  await sharp('f:/Antigravity/Anttonias WEB/public/assets/images/logo-wide-norm.jpg')
    .threshold(160)
    .toFile('f:/Antigravity/Anttonias WEB/public/assets/images/logo-wide-thresh.png');

  // 3. Negated (black on white) for potrace
  await sharp('f:/Antigravity/Anttonias WEB/public/assets/images/logo-wide-thresh.png')
    .negate()
    .toFile('f:/Antigravity/Anttonias WEB/public/assets/images/logo-wide-negate.png');

  console.log('Processed logo images created.');
}

analyzeLogoPixels();

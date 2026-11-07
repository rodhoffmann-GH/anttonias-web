import sharp from 'sharp';

async function findLogo() {
  // Let's create high-contrast edge-detected or threshold crops of the top regions of:
  // 1. Debut album (often has logo at top or center)
  // 2. Atado a tu sentimiento (single cover)
  // 3. Espiritu
  
  // Atado: top center
  await sharp('f:/Antigravity/Anttonias WEB/public/assets/images/single-atado-sentimiento-3000.jpg')
    .extract({ left: 300, top: 200, width: 2400, height: 800 })
    .resize(1200, 400)
    .toFile('f:/Antigravity/Anttonias WEB/public/assets/images/crop-atado-logo.jpg');
    
  // Debut: top center
  await sharp('f:/Antigravity/Anttonias WEB/public/assets/images/album-cover-debut-3000.jpg')
    .extract({ left: 300, top: 150, width: 2400, height: 800 })
    .resize(1200, 400)
    .toFile('f:/Antigravity/Anttonias WEB/public/assets/images/crop-debut-logo.jpg');
    
  // Espiritu: center
  await sharp('f:/Antigravity/Anttonias WEB/public/assets/images/single-espiritu-3000.jpg')
    .resize(1000, 1000)
    .toFile('f:/Antigravity/Anttonias WEB/public/assets/images/crop-espiritu-1000.jpg');

  console.log('Crops generated successfully');
}

findLogo();

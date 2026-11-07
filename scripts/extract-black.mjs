import sharp from 'sharp';

async function extractBlack() {
  const { data, info } = await sharp('f:/Antigravity/Anttonias WEB/public/assets/images/crop-atado-logo.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });
    
  // data is RGB buffer
  const outBuf = Buffer.alloc(info.width * info.height * 4); // RGBA
  
  let blackCount = 0;
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];
    
    // Black or dark text
    const isDark = (r < 70 && g < 40 && b < 40);
    if (isDark) {
      blackCount++;
      outBuf[i * 4] = 255;     // white text
      outBuf[i * 4 + 1] = 255;
      outBuf[i * 4 + 2] = 255;
      outBuf[i * 4 + 3] = 255; // opaque
    } else {
      outBuf[i * 4] = 0;
      outBuf[i * 4 + 1] = 0;
      outBuf[i * 4 + 2] = 0;
      outBuf[i * 4 + 3] = 0;   // transparent
    }
  }
  
  console.log('Black pixels count in atado crop:', blackCount, 'out of', info.width * info.height);
  
  if (blackCount > 100) {
    await sharp(outBuf, { raw: { width: info.width, height: info.height, channels: 4 } })
      .png()
      .toFile('f:/Antigravity/Anttonias WEB/public/assets/images/atado-logo-mask.png');
    console.log('atado-logo-mask.png saved');
  }
}

extractBlack();

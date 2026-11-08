import sharp from 'sharp';

async function findBBox() {
  const img = sharp('f:/Antigravity/Anttonias WEB/public/assets/images/banner-desktop-safe.jpg');
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  
  // Find where pixels are very bright (> 220 in all channels)
  let minX = info.width, maxX = 0, minY = info.height, maxY = 0;
  let brightCount = 0;
  
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Let's test high brightness (white text)
      if (r > 200 && g > 200 && b > 200) {
        brightCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  
  console.log('Bright pixels (>200):', brightCount);
  console.log('Bounding Box for bright pixels:', { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY });

  // Let's extract that bounding box with some padding
  if (brightCount > 50 && maxX > minX && maxY > minY) {
    const pad = 30;
    const left = Math.max(0, minX - pad);
    const top = Math.max(0, minY - pad);
    const width = Math.min(info.width - left, (maxX - minX) + pad * 2);
    const height = Math.min(info.height - top, (maxY - minY) + pad * 2);
    
    await sharp('f:/Antigravity/Anttonias WEB/public/assets/images/banner-desktop-safe.jpg')
      .extract({ left, top, width, height })
      .toFile('f:/Antigravity/Anttonias WEB/public/assets/images/banner-logo-crop.jpg');
      
    console.log('banner-logo-crop.jpg created at:', { left, top, width, height });
  }
}

findBBox();

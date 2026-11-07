import sharp from 'sharp';

async function inspect() {
  const meta = await sharp('f:/Antigravity/Anttonias WEB/public/assets/images/yt-banner-2560.jpg').metadata();
  console.log('Banner:', meta.width, meta.height);
  
  // Let's create a clear high-res grayscale with contrast boost of the banner center
  await sharp('f:/Antigravity/Anttonias WEB/public/assets/images/yt-banner-2560.jpg')
    .extract({ left: Math.floor(meta.width * 0.2), top: 0, width: Math.floor(meta.width * 0.6), height: meta.height })
    .grayscale()
    .normalise()
    .toFile('f:/Antigravity/Anttonias WEB/public/assets/images/banner-logo-extracted.png');
    
  console.log('banner-logo-extracted.png created');
}
inspect();

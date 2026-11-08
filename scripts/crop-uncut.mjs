import sharp from 'sharp';

async function cropWholeLogo() {
  const meta = await sharp('f:/Antigravity/Anttonias WEB/public/assets/images/yt-banner-2560.jpg').metadata();
  
  // Generous crop covering from x=350 to x=1500 (width=1150)
  await sharp('f:/Antigravity/Anttonias WEB/public/assets/images/yt-banner-2560.jpg')
    .extract({ left: 350, top: 0, width: 1150, height: meta.height })
    .toFile('f:/Antigravity/Anttonias WEB/public/assets/images/logo-slice-uncut.jpg');

  // Also let's extract slices with 100px offsets to be 100% sure we have the full word:
  // Crop A: 300 to 1400
  await sharp('f:/Antigravity/Anttonias WEB/public/assets/images/yt-banner-2560.jpg')
    .extract({ left: 300, top: 0, width: 1200, height: meta.height })
    .toFile('f:/Antigravity/Anttonias WEB/public/assets/images/logo-wide-300-1500.jpg');

  console.log('Uncut crops generated successfully');
}

cropWholeLogo();

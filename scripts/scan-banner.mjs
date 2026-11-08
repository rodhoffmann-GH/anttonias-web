import sharp from 'sharp';

async function scanBanner() {
  const meta = await sharp('f:/Antigravity/Anttonias WEB/public/assets/images/yt-banner-2560.jpg').metadata();
  console.log('Banner width:', meta.width, 'height:', meta.height);
  
  // Cut into 4 horizontal slices across the width:
  // 0-640, 640-1280, 1280-1920, 1920-2560
  const sliceW = 640;
  for (let i = 0; i < 4; i++) {
    await sharp('f:/Antigravity/Anttonias WEB/public/assets/images/yt-banner-2560.jpg')
      .extract({ left: i * sliceW, top: 0, width: sliceW, height: meta.height })
      .toFile(`f:/Antigravity/Anttonias WEB/public/assets/images/banner-slice-${i}.jpg`);
  }
  
  // Also let's extract the center 1200px (680 to 1880) which is standard YouTube desktop viewing area
  await sharp('f:/Antigravity/Anttonias WEB/public/assets/images/yt-banner-2560.jpg')
    .extract({ left: 680, top: 0, width: 1200, height: meta.height })
    .toFile('f:/Antigravity/Anttonias WEB/public/assets/images/banner-desktop-safe.jpg');

  console.log('Banner slices and desktop safe area extracted.');
}

scanBanner();

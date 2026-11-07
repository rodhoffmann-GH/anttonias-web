async function main() {
  try {
    const res = await fetch('https://open.spotify.com/intl-es/artist/3zso8kvuPiTFBXe5g6ERJW', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await res.text();
    const regex = /https:\/\/i\.scdn\.co\/image\/[a-zA-Z0-9]+/g;
    const matches = [...new Set(html.match(regex) || [])];
    console.log('Spotify images found:', matches.length);
    matches.forEach((url, i) => console.log(i, url));
  } catch (err) {
    console.error(err);
  }
}
main();

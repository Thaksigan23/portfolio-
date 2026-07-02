import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function download(url, outPath) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        download(new URL(res.headers.location, url).href, outPath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`${url} returned ${res.statusCode}`));
        res.resume();
        return;
      }
      const file = fs.createWriteStream(outPath);
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(outPath)));
    }).on('error', reject);
  });
}

const assets = [
  {
    url: 'https://www.thooddakkaaran.com/images/hero.webp',
    out: 'images/thooddakkaaran/thooddakkaaran-home.webp'
  },
  {
    url: 'https://techloom.ai/og-image.png',
    out: 'images/techloom/techloom-home.png'
  },
  {
    url: 'https://techloom.ai/logo.svg',
    out: 'images/techloom/techloom-logo.svg'
  }
];

for (const asset of assets) {
  const outPath = path.join(root, asset.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  try {
    await download(asset.url, outPath);
    const size = fs.statSync(outPath).size;
    console.log(`OK ${asset.out} (${size} bytes)`);
  } catch (err) {
    console.log(`FAIL ${asset.url}: ${err.message}`);
  }
}

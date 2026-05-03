import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function escAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function galleryButtons(dirRel, slug, label) {
  const dir = path.join(root, dirRel);
  if (!fs.existsSync(dir)) return '';
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  if (files.length === 0) {
    return `                <p class="poster-empty-note">This gallery is empty. Add PNG or JPG images to <code class="poster-code">images/posters/${slug}/</code>.</p>`;
  }

  return files
    .map((f, i) => {
      // Use real filenames in quoted src (spaces OK). encodeURIComponent breaks many file:// loads on Windows.
      const src = `images/posters/${slug}/${escAttr(f)}`;
      const base = f.replace(/\.[^.]+$/i, '');
      const alt = escAttr(`${label} poster: ${base}`);
      const cap = escAttr(`${label} — ${base.slice(0, 100)}`);
      return `                <button type="button" class="poster-tile js-poster-open" data-caption="${cap}" aria-label="Open ${label} poster ${i + 1} full size">
                    <img src="${src}" alt="${alt}" loading="lazy" width="800" height="1000" data-fallback="images/posters/placeholder.svg">
                </button>`;
    })
    .join('\n');
}

function replaceGallery(htmlPath, slug, label) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  const openTag = '<div class="poster-gallery">';
  const inner = galleryButtons(`images/posters/${slug}`, slug, label);
  const newBlock = `${openTag}\n${inner}\n            </div>`;
  const galleryRe = /<div class="poster-gallery">\s*[\s\S]*?<\/div>/;
  if (!galleryRe.test(html)) throw new Error('poster-gallery block not found in ' + htmlPath);
  // Use a function replacer so `$` in poster captions/filenames is not treated as a replacement pattern
  const replaced = html.replace(galleryRe, () => newBlock);
  fs.writeFileSync(htmlPath, replaced);
  const count = (inner.match(/class="poster-tile/g) || []).length;
  console.log('Updated', path.basename(htmlPath), 'tiles:', count);
}

replaceGallery(path.join(root, 'posters-ieee.html'), 'ieee', 'IEEE');
replaceGallery(path.join(root, 'posters-aiesec.html'), 'aiesec', 'AIESEC');
replaceGallery(path.join(root, 'posters-techloom.html'), 'techloom', 'Techloom.ai');

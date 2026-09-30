import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '../..');
const dataDir = path.join(root, 'src/data');

/** Every "/images/..." path referenced anywhere in the study data files. */
function referencedImages() {
  const refs = new Map(); // path -> [source files]
  for (const file of fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'))) {
    const text = fs.readFileSync(path.join(dataDir, file), 'utf8');
    for (const m of text.matchAll(/"(\/images\/[^"]+\.(?:png|jpe?g|gif|webp|avif|svg))"/gi)) {
      if (!refs.has(m[1])) refs.set(m[1], []);
      refs.get(m[1]).push(file);
    }
  }
  return refs;
}

describe('pattern / syndrome images', () => {
  // On Vercel a missing file is served as index.html (HTTP 200), so a broken
  // reference never shows up as a 404 - it has to be caught here.
  it('every image referenced by src/data exists in public/', () => {
    const missing = [...referencedImages().entries()]
      .filter(([p]) => !fs.existsSync(path.join(root, 'public', p)))
      .map(([p, files]) => `${p} (referenced in ${[...new Set(files)].join(', ')})`);
    expect(missing).toEqual([]);
  });

  it('every pattern in the recognition quiz has at least one usable image', async () => {
    const patterns = JSON.parse(fs.readFileSync(path.join(dataDir, 'neurotrace_patterns_library_v2.json'), 'utf8'));
    const unusable = patterns
      .filter((p) => {
        const imgs = Array.isArray(p.images) && p.images.length ? p.images : [p.image].filter(Boolean);
        return !imgs.some((i) => fs.existsSync(path.join(root, 'public', i)));
      })
      .map((p) => p.id);
    expect(unusable).toEqual([]);
  });
});

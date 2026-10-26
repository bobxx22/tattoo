// Стискає фото з images-src/ у легкі .webp у public/images/.
// Запуск: npm run images
// Структура папок зберігається: images-src/works/01.jpg → public/images/works/01.webp

import { mkdir, readdir, stat } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import sharp from "sharp";

const SRC = "images-src";
const OUT = "public/images";

// максимальна ширина для кожної папки
const WIDTH = { site: 1920, works: 1000 };

async function* walk(dir) {
  for (const name of await readdir(dir)) {
    const path = join(dir, name);
    if ((await stat(path)).isDirectory()) yield* walk(path);
    else if (/\.(jpe?g|png|webp)$/i.test(name)) yield path;
  }
}

let before = 0;
let after = 0;

for await (const file of walk(SRC)) {
  const rel = relative(SRC, file);
  const folder = rel.split(/[\\/]/)[0];
  const out = join(OUT, rel.slice(0, -extname(rel).length) + ".webp");
  await mkdir(dirname(out), { recursive: true });

  const info = await sharp(file)
    .resize({ width: WIDTH[folder] ?? 1600, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(out);

  before += (await stat(file)).size;
  after += info.size;
  console.log(`${rel} → ${Math.round(info.size / 1024)} КБ`);
}

console.log(`\nБуло ${(before / 1048576).toFixed(1)} МБ, стало ${(after / 1048576).toFixed(1)} МБ`);

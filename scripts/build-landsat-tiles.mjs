import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import { ATTRIBUTION } from "../lib/landsat.js";

const ROOT = process.cwd();
const SOURCE_MANIFEST = path.join(ROOT, "data", "landsat", "originals", "manifest.json");
const PUBLIC_DIR = path.join(ROOT, "public", "landsat");
const TILE_DIR = path.join(PUBLIC_DIR, "tiles");
const TILE_SIZES = [512, 1024];

const sourceManifest = JSON.parse(await readFile(SOURCE_MANIFEST, "utf8"));

const publicManifest = {
  version: "landsat-name-api-v1",
  generatedAt: new Date().toISOString(),
  attribution: ATTRIBUTION,
  sourcePage: sourceManifest.sourcePage,
  tileSizes: TILE_SIZES,
  count: 0,
  letters: {},
};

for (const letter of Object.keys(sourceManifest.letters).sort()) {
  publicManifest.letters[letter] = [];

  for (const item of sourceManifest.letters[letter]) {
    const originalPath = path.join(ROOT, item.originalPath);
    const tiles = {};

    for (const size of TILE_SIZES) {
      const tilePath = path.join(TILE_DIR, String(size), letter, item.fileName);
      await mkdir(path.dirname(tilePath), { recursive: true });

      await sharp(originalPath)
        .rotate()
        .resize({ height: size, withoutEnlargement: true })
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toFile(tilePath);

      tiles[size] = `/landsat/tiles/${size}/${letter}/${item.fileName}`;
    }

    publicManifest.letters[letter].push({
      id: item.id,
      letter,
      fileName: item.fileName,
      sourceUrl: item.sourceUrl,
      tiles,
    });
    publicManifest.count += 1;
  }
}

await mkdir(PUBLIC_DIR, { recursive: true });
await writeFile(
  path.join(PUBLIC_DIR, "manifest.json"),
  `${JSON.stringify(publicManifest, null, 2)}\n`,
);

console.log(
  `Built ${publicManifest.count} Landsat images at ${TILE_SIZES.join("px, ")}px.`,
);

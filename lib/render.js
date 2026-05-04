import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import { DEFAULT_TILE_SIZE, selectLetters } from "./landsat.js";

export async function renderNamePng(
  text,
  manifest,
  { size = DEFAULT_TILE_SIZE, gap = 0, seed = "default" } = {},
) {
  const letters = selectLetters(text, manifest, { size, seed });
  const images = await Promise.all(
    letters.map(async (letter) => {
      const input = await readFile(publicPathFromUrl(letter.tileUrl));
      const metadata = await sharp(input).metadata();

      return {
        input,
        width: metadata.width,
        height: metadata.height,
      };
    }),
  );

  const width =
    images.reduce((total, image) => total + image.width, 0) +
    Math.max(0, images.length - 1) * gap;
  const height = Math.max(...images.map((image) => image.height));
  let left = 0;

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(
      images.map((image) => {
        const layer = {
          input: image.input,
          left,
          top: Math.floor((height - image.height) / 2),
        };
        left += image.width + gap;
        return layer;
      }),
    )
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

function publicPathFromUrl(urlPath) {
  const normalized = String(urlPath).replace(/^\/+/, "");
  return path.join(process.cwd(), "public", normalized);
}

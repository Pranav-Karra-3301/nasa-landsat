import { DEFAULT_TILE_SIZE, selectLetters } from "./landsat.js";
import { PngRowReader, encodePngStream, streamToBytes } from "./png.js";
import { readPublicAsset } from "./public-assets.js";

// Stitches the selected letter tiles left to right (vertically centred, `gap`
// transparent pixels between them) and returns the PNG as a byte stream.
export async function renderNamePngStream(
  text,
  manifest,
  { size = DEFAULT_TILE_SIZE, gap = 0, seed = "default" } = {},
) {
  const letters = selectLetters(text, manifest, { size, seed });
  const tiles = await Promise.all(
    letters.map(async (letter) => new PngRowReader(await readPublicAsset(letter.tileUrl))),
  );

  const width =
    tiles.reduce((total, tile) => total + tile.width, 0) +
    Math.max(0, tiles.length - 1) * gap;
  const height = Math.max(...tiles.map((tile) => tile.height));
  const layers = [];
  let left = 0;

  for (const tile of tiles) {
    layers.push({ tile, left, top: Math.floor((height - tile.height) / 2) });
    left += tile.width + gap;
  }

  return encodePngStream({
    width,
    height,
    async fillRow(y, row) {
      for (const { tile, left, top } of layers) {
        const start = left * 4;
        if (y >= top && y < top + tile.height) {
          row.set(await tile.readRow(), start);
        } else {
          row.fill(0, start, start + tile.width * 4);
        }
      }
    },
    onCancel: () => Promise.all(tiles.map((tile) => tile.cancel())),
  });
}

export async function renderNamePng(text, manifest, options) {
  return streamToBytes(await renderNamePngStream(text, manifest, options));
}

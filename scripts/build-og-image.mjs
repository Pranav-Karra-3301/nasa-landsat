import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;
const MAX_BYTES = 300 * 1024;

const SOURCE_FILE = path.join(process.cwd(), "public", "DEMO.png");
const OUT_FILE = path.join(process.cwd(), "public", "og-image.png");

await readFile(SOURCE_FILE);

const compressionAttempts = [
  { colours: 256, quality: 92 },
  { colours: 192, quality: 88 },
  { colours: 160, quality: 86 },
  { colours: 128, quality: 84 },
  { colours: 96, quality: 80 },
  { colours: 64, quality: 76 },
];

let output;
let chosenOptions;

for (const options of compressionAttempts) {
  const candidate = await sharp(SOURCE_FILE)
    .resize(WIDTH, HEIGHT, { fit: "fill" })
    .png({
      adaptiveFiltering: true,
      compressionLevel: 9,
      dither: 0,
      effort: 10,
      palette: true,
      ...options,
    })
    .toBuffer();

  if (!output || candidate.length < output.length) {
    output = candidate;
    chosenOptions = options;
  }

  if (candidate.length <= MAX_BYTES) {
    output = candidate;
    chosenOptions = options;
    break;
  }
}

if (output.length > MAX_BYTES) {
  throw new Error(
    `OG image is ${output.length} bytes, which exceeds the ${MAX_BYTES} byte limit.`,
  );
}

await mkdir(path.dirname(OUT_FILE), { recursive: true });
await writeFile(OUT_FILE, output);

console.log(
  `Wrote ${path.relative(process.cwd(), OUT_FILE)} from ${path.relative(
    process.cwd(),
    SOURCE_FILE,
  )} (${WIDTH}x${HEIGHT}, ${output.length} bytes, ${chosenOptions.colours} colours).`,
);

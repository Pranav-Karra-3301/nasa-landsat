import { createHash } from "node:crypto";

import { selectLetters } from "../lib/landsat.js";
import { loadPublicManifest } from "../lib/public-manifest.js";
import { renderNamePng } from "../lib/render.js";

const SAMPLES = Number(process.env.DETERMINISM_SAMPLES ?? 1000);
const RENDER_SAMPLES = Number(process.env.DETERMINISM_RENDER_SAMPLES ?? 100);
const manifest = await loadPublicManifest();

let selectionMatches = 0;
let renderMatches = 0;

for (let index = 0; index < SAMPLES; index += 1) {
  const name = sampleName(index);
  const first = fingerprintSelection(name);
  const second = fingerprintSelection(name);
  if (first === second) selectionMatches += 1;

  if (index < RENDER_SAMPLES) {
    const firstPng = await renderNamePng(name, manifest, { size: 512, gap: 8 });
    const secondPng = await renderNamePng(name, manifest, { size: 512, gap: 8 });
    if (hash(firstPng) === hash(secondPng)) renderMatches += 1;
  }

  if ((index + 1) % 100 === 0) {
    process.stderr.write(`Checked ${index + 1}/${SAMPLES}\n`);
  }
}

const selectionRate = selectionMatches / SAMPLES;
const renderRate = RENDER_SAMPLES > 0 ? renderMatches / RENDER_SAMPLES : 1;

console.log(
  JSON.stringify(
    {
      samples: SAMPLES,
      renderSamples: RENDER_SAMPLES,
      selectionMatches,
      renderMatches,
      selectionRate,
      renderRate,
    },
    null,
    2,
  ),
);

if (selectionRate < 0.999 || renderRate < 0.999) {
  process.exitCode = 1;
}

function fingerprintSelection(name) {
  return JSON.stringify(
    selectLetters(name, manifest, { size: 512, gap: 8 }).map((letter) => [
      letter.index,
      letter.letter,
      letter.id,
      letter.tileUrl,
      letter.sourceUrl,
    ]),
  );
}

function sampleName(index) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let state = (index + 1) * 2654435761;
  const length = 3 + (state % 10);
  let output = "";

  for (let offset = 0; offset < length; offset += 1) {
    state = Math.imul(state ^ (state >>> 13), 1597334677);
    output += alphabet[(state >>> 0) % alphabet.length];
  }

  return output;
}

function hash(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

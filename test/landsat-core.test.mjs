import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCacheHeaders,
  normalizeText,
  parseNameFile,
  selectLetters,
} from "../lib/landsat.js";

const sampleManifest = {
  version: "test",
  tileSizes: [512, 1024],
  letters: {
    A: [
      {
        id: "a-0",
        letter: "A",
        tiles: {
          512: "/landsat/tiles/512/A/a-0.png",
          1024: "/landsat/tiles/1024/A/a-0.png",
        },
      },
      {
        id: "a-1",
        letter: "A",
        tiles: {
          512: "/landsat/tiles/512/A/a-1.png",
          1024: "/landsat/tiles/1024/A/a-1.png",
        },
      },
    ],
    B: [
      {
        id: "b-0",
        letter: "B",
        tiles: {
          512: "/landsat/tiles/512/B/b-0.png",
          1024: "/landsat/tiles/1024/B/b-0.png",
        },
      },
    ],
  },
};

test("normalizeText keeps A-Z only and enforces max length", () => {
  assert.equal(normalizeText(" Pranav 123! "), "PRANAV");
  assert.equal(normalizeText("a".repeat(40)), "A".repeat(32));
  assert.throws(() => normalizeText("123 !!!"), /at least one A-Z/i);
});

test("parseNameFile accepts png and json endpoint suffixes", () => {
  assert.deepEqual(parseNameFile("Pranav.png"), { text: "Pranav", format: "png" });
  assert.deepEqual(parseNameFile("Pranav.json"), { text: "Pranav", format: "json" });
  assert.throws(() => parseNameFile("Pranav.gif"), /unsupported/i);
});

test("selectLetters is deterministic and returns requested tile size", () => {
  const first = selectLetters("AaB", sampleManifest, { size: 512 });
  const second = selectLetters("AaB", sampleManifest, { size: 512 });

  assert.deepEqual(first, second);
  assert.equal(first.length, 3);
  assert.equal(first[0].letter, "A");
  assert.equal(first[2].tileUrl, "/landsat/tiles/512/B/b-0.png");
});

test("buildCacheHeaders exposes immutable public API caching and CORS", () => {
  assert.deepEqual(buildCacheHeaders("image/png"), {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=31536000, immutable",
    "CDN-Cache-Control": "public, max-age=31536000, immutable",
    "Content-Type": "image/png",
    "Vercel-CDN-Cache-Control": "public, max-age=31536000, immutable",
    "X-Attribution": "Source imagery: NASA/USGS Landsat. Unofficial; not endorsed by NASA.",
  });
});

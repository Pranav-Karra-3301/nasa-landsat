import assert from "node:assert/strict";
import test from "node:test";

import {
  extractImageUrls,
  getLetterFromFileName,
  safeFileName,
} from "../scripts/cache-landsat.mjs";

test("extractImageUrls returns unique Landsat PNG asset URLs", () => {
  const html = `
    <a href="https://assets.science.nasa.gov/content/dam/science/missions/landsat/your-name-in-landsat-images/a-1.png">Download</a>
    <img src="https://assets.science.nasa.gov/content/dam/science/missions/landsat/your-name-in-landsat-images/a-1.png" />
    <a href="https://assets.science.nasa.gov/content/dam/science/missions/landsat/other-folder/z-1.png">Other</a>
    <a href="https://assets.science.nasa.gov/content/dam/science/missions/landsat/your-name-in-landsat-images/a-4-Lake-Mj\u00F8sa-Norway.png">Download</a>
    <img src="https://assets.science.nasa.gov/dynamicimage/assets/science/missions/landsat/your-name-in-landsat-images/a-4-Lake-Mj%C3%B8sa-Norway.png?w=1175&amp;h=2817&amp;fit=clip" />
    <a href="https://assets.science.nasa.gov/content/dam/science/missions/landsat/your-name-in-landsat-images/B%20river.png">Download</a>
    <img src="https://assets.science.nasa.gov/dynamicimage/assets/science/missions/landsat/your-name-in-landsat-images/i-4-HoluhraunIceField-iceland.png?w=1175&amp;h=2817&amp;fit=clip" />
  `;

  assert.deepEqual(extractImageUrls(html), [
    "https://assets.science.nasa.gov/content/dam/science/missions/landsat/your-name-in-landsat-images/a-1.png",
    "https://assets.science.nasa.gov/content/dam/science/missions/landsat/your-name-in-landsat-images/a-4-Lake-Mj%C3%B8sa-Norway.png",
    "https://assets.science.nasa.gov/content/dam/science/missions/landsat/your-name-in-landsat-images/B%20river.png",
    "https://assets.science.nasa.gov/content/dam/science/missions/landsat/your-name-in-landsat-images/i-4-HoluhraunIceField-iceland.png",
  ]);
});

test("safeFileName normalizes downloaded NASA asset names", () => {
  assert.equal(safeFileName("a-4-Lake-Mj%C3%B8sa-Norway.png"), "a-4-Lake-Mjsa-Norway.png");
  assert.equal(safeFileName("B river, Brazil.png"), "B-river-Brazil.png");
});

test("getLetterFromFileName reads the leading letter from decoded names", () => {
  assert.equal(getLetterFromFileName("a-4-Lake-Mj%C3%B8sa-Norway.png"), "A");
  assert.equal(getLetterFromFileName("Z Island.png"), "Z");
  assert.equal(getLetterFromFileName("1-not-a-letter.png"), null);
});

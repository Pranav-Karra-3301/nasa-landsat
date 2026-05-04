import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { renderNamePng } from "../lib/render.js";
import { GET as nameRoute } from "../app/v1/name/[file]/route.js";

const manifest = JSON.parse(await readFile("public/landsat/manifest.json", "utf8"));

test("renderNamePng returns deterministic PNG bytes", async () => {
  const first = await renderNamePng("AB", manifest, { size: 512 });
  const second = await renderNamePng("AB", manifest, { size: 512 });

  assert.deepEqual([...first.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(hash(first), hash(second));
});

test("name route returns selected letters as cacheable JSON", async () => {
  const response = await nameRoute(
    new Request("https://landsat.test/v1/name/Pranav.json?size=512"),
    { params: Promise.resolve({ file: "Pranav.json" }) },
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "application/json");
  assert.equal(response.headers.get("cache-control"), "public, max-age=31536000, immutable");
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.equal(body.normalizedText, "PRANAV");
  assert.equal(body.format, "json");
  assert.equal(body.letters.length, 6);
  assert.match(body.renderUrl, /^https:\/\/landsat\.test\/v1\/name\/PRANAV\.png/);
});

function hash(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

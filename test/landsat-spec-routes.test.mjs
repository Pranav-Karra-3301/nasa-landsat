import assert from "node:assert/strict";
import test from "node:test";

import { GET as llmsRoute } from "../app/llms.txt/route.js";
import { GET as openApiRoute } from "../app/openapi.json/route.js";
import { GET as manifestRoute } from "../app/v1/manifest.json/route.js";

test("manifest route returns the full public inventory", async () => {
  const response = await manifestRoute(new Request("https://landsat.test/v1/manifest.json"));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "public, max-age=31536000, immutable");
  assert.equal(body.count, 72);
  assert.equal(body.letters.I.length, 5);
});

test("openapi route exposes name png and json endpoints", async () => {
  const response = await openApiRoute(new Request("https://landsat.test/openapi.json"));
  const body = await response.json();

  assert.equal(body.openapi, "3.1.0");
  assert.ok(body.paths["/v1/name/{text}.png"]);
  assert.ok(body.paths["/v1/name/{text}.json"]);
});

test("llms route explains copy-paste usage", async () => {
  const response = await llmsRoute(new Request("https://landsat.test/llms.txt"));
  const body = await response.text();

  assert.equal(response.headers.get("content-type"), "text/plain; charset=utf-8");
  assert.match(body, /Landsat Name API/);
  assert.match(body, /\/v1\/name\/PRANAV\.png/);
});

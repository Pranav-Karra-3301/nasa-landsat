import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import sharp from "sharp";

const OG_IMAGE = path.join(process.cwd(), "public", "og-image.png");
const MAX_BYTES = 300 * 1024;

test("static OG image has the expected preview dimensions and size", async () => {
  const [{ size }, metadata] = await Promise.all([stat(OG_IMAGE), sharp(OG_IMAGE).metadata()]);

  assert.equal(metadata.width, 1200);
  assert.equal(metadata.height, 630);
  assert.equal(metadata.format, "png");
  assert.ok(size <= MAX_BYTES, `Expected ${size} bytes to be at most ${MAX_BYTES}`);
});

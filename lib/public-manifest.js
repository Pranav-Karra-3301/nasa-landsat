import { readPublicAsset } from "./public-assets.js";

// Cache the parsed value, not the promise: on Workers a promise created during
// one request must not be awaited from another.
let manifest;

export async function loadPublicManifest() {
  manifest ??= JSON.parse(
    new TextDecoder().decode(await readPublicAsset("/landsat/manifest.json")),
  );

  return manifest;
}

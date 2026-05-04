import { readFile } from "node:fs/promises";
import path from "node:path";

let manifestPromise;

export function loadPublicManifest() {
  manifestPromise ??= readFile(
    path.join(process.cwd(), "public", "landsat", "manifest.json"),
    "utf8",
  ).then((json) => JSON.parse(json));

  return manifestPromise;
}

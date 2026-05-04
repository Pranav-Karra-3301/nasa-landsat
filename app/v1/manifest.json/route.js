import { buildCacheHeaders } from "../../../lib/landsat.js";
import { loadPublicManifest } from "../../../lib/public-manifest.js";

export const runtime = "nodejs";

export async function GET() {
  const manifest = await loadPublicManifest();

  return new Response(`${JSON.stringify(manifest, null, 2)}\n`, {
    headers: buildCacheHeaders("application/json"),
  });
}

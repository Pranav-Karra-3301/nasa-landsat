// Reads files from public/. On Cloudflare Workers there is no filesystem, so
// files come from the Workers Static Assets binding (ASSETS); everywhere else
// (tests, scripts, `next dev`) they are read from disk.

const inWorkerd = globalThis.navigator?.userAgent === "Cloudflare-Workers";

export async function readPublicAsset(urlPath) {
  const normalized = `/${String(urlPath).replace(/^\/+/, "")}`;

  if (inWorkerd) {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const response = await env.ASSETS.fetch(new URL(normalized, "https://assets.local"));
    if (!response.ok) {
      throw new Error(`Asset ${normalized} could not be loaded (${response.status}).`);
    }
    return new Uint8Array(await response.arrayBuffer());
  }

  const [{ readFile }, path] = await Promise.all([
    import("node:fs/promises"),
    import("node:path"),
  ]);
  return new Uint8Array(await readFile(path.join(process.cwd(), "public", normalized)));
}

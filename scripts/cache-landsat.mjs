// Requires Node 18+ because it uses built-in fetch.

import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const PAGE =
  "https://science.nasa.gov/mission/landsat/outreach/your-name-in-landsat/";

export const OUT_DIR = path.join(process.cwd(), "data", "landsat", "originals");

const LANDSAT_IMAGE_PATTERN =
  /https:\/\/assets\.science\.nasa\.gov\/(?:content\/dam|dynamicimage\/assets)\/science\/missions\/landsat\/your-name-in-landsat-images\/[^"'<> ]+?\.png(?:\?[^"'<> ]*)?/g;

export function safeFileName(name) {
  return decodeURIComponent(name)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^\w.-]+/g, "-");
}

export function extractImageUrls(html) {
  return [
    ...new Set(
      [...html.matchAll(LANDSAT_IMAGE_PATTERN)].map((match) =>
        canonicalImageUrl(match[0]),
      ),
    ),
  ].sort((a, b) => a.localeCompare(b));
}

export function canonicalImageUrl(url) {
  const normalizedUrl = url.replaceAll("&amp;", "&").replace(
    "https://assets.science.nasa.gov/dynamicimage/assets/science/",
    "https://assets.science.nasa.gov/content/dam/science/",
  );
  const parsedUrl = new URL(normalizedUrl);

  parsedUrl.search = "";
  parsedUrl.hash = "";

  return parsedUrl.href;
}

export function getLetterFromFileName(name) {
  const decodedName = decodeURIComponent(name);
  const match = decodedName.match(/^([a-z])-?/i);

  return match ? match[1].toUpperCase() : null;
}

export async function cacheLandsatImages({
  page = PAGE,
  outDir = OUT_DIR,
  fetcher = fetch,
  logger = console,
} = {}) {
  const pageRes = await fetcher(page);
  if (!pageRes.ok) throw new Error(`Could not fetch NASA page: ${pageRes.status}`);

  const html = await pageRes.text();
  const urls = extractImageUrls(html);
  const manifest = {
    generatedAt: new Date().toISOString(),
    sourcePage: page,
    letters: {},
  };

  for (const url of urls) {
    const rawName = path.basename(new URL(url).pathname);
    const letter = getLetterFromFileName(rawName);
    if (!letter) continue;

    const fileName = safeFileName(rawName);
    const letterDir = path.join(outDir, letter);

    const localPath = path.join(letterDir, fileName);

    await mkdir(letterDir, { recursive: true });

    if (!(await fileExists(localPath))) {
      const imageRes = await fetcher(url);
      if (!imageRes.ok) throw new Error(`Failed ${url}: ${imageRes.status}`);

      const buffer = Buffer.from(await imageRes.arrayBuffer());
      await writeFile(localPath, buffer);
    }

    manifest.letters[letter] ??= [];
    manifest.letters[letter].push({
      id: path.basename(fileName, ".png"),
      letter,
      fileName,
      originalPath: path.relative(process.cwd(), localPath),
      sourceUrl: url,
    });

    logger.log(`Cached ${letter}: ${fileName}`);
  }

  for (const letter of Object.keys(manifest.letters)) {
    manifest.letters[letter].sort((a, b) => a.fileName.localeCompare(b.fileName));
  }

  await mkdir(outDir, { recursive: true });
  await writeFile(
    path.join(outDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  const count = Object.values(manifest.letters).flat().length;
  logger.log(`Cached ${count} images.`);

  return { count, manifest, urls };
}

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await cacheLandsatImages();
}

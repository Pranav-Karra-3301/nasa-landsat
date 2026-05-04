export const ATTRIBUTION =
  "Source imagery: NASA/USGS Landsat. Unofficial; not endorsed by NASA.";

export const DEFAULT_TILE_SIZE = 512;
export const MAX_LETTERS = 32;

export function normalizeText(input, maxLetters = MAX_LETTERS) {
  const normalized = String(input ?? "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, maxLetters);

  if (!normalized) {
    throw new RangeError("Text must contain at least one A-Z letter.");
  }

  return normalized;
}

export function parseNameFile(fileName) {
  const decoded = decodeURIComponent(String(fileName ?? ""));
  const match = decoded.match(/^(.+)\.(png|json)$/i);

  if (!match) {
    throw new RangeError("Unsupported name endpoint format. Use .png or .json.");
  }

  return {
    text: match[1],
    format: match[2].toLowerCase(),
  };
}

export function selectLetters(
  input,
  manifest,
  { size = DEFAULT_TILE_SIZE, seed = "default" } = {},
) {
  const text = normalizeText(input);
  const sizeKey = String(size);

  return [...text].map((letter, index) => {
    const options = manifest.letters?.[letter] ?? manifest[letter] ?? [];
    if (!options.length) {
      throw new RangeError(`No Landsat images are available for ${letter}.`);
    }

    const variantIndex = stableIndex(`${seed}:${text}:${letter}:${index}`, options.length);
    const selected = options[variantIndex];
    const tileUrl = selected.tiles?.[sizeKey] ?? selected.tileUrl;

    if (!tileUrl) {
      throw new RangeError(`No ${sizeKey}px tile is available for ${letter}.`);
    }

    return {
      ...selected,
      index,
      letter,
      normalizedText: text,
      tileSize: Number(size),
      tileUrl,
      variantIndex,
    };
  });
}

export function buildCacheHeaders(contentType) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=31536000, immutable",
    "CDN-Cache-Control": "public, max-age=31536000, immutable",
    "Content-Type": contentType,
    "Vercel-CDN-Cache-Control": "public, max-age=31536000, immutable",
    "X-Attribution": ATTRIBUTION,
  };
}

export function stableIndex(value, modulo) {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0) % modulo;
}

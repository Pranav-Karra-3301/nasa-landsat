import {
  ATTRIBUTION,
  DEFAULT_TILE_SIZE,
  buildCacheHeaders,
  normalizeText,
  parseNameFile,
  selectLetters,
} from "../../../../lib/landsat.js";
import { loadPublicManifest } from "../../../../lib/public-manifest.js";
import { renderNamePng } from "../../../../lib/render.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { text, format } = parseNameFile(params.file);
    const url = new URL(request.url);
    const options = parseOptions(url.searchParams);
    const manifest = await loadPublicManifest();
    const normalizedText = normalizeText(text);

    if (format === "json") {
      const selected = selectLetters(normalizedText, manifest, options);
      const body = {
        text,
        normalizedText,
        format,
        tileSize: options.size,
        gap: options.gap,
        attribution: ATTRIBUTION,
        renderUrl: buildRenderUrl(url, normalizedText, options),
        letters: selected.map((letter) => ({
          index: letter.index,
          letter: letter.letter,
          id: letter.id,
          variantIndex: letter.variantIndex,
          tileUrl: absoluteUrl(url, letter.tileUrl),
          sourceUrl: letter.sourceUrl,
        })),
      };

      return new Response(`${JSON.stringify(body, null, 2)}\n`, {
        headers: buildCacheHeaders("application/json"),
      });
    }

    const png = await renderNamePng(normalizedText, manifest, options);

    return new Response(png, {
      headers: buildCacheHeaders("image/png"),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

function parseOptions(searchParams) {
  const size = Number(searchParams.get("size") ?? DEFAULT_TILE_SIZE);
  const gap = Number(searchParams.get("gap") ?? 0);
  const seed = searchParams.get("seed") || "default";

  if (![512, 1024].includes(size)) {
    throw new RangeError("Unsupported size. Use 512 or 1024.");
  }

  if (!Number.isInteger(gap) || gap < 0 || gap > 64) {
    throw new RangeError("Unsupported gap. Use an integer from 0 to 64.");
  }

  return { size, gap, seed };
}

function buildRenderUrl(requestUrl, normalizedText, options) {
  const output = new URL(`/v1/name/${normalizedText}.png`, requestUrl.origin);

  if (options.size !== DEFAULT_TILE_SIZE) output.searchParams.set("size", options.size);
  if (options.gap !== 0) output.searchParams.set("gap", options.gap);
  if (options.seed !== "default") output.searchParams.set("seed", options.seed);

  return output.toString();
}

function absoluteUrl(requestUrl, path) {
  return new URL(path, requestUrl.origin).toString();
}

function errorResponse(error) {
  const status = error instanceof RangeError ? 400 : 500;

  return Response.json(
    {
      error: status === 400 ? "bad_request" : "internal_error",
      message: error.message,
    },
    {
      status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      },
    },
  );
}

import { buildCacheHeaders } from "../../lib/landsat.js";

export const runtime = "nodejs";

export async function GET(request) {
  const origin = new URL(request.url).origin;
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Landsat Name API",
      version: "1.0.0",
      description:
        "A public deterministic API that renders text as stitched Landsat letter imagery. Source imagery: NASA/USGS Landsat. Unofficial; not endorsed by NASA.",
    },
    servers: [{ url: origin }],
    paths: {
      "/v1/name/{text}.png": {
        get: {
          summary: "Render text as a cached PNG",
          parameters: [
            pathTextParameter(),
            sizeParameter(),
            gapParameter(),
            seedParameter(),
          ],
          responses: {
            200: {
              description: "PNG image",
              content: { "image/png": {} },
            },
            400: { description: "Invalid text or render parameters" },
          },
        },
      },
      "/v1/name/{text}.json": {
        get: {
          summary: "Return deterministic letter selections for text",
          parameters: [
            pathTextParameter(),
            sizeParameter(),
            gapParameter(),
            seedParameter(),
          ],
          responses: {
            200: {
              description: "Selected letters, tile URLs, source URLs, and attribution",
              content: { "application/json": {} },
            },
            400: { description: "Invalid text or render parameters" },
          },
        },
      },
      "/v1/manifest.json": {
        get: {
          summary: "Return the full Landsat letter inventory",
          responses: {
            200: {
              description: "Manifest of available letter variants and tile URLs",
              content: { "application/json": {} },
            },
          },
        },
      },
      "/llms.txt": {
        get: {
          summary: "Agent-readable usage guide",
          responses: {
            200: {
              description: "Plain-text instructions for coding agents",
              content: { "text/plain": {} },
            },
          },
        },
      },
    },
  };

  return new Response(`${JSON.stringify(spec, null, 2)}\n`, {
    headers: buildCacheHeaders("application/json"),
  });
}

function pathTextParameter() {
  return {
    name: "text",
    in: "path",
    required: true,
    schema: { type: "string", minLength: 1, maxLength: 32 },
    description: "Text to render. Non-A-Z characters are stripped after decoding.",
  };
}

function sizeParameter() {
  return {
    name: "size",
    in: "query",
    required: false,
    schema: { type: "integer", enum: [512, 1024], default: 512 },
    description: "Letter tile height in pixels.",
  };
}

function gapParameter() {
  return {
    name: "gap",
    in: "query",
    required: false,
    schema: { type: "integer", minimum: 0, maximum: 64, default: 0 },
    description: "Transparent gap between letters in pixels.",
  };
}

function seedParameter() {
  return {
    name: "seed",
    in: "query",
    required: false,
    schema: { type: "string", default: "default" },
    description: "Optional deterministic variant seed.",
  };
}

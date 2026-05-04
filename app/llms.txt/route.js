import { buildCacheHeaders } from "../../lib/landsat.js";

export const runtime = "nodejs";

export async function GET(request) {
  const origin = new URL(request.url).origin;
  const body = `# Landsat Alphabet API

Base URL: ${origin}

The Landsat Alphabet API renders text as a deterministic PNG stitched from NASA/USGS Landsat letter imagery. It is unofficial and is not endorsed by NASA.

## Quick usage

Embed an image:

<img src="${origin}/v1/name/PRANAV.png" alt="PRANAV rendered in Landsat imagery" />

Fetch metadata:

fetch("${origin}/v1/name/PRANAV.json").then((res) => res.json())

## Endpoints

- GET /v1/name/{text}.png
- GET /v1/name/{text}.json
- GET /v1/manifest.json
- GET /openapi.json
- GET /llms.txt

## Parameters

- size: 512 or 1024. Default: 512.
- gap: integer from 0 to 64. Default: 0.
- seed: optional deterministic variant seed. Default: default.

## Agent guidance

Use /v1/name/{text}.png directly in HTML, Markdown, Open Graph image generation, slides, or docs. Use /v1/name/{text}.json when you need selected letter metadata, tile URLs, source URLs, or attribution.

Always include attribution near generated output: Source imagery: NASA/USGS Landsat. Unofficial; not endorsed by NASA.

Sources:
- NASA Science, Your Name in Landsat: https://science.nasa.gov/mission/landsat/outreach/your-name-in-landsat/
- NASA Images and Media Guidelines: https://www.nasa.gov/nasa-brand-center/images-and-media/
`;

  return new Response(body, {
    headers: buildCacheHeaders("text/plain; charset=utf-8"),
  });
}

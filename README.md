# Landsat Alphabet API

A public deterministic API that renders text as a PNG stitched from NASA/USGS
Landsat letter imagery.

**Open source:** source code and issue tracker live at
[github.com/Pranav-Karra-3301/nasa-landsat](https://github.com/Pranav-Karra-3301/nasa-landsat).
Contributions are welcome.

## Try it (live API)

These examples call production (`landsat.pranavkarra.me`). Responses are
deterministic for the same `text`, tile size, gap, and `seed`.

### PNG in Markdown

```markdown
![LANDSAT from Landsat letter imagery](https://landsat.pranavkarra.me/v1/name/LANDSAT.png?size=512&gap=8)
```

Examples:

<p align="center">
  <img
    src="https://landsat.pranavkarra.me/v1/name/LANDSAT.png?size=512&gap=8"
    alt="LANDSAT spelled with Landsat letter imagery"
    width="720"
  />
</p>

<p align="center"><sub><code>GET /v1/name/LANDSAT.png</code></sub></p>

<br />

<p align="center">
  <img
    src="https://landsat.pranavkarra.me/v1/name/EARTH.png?size=512&gap=8"
    alt="EARTH spelled with Landsat letter imagery"
    width="720"
  />
</p>

<p align="center"><sub><code>GET /v1/name/EARTH.png</code></sub></p>

<br />

<p align="center">
  <img
    src="https://landsat.pranavkarra.me/v1/name/ORBIT.png?size=512&gap=8"
    alt="ORBIT spelled with Landsat letter imagery"
    width="720"
  />
</p>

<p align="center"><sub><code>GET /v1/name/ORBIT.png</code></sub></p>

### JSON with curl

```bash
curl -sL "https://landsat.pranavkarra.me/v1/name/LANDSAT.json"
```

### Sample JSON (live response)

The following matches `GET /v1/name/LANDSAT.json` (abbreviated only where noted):

```json
{
  "text": "LANDSAT",
  "normalizedText": "LANDSAT",
  "format": "json",
  "tileSize": 512,
  "gap": 0,
  "attribution": "Source imagery: NASA/USGS Landsat. Unofficial; not endorsed by NASA.",
  "renderUrl": "https://landsat.pranavkarra.me/v1/name/LANDSAT.png",
  "letters": [
    {
      "index": 0,
      "letter": "L",
      "id": "l-3-ReginaSaskatchewan-Canada",
      "variantIndex": 3,
      "tileUrl": "https://landsat.pranavkarra.me/landsat/tiles/512/L/l-3-ReginaSaskatchewan-Canada.png",
      "sourceUrl": "https://assets.science.nasa.gov/content/dam/science/missions/landsat/your-name-in-landsat-images/l-3-ReginaSaskatchewan-Canada.png"
    },
    {
      "index": 1,
      "letter": "A",
      "id": "a-4-Lake-Mjsa-Norway",
      "variantIndex": 4,
      "tileUrl": "https://landsat.pranavkarra.me/landsat/tiles/512/A/a-4-Lake-Mjsa-Norway.png",
      "sourceUrl": "https://assets.science.nasa.gov/content/dam/science/missions/landsat/your-name-in-landsat-images/a-4-Lake-Mj%C3%B8sa-Norway.png"
    }
  ]
}
```

The live payload includes seven `letters` entries (one per character). Tile URLs point at this repo’s cached tiles under `/landsat/tiles/`; `sourceUrl` values reference NASA Science imagery assets.

## Endpoints

- `GET /v1/name/{text}.png`
- `GET /v1/name/{text}.json`
- `GET /v1/manifest.json`
- `GET /openapi.json`
- `GET /llms.txt`
- `GET /`

## Development

```bash
pnpm install
pnpm test
pnpm build
pnpm exec next start -p 3001
```

Run local HTTP checks against a started server:

```bash
BASE_URL=http://127.0.0.1:3001 pnpm run verify:http
BASE_URL=http://127.0.0.1:3001 pnpm run bench:local
```

Run deterministic selection and PNG byte checks:

```bash
pnpm run verify:determinism
DETERMINISM_RENDER_SAMPLES=1000 pnpm run verify:determinism
```

## Landsat Assets

The full-resolution NASA downloads are kept out of deployable runtime files and
ignored under `data/landsat/originals/`. The deployed assets are generated
512px and 1024px tiles under `public/landsat/tiles/`.

Refresh assets:

```bash
pnpm run landsat:cache
pnpm run landsat:tiles
```

Attribution: Source imagery NASA/USGS Landsat. This project is unofficial and
is not endorsed by NASA.

Sources:

- NASA Science, Your Name in Landsat: https://science.nasa.gov/mission/landsat/outreach/your-name-in-landsat/
- NASA Images and Media Guidelines: https://www.nasa.gov/nasa-brand-center/images-and-media/

## Deployment

Production Vercel URL:

- https://nasa-landsat-eta.vercel.app

Public domain:

- https://landsat.pranavkarra.me

Custom domain setup:

- See `docs/cloudflare-setup.md`

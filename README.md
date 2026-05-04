# Landsat Name API

A public deterministic API that renders text as a PNG stitched from NASA/USGS
Landsat letter imagery.

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

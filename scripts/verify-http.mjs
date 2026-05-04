const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

const checks = [
  { path: "/", type: "text/html" },
  { path: "/v1/name/PRANAV.png?size=512&gap=8", type: "image/png" },
  { path: "/v1/name/PRANAV.json", type: "application/json" },
  { path: "/v1/manifest.json", type: "application/json" },
  { path: "/openapi.json", type: "application/json" },
  { path: "/llms.txt", type: "text/plain" },
];

for (const check of checks) {
  const start = performance.now();
  const response = await fetch(`${BASE_URL}${check.path}`);
  const elapsedMs = Math.round(performance.now() - start);
  const contentType = response.headers.get("content-type") ?? "";

  console.log(
    `${response.status} ${elapsedMs}ms ${check.path} ${contentType}`,
  );

  if (!response.ok) {
    throw new Error(`${check.path} returned ${response.status}`);
  }

  if (!contentType.includes(check.type)) {
    throw new Error(`${check.path} returned ${contentType}, expected ${check.type}`);
  }

  if (check.path.endsWith(".png?size=512&gap=8")) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    const signature = [...bytes.slice(0, 8)];
    const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
    if (JSON.stringify(signature) !== JSON.stringify(pngSignature)) {
      throw new Error("PNG endpoint did not return a PNG signature");
    }
  } else {
    await response.arrayBuffer();
  }
}

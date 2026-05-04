const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const REQUESTS = Number(process.env.BENCH_REQUESTS ?? 50);
const names = ["LANDSAT", "PRANAV", "EARTH", "ORBIT", "PIXEL", "ATLAS"];
const durations = [];
let failures = 0;

for (let index = 0; index < REQUESTS; index += 1) {
  const name = names[index % names.length];
  const url = `${BASE_URL}/v1/name/${name}.png?size=512&gap=8&seed=bench`;
  const start = performance.now();
  const response = await fetch(url);
  const elapsed = performance.now() - start;
  durations.push(elapsed);

  if (!response.ok || !response.headers.get("content-type")?.includes("image/png")) {
    failures += 1;
  }

  await response.arrayBuffer();
}

durations.sort((a, b) => a - b);

const result = {
  requests: REQUESTS,
  failures,
  p50Ms: percentile(durations, 0.5),
  p95Ms: percentile(durations, 0.95),
  maxMs: durations.at(-1),
};

console.log(JSON.stringify(result, null, 2));

if (failures > 0) process.exitCode = 1;

function percentile(values, ratio) {
  const index = Math.min(values.length - 1, Math.ceil(values.length * ratio) - 1);
  return Math.round(values[index] * 100) / 100;
}

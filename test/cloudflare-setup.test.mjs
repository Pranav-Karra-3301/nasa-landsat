import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDnsRecordPayload,
  buildRateLimitRule,
  findExistingDnsRecord,
  findExistingRateLimitRule,
} from "../lib/cloudflare-setup.js";

test("buildDnsRecordPayload targets Vercel with explicit proxy mode", () => {
  assert.deepEqual(
    buildDnsRecordPayload({
      hostname: "landsat.pranavkarra.me",
      targetIp: "76.76.21.21",
      proxied: false,
    }),
    {
      type: "A",
      name: "landsat.pranavkarra.me",
      content: "76.76.21.21",
      ttl: 1,
      proxied: false,
      comment: "Landsat Alphabet API on Vercel",
    },
  );
});

test("buildRateLimitRule creates the 100 req/min/IP rule for name API paths", () => {
  assert.deepEqual(buildRateLimitRule({ hostname: "landsat.pranavkarra.me" }), {
    ref: "landsat-name-api-rate-limit",
    description: "Landsat Alphabet API: 100 requests per minute per IP",
    expression:
      '(http.host eq "landsat.pranavkarra.me" and starts_with(http.request.uri.path, "/v1/name/"))',
    action: "block",
    ratelimit: {
      characteristics: ["cf.colo.id", "ip.src"],
      period: 60,
      requests_per_period: 100,
      mitigation_timeout: 60,
    },
  });
});

test("findExistingDnsRecord matches A records by name", () => {
  const records = [
    { id: "one", type: "CNAME", name: "landsat.pranavkarra.me" },
    { id: "two", type: "A", name: "landsat.pranavkarra.me" },
  ];

  assert.deepEqual(findExistingDnsRecord(records, "landsat.pranavkarra.me"), records[1]);
});

test("findExistingRateLimitRule matches by stable ref", () => {
  const ruleset = {
    rules: [
      { id: "one", ref: "other" },
      { id: "two", ref: "landsat-name-api-rate-limit" },
    ],
  };

  assert.deepEqual(findExistingRateLimitRule(ruleset), ruleset.rules[1]);
});

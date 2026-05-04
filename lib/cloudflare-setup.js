export const CLOUDFLARE_API_BASE = "https://api.cloudflare.com/client/v4";
export const RATE_LIMIT_RULE_REF = "landsat-name-api-rate-limit";

export function buildDnsRecordPayload({
  hostname,
  targetIp = "76.76.21.21",
  proxied = false,
}) {
  return {
    type: "A",
    name: hostname,
    content: targetIp,
    ttl: 1,
    proxied,
    comment: "Landsat Alphabet API on Vercel",
  };
}

export function buildRateLimitRule({ hostname }) {
  return {
    ref: RATE_LIMIT_RULE_REF,
    description: "Landsat Alphabet API: 100 requests per minute per IP",
    expression: `(http.host eq "${hostname}" and starts_with(http.request.uri.path, "/v1/name/"))`,
    action: "block",
    ratelimit: {
      characteristics: ["cf.colo.id", "ip.src"],
      period: 60,
      requests_per_period: 100,
      mitigation_timeout: 60,
    },
  };
}

export function findExistingDnsRecord(records, hostname) {
  return records.find((record) => record.type === "A" && record.name === hostname);
}

export function findExistingRateLimitRule(ruleset) {
  return ruleset?.rules?.find((rule) => rule.ref === RATE_LIMIT_RULE_REF);
}

export class CloudflareClient {
  constructor({ token, fetcher = fetch }) {
    if (!token) throw new Error("CLOUDFLARE_API_TOKEN is required.");
    this.token = token;
    this.fetcher = fetcher;
  }

  async request(path, { method = "GET", body } = {}) {
    const response = await this.fetcher(`${CLOUDFLARE_API_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      const message = data.errors?.map((error) => error.message).join("; ");
      throw new Error(message || `Cloudflare API request failed: ${response.status}`);
    }

    return data.result;
  }

  async getZoneByName(zoneName) {
    const result = await this.request(`/zones?name=${encodeURIComponent(zoneName)}`);
    const zone = result[0];
    if (!zone) throw new Error(`Cloudflare zone not found: ${zoneName}`);
    return zone;
  }

  async listDnsRecords(zoneId, hostname) {
    return this.request(
      `/zones/${zoneId}/dns_records?type=A&name=${encodeURIComponent(hostname)}`,
    );
  }

  async createDnsRecord(zoneId, payload) {
    return this.request(`/zones/${zoneId}/dns_records`, {
      method: "POST",
      body: payload,
    });
  }

  async updateDnsRecord(zoneId, recordId, payload) {
    return this.request(`/zones/${zoneId}/dns_records/${recordId}`, {
      method: "PUT",
      body: payload,
    });
  }

  async getRateLimitEntrypoint(zoneId) {
    try {
      return await this.request(`/zones/${zoneId}/rulesets/phases/http_ratelimit/entrypoint`);
    } catch (error) {
      if (error.message.includes("not found")) return null;
      if (error.message.includes("could not route")) return null;
      throw error;
    }
  }

  async createRateLimitEntrypoint(zoneId, rule) {
    return this.request(`/zones/${zoneId}/rulesets`, {
      method: "POST",
      body: {
        name: "Landsat Alphabet API rate limiting",
        description: "Rate limiting for public Landsat Alphabet API endpoints",
        kind: "zone",
        phase: "http_ratelimit",
        rules: [rule],
      },
    });
  }

  async createRateLimitRule(zoneId, rulesetId, rule) {
    return this.request(`/zones/${zoneId}/rulesets/${rulesetId}/rules`, {
      method: "POST",
      body: rule,
    });
  }

  async updateRateLimitRule(zoneId, rulesetId, ruleId, rule) {
    return this.request(`/zones/${zoneId}/rulesets/${rulesetId}/rules/${ruleId}`, {
      method: "PUT",
      body: rule,
    });
  }
}

export async function configureCloudflare({
  token,
  zoneName = "pranavkarra.me",
  hostname = "landsat.pranavkarra.me",
  targetIp = "76.76.21.21",
  proxied = false,
  fetcher,
} = {}) {
  const client = new CloudflareClient({ token, fetcher });
  const zone = await client.getZoneByName(zoneName);
  const dnsPayload = buildDnsRecordPayload({ hostname, targetIp, proxied });
  const dnsRecords = await client.listDnsRecords(zone.id, hostname);
  const existingDns = findExistingDnsRecord(dnsRecords, hostname);
  const dnsRecord = existingDns
    ? await client.updateDnsRecord(zone.id, existingDns.id, dnsPayload)
    : await client.createDnsRecord(zone.id, dnsPayload);

  const rule = buildRateLimitRule({ hostname });
  const entrypoint = await client.getRateLimitEntrypoint(zone.id);
  let rateLimitResult;

  if (!entrypoint) {
    rateLimitResult = await client.createRateLimitEntrypoint(zone.id, rule);
  } else {
    const existingRule = findExistingRateLimitRule(entrypoint);
    rateLimitResult = existingRule
      ? await client.updateRateLimitRule(zone.id, entrypoint.id, existingRule.id, rule)
      : await client.createRateLimitRule(zone.id, entrypoint.id, rule);
  }

  return {
    zone,
    dnsRecord,
    rateLimitResult,
  };
}

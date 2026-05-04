import { configureCloudflare } from "../lib/cloudflare-setup.js";

const token = process.env.CLOUDFLARE_API_TOKEN;
const zoneName = process.env.CLOUDFLARE_ZONE_NAME || "pranavkarra.me";
const hostname = process.env.LANDSAT_HOSTNAME || "landsat.pranavkarra.me";
const targetIp = process.env.LANDSAT_TARGET_IP || "76.76.21.21";
const proxied = process.env.CLOUDFLARE_PROXIED === "true";

if (!token) {
  console.error("CLOUDFLARE_API_TOKEN is required.");
  process.exit(1);
}

const result = await configureCloudflare({
  token,
  zoneName,
  hostname,
  targetIp,
  proxied,
});

console.log(
  JSON.stringify(
    {
      zone: result.zone.name,
      dnsRecord: {
        id: result.dnsRecord.id,
        name: result.dnsRecord.name,
        type: result.dnsRecord.type,
        content: result.dnsRecord.content,
        proxied: result.dnsRecord.proxied,
      },
      rateLimit: {
        id: result.rateLimitResult.id,
        name: result.rateLimitResult.name,
        phase: result.rateLimitResult.phase,
      },
    },
    null,
    2,
  ),
);

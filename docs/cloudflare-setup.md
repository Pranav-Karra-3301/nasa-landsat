# Cloudflare Setup

Vercel production deployment:

- https://nasa-landsat-eta.vercel.app
- Vercel project: `pranavkarra/nasa-landsat`
- Requested custom domain: `landsat.pranavkarra.me`

Vercel accepted the domain, but DNS still needs to be configured at Cloudflare.

## DNS

In Cloudflare DNS for `pranavkarra.me`, add:

```txt
Type: A
Name: landsat
IPv4 address: 76.76.21.21
Proxy status: DNS only until Vercel verifies the domain
TTL: Auto
```

After Vercel shows the domain as valid and the certificate is active, switch the
record to proxied if you want Cloudflare WAF/rate limiting in front of Vercel.

Use Cloudflare SSL/TLS mode `Full (strict)` after the Vercel certificate is
active. Use `Full` temporarily only if certificate validation is still pending.

## Cache Rule

Create a cache rule matching:

```txt
Hostname equals landsat.pranavkarra.me
URI path starts with /v1/name/
```

Action:

```txt
Cache eligibility: Eligible for cache
Edge TTL: Respect origin
Browser TTL: Respect origin
```

The API already sends immutable cache headers.

## Rate Limiting

Create a rate limiting rule:

```txt
Expression:
(http.host eq "landsat.pranavkarra.me" and starts_with(http.request.uri.path, "/v1/name/"))

Characteristics:
IP

Period:
60 seconds

Requests:
100

Action:
Block or Managed Challenge
```

Use Managed Challenge if you want friendlier behavior for accidental bursts.
Use Block if the goal is strict API protection.

## API Setup Script

If you have a Cloudflare API token with Zone DNS Edit and Zone WAF Edit
permissions, the project can configure the DNS record and rate limit rule:

```bash
CLOUDFLARE_API_TOKEN=... pnpm run cloudflare:setup
```

Optional environment variables:

```txt
CLOUDFLARE_ZONE_NAME=pranavkarra.me
LANDSAT_HOSTNAME=landsat.pranavkarra.me
LANDSAT_TARGET_IP=76.76.21.21
CLOUDFLARE_PROXIED=false
```

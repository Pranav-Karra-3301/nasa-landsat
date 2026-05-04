/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  outputFileTracingIncludes: {
    "/v1/name/[file]": ["./public/landsat/manifest.json", "./public/landsat/tiles/**/*"],
    "/v1/manifest.json": ["./public/landsat/manifest.json"],
  },
};

export default nextConfig;

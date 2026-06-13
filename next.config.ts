import type { NextConfig } from "next";

// Only initialize the Cloudflare dev proxy during `next dev`. Running it during
// `next build` spins up Wrangler and writes to a global config dir, which fails
// in restricted/CI sandboxes. The production Cloudflare bundle is produced by
// `opennextjs-cloudflare build` instead.
if (process.env.NODE_ENV === "development") {
  import("@opennextjs/cloudflare").then((mod) => mod.initOpenNextCloudflareForDev());
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb"
    }
  }
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Next.js from modifying the repository's existing guidance.
  agentRules: false,
  // Authentication callbacks carry short-lived OAuth codes/magic-link tokens.
  logging: { incomingRequests: { ignore: [/^\/api\/auth\//] } },
  async redirects() {
    return [{
      source: "/:path*",
      has: [{ type: "host", value: "127\\.0\\.0\\.1" }],
      // Use the same local origin as the registered Google callback. Cookies
      // cannot follow a callback from the IP address to the localhost hostname.
      destination: "http://localhost:3000/:path*",
      permanent: false,
    }];
  },
};

export default nextConfig;

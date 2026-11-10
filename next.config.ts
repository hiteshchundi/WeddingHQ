import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Next.js from modifying the repository's existing guidance.
  agentRules: false,
  // Authentication callbacks carry short-lived OAuth codes/magic-link tokens.
  logging: { incomingRequests: { ignore: [/^\/api\/auth\//] } },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@zevlin/auth",
    "@zevlin/config",
    "@zevlin/contracts",
    "@zevlin/db",
    "@zevlin/integrations",
    "@zevlin/observability",
    "@zevlin/security",
    "@zevlin/ui",
  ],
};

export default nextConfig;

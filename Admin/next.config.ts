import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/fevicon.png",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["baileys", "jimp", "sharp"],
};

export default nextConfig;

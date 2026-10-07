import type { NextConfig } from "next";

const immutable = [
  { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
];

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/models/:path*", headers: immutable },
      { source: "/posters/:path*", headers: immutable },
      { source: "/draco/:path*", headers: immutable },
    ];
  },
};

export default nextConfig;

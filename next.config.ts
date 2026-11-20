import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // plan pages show the label text the reader saw, read from disk at request time
  outputFileTracingIncludes: { "/plan/*": ["./data/text/**/*", "./data/text-dallas/**/*"] },
  partialPrefetching: true,
  // browsers ask for /favicon.ico on their own; send them to the real icon instead of a 404
  async redirects() {
    return [{ source: "/favicon.ico", destination: "/icon.svg", permanent: true }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

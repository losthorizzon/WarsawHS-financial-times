import type { NextConfig } from "next";

// The site is published to GitHub Pages as plain static files, under
// https://losthorizzon.github.io/WarsawHS-financial-times/ — so every URL
// needs that repo-name prefix in production. The deploy workflow sets
// PAGES_BASE_PATH; local `npm run dev` leaves it empty.
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
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

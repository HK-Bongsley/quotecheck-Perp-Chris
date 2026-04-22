/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@quotecheck/estimator"],
  },
  images: {
    unoptimized: true,
  },
  output: "export",
  basePath: "",
};

module.exports = nextConfig;

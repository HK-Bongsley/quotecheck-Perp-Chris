/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: {
    serverComponentsExternalPackages: ['@cloudflare/turnstile-react']
  }
};

export default nextConfig;
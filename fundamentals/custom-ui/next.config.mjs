/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  transpilePackages: [
    "@akapulu/react",
    "@akapulu/server",
  ],
};

export default nextConfig;

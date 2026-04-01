/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  transpilePackages: [
    "@akapulu/web-core",
    "@akapulu/react",
    "@akapulu/react-ui",
    "@akapulu/server",
  ],
};

export default nextConfig;

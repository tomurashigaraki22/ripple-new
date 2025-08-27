/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      // ✅ Ignore TypeScript build errors
      ignoreBuildErrors: true,
    },
    eslint: {
      // ✅ Ignore ESLint build errors
      ignoreDuringBuilds: true,
    },
    images: {
      domains: ['res.cloudinary.com'],
    },
  };

export default nextConfig;

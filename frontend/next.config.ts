import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Cloudinary — fotos de productos subidas desde el panel admin
        protocol: "https",
        hostname: "res.cloudinary.com",
        // Restringido a nuestro cloud específico
        pathname: "/dac6nk0ji/**",
      },
    ],
  },
};

export default nextConfig;

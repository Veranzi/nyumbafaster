import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
    // Pin Turbopack to this directory so it doesn't walk up to the empty parent.
    turbopack: { root: __dirname },
    images: {
        // Supabase Storage public URLs follow {project}.supabase.co/storage/v1/object/public/...
        // Cloudinary handles transcoded video posters.
        remotePatterns: [
            { protocol: "https", hostname: "*.supabase.co" },
            { protocol: "https", hostname: "res.cloudinary.com" },
            { protocol: "https", hostname: "images.unsplash.com" },
        ],
    },
    experimental: {
        // next-intl + RSC works without this but the team recommends it
        serverActions: { bodySizeLimit: "5mb" },
    },
};

export default withNextIntl(nextConfig);

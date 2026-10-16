import type { NextConfig } from "next";

/** Supabase Storage serves all uploaded media, so its host has to be allowed
 *  for `next/image`. Derived from the same env var the client uses, so there
 *  is only ever one place to change the project. */
const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : null;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  // Keep test servers from overwriting the user's running development build.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  typescript: { tsconfigPath: process.env.NEXT_TSCONFIG_PATH ?? "tsconfig.json" },
  // Several lockfiles exist above this directory; pin the root explicitly.
  outputFileTracingRoot: __dirname,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      ...(supabaseHost
        ? ([
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ])
        : []),
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  eslint: {
    dirs: ["app", "components", "lib"],
  },
};

export default nextConfig;

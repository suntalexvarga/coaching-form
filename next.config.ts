import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export static — site-ul e 100% client-side, deci merge pe orice hosting
  // gratuit (Vercel, Netlify, Cloudflare Pages).
  output: "export",
  reactCompiler: true,
};

export default nextConfig;

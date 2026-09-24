import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The saved-words page used to be called the Codex; keep old links and bookmarks working.
  async redirects() {
    return [{ source: "/codex", destination: "/my-words", permanent: true }];
  },
};

export default nextConfig;

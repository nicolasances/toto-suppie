import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['toto-react'],
  // turbopack: {} silences the "webpack config without turbopack config" warning in Next.js 16.
  // Use `--webpack` flag (dev/build scripts) to get toto-react local linking working,
  // since Turbopack rejects symlink targets that resolve outside the project root.
  turbopack: {},
  webpack: (config) => {
    const path = require("path");
    // Exact-match alias for the main toto-react barrel (lets sub-paths like toto-react/server/* resolve normally)
    config.resolve.alias['toto-react$'] = path.resolve(__dirname, '../toto-react/src/index.ts');
    return config;
  },
  async headers() {
    return [
      {
        source: '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.ico|.*\\.json|.*\\.js|.*\\.css).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
    ];
  },
};

export default nextConfig;

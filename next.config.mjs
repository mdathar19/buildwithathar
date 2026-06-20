/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Canonicalize www -> non-www at the edge so Google stops surfacing the
      // www variants as "alternate page with proper canonical tag" entries.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.buildwithathar.com" }],
        destination: "https://buildwithathar.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

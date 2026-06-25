/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Legacy query-param topic URLs -> canonical crawlable topic hubs.
      // 308 (permanent) so link equity consolidates and the param page never
      // competes with /insights/topics/<key> for indexing.
      {
        source: "/insights",
        has: [{ type: "query", key: "topic", value: "(?<topic>[^&]+)" }],
        destination: "/insights/topics/:topic",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

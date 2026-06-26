const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: "standalone",
  experimental: { missingSuspenseWithCSRBailout: false },
};

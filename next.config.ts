import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./data/*.json", "./assets/BeVietnamPro-SemiBold.ttf"],
  },
}

export default nextConfig

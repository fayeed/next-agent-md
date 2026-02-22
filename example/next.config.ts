import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: [{ key: 'vary', value: 'accept' }],
      },
    ]
  },
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
async redirects() {
    return [
      // Browsers sometimes request /path. (with trailing dot) when URL is typed without http://
      { source: '/:path+.', destination: '/:path+', permanent: false },
    ]
  },
}

export default nextConfig

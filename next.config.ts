import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Configurações otimizadas para Vercel
  // output: 'standalone', // Comentado para Vercel
  poweredByHeader: false,
  compress: true,
  generateEtags: false,

  // Configurações de imagem para otimização
  images: {
    domains: ['via.placeholder.com', 'localhost'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Configurações experimentais otimizadas
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  
  // Configurações de pacotes externos
  serverExternalPackages: ['@supabase/supabase-js'],

  // Configurações de headers para segurança e performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ]
  },

  // Configurações de redirecionamento
  async redirects() {
    return [
      {
        source: '/dashboard/overview',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
}

export default nextConfig

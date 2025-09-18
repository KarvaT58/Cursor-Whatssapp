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
  experimental: {
    turbo: {
      // Configurações para resolver problemas com caracteres especiais no caminho
      resolveAlias: {
        // Mapear caminhos para evitar problemas com caracteres especiais
      },
    },
  },
  // Configurações adicionais para resolver problemas de encoding
  webpack: (config, { isServer }) => {
    // Configurar encoding UTF-8 para resolver problemas com caracteres especiais
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
        },
      },
    })
    return config
  },
}

export default nextConfig

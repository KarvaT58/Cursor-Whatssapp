export default {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  reportsDirectory: './coverage',
  exclude: [
    'node_modules/',
    'src/test/',
    '**/*.d.ts',
    '**/*.config.*',
    '**/coverage/**',
    '**/dist/**',
    '**/.next/**',
    '**/public/**',
    '**/*.test.*',
    '**/*.spec.*',
  ],
  include: ['src/**/*.{ts,tsx}'],
  excludeNodeModules: true,
  all: true,
  thresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

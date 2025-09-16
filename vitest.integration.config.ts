import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    name: 'integration',
    environment: 'jsdom',
    setupFiles: ['./src/test/integration/setup.ts'],
    globals: true,
    css: false,
    include: ['src/test/integration/**/*.test.ts'],
    exclude: ['node_modules/', 'src/test/unit/', 'src/test/e2e/'],
    testTimeout: 30000, // 30 seconds for integration tests
    hookTimeout: 30000,
    teardownTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/integration',
      exclude: [
        'node_modules/',
        'src/test/',
        'src/types/',
        'src/lib/supabase/',
        'src/lib/workers/',
        'src/lib/queues/',
        'src/lib/redis/',
        'src/lib/z-api/',
        'src/app/',
        'src/components/ui/',
        'src/components/index.ts',
        'src/hooks/index.ts',
        'src/hooks/notifications/index.ts',
        'src/hooks/performance/index.ts',
        'src/providers/',
      ],
    },
  },
})

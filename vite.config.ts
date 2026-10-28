import { defineConfig } from 'vitest/config';
export default defineConfig({
  base: '/',
  // Offline model environments contain their own HTML/JS; they are never app entries.
  optimizeDeps: { entries: ['index.html'] },
  server: { host: '127.0.0.1', port: 5174, strictPort: true,
    watch: { ignored: ['**/.tools/**', '**/audio-workbench/**', '**/test-results/**'] } },
  preview: { host: '127.0.0.1', port: 4174, strictPort: true },
  build: { target: 'es2022' },
  test: { include: ['tests/**/*.test.ts'], testTimeout: 60000 },
});

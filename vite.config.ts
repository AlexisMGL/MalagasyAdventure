import { defineConfig } from 'vitest/config';
export default defineConfig({
  base: '/',
  server: { host: '127.0.0.1', port: 5174, strictPort: true },
  preview: { host: '127.0.0.1', port: 4174, strictPort: true },
  build: { target: 'es2022' },
  test: { include: ['tests/**/*.test.ts'], testTimeout: 60000 },
});

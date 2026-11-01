import { defineConfig } from 'vitest/config';
import { randomUUID } from 'node:crypto';

// One deployment identity shared by the running bundle and the tiny update check.
const buildId = randomUUID();
export default defineConfig({
  base: '/',
  define: { __MA_BUILD_ID__: JSON.stringify(buildId) },
  plugins: [{ name: 'malagasy-release', generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version: buildId }) });
  } }],
  // Offline model environments contain their own HTML/JS; they are never app entries.
  optimizeDeps: { entries: ['index.html'] },
  server: { host: '127.0.0.1', port: 5174, strictPort: true,
    watch: { ignored: ['**/.tools/**', '**/audio-workbench/**', '**/test-results/**'] } },
  preview: { host: '127.0.0.1', port: 4174, strictPort: true },
  build: { target: 'es2022' },
  test: { include: ['tests/**/*.test.ts'], testTimeout: 60000 },
});

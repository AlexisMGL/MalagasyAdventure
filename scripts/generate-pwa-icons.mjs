// Original leaf mark from favicon.svg, rasterized locally; no external asset or service.
import { chromium } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const svg = (await readFile(new URL('../public/favicon.svg', import.meta.url), 'utf8')).replace('rx="15"', 'rx="0"');
const destination = new URL('../public/icons/', import.meta.url);
await mkdir(destination, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const [file, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['icon-maskable-512.png', 512], ['apple-touch-icon.png', 180]]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<style>html,body{margin:0;width:100%;height:100%}svg{display:block;width:100%;height:100%}</style>${svg}`);
    await page.screenshot({ path: fileURLToPath(new URL(file, destination)) });
  }
} finally { await browser.close(); }

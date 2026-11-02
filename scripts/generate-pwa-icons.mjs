// Approved original maki, rasterized locally; no external asset or service.
import { chromium } from '@playwright/test';
import { readFile, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const svg = await readFile(new URL('../public/brand/maki.svg', import.meta.url), 'utf8');
const root = svg.match(/^<svg\b[^>]*>/u)[0];
const mark = svg.replace(root, '').replace(/<rect\b[^>]*\/>/u, '').replace('</svg>', '');
const square = '<rect width="128" height="128" fill="#345746"/>';
const iconSvg = masked => `${root}${square}${masked ? '<g transform="translate(10.24 10.24) scale(.84)">' : ''}${mark}${masked ? '</g>' : ''}</svg>`;
await writeFile(new URL('../public/favicon.svg', import.meta.url), svg);
// Reverse foreground/background colors for the existing cream sidebar, as in the approved proposal.
await writeFile(new URL('../public/brand/maki-mark.svg', import.meta.url), `${root}${mark.replace(/#f7f2dc|#345746/gu, color => color === '#f7f2dc' ? '#345746' : '#faf9f5')}</svg>`);
const destination = new URL('../public/icons/', import.meta.url);
await mkdir(destination, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const [file, legacy, size, masked] of [
    ['maki-192.png', 'icon-192.png', 192, false],
    ['maki-512.png', 'icon-512.png', 512, false],
    ['maki-maskable-512.png', 'icon-maskable-512.png', 512, true],
    ['maki-apple-touch-icon.png', 'apple-touch-icon.png', 180, false],
  ]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<style>html,body{margin:0;width:100%;height:100%}svg{display:block;width:100%;height:100%}</style>${iconSvg(masked)}`);
    await page.screenshot({ path: fileURLToPath(new URL(file, destination)) });
    // Old direct links also show the maki; the manifest uses new URLs to trigger identity updates.
    await copyFile(new URL(file, destination), new URL(legacy, destination));
  }
} finally { await browser.close(); }

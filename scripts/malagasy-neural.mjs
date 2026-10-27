#!/usr/bin/env node
/** Convenience launcher for the free, local-only audio authoring environment. */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
const explicit = process.env.MALAGASY_AUDIO_PYTHON;
const candidates = [explicit, '.tools/omnivoice-xpu/Scripts/python.exe', '.tools/omnivoice-runtime/Scripts/python.exe', '.tools/omnivoice-runtime/bin/python'].filter(Boolean);
const python = candidates.find(file => existsSync(file));
if (!python) {
  console.error('Environnement audio local absent. Voir docs/MALAGASY_NEURAL_SETUP.md ; aucune API payante ne sera utilisée.');
  process.exitCode = 1;
} else {
  const dependencies = resolve('.tools/omnivoice-deps');
  const environment = { ...process.env, PYTHONDONTWRITEBYTECODE: '1', PYTHONUNBUFFERED: '1', PYTHONIOENCODING: 'utf-8' };
  if (existsSync(dependencies)) environment.PYTHONPATH = [dependencies, environment.PYTHONPATH].filter(Boolean).join(process.platform === 'win32' ? ';' : ':');
  const child = spawn(python, ['scripts/generate-malagasy-neural.py', ...process.argv.slice(2)], { stdio: 'inherit', env: environment, windowsHide: true });
  child.on('error', error => { console.error(error.message); process.exitCode = 1; });
  child.on('exit', code => { process.exitCode = code ?? 1; });
}

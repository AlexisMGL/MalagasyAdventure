#!/usr/bin/env node
/** Copy the existing reviewed-in-the-workbench batch. Never runs a model or an encoder. */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const batch = resolve(root, 'audio-workbench/generated/omnivoice');
const destination = resolve(root, 'public/malagasy/voices/omnivoice');
const manifest = JSON.parse(readFileSync(resolve(batch, 'manifest.json'), 'utf8'));
const sources = JSON.parse(readFileSync(resolve(batch, 'sources.json'), 'utf8'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const files = [];
for (const recording of manifest.recordings) {
  if (!/^audio-neural-(mia|lova)-[a-f0-9]{16}$/u.test(recording.id)
    || recording.masterFile !== `masters/${recording.id}.wav`
    || recording.file !== `audio/${recording.id}.ogg`
    || recording.status !== 'synthetic' || recording.verification !== 'model-generated') throw Error('Invalid candidate metadata');
  files.push([recording.masterFile, recording.masterSha256], [recording.file, recording.sha256]);
}
for (const reference of manifest.references) {
  if (!['mia', 'lova'].includes(reference.character) || reference.file !== `references/${reference.character}.wav`) throw Error('Invalid reference metadata');
  files.push([reference.file, reference.sha256]);
}
// Verify every byte before publishing anything; only files declared in the batch qualify.
for (const [file, expected] of files) {
  if (sha256(readFileSync(resolve(batch, file))) !== expected) throw Error(`Candidate hash mismatch: ${file}`);
}
for (const [file] of files) {
  const target = resolve(destination, file);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(resolve(batch, file), target);
}
for (const file of ['manifest.json', 'sources.json']) copyFileSync(resolve(batch, file), resolve(destination, file));
mkdirSync(resolve(destination, 'licenses'), { recursive: true });
for (const file of ['BOSON_HIGGS_AUDIO_2_LICENSE.txt', 'META_LLAMA_3_LICENSE_AND_USE_POLICY.txt']) {
  copyFileSync(resolve(root, 'audio-workbench/licenses', file), resolve(destination, 'licenses', file));
}
copyFileSync(resolve(root, 'audio-workbench/NOTICE.md'), resolve(destination, 'NOTICE.md'));
const recordings = manifest.recordings.map(({ id, transcript, spokenText, sourceId, character, status, verification, model, masterFile }) => ({
  id, url: `/malagasy/voices/omnivoice/${masterFile}`, transcript, spokenText, sourceId, character, status, verification, model,
}));
const notice = 'Built with Higgs Materials licensed from Boson AI USA, Inc., Copyright Boson AI USA, Inc., All Rights Reserved and Meta Llama 3 licensed under the Meta Llama 3 Community License, Copyright Meta Platforms, Inc., All Right Reserved. Based on Meta Llama 3.';
writeFileSync(resolve(root, 'src/malagasy/omnivoice-voices.ts'), `// Existing OmniVoice batch copied by scripts/activate-malagasy-omnivoice.mjs; no synthesis.\nimport type { AudioAsset, Source } from './types';\n\nexport const OMNIVOICE_RECORDINGS: AudioAsset[] = ${JSON.stringify(recordings, null, 2)};\n\nexport const OMNIVOICE_SOURCES: Source[] = ${JSON.stringify(sources, null, 2)};\n\nexport const OMNIVOICE_NOTICE = ${JSON.stringify(notice)};\n`);
console.log(`Activated ${recordings.length} existing OmniVoice recordings; all WAV/Opus/reference SHA-256 hashes match.`);

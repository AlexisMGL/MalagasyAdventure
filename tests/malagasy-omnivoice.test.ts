import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { OMNIVOICE_RECORDINGS } from '../src/malagasy/omnivoice-voices';
import { ALL_DIALOGUE_RECORDINGS } from '../src/malagasy/voice-bank';

it('publishes the complete OmniVoice bank while preserving original audio bytes and provenance', () => {
  const authoring = resolve('audio-workbench/generated/omnivoice');
  const published = resolve('public/malagasy/voices/omnivoice');
  const manifest = JSON.parse(readFileSync(resolve(authoring, 'manifest.json'), 'utf8'));
  expect(readFileSync(resolve(published, 'manifest.json')).equals(readFileSync(resolve(authoring, 'manifest.json')))).toBe(true);
  expect(manifest.nativeSpeakerReviewed).toBe(false);
  expect(ALL_DIALOGUE_RECORDINGS).toEqual(OMNIVOICE_RECORDINGS);
  expect(OMNIVOICE_RECORDINGS.length).toBeGreaterThan(102);
  for (const entry of manifest.recordings) {
    const asset = OMNIVOICE_RECORDINGS.find(asset => asset.id === entry.id)!;
    expect(asset.character).toBe(entry.character);
    expect(asset.url).toBe(`/malagasy/voices/omnivoice/${entry.masterFile}`);
    expect(asset.spokenText).toBe(entry.spokenText);
    expect(asset.status).toBe('synthetic');
    for (const [file, hash] of [[entry.masterFile, entry.masterSha256], [entry.file, entry.sha256]]) {
      const bytes = readFileSync(resolve(published, file));
      expect(bytes.equals(readFileSync(resolve(authoring, file)))).toBe(true);
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(hash);
    }
  }
  for (const reference of manifest.references) {
    expect(createHash('sha256').update(readFileSync(resolve(published, reference.file))).digest('hex')).toBe(reference.sha256);
  }
  const original = JSON.parse(readFileSync(resolve('tests/fixtures/omnivoice-original-hashes.json'), 'utf8'));
  expect(original.recordings).toHaveLength(102);
  for (const entry of original.recordings) {
    for (const [file, hash] of [[entry.masterFile, entry.masterSha256], [entry.file, entry.sha256]]) {
      expect(createHash('sha256').update(readFileSync(resolve(published, file))).digest('hex')).toBe(hash);
    }
  }
  for (const file of ['BOSON_HIGGS_AUDIO_2_LICENSE.txt', 'META_LLAMA_3_LICENSE_AND_USE_POLICY.txt']) {
    expect(readFileSync(resolve(published, 'licenses', file))).toEqual(readFileSync(resolve('audio-workbench/licenses', file)));
  }
});

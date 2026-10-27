import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep, basename } from 'node:path';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { request as httpRequest } from 'node:http';
import { createReviewServer, loadAudioCatalog } from './malagasy-audio-review.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const original = Buffer.from('RIFF1234WAVEactual audio bytes');
function pcmWave() {
  const wave = Buffer.alloc(44 + 320);
  wave.write('RIFF'); wave.writeUInt32LE(wave.length - 8, 4); wave.write('WAVE', 8); wave.write('fmt ', 12);
  wave.writeUInt32LE(16, 16); wave.writeUInt16LE(1, 20); wave.writeUInt16LE(1, 22);
  wave.writeUInt32LE(16000, 24); wave.writeUInt32LE(32000, 28); wave.writeUInt16LE(2, 32); wave.writeUInt16LE(16, 34);
  wave.write('data', 36); wave.writeUInt32LE(320, 40);
  for (let i = 0; i < 160; i++) wave.writeInt16LE(Math.round(Math.sin(i / 10) * 1000), 44 + i * 2);
  return wave;
}
async function put(root, path, value) { await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), value); }
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'malagasy-review-'));
  await put(root, 'public/malagasy/voices/mms/salama.wav', original);
  await put(root, 'public/malagasy/voices/mms/manifest.json', JSON.stringify({ model: 'mms', recordings: [{ id: 'mms.salama', transcript: 'Salama!', url: '/malagasy/voices/mms/salama.wav', sha256: hash(original), duration: 1.1 }] }));
  await put(root, 'audio-workbench/generated/omnivoice/audio/salama.ogg', Buffer.from('OggSnew synthetic audio'));
  await put(root, 'audio-workbench/generated/omnivoice/manifest.json', JSON.stringify({ model: 'omnivoice', recordings: [{ id: 'omni.mia.salama', transcript: 'Salama!', character: 'mia', file: 'audio/salama.ogg', duration: 1.2 }] }));
  const server = createReviewServer({ root }); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  return { root, server, base, async close() {
    await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    assert.ok(resolve(root).startsWith(resolve(tmpdir()) + sep) && basename(root).startsWith('malagasy-review-'));
    await rm(root, { recursive: true, force: true });
  } };
}
async function post(base, body, headers = {}) {
  return fetch(base + '/api/review', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
}

test('catalogue compares actual current and candidate files without exposing local paths', async () => {
  const fixture = await fixtureFactory();
  try {
    const result = await (await fetch(fixture.base + '/api/catalog')).json();
    assert.equal(result.assets.length, 2);
    assert.equal(result.assets[0].sha256, hash(original));
    assert.equal(result.assets[0].group, result.assets[1].group);
    assert.equal(result.assets[1].character, 'mia');
    assert.equal(result.assets[0].file, undefined);
    assert.equal(result.assets[0].reviewIsCurrent, false);
    assert.equal(result.assets[0].manifestHashMatches, true);
    const html = await (await fetch(fixture.base)).text();
    assert.match(html, /Atelier de développement local/);
    assert.match(html, /preservesPitch = true/);
    assert.match(html, /\.8/);
    assert.ok(!html.includes('speechSynthesis'));
  } finally { await fixture.close(); }
});

// Named alias keeps the local test variable readable without shadowing setup.
const fixtureFactory = fixture;

test('audio route serves only inventoried bytes, supports byte ranges and rejects malformed ranges', async () => {
  const fixture = await fixtureFactory();
  try {
    const catalog = await (await fetch(fixture.base + '/api/catalog')).json();
    const url = fixture.base + catalog.assets[0].audioUrl;
    const full = await fetch(url); assert.equal(full.status, 200); assert.equal(full.headers.get('content-type'), 'audio/wav');
    assert.deepEqual(Buffer.from(await full.arrayBuffer()), original);
    const partial = await fetch(url, { headers: { range: 'bytes=0-3' } });
    assert.equal(partial.status, 206); assert.equal(await partial.text(), 'RIFF');
    assert.equal(partial.headers.get('content-range'), `bytes 0-3/${original.length}`);
    assert.equal((await fetch(url, { headers: { range: 'bytes=999-1000' } })).status, 416);
    assert.equal((await fetch(url, { headers: { range: 'bytes=0-2,4-8' } })).status, 416);
    assert.equal((await fetch(fixture.base + '/audio/../../package.json')).status, 404);
  } finally { await fixture.close(); }
});

test('OmniVoice plays its PCM master while reviews retain both exact file hashes', async () => {
  const fixture = await fixtureFactory();
  try {
    const master = pcmWave();
    const manifestFile = 'audio-workbench/generated/omnivoice/manifest.json';
    const manifest = JSON.parse(await readFile(join(fixture.root, manifestFile), 'utf8'));
    manifest.recordings[0].masterFile = 'masters/salama.wav';
    manifest.recordings[0].masterSha256 = hash(master);
    await put(fixture.root, 'audio-workbench/generated/omnivoice/masters/salama.wav', master);
    await put(fixture.root, manifestFile, JSON.stringify(manifest));
    const candidate = (await (await fetch(fixture.base + '/api/catalog')).json()).assets.find(asset => asset.variant === 'omnivoice');
    assert.equal(candidate.playbackFormat, 'WAV PCM');
    assert.equal(candidate.playbackSha256, hash(master));
    assert.notEqual(candidate.sha256, candidate.playbackSha256);
    assert.ok(candidate.audioUrl.endsWith(hash(master)));
    assert.equal(candidate.playbackFile, undefined);
    const audio = await fetch(fixture.base + candidate.audioUrl);
    assert.equal(audio.headers.get('content-type'), 'audio/wav');
    assert.deepEqual(Buffer.from(await audio.arrayBuffer()), master);
    const part = await fetch(fixture.base + candidate.audioUrl, { headers: { range: 'bytes=0-43' } });
    assert.equal(part.headers.get('content-range'), `bytes 0-43/${master.length}`);
    assert.deepEqual(Buffer.from(await part.arrayBuffer()), master.subarray(0, 44));
    const review = { key: candidate.key, sha256: candidate.sha256, rating: 'good', notes: 'Prononciation écoutée sur le maître PCM.' };
    assert.equal((await post(fixture.base, review)).status, 409); // Old pages must refresh the actual listening version.
    assert.equal((await post(fixture.base, { ...review, playbackSha256: candidate.playbackSha256 })).status, 200);
    const saved = JSON.parse(await readFile(join(fixture.root, 'audio-workbench/reviews.json'), 'utf8'));
    assert.equal(saved.entries[candidate.key].sha256, candidate.sha256);
    assert.equal(saved.entries[candidate.key].playbackSha256, hash(master));
    const changed = Buffer.from(master); changed.writeInt16LE(99, 44);
    await put(fixture.root, 'audio-workbench/generated/omnivoice/masters/salama.wav', changed);
    assert.equal((await post(fixture.base, { ...review, playbackSha256: candidate.playbackSha256 })).status, 409);
    const updated = (await (await fetch(fixture.base + '/api/catalog')).json()).assets.find(asset => asset.key === candidate.key);
    assert.equal(updated.reviewIsCurrent, false);
    assert.equal(updated.manifestHashMatches, false);
  } finally { await fixture.close(); }
});

test('a master path cannot escape the inventoried audio directory', async () => {
  const fixture = await fixtureFactory();
  try {
    const manifestFile = 'audio-workbench/generated/omnivoice/manifest.json';
    const manifest = JSON.parse(await readFile(join(fixture.root, manifestFile), 'utf8'));
    manifest.recordings[0].masterFile = '../../../private.wav';
    await put(fixture.root, 'private.wav', pcmWave());
    await put(fixture.root, manifestFile, JSON.stringify(manifest));
    const catalog = await (await fetch(fixture.base + '/api/catalog')).json();
    const candidate = catalog.assets.find(asset => asset.variant === 'omnivoice');
    assert.equal(candidate.playbackFormat, 'OGG');
    assert.equal(candidate.playbackSha256, candidate.sha256);
    assert.match(catalog.warnings.join(' '), /maître WAV absent ou invalide/);
    const audio = await fetch(fixture.base + candidate.audioUrl);
    assert.equal(audio.headers.get('content-type'), 'audio/ogg');
  } finally { await fixture.close(); }
});

test('review save persists its exact audio hash and rejects a stale browser version', async () => {
  const fixture = await fixtureFactory();
  try {
    const first = (await (await fetch(fixture.base + '/api/catalog')).json()).assets[0];
    const entry = { key: first.key, sha256: first.sha256, rating: 'good', notes: 'Relu : début et fin complets.', reviewer: 'AB' };
    assert.equal((await post(fixture.base, entry)).status, 200);
    const saved = JSON.parse(await readFile(join(fixture.root, 'audio-workbench/reviews.json'), 'utf8'));
    assert.equal(saved.entries[first.key].sha256, first.sha256);
    assert.equal(saved.entries[first.key].rating, 'good');
    const audioFile = join(fixture.root, 'public/malagasy/voices/mms/salama.wav');
    await writeFile(audioFile, Buffer.from('RIFFchangedWAVEnew bytes'));
    assert.equal((await post(fixture.base, entry)).status, 409);
    const current = (await (await fetch(fixture.base + '/api/catalog')).json()).assets[0];
    assert.notEqual(current.audioUrl, first.audioUrl);
    assert.equal(current.reviewIsCurrent, false);
    assert.equal(current.review.rating, 'good');
    assert.equal(current.manifestHashMatches, false);
    assert.equal((await post(fixture.base, { ...entry, sha256: current.sha256, rating: 'incorrect' })).status, 200);
    const exported = await fetch(fixture.base + '/api/export');
    assert.match(exported.headers.get('content-disposition'), /attachment/);
    const review = await exported.json();
    assert.equal(review.entries[first.key].rating, 'incorrect');
    assert.equal(review.history[0].sha256, first.sha256);
  } finally { await fixture.close(); }
});

test('review API validates origins, body format, allowed ratings and bounded notes', async () => {
  const fixture = await fixtureFactory();
  try {
    const asset = (await (await fetch(fixture.base + '/api/catalog')).json()).assets[0];
    const valid = { key: asset.key, sha256: asset.sha256, rating: 'acceptable', notes: '' };
    assert.equal((await post(fixture.base, valid, { origin: 'https://unrelated.example' })).status, 403);
    const wrongHostStatus = await new Promise((resolve, reject) => {
      const request = httpRequest(fixture.base + '/api/catalog', { headers: { host: 'unrelated.example' } }, response => { response.resume(); resolve(response.statusCode); });
      request.on('error', reject); request.end();
    });
    assert.equal(wrongHostStatus, 403);
    assert.equal((await post(fixture.base, valid, { 'content-type': 'text/plain' })).status, 415);
    assert.equal((await post(fixture.base, { ...valid, rating: 'approved-native' })).status, 400);
    assert.equal((await post(fixture.base, { ...valid, notes: 'x'.repeat(4001) })).status, 400);
    assert.equal((await post(fixture.base, { ...valid, notes: 'x'.repeat(17000) })).status, 413);
    const badJson = await fetch(fixture.base + '/api/review', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' });
    assert.equal(badJson.status, 400);
    assert.equal((await post(fixture.base, { ...valid, key: '0'.repeat(24) })).status, 404);
    assert.equal((await post(fixture.base, valid)).status, 200);
  } finally { await fixture.close(); }
});

test('manifest traversal and remote URLs never expose arbitrary files', async () => {
  const fixture = await fixtureFactory();
  try {
    await put(fixture.root, 'private.wav', Buffer.from('RIFFprivate outside allowed roots'));
    await put(fixture.root, 'outside-audio/private.wav', Buffer.from('RIFFprivate through a directory link'));
    await symlink(join(fixture.root, 'outside-audio'), join(fixture.root, 'audio-workbench/generated/omnivoice/audio/bridge'), 'junction');
    await put(fixture.root, 'audio-workbench/generated/omnivoice/manifest.json', JSON.stringify({ recordings: [
      { id: 'escape', transcript: 'Secret', file: '../../../private.wav' },
      { id: 'remote', transcript: 'Remote', file: 'https://example.com/file.wav' },
      { id: 'absolute', transcript: 'Absolute', file: join(fixture.root, 'private.wav') },
      { id: 'linked', transcript: 'Linked', file: 'audio/bridge/private.wav' },
    ] }));
    const result = await loadAudioCatalog(fixture.root);
    assert.equal(result.assets.length, 1);
    assert.equal(result.assets[0].id, 'mms.salama');
  } finally { await fixture.close(); }
});

test('an absent candidate and corrupted review metadata are reported without rewriting them', async () => {
  const fixture = await fixtureFactory();
  try {
    await rm(join(fixture.root, 'audio-workbench/generated/omnivoice/manifest.json'));
    const catalog = await (await fetch(fixture.base + '/api/catalog')).json();
    assert.match(catalog.warnings.join(' '), /pas encore disponible/);
    await put(fixture.root, 'audio-workbench/reviews.json', '{broken');
    assert.equal((await fetch(fixture.base + '/api/catalog')).status, 500);
    assert.equal(await readFile(join(fixture.root, 'audio-workbench/reviews.json'), 'utf8'), '{broken');
  } finally { await fixture.close(); }
});

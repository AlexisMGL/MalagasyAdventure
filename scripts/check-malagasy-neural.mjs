#!/usr/bin/env node
/** Read-only technical audit of candidate audio. It does not assess pronunciation. */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = resolve(ROOT, 'audio-workbench/generated/omnivoice');
const MODEL = 'k2-fsa/OmniVoice';
const REVISION = 'c5fdb5ccb189668d56333f77ba2629f4cd7535f4';
const SOURCE = 'omnivoice-malagasy';
const CHARACTERS = ['mia', 'lova'];
const MODEL_HASHES = {
  'model.safetensors': '730839316de585f4c8298ec0e1712efc10fb19c6fa4e36eb741cb8d51ebcf6aa',
  'audio_tokenizer/model.safetensors': 'fe7c5e8785e0a05833e1bfc3e002ec7f55af21e306b2e7154a448c1f54ccfb0d',
  'config.json': '5e359117e13b420c5e0c925d4aba650d624767131f1d1746928f8b850d5dc372',
  'tokenizer.json': '408f669b7e2b045fdf54201d815bd364e6667dbd845115da81239c40bc6dcfd1',
  'tokenizer_config.json': '49f78845596a82bf15c83673794bdf9f76f812b11f60ab6a2239d9be65b00676',
  'audio_tokenizer/config.json': 'eefb20806f7104e77c9a5277c9df0f9bb8826b08eb1d4e8ab2b9829b6ef9fac1',
  'audio_tokenizer/preprocessor_config.json': 'ae61eea88558608ee2fa86d2aec9fce8d99a5ff75d09cb7651ccce21ae1d9084',
};
const sha256 = value => createHash('sha256').update(value).digest('hex');
const hashFormat = value => typeof value === 'string' && /^[a-f0-9]{64}$/u.test(value);
const readJson = path => JSON.parse(readFileSync(path, 'utf8'));
const canonical = value => JSON.stringify(value && typeof value === 'object' && !Array.isArray(value)
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, JSON.parse(canonical(value[key]))]))
  : Array.isArray(value) ? value.map(item => JSON.parse(canonical(item))) : value);
const bindingSignatures = entries => entries.map(canonical).sort();

/** Resolve and check real paths too: a symlink must not escape the workbench. */
function boundedFile(relative) {
  if (typeof relative !== 'string' || !relative || isAbsolute(relative) || /[\\:%\0]/u.test(relative)
    || relative.split('/').some(part => !part || part === '.' || part === '..')) throw Error('Invalid relative audio path');
  const absolute = resolve(OUTPUT, relative);
  if (!absolute.startsWith(OUTPUT + sep)) throw Error('Audio path escapes the workbench');
  const actualRoot = realpathSync(OUTPUT), actualPath = realpathSync(absolute);
  if (!actualPath.startsWith(actualRoot + sep)) throw Error('Audio symlink escapes the workbench');
  return absolute;
}

function signalFromWave(bytes) {
  if (bytes.length < 44 || bytes.toString('ascii', 0, 4) !== 'RIFF'
    || bytes.toString('ascii', 8, 12) !== 'WAVE' || bytes.readUInt32LE(4) + 8 !== bytes.length) throw Error('Invalid RIFF/WAVE container');
  let sampleRate, data;
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const size = bytes.readUInt32LE(offset + 4), start = offset + 8;
    if (start + size > bytes.length) throw Error('Truncated WAVE chunk');
    const chunk = bytes.toString('ascii', offset, offset + 4);
    if (chunk === 'fmt ') {
      if (size < 16 || bytes.readUInt16LE(start) !== 1 || bytes.readUInt16LE(start + 2) !== 1
        || bytes.readUInt16LE(start + 14) !== 16) throw Error('Expected mono PCM16 WAVE');
      sampleRate = bytes.readUInt32LE(start + 4);
    }
    if (chunk === 'data') {
      if (data) throw Error('Multiple WAVE sample chunks');
      data = bytes.subarray(start, start + size);
    }
    offset = start + size + size % 2;
  }
  if (sampleRate !== 24000 || !data?.length || data.length % 2) throw Error('Expected non-empty 24 kHz PCM16 samples');
  let peak = 0, energy = 0;
  for (let offset = 0; offset < data.length; offset += 2) {
    const sample = data.readInt16LE(offset) / 32768;
    peak = Math.max(peak, Math.abs(sample)); energy += sample * sample;
  }
  return { sampleRate, duration: data.length / 2 / sampleRate, peak, rms: Math.sqrt(energy / (data.length / 2)) };
}

function decodeOpus(ffmpeg, path) {
  // Decode to the master rate for a directly comparable sample count and levels.
  const bytes = execFileSync(ffmpeg, ['-v', 'error', '-i', path, '-map', '0:a:0', '-vn', '-sn', '-dn',
    '-ac', '1', '-ar', '24000', '-f', 'f32le', 'pipe:1'], {
    timeout: 30000, maxBuffer: 4 * 24000 * 36, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (!bytes.length || bytes.length % 4) throw Error('No complete decoded floating-point samples');
  let peak = 0, energy = 0;
  for (let offset = 0; offset < bytes.length; offset += 4) {
    const sample = bytes.readFloatLE(offset);
    if (!Number.isFinite(sample)) throw Error('Non-finite decoded sample');
    peak = Math.max(peak, Math.abs(sample)); energy += sample * sample;
  }
  return { duration: bytes.length / 4 / 24000, peak, rms: Math.sqrt(energy / (bytes.length / 4)) };
}

export function checkNeuralBatch({ allowPartial = false } = {}) {
  const errors = [], missing = [], referenceMissing = [];
  const check = (condition, message) => { if (!condition) errors.push(message); return condition; };
  const close = (actual, expected, tolerance) => Number.isFinite(actual) && Number.isFinite(expected) && Math.abs(actual - expected) <= tolerance;
  const quality = (signal, label) => {
    check(signal.duration > .2 && signal.duration < 35, `${label}: invalid duration`);
    check(Number.isFinite(signal.peak) && signal.peak > .01 && signal.peak < .995, `${label}: silent or clipped signal`);
    check(Number.isFinite(signal.rms) && signal.rms > .001, `${label}: insufficient or invalid signal energy`);
  };
  const inventory = readJson(resolve(ROOT, '.tools/neural-voice-authoring/inventory.json'));
  const manifest = readJson(resolve(OUTPUT, 'manifest.json'));
  const sources = readJson(resolve(OUTPUT, 'sources.json'));
  if (!Array.isArray(inventory.utterances) || !Array.isArray(manifest.recordings) || !Array.isArray(manifest.references)
    || !Array.isArray(sources)) throw Error('Invalid inventory, manifest or sources structure');
  check(inventory.schemaVersion === 1 && inventory.language === 'plt', 'Unexpected inventory schema/language');
  check(manifest.schemaVersion === 1 && manifest.language === 'plt', 'Unexpected manifest schema/language');
  check(manifest.model === MODEL && manifest.modelRevision === REVISION, 'Unexpected model or model revision');
  check(manifest.library === 'omnivoice==0.2.1', 'Unexpected authoring model library');
  check(manifest.license === 'CC-BY-NC (version not specified in model card)', 'Unexpected model license declaration');
  check(manifest.nativeSpeakerReviewed === false && manifest.stage === 'unreviewed-candidates-outside-site', 'Candidates falsely marked as linguistically reviewed or active');
  for (const [file, hash] of Object.entries(MODEL_HASHES)) check(manifest.modelHashes?.[file] === hash, `Unexpected pinned model hash: ${file}`);
  const sourceIds = sources.map(source => source.id);
  check(new Set(sourceIds).size === sourceIds.length && sourceIds.includes(SOURCE), 'Missing or duplicate audio provenance source');

  const expected = new Map(), keys = new Set(), inventoryIds = new Set();
  for (const utterance of inventory.utterances) {
    check(typeof utterance.key === 'string' && !!utterance.key && !keys.has(utterance.key), 'Empty or duplicate inventory key');
    keys.add(utterance.key);
    check(/^[a-f0-9]{16}$/u.test(utterance.id ?? '') && utterance.id === sha256(utterance.key ?? '').slice(0, 16)
      && !inventoryIds.has(utterance.id), `Invalid or duplicate inventory ID: ${utterance.id}`);
    inventoryIds.add(utterance.id);
    check(typeof utterance.spokenText === 'string' && !!utterance.spokenText.trim()
      && !/[…_]|\.{3}/u.test(utterance.spokenText), `Incomplete inventory text: ${utterance.id}`);
    check(Array.isArray(utterance.bindings) && utterance.bindings.length > 0, `Missing inventory bindings: ${utterance.id}`);
    for (const character of CHARACTERS) expected.set(`audio-neural-${character}-${utterance.id}`, { ...utterance, character });
  }

  const references = new Map();
  let referenceBytes = 0, referenceDuration = 0;
  for (const reference of manifest.references) {
    const label = `reference ${reference.character}`;
    check(CHARACTERS.includes(reference.character) && !references.has(reference.character), `${label}: unknown or duplicate character`);
    references.set(reference.character, reference);
    check(reference.file === `references/${reference.character}.wav`, `${label}: unexpected file mapping`);
    check(typeof reference.text === 'string' && !!reference.text.trim() && typeof reference.instruction === 'string'
      && Number.isInteger(reference.seed), `${label}: incomplete generation provenance`);
    check(reference.origin === 'model-generated fictional character; no human reference recording', `${label}: unexpected reference origin`);
    try {
      const bytes = readFileSync(boundedFile(reference.file)), signal = signalFromWave(bytes);
      referenceBytes += bytes.length; referenceDuration += signal.duration;
      check(hashFormat(reference.sha256) && sha256(bytes) === reference.sha256, `${label}: SHA mismatch`);
      check(close(signal.duration, reference.duration, 1 / 24000), `${label}: duration mismatch`);
      quality(signal, label);
    } catch (error) { errors.push(`${label}: ${error.message}`); }
  }
  for (const character of CHARACTERS) if (!references.has(character)) referenceMissing.push(character);

  const bundled = resolve(ROOT, '.tools/voice-processing/node_modules/ffmpeg-static', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
  const ffmpeg = existsSync(bundled) ? bundled : 'ffmpeg';
  const ids = new Set(), files = new Set(), byCharacter = { mia: 0, lova: 0 }, steps = new Set();
  let oggBytes = 0, masterBytes = 0, decoded = 0, duration = 0, maxDecodedPeak = 0;
  for (const recording of manifest.recordings) {
    const label = recording.id ?? '(missing ID)', item = expected.get(recording.id);
    check(!ids.has(recording.id), `${label}: duplicate audio ID`); ids.add(recording.id);
    check(!!item, `${label}: audio ID absent from current inventory`);
    if (CHARACTERS.includes(recording.character)) byCharacter[recording.character]++;
    check(recording.character === item?.character, `${label}: wrong character`);
    check(recording.transcript === item?.transcript && recording.spokenText === item?.spokenText, `${label}: exact source text mismatch`);
    check(Array.isArray(recording.bindings) && Array.isArray(item?.bindings)
      && canonical(bindingSignatures(recording.bindings)) === canonical(bindingSignatures(item.bindings)), `${label}: lost or changed content bindings`);
    check(recording.model === MODEL && recording.language === 'plt' && recording.sourceId === SOURCE
      && sourceIds.includes(recording.sourceId), `${label}: wrong model/language/provenance source`);
    check(recording.status === 'synthetic' && recording.verification === 'model-generated'
      && recording.nativeSpeakerReviewed !== true, `${label}: false verification status`);
    check(hashFormat(recording.referenceSha256) && references.has(recording.character)
      && recording.referenceSha256 === references.get(recording.character)?.sha256, `${label}: character reference mismatch`);
    check(Number.isInteger(recording.steps) && recording.steps >= 16 && recording.steps <= 64
      && hashFormat(recording.recipeSha256), `${label}: invalid generation recipe`);
    steps.add(recording.steps);
    check(recording.format === 'ogg-opus' && recording.sampleRate === 48000 && recording.sourceSampleRate === 24000, `${label}: invalid encoding metadata`);
    check(recording.file === `audio/${recording.id}.ogg` && recording.masterFile === `masters/${recording.id}.wav`, `${label}: unexpected asset file mapping`);
    for (const file of [recording.file, recording.masterFile]) {
      check(!files.has(file), `${label}: file reused by another record`); files.add(file);
    }
    try {
      const path = boundedFile(recording.masterFile), bytes = readFileSync(path), signal = signalFromWave(bytes);
      masterBytes += bytes.length;
      check(Number.isInteger(recording.masterBytes) && bytes.length === recording.masterBytes
        && hashFormat(recording.masterSha256) && sha256(bytes) === recording.masterSha256, `${label}: master size/SHA mismatch`);
      check(close(signal.duration, recording.duration, 1 / 24000), `${label}: master duration mismatch`);
      check(close(signal.peak, recording.peak, 2 / 32768) && close(signal.rms, recording.rms, 2 / 32768), `${label}: master signal metadata mismatch`);
      quality(signal, `${label} master`);
    } catch (error) { errors.push(`${label} master: ${error.message}`); }
    // Metadata errors do not skip decoding: every declared readable Ogg is audited.
    try {
      const path = boundedFile(recording.file), bytes = readFileSync(path);
      oggBytes += bytes.length;
      check(Number.isInteger(recording.bytes) && bytes.length === recording.bytes
        && hashFormat(recording.sha256) && sha256(bytes) === recording.sha256, `${label}: Ogg size/SHA mismatch`);
      const opusHead = bytes.indexOf(Buffer.from('OpusHead'));
      check(bytes.toString('ascii', 0, 4) === 'OggS' && opusHead >= 0 && opusHead + 19 <= bytes.length
        && bytes[opusHead + 9] === 1, `${label}: not a mono Opus/Ogg container`);
      const signal = decodeOpus(ffmpeg, path);
      decoded++; duration += signal.duration; maxDecodedPeak = Math.max(maxDecodedPeak, signal.peak);
      quality(signal, `${label} Opus`);
      check(close(signal.duration, recording.duration, .002), `${label}: decoded duration mismatch`);
      check(close(signal.peak, recording.decodedPeak, .00002) && close(signal.rms, recording.decodedRms, .00002), `${label}: decoded signal metadata mismatch`);
    } catch (error) { errors.push(`${label} Opus: ${error.message}`); }
  }
  for (const id of expected.keys()) if (!ids.has(id)) missing.push(id);
  if (!allowPartial && missing.length) errors.push(`${missing.length} expected recordings are missing`);
  if (!allowPartial && referenceMissing.length) errors.push(`Missing character references: ${referenceMissing.join(', ')}`);
  return {
    ok: errors.length === 0, complete: missing.length === 0 && referenceMissing.length === 0,
    allowPartial, expectedUtterances: inventory.utterances.length, expectedRecordings: expected.size,
    recordings: manifest.recordings.length, decoded, byCharacter, steps: [...steps].sort((a, b) => a - b),
    missingCount: missing.length, missingReferences: referenceMissing,
    durationSeconds: Number(duration.toFixed(3)), referenceSeconds: Number(referenceDuration.toFixed(3)),
    oggBytes, masterBytes, referenceBytes, maximumDecodedPeak: Number(maxDecodedPeak.toFixed(6)),
    nativeSpeakerReviewed: manifest.nativeSpeakerReviewed, errorCount: errors.length, errors: errors.slice(0, 15),
  };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const arguments_ = process.argv.slice(2);
  try {
    if (arguments_.some(argument => argument !== '--allow-partial')) throw Error('Usage: node scripts/check-malagasy-neural.mjs [--allow-partial]');
    const report = checkNeuralBatch({ allowPartial: arguments_.includes('--allow-partial') });
    console.log(JSON.stringify(report));
    if (!report.ok) process.exitCode = 1;
  } catch (error) {
    console.log(JSON.stringify({ ok: false, errorCount: 1, errors: [error.message] }));
    process.exitCode = 1;
  }
}

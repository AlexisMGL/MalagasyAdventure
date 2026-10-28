import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let buildNeuralInventory, content, inventory, filesBeforeImport, filesAfterImport;

function siteSnapshot() {
  const entries = [];
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile()) entries.push([path, createHash('sha256').update(readFileSync(path)).digest('hex')]);
    }
  }
  walk(join(root, 'src'));
  walk(join(root, 'public'));
  return entries;
}

before(async () => {
  filesBeforeImport = siteSnapshot();
  ({ buildNeuralInventory } = await import('./prepare-malagasy-neural.mjs'));
  filesAfterImport = siteSnapshot();
  // Real authored content is loaded once; the preparation CLI is never executed.
  const server = await createServer({ root, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  try { content = (await server.ssrLoadModule('/src/malagasy/content.ts')).CONTENT; }
  finally { await server.close(); }
  inventory = buildNeuralInventory(content);
});

const emptyContent = extra => ({ lessons: [], vocabulary: [], exercises: [], ...extra });
const complete = text => !!text?.trim() && !/[…_]|\.{3}/u.test(text);
const bindings = () => inventory.utterances.flatMap(utterance => utterance.bindings);

test('importing the authoring module changes no src or public file', () => {
  assert.deepEqual(filesAfterImport, filesBeforeImport);
});

test('the real corpus has a compact, stable inventory for two character voices', () => {
  assert.equal(inventory.schemaVersion, 1);
  assert.equal(inventory.language, 'plt');
  assert.ok(inventory.utterances.length > 51);
  assert.ok(inventory.utterances.length * 2 > 102);
  assert.equal(new Set(inventory.utterances.map(item => item.key)).size, inventory.utterances.length);
  assert.equal(new Set(inventory.utterances.map(item => item.id)).size, inventory.utterances.length);
  for (const item of inventory.utterances) {
    assert.match(item.id, /^[a-f0-9]{16}$/);
    assert.ok(complete(item.spokenText), item.transcript);
    assert.ok(item.bindings.length > 0, item.transcript);
  }
});

test('every vocabulary item and every complete authored dialogue has a recoverable content binding', () => {
  const all = bindings();
  for (const word of content.vocabulary) {
    assert.ok(all.some(binding => binding.kind === 'vocabulary' && binding.contentId === word.id && binding.text === word.malagasy), word.id);
  }
  for (const lesson of content.lessons) {
    for (const scene of lesson.scenes ?? []) {
      scene.turns.forEach((turn, index) => {
        const found = all.some(binding => binding.kind === 'dialogue' && binding.lessonId === lesson.id
          && binding.sceneId === scene.id && binding.index === index
          && binding.character === turn.speaker && binding.text === turn.text);
        assert.equal(found, complete(turn.text), `${scene.id}:${index}`);
      });
    }
  }
  for (const exercise of content.exercises) {
    (exercise.dialogue ?? []).forEach((turn, index) => {
      const found = all.some(binding => binding.kind === 'exercise-dialogue' && binding.exerciseId === exercise.id
        && binding.index === index && binding.character === turn.speaker && binding.text === turn.text);
      assert.equal(found, complete(turn.text), `${exercise.id}:${index}`);
    });
  }
});

test('Malagasy alternatives are included before grading while French alternatives remain excluded', () => {
  const selections = bindings().filter(binding => binding.kind === 'selection');
  for (const exercise of content.exercises) {
    const visible = [...exercise.choices ?? [], ...exercise.tokens ?? [], ...exercise.pairs?.flatMap(pair => [pair.left, pair.right]) ?? []];
    const authored = exercise.spokenSelections ?? (exercise.selectionLanguage === 'mg'
      ? exercise.choices ?? exercise.tokens ?? exercise.pairs?.map(pair => pair.left) ?? [] : []);
    for (const text of visible) {
      const found = selections.some(binding => binding.exerciseId === exercise.id && binding.text === text);
      assert.equal(found, authored.includes(text) && complete(text), `${exercise.id}: ${text}`);
    }
  }
  const first = content.exercises.find(exercise => exercise.id === 'exercise-01-01-a');
  assert.ok(!first.answers.includes('Veloma')); // This distractor must still be pronounceable.
  assert.ok(selections.some(binding => binding.exerciseId === first.id && binding.text === 'Veloma'));
  assert.ok(!selections.some(binding => binding.exerciseId === 'exercise-01-01-b' && binding.text === 'Merci'));
  assert.ok(selections.some(binding => binding.exerciseId === 'exercise-03-01-b' && binding.text === 'mpiofana'));
  assert.ok(!selections.some(binding => binding.exerciseId === 'exercise-03-01-b' && binding.text === 'Un verbe être écrit'));
  const written = bindings().filter(binding => binding.kind === 'written-answer' && binding.exerciseId === 'exercise-03-03-d');
  assert.deepEqual(written, []);
});

test('normalization deduplicates NFC, spacing, case and final punctuation without rewriting the first spoken words', () => {
  const original = '  Tanàna   tsara!  ';
  const input = emptyContent({ vocabulary: [
    { id: 'word.first', malagasy: original },
    { id: 'word.decomposed', malagasy: 'tana\u0300na tsara.' },
    { id: 'word.uppercase', malagasy: 'TANÀNA tsara?' },
  ] });
  const result = buildNeuralInventory(input);
  assert.equal(result.utterances.length, 1);
  const entry = result.utterances[0];
  assert.equal(entry.key, 'tanàna tsara');
  assert.equal(entry.transcript, original);
  assert.equal(entry.spokenText, 'Tanàna   tsara!');
  assert.deepEqual(entry.bindings.map(binding => binding.text), input.vocabulary.map(word => word.malagasy));
  const reordered = buildNeuralInventory(emptyContent({ vocabulary: [
    { id: 'word.other', malagasy: 'Ny' },
    ...input.vocabulary.slice().reverse(),
  ] }));
  assert.equal(reordered.utterances.find(item => item.key === 'tanàna tsara').id, entry.id);
  const apostrophes = buildNeuralInventory(emptyContent({ vocabulary: [
    { id: 'word.curly', malagasy: 'An’i Mia.' },
    { id: 'word.straight', malagasy: "an'i mia!" },
  ] }));
  assert.equal(apostrophes.utterances.length, 1);
  assert.equal(apostrophes.utterances[0].spokenText, 'An’i Mia.');
});

test('deduplication keeps all lesson, exercise and vocabulary bindings rather than losing repeated content', () => {
  const salama = inventory.utterances.find(item => item.key === 'salama');
  const kinds = new Set(salama.bindings.map(binding => binding.kind));
  for (const kind of ['dialogue', 'exercise-dialogue', 'vocabulary', 'selection']) assert.ok(kinds.has(kind), kind);
  assert.ok(new Set(salama.bindings.map(binding => binding.lessonId).filter(Boolean)).size > 1);
  assert.ok(new Set(salama.bindings.map(binding => binding.exerciseId).filter(Boolean)).size > 1);
  const quoted = buildNeuralInventory(emptyContent({ vocabulary: [
    { id: 'word.quoted', malagasy: '« aho »' },
    { id: 'word.plain', malagasy: 'Aho.' },
  ] }));
  assert.equal(quoted.utterances.length, 1);
  assert.equal(quoted.utterances[0].spokenText, 'aho');
  assert.equal(quoted.utterances[0].bindings.length, 2);
});

test('incomplete utterances stay silent and translations never enter the audio text', () => {
  const result = buildNeuralInventory(emptyContent({ lessons: [{
    id: 'fixture.lesson', notes: [], scenes: [{ id: 'fixture.scene', turns: [
      { speaker: 'lova', text: 'Salama!', translation: 'Bonjour !' },
      { speaker: 'mia', text: '…', translation: 'Une réponse française' },
      { speaker: 'mia', text: 'Mia no ...', translation: 'Encore du français' },
      { speaker: 'mia', text: 'Avy ___ ianao?', translation: 'Une traduction' },
      { speaker: 'mia', text: ' ', translation: 'Un écran vide' },
    ] }],
  }] }));
  assert.deepEqual(result.utterances.map(item => item.spokenText), ['Salama!']);
  assert.equal(result.excluded.length, 4);
  assert.ok(result.excluded.every(item => item.reason === 'incomplete utterance'));
});

test('the already accepted Aza fady spelling remains a separate exact spoken form', () => {
  const joined = inventory.utterances.find(item => item.key === 'azafady');
  const separated = inventory.utterances.find(item => item.key === 'aza fady');
  assert.ok(joined); assert.ok(separated);
  assert.notEqual(joined.id, separated.id);
  assert.equal(separated.spokenText, 'Aza fady');
  assert.ok(separated.bindings.some(binding => binding.kind === 'written-answer' && binding.exerciseId === 'exercise-01-03-b'));
  assert.ok(content.exercises.find(exercise => exercise.id === 'exercise-01-03-b').answers.includes(separated.spokenText));
});

test('complete constructed Malagasy answers also cover their earlier written-answer occurrences', () => {
  const phrase = inventory.utterances.find(item => item.key === 'tsy mpiofana aho');
  assert.ok(phrase, 'The complete negative answer must not be reduced to its separate word-bank tokens.');
  assert.equal(phrase.spokenText, 'Tsy mpiofana aho');
  assert.ok(phrase.bindings.some(binding => binding.kind === 'constructed-answer' && binding.exerciseId === 'exercise-03-03-i'));
  for (const exerciseId of ['exercise-03-02-f', 'exercise-03-03-i']) {
    assert.ok(phrase.bindings.some(binding => binding.kind === 'written-answer' && binding.exerciseId === exerciseId), exerciseId);
    assert.ok(!inventory.excluded.some(entry => entry.exerciseId === exerciseId && entry.text === 'Tsy mpiofana aho'), exerciseId);
  }
});

#!/usr/bin/env node
/** Export authored full utterances for the offline neural voice authoring tool. */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { normalizeTranscript } from './generate-malagasy-mms.mjs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export function buildNeuralInventory(content, notionCards = {}, recordedUtterances = []) {
  const unique = new Map(), excluded = [];
  function add(text, binding) {
    if (!text?.trim() || /[…_]|\.{3}/u.test(text)) { excluded.push({ text, binding, reason: 'incomplete utterance' }); return; }
    const spokenText = text.replace(/[«»]/gu, '').trim();
    const key = normalizeTranscript(spokenText);
    if (!unique.has(key)) unique.set(key, { key, id: createHash('sha256').update(key).digest('hex').slice(0, 16), transcript: text, spokenText, bindings: [] });
    unique.get(key).bindings.push({ ...binding, text });
  }
  for (const lesson of content.lessons) {
    for (const scene of lesson.scenes ?? []) scene.turns.forEach((turn, index) => add(turn.text, { kind: 'dialogue', lessonId: lesson.id, sceneId: scene.id, index, character: turn.speaker }));
    (lesson.notes ?? []).forEach((note, index) => {
      // Split authored typographic examples, never cut or assemble generated audio.
      for (const text of note.example?.replace(/^(?:Lova|Mia)\s*:\s*/u, '').split(/\s+—\s+/u) ?? []) add(text, { kind: 'lesson-example', lessonId: lesson.id, index });
    });
  }
  for (const word of content.vocabulary) add(word.malagasy, { kind: 'vocabulary', contentId: word.id });
  for (const exercise of content.exercises) {
    (exercise.dialogue ?? []).forEach((turn, index) => add(turn.text, { kind: 'exercise-dialogue', exerciseId: exercise.id, index, character: turn.speaker }));
    const selections = exercise.spokenSelections ?? (exercise.selectionLanguage === 'mg'
      ? exercise.choices ?? exercise.tokens ?? exercise.pairs?.map(pair => pair.left) ?? [] : []);
    selections.forEach((text, index) => add(text, { kind: 'selection', exerciseId: exercise.id, index }));
    if (exercise.type === 'order' && exercise.selectionLanguage === 'mg') {
      exercise.answers.forEach((text, index) => add(text, { kind: 'constructed-answer', exerciseId: exercise.id, index }));
    }
  }
  for (const exercise of content.exercises) {
    if (!['translate', 'cloze', 'order'].includes(exercise.type)) continue;
    exercise.answers.forEach((text, index) => {
      // Exact existing Malagasy matches; the alternative spelling is already authored and accepted.
      if (unique.has(normalizeTranscript(text)) || exercise.id === 'exercise-01-03-b') add(text, { kind: 'written-answer', exerciseId: exercise.id, index });
      else excluded.push({ text, exerciseId: exercise.id, reason: 'answer language not explicitly known as Malagasy' });
    });
  }
  // Append mnemonic bindings after the established corpus. A newly added card
  // must not change the original spelling/case of an already recorded utterance.
  for (const [lessonId, cards] of Object.entries(notionCards)) {
    for (const card of cards) card.examples.forEach((example, index) => add(example.malagasy,
      { kind: 'notion-example', lessonId, contentId: card.id, index }));
  }
  for (const recorded of recordedUtterances) {
    if (typeof recorded.transcript !== 'string' || typeof recorded.spokenText !== 'string') continue;
    const key = normalizeTranscript(recorded.spokenText), item = unique.get(key);
    if (item && normalizeTranscript(recorded.transcript) === key) {
      // Safe typography is already deduplicated. Keep the exact original words
      // sent to the model, rather than relabelling an unchanged recorded file.
      item.transcript = recorded.transcript;
      item.spokenText = recorded.spokenText;
    }
  }
  return { schemaVersion: 1, language: 'plt', utterances: [...unique.values()], excluded };
}

async function main() {
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { CONTENT } = await server.ssrLoadModule('/src/malagasy/content.ts');
  const { getNotionCards } = await server.ssrLoadModule('/src/malagasy/notion-cards.ts');
  let recorded = [];
  try { recorded = JSON.parse(await readFile('audio-workbench/generated/omnivoice/manifest.json', 'utf8')).recordings; }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const inventory = buildNeuralInventory(CONTENT, Object.fromEntries(CONTENT.lessons.map(lesson => [lesson.id, getNotionCards(lesson.id)])), recorded);
  await mkdir('.tools/neural-voice-authoring', { recursive: true });
  await writeFile('.tools/neural-voice-authoring/inventory.json', JSON.stringify(inventory, null, 2) + '\n');
  console.log(`${inventory.utterances.length} unique Malagasy utterances prepared; no audio generated or site file changed.`);
} finally { await server.close(); }
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await main();

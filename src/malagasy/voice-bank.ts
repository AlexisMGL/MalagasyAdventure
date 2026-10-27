import type { AudioAsset, DialogueTurn, Exercise } from './types';
import { OMNIVOICE_RECORDINGS } from './omnivoice-voices';
import { normalizeDialogueTranscript, isPlayableDialogueAsset, matchesDialogueTranscript } from './dialogue-audio';
import { spokenSelectionsForExercise } from './spoken-selections';

export const ALL_DIALOGUE_RECORDINGS: AudioAsset[] = OMNIVOICE_RECORDINGS;

/** Whole utterances only, using each character's existing OmniVoice recording. */
export function recordingForTurn(turn: DialogueTurn, assets: readonly AudioAsset[] = ALL_DIALOGUE_RECORDINGS): AudioAsset | undefined {
  const text = normalizeDialogueTranscript(turn.text);
  if (!text || /[…_]|\.{3}/u.test(turn.text)) return undefined;
  const matches = assets.filter(asset => isPlayableDialogueAsset(asset)
    && matchesDialogueTranscript(asset, turn.text)
    && (asset.character === turn.speaker || asset.character === 'any' || asset.character === undefined));
  if (turn.audioId) return matches.find(asset => asset.id === turn.audioId);
  return matches.find(asset => asset.character === turn.speaker)
    ?? matches.find(asset => asset.status === 'synthetic' && asset.character === 'any')
    ?? matches.find(asset => asset.character === 'any' || asset.character === undefined);
}

export function recordingForSelection(exercise: Exercise, text: string, assets: readonly AudioAsset[] = ALL_DIALOGUE_RECORDINGS): AudioAsset | undefined {
  if (!spokenSelectionsForExercise(exercise).includes(text)) return undefined;
  return recordingForTurn({ speaker: 'mia', text, translation: '' }, assets);
}

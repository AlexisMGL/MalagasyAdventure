/** Authored diagrams: labels explain a concrete language relation, not decorative artwork. */
export type LearningPicture = 'greeting' | 'goodbye' | 'thanks' | 'please' | 'welcome' | 'respect'
  | 'yes' | 'no' | 'me' | 'you' | 'person' | 'mother' | 'father' | 'child' | 'family'
  | 'house' | 'chair' | 'table' | 'book' | 'rice' | 'water' | 'bread' | 'banana' | 'coffee'
  | 'hungry' | 'thirsty' | 'market' | 'tired' | 'sleep' | 'drink' | 'toilet' | 'repeat'
  | 'slow' | 'understand' | 'coin' | 'name' | 'origin' | 'work' | 'number' | 'need' | 'like' | 'france'
  | 'morning' | 'daytime' | 'evening' | 'night' | 'wake' | 'clock' | 'eat' | 'study'
  | 'plate' | 'spoon' | 'glass' | 'knife' | 'read' | 'write' | 'wash' | 'cook';
export type WordRole = 'predicate' | 'subject' | 'object' | 'marker' | 'place' | 'quantity' | 'neutral';
export type LearningVisual =
  | { kind: 'pictorial'; items: { picture: LearningPicture; label: string; caption?: string }[] }
  | { kind: 'sentence'; rows: { parts: { text: string; role: WordRole; caption?: string }[] }[] }
  | { kind: 'possession'; pairs: { base: string; mine: string; yours: string; picture: LearningPicture }[] }
  | { kind: 'spatial'; items: { location: 'here' | 'inside' | 'above' | 'below'; label: string; subject: LearningPicture; caption?: string }[] }
  | { kind: 'quantity'; items: { value: number; label: string; picture: 'book' | 'chair' | 'table' | 'coin' }[] }
  | { kind: 'questions'; items: { word: string; answer: string; picture: LearningPicture }[] }
  | { kind: 'directions'; items: { direction: 'left' | 'right' | 'straight'; label: string }[] }
  | { kind: 'sounds'; items: { letter: string; sound: string; word: string }[] }
  | { kind: 'clock'; items: { hour: number; label: string; period?: string }[] };

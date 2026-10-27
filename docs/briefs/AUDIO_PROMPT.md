# Improve Malagasy Text-to-Speech — Duolingo-style Learning App

You are working on an existing web application designed to teach Malagasy through interactive lessons, vocabulary exercises, and quizzes, inspired by Duolingo.

The current application already has a text-to-speech system, but the Malagasy pronunciation and naturalness are not satisfactory.

Your task is to significantly improve the audio experience while preserving the existing application architecture, lesson mechanics, and free Netlify deployment.

## 1. Analyze the current implementation

Before making changes:

- Inspect the existing project structure.
- Identify how Malagasy speech is currently generated.
- Identify every place where audio is used: vocabulary, sentences, listening exercises, dialogues, quizzes, etc.
- Determine whether the current implementation uses browser SpeechSynthesis, external APIs, or static files.
- Identify where lesson texts and translations are stored.
- Preserve existing behavior and avoid unnecessary refactoring.

## 2. Evaluate real Malagasy TTS solutions

Research the current official documentation for:

1. Google Gemini Text-to-Speech, particularly Gemini 3.8 Flash TTS and Flash-Lite TTS.
2. Meta MMS-TTS Malagasy (`facebook/mms-tts-mlg`).
3. Other providers only if they explicitly support Malagasy.

Compare:

- Actual Malagasy language support (mg-MG).
- Pronunciation quality and naturalness.
- Free-tier availability.
- API accessibility.
- Terms of use and licensing.
- Suitability for static deployment on Netlify.

Do not assume that generic multilingual support guarantees correct Malagasy pronunciation.

Prefer Gemini TTS for the initial implementation, provided that the API and usage terms are compatible.

## 3. Implement an offline audio-generation pipeline

The application must not require a paid TTS API call every time an end user plays audio.

Instead:

- Extract all unique Malagasy words, sentences, and expressions from the existing lessons.
- Generate audio files ahead of deployment using a development-time script.
- Use the official Google Gemini API SDK with the currently supported TTS endpoint and model.
- Use environment variables to secure credentials.
- Never expose an API key in frontend code or committed files.
- Normalize text for deduplication without changing the actual pronunciation text.
- Assign stable IDs to audio assets.
- Save generated files in a static directory compatible with Netlify.
- Prefer compressed, browser-compatible formats with good sound quality.
- Generate an audio manifest mapping lesson content to audio assets.
- Skip existing audio when the source text, selected voice, and generation settings have not changed.
- Provide a regeneration option for specific phrases.

The generation script must run locally and must not be necessary during the Netlify deployment.

## 4. Optimize Malagasy pronunciation

The objective is educational accuracy, not just natural-sounding speech.

Use the actual Malagasy text as input and explicitly instruct the TTS model to:

- Speak standard Malagasy as spoken in Madagascar.
- Avoid French, English, or other foreign accents.
- Pronounce every Malagasy word accurately.
- Use natural, conversational intonation.
- Speak clearly without sounding excessively robotic.
- Maintain appropriate syllable stress and rhythm.
- Preserve the exact written words without adding or translating content.

Use this initial voice instruction:

"Speak the following text in natural, standard Malagasy as spoken in Madagascar. Use authentic Malagasy pronunciation, natural rhythm and clear articulation. This is for a language-learning application. Do not translate, omit, or add words. Speak only the provided Malagasy text."

Adapt the prompting technique to the official API's actual input requirements.

Do not automatically modify Malagasy spelling or invent phonetic transcriptions.

## 5. Introduce multiple playback modes

Support:

- Normal speed: natural conversational pronunciation.
- Slow speed: approximately 0.8× playback speed.
- Repeat: replay the current audio.
- Word-level playback for individual vocabulary items.
- Sentence-level playback for complete expressions.

Use pitch-preserving browser playback-rate adjustment when appropriate.

Where slow playback noticeably degrades intelligibility, allow a separate deliberately articulated recording.

Ensure that playback is responsive on desktop and mobile.

## 6. Create a development audio-quality interface

Add a developer-only audio quality review interface with:

- Malagasy text.
- Existing audio.
- Newly generated Gemini audio.
- Optional alternative provider audio.
- Playback controls.
- Rating: Good / Acceptable / Incorrect.
- Notes about pronunciation errors.
- Regenerate button when development credentials are available.

Store review metadata so that previously approved audio is not unintentionally replaced.

A voice sounding pleasant is not sufficient evidence of correct pronunciation. Allow native Malagasy speakers to validate the recordings.

## 7. Implement a robust audio service

Create a centralized, maintainable audio service.

It should:

- Load prerecorded audio based on content IDs.
- Cache frequently accessed audio.
- Avoid overlapping playback.
- Stop previous audio when starting a new exercise.
- Handle missing files gracefully.
- Use the existing fallback only when appropriate.
- Avoid substituting an unrelated language voice for Malagasy.
- Support future additions of lessons and worlds.

Keep the code commented, logically structured, and easy to extend.

Provide useful debugging information in the browser console.

## 8. Respect zero-cost deployment

Netlify must remain the frontend deployment platform.

Do not introduce:

- Paid hosting dependencies.
- Mandatory databases.
- Permanent inference servers.
- Paid runtime TTS calls.
- Exposed API credentials.

Audio generation should be a development-time activity.

Estimate the audio file count, storage requirements, bandwidth impact, and API-generation cost.

Verify current quotas and pricing instead of assuming unlimited free API usage.

If free-tier limits are reached, generation must stop gracefully, without triggering unexpected paid usage.

## 9. Preserve future scalability

The application is planned to contain 20 learning worlds.

Design the audio-generation system so that introducing new worlds only requires adding content and running an incremental generation command.

Avoid manually managing thousands of audio references.

The audio manifest should be generated automatically from lesson content.

Keep the architecture suitable for a future system with native speaker recordings, alternative voices, and user-selected voice preferences.

## 10. Credits and documentation

Add any new providers, models, documentation, and other external resources to the application's existing Credits section.

Include:

- Provider name.
- Model name.
- Official documentation link.
- Relevant licensing and attribution requirements.

Document how to obtain an API key, generate audio, review audio quality, and deploy the app.

## Expected deliverables

1. Analysis of the current audio implementation.
2. Short technical comparison of suitable Malagasy TTS providers.
3. Working local audio-generation pipeline.
4. Improved frontend audio playback integration.
5. Developer audio-review interface.
6. Updated Credits section.
7. Clear setup documentation.
8. Validation through existing build and test commands.

Implement the solution in the existing repository. Do not create a separate application.

Prioritize pronunciation correctness, maintainability, and zero-cost hosting over unnecessary complexity.
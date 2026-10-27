# MASTER PROMPT — MALAGASY ADVENTURE
## Build a Complete, Extensible French-to-Malagasy Learning Platform Inside the Existing AfterHours Repository

# 1. Project Mission

Create a **fourth game/application** within the existing AfterHours website and repository.

The new application will be an ambitious, interactive, gamified platform designed to teach **standard Malagasy to French-speaking learners**.

Working title: **Malagasy Adventure**.

The long-term ambition is to build something comparable in depth and engagement to Duolingo, while maintaining its own visual identity, pedagogical approach, and connection to Madagascar.

The application must combine:

- Structured language learning.
- Vocabulary and grammar progression.
- Interactive exercises.
- Listening and reading comprehension.
- Interactive conversations.
- Storytelling.
- Cultural and historical discoveries.
- Intelligent spaced repetition.
- XP, levels, achievements and learning streaks.
- A geographical journey through Madagascar.
- Long-term learning statistics.

The ultimate objective is to offer an intensive six-month learning journey that helps a motivated learner become reasonably comfortable communicating in Malagasy.

This is an ambitious educational goal, not a guarantee of fluency or a specific CEFR level.

## CRITICAL PROJECT PHILOSOPHY

**We are not simply building World 1. We are building the foundation of a large educational platform that will progressively expand to 20 worlds.**

Only World 1 must contain fully playable lessons in the current implementation.

However, the 20-world curriculum, progression architecture, lesson engine, concept tracking, review mechanics, and source management must already be designed with the complete future application in mind.

The application will be expanded through many future Codex prompts.

Therefore:

- Favor extensibility over quick hardcoded solutions.
- Favor pedagogical coherence over content quantity.
- Favor maintainable architecture over unnecessary technical complexity.
- Favor genuinely functional learning experiences over mockups.
- Favor reliable linguistic content over invented or approximate translations.

The final result must be a complete, enjoyable World 1 built on a solid foundation for future development.

---

# 2. Existing Repository Integration

Before writing code:

1. Inspect the entire existing repository.
2. Identify its framework, routing, build system, component architecture and dependencies.
3. Understand the existing game catalog and how games are launched.
4. Identify shared components that can be reused.
5. Understand the current Netlify deployment setup.
6. Identify existing testing and coding conventions.

Add Malagasy Adventure as the **fourth selectable application** in the existing catalog.

Do not replace the existing website or create an unrelated standalone project.

Preserve all existing games and features.

Do not introduce breaking changes to existing routes, dependencies, build configuration or shared behavior.

Use the existing framework unless there is a compelling technical reason not to.

The final application must remain compatible with static Netlify deployment.

Support desktop and mobile devices, including touchscreens.

---

# 3. Overall Educational Vision

The platform will eventually contain 20 worlds.

Each world must introduce three essential dimensions:

### A. New vocabulary

Every world explores one or more distinct lexical domains:

- Family.
- House.
- Food.
- Daily activities.
- Transport.
- Nature.
- Work.
- Relationships.
- Emotions.
- Society.
- History.
- Culture.
- And many others.

### B. New grammar and sentence constructions

This is even more important than vocabulary.

Each world must progressively introduce new ways of constructing meaningful Malagasy sentences.

The learner must become increasingly capable of expressing complex ideas.

Do not build worlds that simply teach lists of new words without introducing or consolidating grammatical abilities.

### C. New practical communication abilities

Each world must enable the learner to accomplish new communication tasks.

Examples:

- Introduce themselves.
- Ask for information.
- Buy food.
- Explain where they are going.
- Describe a person.
- Narrate past events.
- Discuss future plans.
- Explain a problem.
- Express an opinion.
- Tell a story.
- Debate everyday topics.

**Every world must deliver tangible new communication capabilities.**

Cultural, historical and geographical information should enrich the experience but never replace the main language-learning objectives.

---

# 4. Complete 20-World Curriculum

Design the entire progression before implementing World 1.

Each world will be inspired by a real Malagasy city, geographical region, landscape or historical location.

The world names are thematic locations, not a claim that Madagascar has 20 administrative provinces.

The following table is the proposed curriculum.

Treat it as a strong starting point, but verify the linguistic sequencing using reliable Malagasy grammar references before finalizing the data model.

Do not mechanically transfer French grammar concepts to Malagasy.

| World | Name | Main vocabulary | New grammar / structures | Practical capability |
|---|---|---|---|---|
| 1 | Antananarivo — Premiers pas | Greetings, introductions, family, house, basic food | Pronunciation, simple predicates, basic word order, personal pronouns, "ny", elementary questions, simple negation | Greet someone, introduce yourself, understand and create simple sentences |
| 2 | Antsirabe — Vie quotidienne | Routine, time, household objects, family activities | Common verb patterns, basic possession, affirmative/negative sentence patterns, everyday time expressions | Talk about family, home and daily activities |
| 3 | Toamasina — Marchés et repas | Food, drinks, quantities, numbers, prices, shopping | Requests, demonstratives, quantities, preferences, interrogative patterns | Order food, shop, express needs and ask prices |
| 4 | Andasibe — Explorer Madagascar | Directions, places, transport, landscape, movement | Spatial relations, movement expressions, location predicates, elementary imperatives | Navigate, ask directions and explain destinations |
| 5 | Fianarantsoa — Premières conversations | Social exchanges, interests, people, common situations | Integration of core sentence patterns, conversational connectors, common questions and time expressions | Sustain a simple everyday conversation with a Malagasy speaker |
| 6 | Ambositra — Décrire le monde | Appearance, objects, materials, colors, qualities | Adjectival predicates, descriptive structures and basic comparisons | Describe people, objects, landscapes and preferences |
| 7 | Ranomafana — Hier et demain | Activities, schedules, events, planning | Past/future marking for relevant verb classes, temporal expressions | Explain what happened and what will happen |
| 8 | Manakara — En voyage | Journeys, accommodation, weather, travel | Sequencing, conjunctions, temporal relationships | Explain a journey and describe a sequence of events |
| 9 | Morondava — Souvenirs | Memories, celebrations, experiences, emotions | Narrative patterns and expanded temporal constructions | Tell stories and describe experiences |
| 10 | Toliara — Problèmes et solutions | Health situations, services, emergencies, practical issues | Ability, obligation, permission, causal explanations and requests | Explain problems, ask for help and propose solutions |
| 11 | Mahajanga — Relations humaines | Friendship, relationships, family life, social customs | More complex possession, polite formulations and interpersonal constructions | Maintain longer social conversations |
| 12 | Antsiranana — Exprimer ses idées | Opinions, activities, preferences, comparisons | Agreement, disagreement, opinion expressions, justification | Express opinions and explain preferences |
| 13 | Nosy Be — Projets et possibilités | Leisure, future projects, activities, choices | Possibility, intention, conditions and hypothetical situations | Discuss plans, suggestions and possibilities |
| 14 | Sambava — Travail et société | Work, responsibilities, trade, organization | More complex verbal constructions, purpose and causation | Discuss work and social situations |
| 15 | Ambohimanga — Histoire et patrimoine | Heritage, historical events, traditions, politics | Relative constructions, expanded descriptions and historical narratives | Explain historical events and traditions |
| 16 | Isalo — Nature et environnement | Biodiversity, landscapes, conservation, environment | Complex descriptions, causes, consequences and explanations | Discuss nature and environmental challenges |
| 17 | Tôlanaro — Nouvelles perspectives | Abstract ideas, society, decisions | More advanced Malagasy voice constructions and information structure | Express and interpret ideas through varied sentence patterns |
| 18 | Sainte-Marie — Récits et expériences | Stories, travel memories, culture, emotions | Embedded clauses, reported speech and extended discourse | Tell detailed stories and understand longer narratives |
| 19 | Antananarivo — Madagascar moderne | Media, society, current issues, complex social vocabulary | Argumentation, connectors, discourse nuance and register | Discuss contemporary subjects and justify viewpoints |
| 20 | Madagascar — Le grand voyage | Complete vocabulary consolidation | Integration of all previously learned constructions | Communicate autonomously in varied everyday situations |

## Important linguistic validation

This curriculum is a pedagogical hypothesis.

Research authentic Malagasy grammar before deciding exactly when particular constructions should be taught.

Pay particular attention to:

- Predicate-initial structures.
- Verb-object-subject patterns and their limitations.
- Nominal and adjectival predicates.
- Malagasy voice systems.
- Pronouns.
- Articles and determiners.
- Possession.
- Negation.
- Questions.
- Tense and aspect.
- Information structure.
- Relative and subordinate constructions.

Teach the genuine structures of Malagasy instead of forcing French grammatical categories onto the language.

If a structure is necessary earlier than suggested in this table, adjust the curriculum accordingly and document the decision.

Maintain logical prerequisites between concepts.

## Major progression milestones

### After World 5 — Basic conversational communication

The learner should be able to:

- Introduce themselves naturally.
- Ask someone about their name, origin and family.
- Describe their home and routine.
- Ask and answer common questions.
- Order food and drinks.
- Ask for prices.
- Ask for directions.
- Express simple needs.
- Discuss everyday preferences.
- Ask someone to repeat or speak more slowly.
- Participate in a basic conversation with a Malagasy speaker, even with mistakes and pauses.

World 5 must contain a comprehensive conversation-based assessment that combines the first five worlds.

### After World 10

The learner should additionally be able to:

- Describe experiences.
- Discuss past and future events.
- Explain problems.
- Ask for and provide assistance.
- Narrate relatively simple stories.
- Communicate in a broader range of daily situations.

### After World 15

The learner should additionally be able to:

- Understand longer texts.
- Describe complex situations.
- Express and justify opinions.
- Explain causes and consequences.
- Discuss historical and cultural topics.
- Maintain more substantial conversations.

### After World 20

The learner should be capable of increasingly independent conversations across varied familiar topics, with substantially richer vocabulary and grammar.

Do not make unsupported promises of native-like fluency.

---

# 5. World Structure

Every world should use the same extensible educational structure.

Each world contains:

- Multiple learning units.
- Vocabulary introduction lessons.
- Grammar lessons.
- Interactive practice.
- Listening comprehension.
- Reading comprehension.
- Sentence construction.
- Dialogue simulations.
- Story interludes.
- Mixed revision quizzes.
- Unit assessments.
- A final world challenge.

Each world should have:

- Stable world ID.
- Display name.
- Geographical location.
- Description.
- Main vocabulary domains.
- Grammar objectives.
- Communication objectives.
- Cultural themes.
- Prerequisite concepts.
- Unlock conditions.
- Difficulty level.
- Estimated study time.
- Units and lesson references.
- Completion requirements.

Worlds 2–20 should have meaningful metadata and a planned curriculum, but no fabricated or superficial playable content.

They must appear on the world map as locked future destinations.

For each world, the application should be able to display the location, future objectives and expected new skills.

Only World 1 is fully playable in this version.

---

# 6. World 1 — Antananarivo: Premiers pas

World 1 must be the focus of the actual educational content implementation.

The narrative begins when the player arrives in Madagascar.

They gradually learn enough Malagasy to navigate introductory real-world situations.

Create approximately 12 structured units.

Aim for around 45–60 meaningful interactive learning activities across World 1.

Do not generate repetitive filler merely to reach this number.

Every unit should contain multiple short lessons, practical exercises, and relevant revision opportunities.

## Unit 1 — Tonga soa! Welcome to Madagascar

Introduce:

- Greetings.
- Goodbye.
- Thank you.
- Please.
- Excuse me.
- Yes and no.
- Basic politeness.
- Elementary Malagasy pronunciation and spelling.

Include short listening exercises and contextual greetings.

## Unit 2 — Introducing Yourself

Teach:

- My name is...
- What is your name?
- I am from...
- Where are you from?
- Basic personal pronouns.
- Elementary introduction patterns.

Include short two-person conversations.

## Unit 3 — Building Your First Sentences

Teach:

- Simple Malagasy sentence construction.
- Predicate-initial structures.
- Differences from French word order.
- Elementary nominal predicates.
- The definite article "ny".
- Basic negation.
- Simple questions.

Use examples that are suitable for beginners.

## Unit 4 — Family and People

Teach vocabulary for:

- Father.
- Mother.
- Brother.
- Sister.
- Parents.
- Children.
- Friends.
- Common family relationships.

Introduce simple ownership and family descriptions.

## Unit 5 — The House

Teach vocabulary for:

- House.
- Room.
- Door.
- Window.
- Table.
- Chair.
- Bed.
- Everyday objects.

Introduce simple spatial descriptions.

## Unit 6 — Meals and Food

Teach vocabulary for:

- Rice.
- Water.
- Meat.
- Fish.
- Vegetables.
- Food and drinks.
- Eating and drinking.

Introduce simple expressions of hunger, thirst and food preferences.

Use relevant Malagasy culinary examples.

## Unit 7 — Numbers and Quantities

Teach:

- Numbers 0–20.
- Elementary quantities.
- Basic prices.
- Everyday counting.
- Simple purchasing interactions.

## Unit 8 — Asking Questions

Teach essential interrogative expressions:

- Who?
- What?
- Where?
- How?
- How many?
- How much?

Practice both forming and answering simple questions.

## Unit 9 — Getting Around

Teach:

- Directions.
- Left and right.
- Destinations.
- Basic transport.
- Taxi vocabulary.
- Asking for help finding a location.

## Unit 10 — Everyday Tourist Needs

Teach:

- I'm hungry.
- I'm thirsty.
- I'm tired.
- I don't understand.
- Please repeat.
- I speak a little Malagasy.
- Where are the toilets?
- Can you help me?

Use reliable and natural Malagasy expressions.

## Unit 11 — First Real Dialogues

Combine previously learned content in practical situations:

- Meeting someone.
- Introducing a family member.
- Ordering food.
- Shopping.
- Asking directions.
- Talking to a host family.

Focus on functional comprehension and communication.

## Unit 12 — The Antananarivo Adventure

Create an interactive final adventure involving multiple real-world situations.

It must combine:

- Vocabulary.
- Grammar.
- Listening.
- Reading.
- Sentence construction.
- Dialogues.
- Cultural knowledge.
- Cumulative revision.

This should feel like a meaningful final challenge, not a generic quiz.

### World 1 scope management

Although World 1 includes tourist survival expressions, Worlds 2–5 must revisit these topics in greater depth.

World 1 introduces basic patterns.

Later worlds develop genuine conversational proficiency.

Avoid trying to teach all foundational Malagasy grammar completely in the first world.

---

# 7. Critical Requirement — Cumulative Duolingo-Style Learning

This is one of the most important features.

**New exercises must continuously reuse vocabulary and grammar already introduced in previous lessons and worlds.**

The application must not treat every lesson as an isolated collection of questions.

When the player learns something new, later exercises should naturally incorporate older concepts.

For example:

- Unit 1 teaches greetings.
- Unit 2 teaches pronouns.
- Unit 3 teaches basic sentence construction.
- Unit 4 teaches family vocabulary.

A quiz in Unit 4 should test family vocabulary while also occasionally revisiting greetings, pronouns and previously learned sentence constructions.

An exercise can simultaneously evaluate several concepts.

Example:

A sentence-building exercise involving someone's mother could test:

- Family vocabulary.
- Pronouns.
- Possession.
- Sentence structure.

## Mixed quiz engine

Implement a reusable exercise-selection engine.

For ordinary practice lessons, use these approximate initial weights:

- 55% current learning objectives.
- 25% older concepts.
- 20% due reviews or known weaknesses.

These percentages must be configurable.

Adapt them when the player has not yet learned enough material or when the quiz has a specific assessment purpose.

The review engine must only select concepts the learner has already encountered.

It must never include locked grammar or unknown vocabulary without deliberately introducing them.

## Explicit review checkpoints

Every unit must include revision activities.

Examples:

- Short review after a few lessons.
- End-of-unit mixed review.
- Cumulative challenge across multiple units.
- Final world assessment.

Some review checkpoints should be required before unlocking subsequent content.

Others should be available as optional practice.

## Cross-world revisions

The engine must support cumulative revision across all 20 worlds.

A World 12 quiz should still be able to test a relevant concept introduced in World 2.

Concepts should not disappear merely because their original world was completed.

However, avoid excessively repeating concepts that are clearly mastered.

Prioritize:

- Weak concepts.
- Forgotten vocabulary.
- Due reviews.
- Prerequisite concepts relevant to current learning.
- Important commonly used constructions.

## Pedagogical coherence

Prefer exercises that combine old and new knowledge in meaningful sentences.

Do not simply insert random old vocabulary questions unrelated to the lesson.

The learner should feel that their existing knowledge is helping them learn something new.

---

# 8. Central Knowledge and Mastery System

Build a centralized concept registry.

Every important vocabulary item, grammar structure, sentence pattern and communication skill must have a stable identifier.

Examples:

- vocab.family.mother
- vocab.food.rice
- grammar.basic-predicate
- grammar.definite-article
- grammar.simple-negation
- grammar.possession
- skill.introducing-yourself
- skill.asking-directions

These IDs are illustrative.

The architecture must support relationships between:

- Concepts.
- Lessons.
- Exercises.
- Learning objectives.
- Prerequisites.
- Review sessions.
- Player mastery.

## Concept metadata

Each concept should contain:

- Stable ID.
- Category.
- Learning objective.
- First introduction.
- Prerequisites.
- Difficulty.
- Associated exercises.
- Source references.
- Review configuration.

## Individual mastery

Track:

- Times practiced.
- Successful attempts.
- Failed attempts.
- Last practiced date.
- Next review date.
- Current mastery estimate.
- Historical mistakes.
- Whether the concept was introduced or mastered.

Distinguish between:

- Never seen.
- Learning.
- Reviewing.
- Mastered.
- Due for review.

Do not consider a concept mastered just because the corresponding lesson was completed once.

Likewise, XP should not be used as a substitute for actual learning mastery.

---

# 9. Spaced Repetition System

Implement a lightweight deterministic spaced-repetition algorithm.

The purpose is to bring back concepts at progressively increasing intervals.

Correct answers should generally increase the review interval.

Repeated mistakes should reduce mastery estimates and bring concepts back sooner.

The system must be:

- Deterministic.
- Testable.
- Documented.
- Compatible with browser persistence.
- Flexible enough for future improvements.

Avoid arbitrary random scheduling.

Provide a dedicated **Centre de révision**.

Display:

- Number of concepts due for review.
- Weak vocabulary.
- Weak grammar concepts.
- Recommended review session.
- Overall mastery progression.

Players should be able to practice without resetting completed lessons.

Repeating a lesson should not produce unlimited XP rewards.

---

# 10. Interactive Exercise Engine

Build a modular exercise engine that supports different activity types.

All exercises must have:

- Clear instructions.
- A question or task.
- Reliable answer validation.
- Helpful feedback.
- Explanations.
- Difficulty metadata.
- Concept tags.
- Source references.
- Appropriate XP/mastery integration.

Implement at least the following exercise types in World 1.

## A. Multiple Choice

French-to-Malagasy and Malagasy-to-French questions.

Use plausible distractors.

Avoid making the correct answer obvious from formatting or answer length.

## B. Matching

Match Malagasy words to French translations.

Support mobile interaction.

## C. Sentence Construction

Present shuffled words and let the learner reconstruct a Malagasy sentence.

Support click/tap interaction as well as accessible keyboard controls.

Do not require drag-and-drop exclusively.

## D. Fill in the Blank

Complete a Malagasy sentence with the appropriate word.

## E. Translation

Translate simple sentences in either direction.

Support multiple valid answers where appropriate.

Do not use naive strict equality as the only validation mechanism.

Normalize harmless spelling/formatting differences where linguistically safe.

Do not accept materially incorrect grammar simply because the sentence resembles a valid answer.

## F. Listening Comprehension

Play authentic or appropriately verified Malagasy audio.

Ask the learner to:

- Identify a word.
- Select a translation.
- Reconstruct a phrase.
- Answer a question.

## G. Reading Comprehension

Show short Malagasy texts and ask comprehension questions.

## H. Dialogue Simulation

Let the learner participate in a conversation.

Select appropriate responses and react to the conversation context.

Incorrect answers should trigger informative explanations.

## I. Cultural Quizzes

Occasional questions about Madagascar's geography, history and culture.

Keep these secondary to language learning.

## J. Pronunciation Practice

Prepare an architecture for future speech-recognition functionality.

For now, provide listening and independent repetition exercises where audio exists.

Do not pretend that automatic pronunciation evaluation exists if it has not been implemented.

---

# 11. Audio System

Audio is essential to a serious language-learning application.

Build a reusable audio service with:

- Play.
- Pause.
- Replay.
- Loading indicators.
- Playback errors.
- Adjustable playback speed.
- Slow listening.
- Mobile compatibility.
- Global mute settings.

## Important technical constraint

Do not assume browser speech synthesis supports Malagasy.

Research available Malagasy audio solutions.

Prioritize:

1. Legal, reliable native-speaker recordings.
2. Verified Malagasy-capable TTS if available.
3. Clearly indicated limitations where audio is unavailable.

Do not silently substitute French or English TTS and claim that it represents correct Malagasy pronunciation.

Do not create decorative play buttons with no actual playback.

Every listening exercise must have a valid playable audio asset to count toward listening mastery.

If audio is unavailable, the exercise should be disabled, replaced with an appropriately labeled text exercise, or excluded from required completion.

Do not award listening mastery through a text-only substitute.

Use an audio manifest with stable asset references.

Design the service so native recordings can be added in later iterations without rewriting the lessons.

Document the real audio solution implemented and its limitations.

---

# 12. Interactive Stories and Narrative Interludes

Introduce recurring story interludes.

The player begins their adventure after arriving in Antananarivo.

They meet recurring characters and gradually experience everyday life in Madagascar.

Example events:

- Arrival in the city.
- Meeting a local person.
- Visiting a family.
- Exploring a market.
- Ordering a meal.
- Asking for directions.
- Solving a simple misunderstanding.
- Completing a final city adventure.

Each story should include:

- A setting.
- Characters.
- Short dialogues.
- Interactive responses.
- Language objectives.
- Occasional audio.
- Contextual explanations.
- XP rewards.

Some decisions may produce small dialogue branches.

Stories should gradually introduce more Malagasy and less French.

Early stories can rely heavily on French narration.

Later stories should require greater understanding of Malagasy dialogue.

Make the experience entertaining without sacrificing educational accuracy.

For World 1, aim for approximately 4–6 meaningful story interludes.

---

# 13. Madagascar History, Geography and Culture

The app should introduce Madagascar naturally during the learning journey.

Language remains the primary focus.

Use short cultural discoveries as rewards or interludes between lessons.

Potential topics:

- Madagascar's geographical location.
- Antananarivo.
- The Central Highlands.
- Malagasy food and rice culture.
- Everyday etiquette.
- Historical kingdoms.
- Ambohimanga.
- Independence.
- Malagasy architecture.
- Traditional crafts.
- National parks.
- Lemurs and biodiversity.
- Coastal regions.
- Regional cultural diversity.

Some discoveries should include short interactive quizzes.

Avoid stereotypes and unsupported historical claims.

Differentiate between historical provinces and current administrative divisions.

Integrate cultural discoveries into relevant worlds.

For World 1, focus mainly on Antananarivo, the geography of Madagascar, daily customs, food and a brief historical introduction.

---

# 14. Gamification and Progression

The application should be engaging enough to encourage consistent daily learning.

Implement:

- XP.
- Player level.
- Completed lessons.
- Unlocked units.
- Unlocked worlds.
- Daily learning goals.
- Streak tracking.
- Longest streak.
- Achievements.
- Vocabulary mastery statistics.
- Grammar mastery statistics.
- Learning time.
- Progression visualization.

## Achievements

Examples:

- Premier mot malgache.
- Première conversation.
- 7 jours d'assiduité.
- 50 mots appris.
- Leçon parfaite.
- Première histoire terminée.
- Explorateur d'Antananarivo.
- Monde 1 terminé.

Achievements must have clear, deterministic requirements.

## XP logic

Award XP for:

- First-time lesson completion.
- Correct answers.
- Review practice.
- Perfect lessons.
- Story completion.
- Milestones.

Prevent trivial unlimited XP farming.

Repeating a lesson should still be useful for learning, but XP rewards may be reduced or capped.

## Streaks

Track activity by calendar day.

Show:

- Current streak.
- Longest streak.
- Days studied.
- Daily goal completion.

Handle local time and day transitions consistently.

Do not erase learning progress because of a missed day.

## Engagement

Add attractive feedback animations and progression celebrations.

Maintain a motivating experience without manipulative monetization, artificial frustration or excessive gamification.

---

# 15. Six-Month Intensive Learning Roadmap

Design a suggested six-month learning roadmap through the 20 worlds.

The roadmap should include:

- Recommended daily practice.
- Approximate learning time.
- Vocabulary milestones.
- Grammar milestones.
- Listening milestones.
- Conversational milestones.
- Periodic review periods.

Allow learners to progress at their own pace.

Show:

- Days since starting.
- Actual study time.
- Daily study goal.
- Current world.
- Completion percentage.
- Concepts mastered.
- Reviews due.
- Estimated roadmap progression.

Avoid presenting completion percentages as proof of real-world fluency.

Distinguish between platform progress and actual language proficiency.

---

# 16. Visual Design and User Experience

Create an attractive, modern learning application.

Visual references:

- Duolingo's engaging learning path.
- Adventure-style world maps.
- Modern educational mobile apps.
- Madagascar's geographical and cultural identity.

Do not simply clone Duolingo.

Develop a recognizable visual style.

The application should feel polished, colorful, welcoming and rewarding without becoming childish.

## Required screens

- Welcome screen.
- Home dashboard.
- World selection map.
- World learning path.
- Lesson player.
- Review center.
- Vocabulary collection.
- Grammar reference.
- Achievement screen.
- Statistics dashboard.
- Stories interface.
- Settings.
- Import/export progress.
- Sources & Crédits.

## World map

Display 20 worlds inspired by Madagascar's geography.

Each world should show:

- Name.
- Theme.
- Status.
- Progress.
- Main learning objectives.
- Unlock requirements.

World 1 must be accessible.

Worlds 2–20 should be visible but locked.

Do not display them as implemented when they are only planned.

## Learning path

Within a world, display lessons as an interactive progression path.

Visually distinguish:

- Locked lessons.
- Available lessons.
- Completed lessons.
- Review checkpoints.
- Stories.
- Assessments.
- Final challenges.

## Feedback

Include polished but restrained animations for:

- Correct answers.
- Incorrect answers.
- XP gains.
- Lesson completion.
- Unit completion.
- Achievement unlocks.

Add sound effects with a mute option.

Respect reduced-motion accessibility settings.

Support desktop, mobile, mouse, touch and keyboard navigation.

---

# 17. Progress Saving and Netlify Deployment

The application will initially remain a static Netlify deployment.

No backend or account system is required for this version.

## Automatic local progress

Use localStorage or IndexedDB to save progression automatically in the browser.

The user should not need to export a save after every lesson.

Progress should survive page reloads and ordinary browser restarts on the same device.

Clearly communicate that browser-only storage can be lost if site data is cleared or the browser/device is changed.

## JSON export/import

Implement a full JSON backup mechanism.

The user must be able to:

- Export a save.
- Download it as JSON.
- Import a previous save.
- Preview save information.
- Confirm before replacing the current save.
- Reject invalid or corrupted files safely.

The save format should include:

- Schema version.
- Player settings.
- XP and levels.
- Completed lessons.
- Unit/world progression.
- Streak data.
- Achievements.
- Concept mastery.
- Review schedule.
- Relevant learning history.
- Timestamps.

Validate imported JSON and reject invalid or malicious data.

## Versioning and migration

Design save files with explicit schema versions.

Prepare migration mechanisms for future updates.

Do not tie save data directly to fragile array indexes or visual component state.

## Future accounts

Use a storage abstraction so user accounts and remote synchronization can be implemented later.

Do not implement authentication yet.

---

# 18. Research and Linguistic Reliability

This project is an educational platform.

Linguistic correctness is essential.

Codex must research reliable material before finalizing educational content.

Start with these candidate references:

- Peace Corps Malagasy Official Language Manual:
  https://eric.ed.gov/?id=ED454700

- Malagasy Encyclopedic Dictionary:
  https://www.malagasyword.org/

- Peace Corps Malagasy course:
  https://www.101languages.net/malagasy/malagasy-peace-corps-course/

- University of Texas linguistic material:
  https://lrc.la.utexas.edu/books/typology/6-subject-final

- Historical Malagasy grammar reference:
  https://en.wikisource.org/wiki/A_Concise_Grammar_of_the_Malagasy_Language/The_Article

- United Nations Madagascar information:
  https://www.un.int/madagascar/madagascar/country-facts

These are starting references, not an exhaustive bibliography.

## Independent source discovery

**Codex is explicitly allowed and encouraged to discover additional sources independently.**

Search for:

- Academic Malagasy grammars.
- Reputable dictionaries.
- Educational materials.
- Contemporary language resources.
- Authentic dialogues.
- Pronunciation resources.
- Malagasy cultural and historical references.
- Geography information.
- Legally reusable recordings and media.

Prioritize reliable sources.

Cross-check uncertain vocabulary or grammar using multiple references when possible.

Teach standard Malagasy initially.

Regional variants can be introduced later, but must be clearly distinguished from the standard form.

Do not invent translations, pronunciation instructions, or grammatical explanations to fill gaps.

If a specific expression cannot be verified reliably, omit it from scored exercises or mark it as pending review.

---

# 19. Mandatory Sources & Crédits Section

**Every external source actually used in the application must be listed in a dedicated in-app "Sources & Crédits" section.**

This requirement is mandatory.

The section must be accessible from the application's navigation or settings.

It should include:

- Linguistic references.
- Dictionaries.
- Grammar sources.
- Historical references.
- Cultural references.
- Geographical sources.
- Audio sources.
- Image sources.
- Other media attribution.

For each source, include when available:

- Title.
- Author or organization.
- Direct link.
- Resource category.
- Publication date or edition.
- Relevant content supported.
- Licensing/attribution requirements.

## Centralized source registry

Create a structured source registry.

Do not hardcode the complete source list inside the Credits component.

Lessons and concepts should reference source IDs.

The Credits page must be generated from this registry.

This way, adding more worlds or sources automatically extends the credits.

Distinguish between:

- Sources actually consulted.
- Suggested supplementary reading.
- Media used in the application.
- Content awaiting verification.

Do not falsely claim to have accessed a resource.

Do not fabricate licensing permissions.

Do not copy copyrighted course content or recordings without appropriate authorization.

Create original educational exercises based on legitimate research and verified knowledge.

Clearly identify any educational content that still requires native-speaker validation.

---

# 20. Technical Architecture — Critical Long-Term Requirement

**The application must be designed to support future Codex development through incremental prompts without major refactoring.**

This is a central success criterion.

Separate educational content, application logic, UI components, state management and persistence.

Use the existing repository framework and conventions.

Avoid unnecessary new dependencies.

## Required conceptual modules

### A. Curriculum Engine

Responsible for:

- Worlds.
- Units.
- Lessons.
- Learning objectives.
- Prerequisites.
- Unlocking.
- World progression.

### B. Exercise Engine

Responsible for:

- Exercise rendering.
- Answer validation.
- Feedback.
- Exercise selection.
- Difficulty.
- Exercise type registration.

Adding a new exercise type should not require rewriting every lesson.

### C. Knowledge Engine

Responsible for:

- Concept registry.
- Vocabulary mastery.
- Grammar mastery.
- Learning prerequisites.
- Mistake history.
- Spaced repetition.
- Review recommendations.

### D. Progression Engine

Responsible for:

- XP.
- Player levels.
- Streaks.
- Achievements.
- Lesson completion.
- Milestones.

### E. Content Repository

Responsible for structured content:

- Vocabulary.
- Grammar.
- Worlds.
- Units.
- Lessons.
- Exercises.
- Dialogues.
- Stories.
- Cultural facts.
- Audio asset references.
- Source references.

Never embed large amounts of educational content directly in UI components.

### F. Persistence Service

Responsible for:

- Automatic saving.
- Local storage.
- JSON export/import.
- Save validation.
- Schema migrations.
- Future account synchronization compatibility.

### G. Audio Service

Responsible for:

- Playback.
- Playback speed.
- Source selection.
- Errors.
- Audio availability.
- Asset references.

### H. Credits Registry

Responsible for:

- Source attribution.
- Reference metadata.
- Licensing information.
- Linking concepts to sources.
- Displaying the credits interface.

## Architectural rules

- Use stable IDs for worlds, units, lessons and concepts.
- Never use array indexes as persistent identifiers.
- Keep learning data separate from React/Vue/etc. components.
- Keep core algorithms deterministic and testable.
- Avoid hardcoded World 1 conditions in generic engines.
- Avoid excessive global state.
- Avoid giant files combining UI, content and logic.
- Make new worlds addable primarily through data.
- Make new exercise types registerable through clear interfaces.
- Keep progression compatible with future data migrations.
- Use content schemas and validation.
- Do not overengineer with unnecessary microservices or backend infrastructure.

The objective is a clean, understandable frontend architecture, not architectural complexity for its own sake.

---

# 21. Content Authoring Standards

Create structured content definitions.

Every lesson should include:

- Stable ID.
- World ID.
- Unit ID.
- Title.
- Description.
- Learning objectives.
- Introduced concepts.
- Reviewed concepts.
- Exercise references.
- Prerequisites.
- Difficulty.
- Estimated duration.

Every exercise should include:

- Stable ID.
- Exercise type.
- Prompt.
- Correct answer definitions.
- Accepted alternatives.
- Explanations.
- Concept tags.
- Difficulty.
- Source IDs.
- Audio references when applicable.

Create automated validation for:

- Duplicate IDs.
- Missing references.
- Broken prerequisites.
- Invalid answers.
- Missing translations.
- Missing source IDs.
- Inaccessible lessons.
- Invalid exercise configurations.
- Broken asset paths.

The content architecture must make it easy for future Codex prompts to generate and add new units safely.

---

# 22. Required Documentation for Future Development

Create useful documentation in the repository.

## docs/ARCHITECTURE.md

Explain:

- Project structure.
- Core modules.
- Data flow.
- State management.
- Exercise engine.
- Storage.
- Extension points.

## docs/CURRICULUM.md

Document:

- All 20 worlds.
- Vocabulary themes.
- Grammar progression.
- Practical objectives.
- Prerequisites.
- World 5 milestone.
- Six-month learning roadmap.

## docs/CONTENT_GUIDE.md

Explain how to add:

- A new world.
- A new unit.
- A new lesson.
- A vocabulary entry.
- A grammar concept.
- An exercise.
- An interactive story.
- An audio file.

## docs/REVIEW_ENGINE.md

Document:

- Concept mastery.
- Mixed quiz selection.
- Revision scheduling.
- Spaced repetition.
- Cross-world reviews.
- XP and mastery interaction.

## docs/LANGUAGE_SOURCES.md

List:

- Sources actually consulted.
- URLs.
- Purposes.
- Reliability notes.
- Licensing.
- Dialect information.
- Content requiring native-speaker validation.

## docs/ROADMAP.md

Document:

- Implemented features.
- Future worlds.
- Planned features.
- Technical limitations.
- Suggested next development stages.

These documents must describe the real implementation rather than merely repeating the specification.

A future Codex session should be able to read them and extend the application efficiently.

---

# 23. Testing and Quality Assurance

Implement relevant tests using the repository's existing tooling where possible.

Verify at minimum:

- Existing games still launch correctly.
- Malagasy Adventure appears as the fourth game.
- World 1 is unlocked.
- Future worlds are locked.
- Lessons unlock correctly.
- The first lesson is immediately playable.
- All implemented exercise types validate answers correctly.
- Alternative valid translations work as expected.
- XP is awarded appropriately.
- Repeated exercises cannot generate unlimited rewards.
- Concept mastery updates correctly.
- Mixed quizzes include appropriate previously learned content.
- Locked concepts never appear in ordinary reviews.
- Spaced repetition behaves deterministically.
- Review checkpoints work correctly.
- Progress survives a browser reload.
- JSON export/import restores progression.
- Corrupted saves are handled safely.
- Content references are valid.
- The full World 1 path is reachable.
- Required audio exercises have valid playable assets.
- Unsupported audio does not falsely award listening proficiency.
- Mobile layouts remain usable.
- Accessibility basics are respected.
- Netlify production build succeeds.

Test the progression and review engines independently from the UI whenever possible.

---

# 24. Implementation Priorities

Work in the following order.

## Phase 1 — Repository and architecture

- Inspect existing repository.
- Integrate fourth application.
- Define architecture.
- Define curriculum/content schemas.
- Design progression and knowledge engines.
- Prepare local persistence.

## Phase 2 — Complete curriculum architecture

- Establish the 20-world curriculum.
- Define skills, concepts and prerequisites.
- Set communication milestones.
- Create the world metadata.
- Build the world map.

## Phase 3 — Core learning engine

- Implement reusable exercise types.
- Implement answer validation.
- Implement concept mastery.
- Implement mixed quiz generation.
- Implement review scheduling.
- Implement lesson unlocks and progression.

## Phase 4 — World 1 content

- Create the 12 planned units.
- Research and verify vocabulary/grammar.
- Create meaningful lessons.
- Create varied exercises.
- Implement reading comprehension.
- Implement dialogue simulations.
- Integrate available valid audio.
- Add story interludes.
- Create unit reviews and final challenge.

## Phase 5 — Engagement and polish

- XP.
- Levels.
- Achievements.
- Streaks.
- Statistics.
- Vocabulary collection.
- Review center.
- Animations.
- Responsive design.

## Phase 6 — Persistence and documentation

- Automatic local saving.
- JSON export/import.
- Save versioning.
- Credits registry and interface.
- Technical documentation.
- Content documentation.
- Roadmap.

## Phase 7 — Testing and final verification

- Run content validation.
- Run relevant tests.
- Verify progression.
- Verify the complete World 1 learning path.
- Run the production build.
- Check Netlify compatibility.
- Fix discovered regressions.

If scope constraints require compromises, prioritize a stable, functional educational foundation and complete World 1 path over cosmetic extras.

Do not leave misleading fake functionality.

---

# 25. Scope Boundaries

### Implement now

- Integration into the existing game catalog.
- Complete metadata and curriculum planning for 20 worlds.
- World map.
- Full World 1 content.
- Core exercise engine.
- Mixed reviews.
- Concept mastery.
- Spaced repetition foundation.
- Progression.
- Local saving.
- JSON import/export.
- Sources & Crédits.
- Documentation.
- Relevant tests.

### Prepare for future development, but do not fully implement now

- Worlds 2–20 educational content.
- Account registration/login.
- Cloud synchronization.
- Multiplayer learning.
- Competitive leaderboards.
- Advanced pronunciation scoring.
- Speech recognition.
- AI-generated conversational tutoring.
- Complex adaptive learning algorithms.
- Paid subscriptions.
- Native mobile applications.

Create clean extension points when they are useful, but do not add large unused systems or speculative infrastructure.

---

# 26. Acceptance Criteria

The project is successful when:

1. The existing AfterHours website still functions correctly.

2. Malagasy Adventure appears as a fourth application.

3. The learner can open an attractive Malagasy learning dashboard.

4. A complete map of 20 themed worlds is visible.

5. World 1 is fully playable.

6. The learner can progress through meaningful lessons introducing vocabulary and grammar.

7. Lessons contain diverse interactive exercise types.

8. New lessons naturally reinforce previously learned concepts.

9. Regular cumulative review quizzes are integrated into progression.

10. A centralized mastery system records actual learning progress.

11. Stories, conversations and cultural content enrich the learning experience.

12. Audio works where valid audio assets are available, with honest handling elsewhere.

13. Progress is automatically saved locally.

14. The learner can export and import a JSON save.

15. Every external source actually used is listed in the in-app Sources & Crédits section.

16. All future worlds have coherent curriculum metadata, even though their lessons are not yet implemented.

17. The application builds successfully for Netlify.

18. The architecture is clearly documented.

19. A future Codex prompt can add World 2 without rewriting the core learning engine.

20. A future Codex prompt can add a new exercise type without restructuring the entire application.

---

# 27. Final Deliverables and Report

Make actual code changes in the existing repository.

Do not stop after producing a plan, pseudocode or visual mockup.

At the end, provide a concise and factual implementation report covering:

- Files created or modified.
- Architecture implemented.
- Curriculum structure.
- Number of World 1 units, lessons and exercises actually completed.
- Exercise types actually working.
- Mixed quiz and review mechanics.
- Mastery tracking.
- Audio implementation and limitations.
- Progress saving and JSON backup.
- Sources consulted and included in credits.
- Content requiring native-speaker review.
- Tests executed and their results.
- Netlify build status.
- Remaining limitations.
- Recommended next prompts for continuing development.

Do not claim that incomplete or untested features are finished.

## FINAL PRINCIPLE

**Build a genuine, engaging Malagasy-learning game today, but design it as the robust foundation of a much larger platform tomorrow.**

The player should enjoy learning Malagasy through interactive lessons, cumulative revisions, stories, geography, culture and visible progression.

The developer should be able to add new worlds, lessons, exercise formats, audio, user accounts and advanced learning systems through future Codex prompts without rebuilding the application.

Prioritize **pedagogical quality, cumulative learning, linguistic accuracy, extensibility, maintainability and a polished playable World 1**.

Proceed with repository inspection, architecture design and implementation. Make sensible technical decisions independently, document them, and deliver the strongest complete implementation possible within the existing project.
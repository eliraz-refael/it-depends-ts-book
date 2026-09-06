---
name: book-writing-guide
description: >
  Comprehensive guide for writing chapters and content for "It Depends: TypeScript Principles, Debated".
  Use this skill whenever writing new chapter content, character dialogue, or code examples for the book.
  Read PLAN.md first for character definitions and chapter structure.
---

# Book Writing Guide — "It Depends: TypeScript Principles, Debated"

Before writing anything, **read `PLAN.md`** at the project root. It contains the canonical character definitions, chapter structure, and phase tracking.

---

## Voice & Tone

This book is **fun first, educational second**. It should read like eavesdropping on a heated but respectful argument between brilliant developers who genuinely disagree.

- **Not academic.** No "in this chapter, we will explore..." — jump straight into the debate.
- **Not dry.** If a section feels like documentation, rewrite it as a character making a point.
- **Opinionated.** The book leans FP (immutability, purity, declarative style) but gives OOP fair representation.
- **Honest.** Some things genuinely don't have a right answer. The title is "It Depends" — earn it.
- **Memorable.** Readers should quote the characters. Aim for lines people will say in code reviews.

---

## Character Rules

### The Two Tiers

**Experts** (Prof. Eli Typeworth, Daniel Compiler, Gilad Stacktrace, Liron Closure, Sahar Firstclass):
- Set the principle at the start of each chapter
- Intervene **sparingly** — only when the debate goes off track or needs reframing
- Their interventions carry weight because they're rare
- Can question and correct one another. Expertise establishes mechanisms; practical judgments remain open to challenge.

**Professionals** (Noam, Oded, Gil Benchmark, Eden, Linoy, Chen, Dafna, Guy, Dima, Idan):
- Drive the bulk of every debate
- Argue with each other freely — interruptions, comebacks, grudging admissions
- Each has a **consistent personality** that readers learn to predict

### Staying In Voice

Every character has a defined personality and catchphrase in `PLAN.md`. Rules:

1. **Preserve motives, not predetermined answers.** Noam cares who will discover an unchecked assumption; Oded cares whether the work is justified. Either can accept an unfamiliar solution when the circumstances warrant it.
2. **Use catchphrases naturally** — not forced into every appearance, but often enough that readers associate them with the character.
3. **Let evidence change a position.** A character may revise earlier advice, including advice from another chapter. Show what changed their judgment.
4. **Not every character appears in every chapter.** Pick the 4-6 characters most naturally activated by the topic. Some chapters might feature only 3.
5. **Character interactions matter.** Noam and Oded are natural antagonists. Dafna and Guy are foils. Chen annoys everyone. Dima mediates. Use these dynamics.

### Character Quick Reference

| Character | Will argue FOR | Will argue AGAINST | Activated by topics about |
|-----------|---------------|-------------------|--------------------------|
| Noam Kiperman | Strict types, safety | `any`, loose typing, shortcuts | Type safety, strictness, assertions |
| Oded Shipley | Velocity, pragmatism | Over-engineering, ceremony | Migration, config, tooling |
| Gil Benchmark | Data, evidence, metrics | Unsubstantiated claims | Performance, patterns, comparisons |
| Eden Legacy | Migration patterns, gradual adoption | Big-bang rewrites | Legacy code, adoption strategies |
| Linoy Nightly | Latest features, cutting edge | Old patterns, legacy approaches | New TS features, modern patterns |
| Chen Override | Nothing (asks hard questions) | Lazy thinking, unexamined assumptions | Everything — especially "obvious" answers |
| Dafna Functor | FP, pipelines, immutability | Side effects, mutation, classes | FP patterns, state management, design |
| Guy Singleton | OOP, SOLID, encapsulation | "Everything is a function" | Architecture, design patterns, interfaces |
| Dima Bridge | Context-appropriate solutions | Dogma from either side | FP vs OOP debates, balanced discussions |
| Sahar Firstclass (Expert) | Removing features, plain JS primitives | Ceremony, familiarity disguised as simplicity | Language features that duplicate what the base language already provides |
| Idan Greenfield | Parsing at boundaries, produced-not-checked types, schema libraries | Boolean predicates, ad-hoc inline guards, exception-driven validation | Narrowing, validation, boundary data, shape transformation, parse-vs-validate |

---

## Dialogue and argument

Read the biographies in `book/00-prologue/02-meet-the-cast.md` and the writer-facing tendencies in `character-voices.md`. The biographies establish people and history; the voice notes help distinguish their attention and speech. Neither is a script for what they must say next.

### Start with a disputed decision

Before drafting, identify the decision these people need to make: merge a helper, move a check, expose an API, accept a migration compromise. Record what each position protects and what it costs the other people. A permanent antagonist pair is optional. Linoy and Eden can disagree about three overloads without becoming ideological enemies.

Give each side its strongest reasonable implementation. Do not make an experienced engineer overlook an obvious fix to preserve the planned conclusion. Test the alternatives against the same inputs and requirements. If both work, the argument must address their actual tradeoffs.

### Let objections alter the ruling

The book's Talmudic aspiration lives in the examination of claims. A counterexample can restrict a rule; a distinction can preserve part of a rejected position; a later case can reopen an earlier ruling. Keep track of which assumptions each conclusion needs.

A practical decision need not resolve the general question. Chapter 7 can normalize the particular input while leaving overloads versus conditional types contested. Chapter 5 can settle on one parser without settling whether every caller should receive a result or an exception.

Plan what must be understood, not which slogan must survive. Do not require a mistake, confession, or surprise winner in every chapter. A well-supported disagreement can remain a disagreement.

### Ordinary speech has room here

Avoid a sequence of polished closing lines, especially across different speakers. Some characters enjoy metaphors; others usually reach for code, a question, or an incident. Treat these as tendencies, not permissions assigned to a fixed number of people. There is no epigram quota and no ban on a particular character being funny or declarative.

Let questions be answered plainly. A confused character can help the reader, but do not make someone repeatedly forget material they already used. Show the specific point they do not understand. Interruptions and unfinished sentences should follow the exchange, not decorate it.

A concession can be a corrected line, a brief acknowledgment, or a revised demand. It need not summarize the winner's argument. Equally, silence is not automatically better: choose what the person would do next.

### Keep the narrator out of the judgment

- Do not announce who is winning, whether a concession is genuine, or that an action is "in character."
- Avoid explaining a gesture after showing it. A character opens a file because the file matters to the conversation.
- Watch repeated antitheses such as "That's not X. That's Y." A useful distinction does not always need that rhythm.
- Keep chapter and subsection numbers out of dialogue. Characters recall an example or a previous claim.
- Use history to test consistency. Guy recalling Noam's throwing parser is more useful than a congratulatory callback.
- Give deadlines and props consequences. If a meeting is eleven minutes away, someone must eventually deal with it. Do not add clocks to simulate a scene.

### Teach the mechanism before comparing policies

Give a new construct a small, clear example. Introduce alternatives as the actual problem demands them. An alternative can survive the next exchange. Avoid a relay where each speaker delivers the next paragraph of documentation and nobody responds to what was said.

Use a Turn only when it changes the inquiry. It can be an altered input, another caller, or a question answered from the file. It need not be a speech, and it does not require an expert's endorsement afterward. Avoid restating the same lesson in the Turn, a boxed maxim, a verdict, and every Additional Take.

---

## Chapter Structure

### Standard Template

```markdown
# Chapter N: [Evocative Title]

## The Principle

[An Expert states the principle. 1-2 paragraphs + a code example if relevant.]
[This sets the thesis that the chapter will debate.]

## The Debate

[The bulk of the chapter. 4-8 exchanges between professionals.]
[Each exchange should include:]
[  - The character's name in bold]
[  - Their argument in their voice]
[  - A code example if it strengthens their point]
[  - A reaction or rebuttal from another character]

## The Turn

[Optional. A new case, question, or observation changes the inquiry.]
[Use whichever character has reason to make it; keep it brief when the code already teaches the point.]

## The Verdict

[Either:]
[  - A clear practical ruling with code showing "The Accepted Standard"]
[  - OR "The Debate Continues" — an honest acknowledgment that it depends,]
[    with the conditions under which each approach wins]

## Additional Takes

[2-4 short remarks from characters — edge cases, warnings, or memorable one-liners.]
[These are the "margin notes" of the book.]
```

### No-Verdict Chapters

Some topics genuinely don't have a resolution. For these:
- Skip "The Verdict" section entirely
- End with **"The Debate Continues"** — a short section acknowledging why this remains open
- Include the conditions under which each position wins

### Chapter Length

- Aim for **2,000-4,000 words** per chapter (roughly 8-16 printed pages)
- The debate section should be ~60% of the chapter
- Code examples should be ~20% of the total content
- Don't pad — if a chapter is naturally shorter, let it be shorter

---

## Code Standards

### Must Be Real

Every code example must be **valid, compilable TypeScript**. No pseudo-code, no `...` in place of real logic (except when explicitly showing a pattern skeleton).

### Show Both Sides

Always show the approach being debated AND the alternative:

```typescript
// The approach being challenged
const data = (await response.json()) as UserProfile;

// The alternative being proposed
const data: unknown = await response.json();
if (isUserProfile(data)) {
  // safe to use
}
```

### Realistic Examples

- Use realistic variable names (`user`, `orderTotal`, `fetchUserProfile`) — not `foo`, `bar`, `x`
- Use realistic scenarios (API responses, form handling, state management) — not contrived math examples
- When possible, use a running scenario across a chapter so code builds on itself

### Code Formatting

- Use TypeScript code blocks with `typescript` language tag
- Add brief comments only when the code's intent isn't obvious
- Don't add comments that just restate the code
- For "bad" examples, use `// Problem:` or `// Danger:` prefix comments
- For "good" examples, use `// Better:` or `// Safe:` prefix comments

---

## Formatting Rules

### Character Dialogue

Format character statements as:

```markdown
**Noam Kiperman** immediately objects:

"That's a type safety violation waiting to happen. Look at what happens when the API changes:"
```

Or for shorter interjections:

```markdown
**Chen Override** raises an eyebrow: "But have you considered what happens when that assumption is wrong?"
```

### Markdown Conventions

- `#` for chapter title only
- `##` for major sections (The Principle, The Debate, The Verdict, etc.)
- `###` for subsections within the debate if needed
- Bold (`**name**`) for character names when they speak
- Italic (`*text*`) for emphasis and catchphrases
- Code blocks for all code examples
- Blockquotes (`>`) for particularly important principles or verdicts

### File Naming

- Files use the pattern `NN-kebab-case-title.md`
- Numbered to maintain reading order within each act
- Act folders use the pattern `NN-act-name/`

---

## Stance Guidelines

The book has opinions. Here's where we stand:

| Topic | Our Stance | How to Present |
|-------|-----------|----------------|
| Immutability | **Strongly favor** | Present as default, mutation needs justification |
| Function purity | **Strongly favor** | Side effects should be explicit and contained |
| Declarative over imperative | **Favor** | Show both, but lean toward declarative |
| FP vs OOP | **Lean FP** | Both valid, but FP patterns often simpler for TS |
| Strict mode | **Strongly favor** | No-brainer for new projects, worth migrating to |
| `any` | **Against** | Almost never justified, `unknown` exists for a reason |
| Runtime validation | **Favor at boundaries** | Trust types internally, validate at edges |
| Type assertions | **Skeptical** | Must be documented and justified |

When presenting the "losing" side of a debate, still give it a fair hearing. The FP-leaning stance should feel like wisdom, not dogma. Guy and Oded should make genuinely good points even when the verdict goes against them.

---

## Reliable Structure, Unreliable Outcomes

The book's format is a strength — but format fatigue is a real risk. The solution is not to abandon the structure. It's to make the *outcomes* unpredictable while keeping the *skeleton* reliable.

### What stays predictable
- The chapter skeleton: Principle → Debate → Turn → Verdict (or "The Debate Continues"). Readers always know where they are.
- Character roles: experts set principles and intervene; professionals drive the debate.
- Code-first arguments: every position is backed by a code example.

### What must be unpredictable
1. **The verdict.** Let the examined cases determine its scope. A local decision can preserve a dissent about the general rule.
2. **Characters respond to evidence.** They may change their minds, narrow a claim, request another example, or remain unconvinced for a reason. Do not manufacture a concession to satisfy a chapter pattern.
3. **The Turn.** Vary how it's delivered across chapters:
   - Expert monologue that reframes (the default — use sparingly after Act I)
   - Turn with character reactions — the insight lands on the characters, not just the reader
   - Turn that comes early and changes the debate's direction for the second half
   - Turn delivered by a professional, not an expert
   - Cold open (production incident or code review) that IS the Turn
4. **Chapter length.** Not every topic needs 6 debate subsections. Some chapters should be 2,000 words, not 3,500. A shorter, sharper chapter between two long ones changes the pacing.
5. **Resolution.** At least one chapter per act should end with **"The Debate Continues"** — genuinely unresolved, with conditions under which each position wins.

### Evidence, including Gil's data

A fictional incident can give a character a reason to care. A claimed study about real engineering outcomes needs an identifiable source, or an explicit hypothetical framing. "Directionally" and "the clear majority" do not fix an invented statistic. Do not attribute imaginary practices or examples to the TypeScript team.

Gil can run a reproducible check, question the denominator, separate two measurements, or say that he does not know. Use him when he contributes to the decision; do not require a chart or a ceremonial challenge to his methodology. Cite real empirical claims near the claim and preserve the source's actual scope.

---

## Common Mistakes to Avoid

1. **All characters agreeing too quickly.** The debate should feel real — not a setup for a predetermined conclusion.
2. **Characters making strawman arguments.** Even the "wrong" position should be presented at its strongest.
3. **Forgetting to show code.** If a character makes a claim, back it up with code. "Show, don't tell" applies.
4. **Academic tone creeping in.** Rewrite any paragraph that sounds like a textbook.
5. **Inconsistent character voices.** Re-read the character table and the tendencies in `character-voices.md` before writing. If you can swap two characters' dialogue and it still works, the voices aren't distinct enough.
6. **Ignoring the professionals in favor of experts.** Experts set up and intervene. Professionals are the stars. Watch expert airtime specifically: if an expert owns the longest section as a multi-block lecture, hand a beat to a professional.
7. **Making the FP stance feel preachy.** Dafna should be passionate, not self-righteous. Guy should be respected, not a punching bag.
8. **Universal eloquence.** If every exchange ends with a finished maxim, leave more room for plain answers and specific objections. Do not repair this by inserting arbitrary mistakes or stammers.
9. **Rhetoric substituting for a decision.** For an abstract topic, find the actual change under review and the people who will live with it. Extra gestures and deadlines cannot supply the missing disagreement.

---

## A Note for Reviewers

A plain line is not a defect. First ask whether the alternative has been given its strongest code, whether an objection changed anything, and whether the ruling follows from the cases. Then check the voices. Tightening every sentence into a maxim can make the whole chapter less convincing.

Compare neighboring chapters for repeated outcomes as well as repeated wording. If every disagreement ends in a balanced speech and a table, removing a few metaphors will not resolve the repetition. See `book-review.md` for the review checklist.

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

**Experts** (Prof. Ada Typeworth, Theo Compiler, Chen Wei, Ravi Lambda):
- Set the principle at the start of each chapter
- Intervene **sparingly** — only when the debate goes off track or needs reframing
- Their interventions carry weight because they're rare
- They don't argue with each other (they may politely disagree, but never debate)

**Professionals** (Helena, Marcus, Dr. Elena Voss, Sarah, Alex, Jordan, Kai, Diana, Nate):
- Drive the bulk of every debate
- Argue with each other freely — interruptions, comebacks, grudging admissions
- Each has a **consistent personality** that readers learn to predict

### Staying In Voice

Every character has a defined personality and catchphrase in `PLAN.md`. Rules:

1. **Never break character.** Helena never says "types don't matter sometimes." Marcus never says "let's slow down and think about this more." Kai never endorses a class hierarchy.
2. **Use catchphrases naturally** — not forced into every appearance, but often enough that readers associate them with the character.
3. **Characters can evolve within a debate** — they can be convinced, surprised, or grudgingly admit a point. But their core stance doesn't change.
4. **Not every character appears in every chapter.** Pick the 4-6 characters most naturally activated by the topic. Some chapters might feature only 3.
5. **Character interactions matter.** Helena and Marcus are natural antagonists. Kai and Diana are foils. Jordan annoys everyone. Nate mediates. Use these dynamics.

### Character Quick Reference

| Character | Will argue FOR | Will argue AGAINST | Activated by topics about |
|-----------|---------------|-------------------|--------------------------|
| Helena Strictland | Strict types, safety | `any`, loose typing, shortcuts | Type safety, strictness, assertions |
| Marcus Shipley | Velocity, pragmatism | Over-engineering, ceremony | Migration, config, tooling |
| Dr. Elena Voss | Data, evidence, metrics | Unsubstantiated claims | Performance, patterns, comparisons |
| Sarah Chen | Migration patterns, gradual adoption | Big-bang rewrites | Legacy code, adoption strategies |
| Alex Turing | Latest features, cutting edge | Old patterns, legacy approaches | New TS features, modern patterns |
| Jordan Doubt | Nothing (asks hard questions) | Lazy thinking, unexamined assumptions | Everything — especially "obvious" answers |
| Kai Functor | FP, pipelines, immutability | Side effects, mutation, classes | FP patterns, state management, design |
| Diana Class | OOP, SOLID, encapsulation | "Everything is a function" | Architecture, design patterns, interfaces |
| Nate Bridge | Context-appropriate solutions | Dogma from either side | FP vs OOP debates, balanced discussions |

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

[Optional. An Expert intervenes with an insight that reframes everything.]
[This should feel like a "oh, we were asking the wrong question" moment.]

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
const data = response.json() as UserProfile;

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
**Helena Strictland** immediately objects:

"That's a type safety violation waiting to happen. Look at what happens when the API changes:"
```

Or for shorter interjections:

```markdown
**Jordan Doubt** raises an eyebrow: "But have you considered what happens when that assumption is wrong?"
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

When presenting the "losing" side of a debate, still give it a fair hearing. The FP-leaning stance should feel like wisdom, not dogma. Diana and Marcus should make genuinely good points even when the verdict goes against them.

---

## Reliable Structure, Unreliable Outcomes

The book's format is a strength — but format fatigue is a real risk. The solution is not to abandon the structure. It's to make the *outcomes* unpredictable while keeping the *skeleton* reliable.

### What stays predictable
- The chapter skeleton: Principle → Debate → Turn → Verdict (or "The Debate Continues"). Readers always know where they are.
- Character roles: experts set principles and intervene; professionals drive the debate.
- Code-first arguments: every position is backed by a code example.

### What must be unpredictable
1. **The verdict.** The reader should not be able to guess who "wins" from the Principle. At least one subsection per chapter should go to the side the reader doesn't expect.
2. **Characters must move.** In every chapter, at least one character should concede a point they wouldn't normally concede, be surprised, or change their mind mid-debate. Characters who only ever defend their archetype become puppets.
3. **The Turn.** Vary how it's delivered across chapters:
   - Expert monologue that reframes (the default — use sparingly after Act I)
   - Turn with character reactions — the insight lands on the characters, not just the reader
   - Turn that comes early and changes the debate's direction for the second half
   - Turn delivered by a professional, not an expert
   - Cold open (production incident or code review) that IS the Turn
4. **Chapter length.** Not every topic needs 6 debate subsections. Some chapters should be 2,000 words, not 3,500. A shorter, sharper chapter between two long ones changes the pacing.
5. **Resolution.** At least one chapter per act should end with **"The Debate Continues"** — genuinely unresolved, with conditions under which each position wins.

### Elena Voss's data
Elena shares patterns and trends from her analyses — directional insights, not fake-precise statistics. She says "the clear majority" not "62%." She says "significantly fewer" not "38% fewer." Jordan may challenge her methodology occasionally (sample size, confounders), which makes the device self-aware. One such pushback per act is enough — doing it every chapter would undermine her.

---

## Common Mistakes to Avoid

1. **All characters agreeing too quickly.** The debate should feel real — not a setup for a predetermined conclusion.
2. **Characters making strawman arguments.** Even the "wrong" position should be presented at its strongest.
3. **Forgetting to show code.** If a character makes a claim, back it up with code. "Show, don't tell" applies.
4. **Academic tone creeping in.** Rewrite any paragraph that sounds like a textbook.
5. **Inconsistent character voices.** Re-read the character table before writing. If you can swap two characters' dialogue and it still works, the voices aren't distinct enough.
6. **Ignoring the professionals in favor of experts.** Experts set up and intervene. Professionals are the stars.
7. **Making the FP stance feel preachy.** Kai should be passionate, not self-righteous. Diana should be respected, not a punching bag.

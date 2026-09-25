# It Depends — TypeScript Principles, Debated

## Context

This is a new open-source TypeScript book written in Markdown, structured as debate-style discussions between fictional expert characters. Each chapter presents a TypeScript principle, challenges it from multiple perspectives, and arrives at a practical ruling (or an honest "it depends"). The book will be available as open-source MD files and as a paid printed edition. A chapter-level print design study is available; the full-book PDF and website pipelines remain to be built.

**This plan is a master tracking document.** We work phase by phase — only the current phase is actively being written. Everything else tracks what's coming.

---

## Current Phase: Act II — Advanced TypeScript

**Compiler baseline:** TypeScript **7.0.2**, with locked example dependencies. Run `npm ci` and `npm run check`; [coverage and upgrade procedure](checks/README.md) apply to all eleven completed chapters. Recheck the stable release and rerun the full suite before publication.

### Tasks

- [x] Ch7: `01-conditional-types.md` — revised after voice review; complete overload comparison, local normalization decision, dissent preserved
- [x] Voice revision: Ch1–7 and prologue; Ch5 ends with "The Debate Continues"
- [x] Writing guidance: disputed decisions, fair alternatives, flexible voice tendencies
- [x] Pre-commit corrections: assignability, assertions, Express augmentation, enum interoperability, serialization; expert biographies revised
- [x] Ch8: `02-mapped-types.md` — revised for voice and pacing; explicit partial-update behavior, repaired derivation and contract test, form/error mappings, and key-remapping handoff; examples checked
- [x] Ch9: `03-template-literal-types.md` — drafted and reviewed; naming alternatives, tracing tradeoffs, and compiler/runtime/search checks complete
- [x] Ch10: `04-infer-keyword.md` — drafted and jointly reviewed; infer patterns, overload extraction, runtime mismatch, and competing wrapper/adapter repairs checked
- [x] Ch10 reader-onboarding repair: helper and caller established before the upgrade failure; fresh-reader checks and joint review settled; validation updated
- [x] TypeScript 7 migration: pinned 7.0.2, CLI-based validators, all 199 TypeScript fences covered; compiler defaults, diagnostics, dependencies, and current guidance updated
- [x] Ch11: `05-advanced-generics.md` — drafted and jointly reviewed; state preservation, constrained transitions, competing function APIs, and widening counterexample checked; fresh first-read review settled
- [ ] Ch12: `06-variance.md`
- [ ] Ch13: `07-declaration-merging.md` — NOTE: Ch3 already settled core declaration merging; reframe this chapter as *module augmentation & ambient types* (`.d.ts`, `declare global`, patching third-party types) to avoid re-litigating
- [x] Act II debt: at least one "The Debate Continues" chapter — Ch11 leaves the SDK construction API open, with demonstrated conditions for each choice
- [ ] Act II: use sourced or reproducible evidence; do not schedule Gil/Chen methodology exchanges by quota

---

## File Structure

```
it-depends-ts-book/
├── README.md
├── DISCLAIMER.md
├── PLAN.md                        # This file — master tracking
├── .claude/
│   └── skills/
│       ├── book-writing-guide.md   # Skill for agents: how to write chapters
│       ├── book-review.md         # Skill for agents: how to review content
│       └── character-voices.md    # Writer-facing speech tendencies
├── book/
│   ├── 00-prologue/
│   │   ├── 01-how-to-read.md
│   │   └── 02-meet-the-cast.md
│   ├── 01-the-type-system/
│   │   ├── 01-any-vs-unknown.md
│   │   ├── 02-type-assertions.md
│   │   ├── 03-interface-vs-type.md
│   │   ├── 04-enums-vs-unions.md
│   │   ├── 05-narrowing-strategies.md
│   │   └── 06-generics-basics.md
│   ├── 02-advanced-typescript/
│   │   ├── 01-conditional-types.md
│   │   ├── 02-mapped-types.md
│   │   ├── 03-template-literal-types.md
│   │   ├── 04-infer-keyword.md
│   │   ├── 05-advanced-generics.md
│   │   ├── 06-variance.md
│   │   └── 07-declaration-merging.md
│   ├── 03-patterns-and-design/
│   │   ├── 01-error-handling.md
│   │   ├── 02-branded-types.md
│   │   ├── 03-runtime-validation.md
│   │   ├── 04-immutability.md
│   │   ├── 05-pure-functions.md
│   │   ├── 06-imperative-vs-declarative.md
│   │   ├── 07-currying-partial-application.md
│   │   ├── 08-hof-patterns.md
│   │   ├── 09-config-to-function.md
│   │   └── 10-monads-light.md
│   ├── 04-the-real-world/
│   │   ├── 01-migration-strategies.md
│   │   ├── 02-monorepo-type-sharing.md
│   │   ├── 03-testing-typed-code.md
│   │   └── 04-performance-vs-safety.md
│   └── 05-bonus-ai-and-typescript/
│       ├── 01-prompting-for-typescript.md
│       ├── 02-type-safe-agent-patterns.md
│       └── 03-reviewing-ai-code.md
```

---

## Characters

### The Experts (set principles, intervene when debates derail)

| Name                    | Archetype          | Personality                                                                                            | Catchphrase                                  |
|-------------------------|--------------------|--------------------------------------------------------------------------------------------------------|----------------------------------------------|
| **Prof. Eli Typeworth** | Language theorist  | Patient, precise; looks for the claim beneath an example. Can simplify away a requirement others need restored. | *"Let us return to first principles."*       |
| **Daniel Compiler**       | Compiler internist | Dry humor; tests compiler behavior. Small reproductions can omit project context, and acceptance doesn't settle runtime behavior. | *"The compiler disagrees."*                  |
| **Gilad Stacktrace**            | Systems architect  | Long production experience; asks who diagnoses and recovers from failure. Can import precautions from an old system that the new one doesn't need. | *"Show me the stack trace."*                 |
| **Liron Closure**         | FP / Design master | Warm Lisp/Clojure veteran; uses familiar patterns and analogies. Has to work through the code when an analogy leaves a practical question unanswered. | *"Complexity is a choice, not a necessity."* |
| **Sahar Firstclass**    | Simplicity expert  | Looks at callers and asks what could be removed. Can underestimate library requirements and the value of a team's conventions. | *"Simple made better."*                      |

### The Professionals (drive the debate)

| Name                  | Archetype              | Personality                                                                                            | Catchphrase                           |
|-----------------------|------------------------|--------------------------------------------------------------------------------------------------------|---------------------------------------|
| **Noam Kiperman** | Type safety absolutist | Personal vendetta against `any` and `as`. Gets visibly upset at unsafe code.                           | *"Over my dead type definition."*     |
| **Oded Shipley**    | Velocity advocate      | Ships fast; asks what justifies the work now. Knows the tradeoffs and challenges speculative fixes.                                  | *"We can fix it in the next sprint."* |
| **Gil Benchmark**    | Data-driven analyst    | Won't accept claims without benchmarks. Carries dashboards everywhere.                                 | *"What does the data say?"*           |
| **Eden Legacy**        | Migration veteran      | Converted millions of lines JS→TS. Has seen everything fail at scale.                                  | *"I've seen this fail at scale."*     |
| **Linoy Nightly**       | Cutting-edge advocate  | Uses features before they're stable. Half her code needs `@ts-ignore`.                               | *"There's an RFC for that."*          |
| **Chen Override**      | Socratic skeptic       | Doesn't propose solutions, just pokes holes. Infuriating but indispensable.                            | *"But have you considered..."*        |
| **Dafna Functor**       | FP hard-die            | Everything is a pipeline. Side effects are a personal offense. Would write the entire app in `pipe()`. | *"That's just a map."*                |
| **Guy Singleton**       | OOP advocate           | Believes in encapsulation, inheritance hierarchies, and design patterns. SOLID is gospel.              | *"Where's the interface?"*            |
| **Dima Bridge**       | Balanced pragmatist    | Appreciates both FP and OOP. Picks the right tool per context. The mediator.                           | *"Both have a point here."*           |
| **Idan Greenfield**   | Parse-Don't-Validate advocate | Treats input shape as a problem in itself. Believes types must be produced, not checked. Lives at the boundary. | *"Prove it by producing it."*         |

---

## Chapter Format

Each chapter follows this skeleton (with flexibility):

```
# Chapter N: [Title]

## The Principle
[Expert sets the principle — 1-2 paragraphs with code]

## The Debate
[Professionals challenge, defend, counter-argue — the bulk of the chapter]
[Code examples illustrating each position]

## The Turn (optional)
[A new case, question, or observation changes the inquiry]

## The Verdict
[Clear ruling OR honest "it depends" with conditions]
[Practical code patterns — "The Accepted Standard"]

## Additional Takes
[Short remarks, edge cases, footnotes from various characters]
```

Chapters without resolution skip "The Verdict" and end with **"The Debate Continues"**.

---

## Phase Tracking

| Phase                       | Status          | Notes                 |
|-----------------------------|-----------------|-----------------------|
| Scaffolding + Prologue      | Done            |                       |
| Act I: The Type System      | Done            | 6 chapters; voice revisions merged |
| Act II: Advanced TypeScript | **IN PROGRESS** | Ch7–11 drafted/revised and checked (5 of 7) |
| Act III: Patterns & Design  | Planned         | 10 chapters           |
| Act IV: The Real World      | Planned         | 4 chapters            |
| Bonus: AI & TypeScript      | Planned         | 3 chapters            |
| Build Pipeline (PDF/Web)    | Design study    | 7 × 10 minimal sci-fi direction approved; full-book build, final pagination, and cover pending |

Print design sources and decisions: [design/print/README.md](design/print/README.md).
The cover concept is still open; final cover dimensions depend on the complete
book's page count and paper choice.

---

## Stance & Voice

- **FP-leaning** but not dogmatic — we appreciate OOP where it fits
- **Opinionated** on: immutability, function purity, declarative over imperative
- Some debates end with a verdict, some with "it depends" — the title earns its name
- Characters have **strong personalities** — readers should predict reactions
- Code examples must be **real and runnable** — no pseudo-code
- The book should be **fun** — memorable characters, genuine disagreements, humor

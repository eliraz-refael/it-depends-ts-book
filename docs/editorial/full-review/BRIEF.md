# Whole-book review brief: "It Depends — TypeScript Principles, Debated"

You are one of several independent reviewers reading the complete book before release and print
publication. Read it **as a human reader would**: in order, start to finish, every file. Your
report decides what gets fixed before publication, so be specific and honest. Praise is welcome
only where it tells the authors what to keep.

## What the book is

- An open-source TypeScript book (Markdown, plus a paid printed edition). Each chapter is a
  debate between recurring fictional experts and professionals about one TypeScript principle.
- **The premise:** it should be fun to read while you learn. Memorable characters, real
  disagreements, humour, runnable code (no pseudo-code).
- **Chapter skeleton:**
  - **The Principle:** an expert states a testable rule up front, in plain speech.
  - **The Debate:** a story in a fictional shop or team, with real code.
  - **The Turn:** the moment the argument changes.
  - **The Verdict:** a practical ruling, or an honest open ending ("The Debate Continues") only
    where competent people genuinely still disagree.
  - Sometimes **Additional Takes**.
- **The cast bios in `00-prologue/02-meet-the-cast.md` are canon,** including each character's
  pronouns, personality, stance and catchphrase. Don't infer pronouns from names; check the bios.
- **The last act is a bonus on AI and TypeScript.** The rule there is no claims about real AI
  models or products. Assistants are unnamed and their output is shown as saved artifacts.

## What to look for (all reviewers)

**The most important thing is inconsistencies:**
- within a chapter, and across the book;
- facts, names, numbers, code identifiers and outputs that contradict each other;
- a callback to an earlier chapter that doesn't match what that chapter said;
- a character acting against their bio or their established stance;
- the wrong pronoun;
- advice in one chapter that contradicts another;
- a running example or setting that changes without explanation;
- terminology used two ways.

Then:
1. **AI feel.** Flag any line where you'd say "that's AI talk, no human talks like that". Patterns
   to watch:
   - the narrator explaining like a manual, or adding caveats nobody in the room would raise;
   - characters speaking in complete documentation sentences;
   - aphorism closers;
   - symmetrical "not X, but Y" constructions;
   - tidy triplets;
   - everyone agreeing politely;
   - over-hedged statements;
   - silent closers like "leaves X beside Y";
   - "in the review" endings;
   - lines that summarise instead of saying something.
2. **Voice keeping.** Does each character sound like themselves across the whole book, and like
   their bio? Does the book's register drift between acts? Is it still fun late in the book?
3. **The story holds up.** Motivation, stakes, plausibility, scene logic. Does anyone do something
   only because the plot needs it?
4. **Claims are easy to grasp.** Could a working TypeScript developer state the chapter's rule after
   one read? Is the Principle a rule they can apply?
5. **The debate deals with the claim.** Do the counter-positions engage the Principle's actual claim,
   or a strawman? Is the Turn a real turn? Is the Verdict earned by what happened on the page?

## Your perspective

You've been given one perspective (below the brief, in your instructions). Read everything, report
anything serious you see, but go deepest on your perspective.

## How to work

- **Read only the snapshot:** the files listed in `reading-order.txt`, under `snapshot/`, in that
  order. Don't read editorial notes, plans, checks or git history, and don't look for other copies of
  the book. You're a reader, not an auditor of the process.
- **Don't edit the book.**
- **You may verify a suspicious technical claim** with the TypeScript 7.0.2 compiler at
  `/Users/elirazk/private/ts-book-worktrees/b3/node_modules/.bin/tsc` and Node 22. Work in your own
  scratch subdirectory under `fullreview/verify/<your-id>/`. This is optional; reading is the job.
- **Keep a ledger** at the top of your report file as you go: cast pronouns and stances as shown, the
  running settings (shops, teams), recurring code names, and what each chapter's Principle claims.
  Use it to catch cross-book contradictions.
- **Write to your report file incrementally,** after each chapter, so nothing is lost if your context
  runs long. Get line numbers from the file (the Read tool shows them, or use `grep -n`).

## Report format

Your report file is `fullreview/reports/<your-id>.md`:

1. **Ledger** (brief).
2. **Findings, by chapter.** For each finding:
   - `file:line`;
   - the exact quote (short);
   - a category: inconsistency, AI-feel, voice, story, clarity, debate, technical or other;
   - a severity:
     - **blocker:** wrong, or embarrassing in print;
     - **major:** a reader would notice and be hurt by it;
     - **minor:** polish;
   - one or two sentences on why it matters, and a fix direction.
3. **Cross-book inconsistencies:** everything that spans chapters, in one list.
4. **Top 15 for release,** ranked.
5. **Per-chapter grade** (A–D) with a one-line reason, and where you enjoyed it and where you got
   bored.
6. **Overall readiness verdict:** ready / ready after fixes / not ready, and why, in a short paragraph.

When you finish, reply with a short summary: the counts by severity, your top 5, and your verdict.

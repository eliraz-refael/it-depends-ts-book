---
name: book-review
description: >
  Review skill for validating content in "It Depends: TypeScript Principles, Debated".
  Use this skill to review any chapter or section before it's considered complete.
  Checks character consistency, factual accuracy, fun factor, and alignment with the book's vision.
---

# Book Review Skill — "It Depends: TypeScript Principles, Debated"

When invoked, this skill reviews a chapter or section of the book against the project's quality standards. Before reviewing, **read `PLAN.md`** for character definitions and **`.claude/skills/book-writing-guide.md`** for writing standards.

---

## Review Process

### Step 1: Read the Content

Read the chapter file to be reviewed in full. Also read:
- `PLAN.md` — for character definitions, catchphrases, and archetypes
- `.claude/skills/book-writing-guide.md` — for writing standards and stance guidelines

### Step 2: Evaluate Each Category

Score each category as **PASS**, **NEEDS WORK**, or **FAIL**. Provide specific line-level feedback for anything that isn't PASS.

---

## Review Categories

### 1. Character Consistency

Check every character appearance against their definition in `PLAN.md`:

- Does each character stay in voice throughout?
- Are catchphrases used naturally (not forced, not absent)?
- Does any character say something that contradicts their archetype?
  - Helena defending `any`? **FAIL.**
  - Marcus advocating for slowing down to add types? **FAIL.**
  - Kai endorsing a class hierarchy? **FAIL.**
  - Diana praising a pipeline pattern? **Suspicious** (she might grudgingly acknowledge it, but she wouldn't champion it)
- Are the right characters activated for this topic? (Reference the activation table in the writing guide)
- Do character interactions feel natural? (Helena vs Marcus tension, Kai vs Diana foiling, Jordan annoying everyone)

**Red flags:**
- Two characters making the same argument
- A character being uncharacteristically passive
- Catchphrase used in a way that feels forced or out of context
- Character appearing without contributing meaningfully

### 2. Factual Accuracy (CRITICAL)

**All TypeScript claims and code must be correct.** This is the highest-priority check.

- Does every code example compile as valid TypeScript?
- Are all claims about TypeScript behavior accurate?
  - Check compiler behavior claims against actual TS behavior
  - Verify that mentioned TypeScript features exist and work as described
  - Ensure version-specific features are noted as such
- Are there any hallucinated APIs, methods, types, or compiler behaviors?
- Are performance claims or statistics presented as data (from Dr. Elena Voss) plausible and clearly marked as illustrative?
- Do "bad" examples actually demonstrate the problem they claim to show?
- Do "good" examples actually solve the problem?

**How to verify code:**
- Read the code carefully for syntax errors, type errors, and logical errors
- If uncertain about a specific TypeScript behavior, flag it explicitly in the review rather than guessing
- Pay special attention to: generic constraints, conditional types, utility type usage, and `as` behavior

### 3. Fun Factor

This is a **fun book to read**, not a reference manual. Check:

- Does the chapter open with energy, not exposition?
- Do the debates feel like real developer arguments you've overheard?
- Are there moments of humor, surprise, or "I've been in that exact argument"?
- Are there memorable lines that readers might quote in code reviews?
- Does any section feel dry, academic, or like documentation?
- Is there genuine tension in the debate, or does it feel like a setup for a predetermined conclusion?

**Red flags:**
- Opening with "In this chapter, we will explore..."
- Characters politely agreeing and building on each other's points (too harmonious)
- Long stretches of exposition without character interaction
- Code examples without character reactions to them
- The verdict feeling obvious from the start

### 4. Alignment with Vision

Check that the content aligns with the book's stated stance and voice:

- Is the FP-leaning stance maintained without being preachy?
- Does Diana (OOP advocate) get fair treatment? Her arguments should be strong even when the verdict goes against her.
- If there's a verdict, is it opinionated enough? Wishy-washy verdicts waste the reader's time.
- If there's no verdict ("The Debate Continues"), is the open-endedness justified?
- Does the chapter earn its "it depends" if it uses one?
- Is the two-tier structure respected? (Experts set up and intervene; Professionals drive debate)

### 5. Code Quality

Check all code examples:

- Are examples realistic? (Real-world scenarios, not `foo`/`bar`)
- Do they use realistic variable names and domain scenarios?
- Are both the "wrong" and "right" approaches shown?
- Is the code properly formatted with TypeScript language tags?
- Are comments minimal and only where intent isn't obvious?
- Do examples build on each other within the chapter where possible?

### 6. Readability & Flow

Check the overall reading experience:

- Is the chapter the right length? (Target: 2,000-4,000 words)
- Does the debate flow naturally or feel forced?
- Are transitions between speakers smooth?
- Is there a clear arc? (principle → challenge → escalation → turn → resolution)
- Are there abrupt topic shifts or non-sequiturs?
- Would a reader want to keep reading, or would they put it down?

---

## Output Format

Structure the review as follows:

```markdown
# Review: [Chapter Title]

## Summary
[1-2 sentences: overall quality and biggest concern if any]

## Scores

| Category | Score | Notes |
|----------|-------|-------|
| Character Consistency | PASS / NEEDS WORK / FAIL | [brief note] |
| Factual Accuracy | PASS / NEEDS WORK / FAIL | [brief note] |
| Fun Factor | PASS / NEEDS WORK / FAIL | [brief note] |
| Alignment with Vision | PASS / NEEDS WORK / FAIL | [brief note] |
| Code Quality | PASS / NEEDS WORK / FAIL | [brief note] |
| Readability & Flow | PASS / NEEDS WORK / FAIL | [brief note] |

## Detailed Feedback

### [Category with issues]

- **Line/Section:** [quote or location]
  **Issue:** [what's wrong]
  **Suggestion:** [how to fix]

[Repeat for each issue]

## Verdict

[APPROVED / NEEDS REVISION / MAJOR REWRITE]
[If needs revision: list the 1-3 most critical fixes needed]
```

---

## Severity Guidelines

- **FAIL on any category** = chapter needs revision before it can be included
- **Factual Accuracy FAIL** = highest priority, must be fixed immediately
- **Character Consistency FAIL** = damages the book's core mechanic, fix before publishing
- **Fun Factor FAIL** = rewrite the dry sections, the book's appeal depends on this
- **Multiple NEEDS WORK** = acceptable for a draft, but should be improved before final
- **All PASS** = chapter is ready for inclusion

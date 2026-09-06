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

Check the characters against their motives in `PLAN.md`, their biographies, and the tendencies in `character-voices.md`.

- What decision is disputed, and what does each participant stand to lose?
- Does each side offer the strongest reasonable implementation for the same problem?
- Does an objection change the scope of a claim, expose an assumption, or leave a consequential disagreement?
- If a character changes position, does the exchange explain why? If they hold their ground, does their reasoning remain visible?
- Can a professional challenge an expert, including by bringing back an earlier example?
- Does the speaker notice things this person would care about, or merely read the next prepared explanation?
- Are catchphrases and physical details doing useful work rather than satisfying a quota?

**Red flags:**
- An obvious repair omitted from the losing implementation
- A narrator declaring a winner, explaining that someone is "in character," or announcing a concession
- Everyone ending their turn with a maxim, or sharing the same antithetical rhythm
- Concessions that summarize the other side's whole position
- Arbitrary confusion, stammers, mistakes, or gestures inserted to simulate spontaneity
- A deadline that never affects the scene
- Chapter numbers spoken in dialogue

Do not require an antagonist pair, a mistake, a concession, or a fixed number of polished lines. Judge whether the exchange earns its conclusion.

### 2. Factual Accuracy (CRITICAL)

**All TypeScript claims and code must be correct.** This is the highest-priority check.

- Does every code example compile as valid TypeScript?
- Are all claims about TypeScript behavior accurate?
  - Check compiler behavior claims against actual TS behavior
  - Verify that mentioned TypeScript features exist and work as described
  - Ensure version-specific features are noted as such
- Are there any hallucinated APIs, methods, types, or compiler behaviors?
- Are empirical claims sourced, reproducibly demonstrated, or explicitly hypothetical? Hedged or plausible-sounding invented studies are still a finding.
- Do "bad" examples actually demonstrate the problem they claim to show?
- Do "good" examples actually solve the same problem? Check output shapes, failure details, and requirements on both sides.
- Does an attributed real-world precedent have a source that supports the actual claim?

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
- Does Guy (OOP advocate) get fair treatment? His arguments should be strong even when the verdict goes against him.
- If there is a verdict, does it identify a useful decision and its conditions without claiming more than the examples establish?
- If there's no verdict ("The Debate Continues"), is the open-endedness justified?
- Does the chapter earn its "it depends" if it uses one?
- Do professionals drive the debate? Experts may disagree with one another and need not have the final word.

### 5. Code Quality

Check all code examples:

- Are examples realistic? (Real-world scenarios, not `foo`/`bar`)
- Do they use realistic variable names and domain scenarios?
- Are the alternatives shown fairly? A deliberately broken example is useful for a mechanism, but cannot stand in for the strongest competing design.
- Is the code properly formatted with TypeScript language tags?
- Are comments minimal and only where intent isn't obvious?
- Do examples build on each other within the chapter where possible?

### 6. Readability & Flow

Check the overall reading experience:

- Is the chapter the right length? (Target: 2,000-4,000 words)
- Does the debate flow naturally or feel forced?
- Are transitions between speakers smooth?
- Can the reader follow how the cases change the initial claim? Does the ending preserve any material disagreement?
- Does the chapter repeat a lesson through a Turn, maxim, verdict, and multiple closing remarks?
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

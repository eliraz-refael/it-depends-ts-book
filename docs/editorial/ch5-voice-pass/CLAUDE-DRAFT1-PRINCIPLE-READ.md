# Ch5 draft 1 Principle-only reader (Claude)

2026-10-21. A fresh subagent was given only the text before `## The Debate` of draft 1 (`70ae6073…`), plus Ch1–4 prerequisites.

**1. Principle sentence(s).** The rule is there, but you have to dig for it. It's line 21, spoken by Daniel:
> "For external input, prefer building a typed value from the fields you've checked. The compiler can check what you return. A predicate or assertion annotation asks it to trust that you did the checks."

It's general and you could test code against it. But it arrives as a bare line of dialogue between two narrowing demos, with no signal that it's the chapter's rule. Line 36 ("Neither spelling tells the compiler what you meant") is the second-closest thing, and it's a remark, not a rule.

**2. In my words.** When data comes from outside (JSON, requests, storage), check it field by field and build a new object of the target type from the narrowed values. Don't write `isUser(x): x is User` or `asserts x is User` and hand back the original value. The compiler checks the object you build. With a guard you're just making a promise it can't check.

**3. Return vs throw.** It doesn't take a side. Nothing mentions what happens when a check fails: no error, no `throw`, no result or `null` return. "Building a typed value" says nothing about the failure path. "Assertion annotation" hints at throwing, but the opening only uses it as an example of the trust problem.

**4. Friction.**
- **Terms used too early.** Line 21 uses "predicate or assertion annotation" before either is introduced. Predicates are explained at line 40. "Assertion annotation" (`asserts x is T`) is never explained or shown.
- **Abrupt jump.** Line 21 doesn't follow from what comes before. The topic jumps from `typeof` narrowing on a parameter to "external input", and neither example involves external input. The extra "**Daniel**:" tag, when he was already speaking, makes it read like a pasted-in line.
- **Read twice:** "Neither spelling tells the compiler what you meant." Each spelling tells the compiler exactly one precise thing. The real problem is that the reader picked the wrong one. As written, it sounds like a limitation of the compiler.
- **Slightly overstated:** "The compiler can check what you return." It checks the shape you return, not whether your checks were right. `String(raw.name)` or a cast still gets through. This needs the same caveat line 40 gives predicates.
- Noam's "test it with inputs it should reject" is a good line that goes nowhere yet.
- Minor: `process` shadows the Node global.

**5. What I expect next.** A debate on parsing into a constructed value versus trusting `is`/`asserts` guards. Chen will likely defend guards as convenient or cheaper. Then probably how to test guards, whether to use a schema library, and how failure gets reported: an assertion function that throws versus returning a result or `undefined`. Question 3 is still open, so I'd expect the argument to land there.

# Claude's formal review: Chapter 17 draft 1 (`aaa4e5b7…`)

2026-10-21. I reviewed `2d1cf88` against the settled plan and two fresh readers, each isolated with only
the earlier chapters' prerequisites stated:
- [Principle-only](CLAUDE-PRINCIPLE-READ.md);
- [full](CLAUDE-FULL-READ.md).

`node checks/chapter17.cjs` passes on my machine (15 fences / 19 compiler cases / 19 runtime groups).
The full reader hand-checked every printed output and found them all correct. The type-level claims
below were checked on 7.0.2 with the book profile.

**Verdict: revise, then a targeted recheck.**

**What draft 1 got right:**
- **The Principle passes its test, including the hard case.** Using the rule alone, the Principle-only
  reader rejected a receipt holding a live readonly view even with one owner writing, accepted the
  summary panel, and accepted the local builder.
- **The opening is good.** "Was 80. Now 80." / "The receipt forgot."
- **Guy's own frozen-getter view is the Turn,** as the settlement suggested.
- **Both sides share one checked constructor.**

**What's left** is one substantive gap, which the full reader ranks first. The chapter's central
problem is that "the type doesn't distinguish them" (l.197), and nobody gives a type-level answer. Guy
also loses on structure rather than argument. The rest is clarity and voice, and there is room for it:
the chapter is 2,158 words against a 2,500–3,300 target.

## Findings, ranked

### 1. Give the Turn's problem a type-level answer, and let it be the real Guy/Dafna exchange (must fix)

Eden says at l.197 that the type doesn't distinguish a live view from a snapshot. The draft answers
by adding `snapshot(): Quote`. That has the *same* type as `view()`. By l.303, the compiler gap is
handed to tests. Two competent answers are available, and each belongs to one of them. I verified both
on 7.0.2.

- **Dafna:** a live read shouldn't look like a value. A frozen object whose getters change under you
  isn't one. Give the summary `() => Quote`. `receipt(live, q)` fails with TS2345.
- **Guy:** "Where's the interface?" Name it. `interface PriceView { current(): Quote }`, which is the
  owner's published capability. `receipt(view, q)` fails with TS2739 (missing `subtotal`, `discount`,
  `total`).

Either way, the receipt's `Quote` parameter now *rejects* the live read. The mistake moves from a test to
the compiler. Eden's l.303 ("The compiler can't find that mistake from `Quote` alone") becomes the
motivation, not the ending.

This gives Guy his strongest move in his own vocabulary. It gives Dafna her purist objection to the
getter object. It also gives the chapter a natural, small, in-character dissent: a named interface vs a
function type, which is where "the class isn't the ruling" can honestly land. The fences around
`view()` and the Turn will change; update the checks.

### 2. Replace the narrator's ruling with the people (must fix)

l.311 reads like a design-decision record: "The accepted boundary uses… Choosing a class over the closure
is not part of this ruling."
- **Keep the blockquote.**
- **Replace the prose paragraph** with one exchange in which Guy and Dafna each keep their own choice
  (finding 1 supplies it).
- **Eden's closing line can stay** if it still follows.

### 3. Guy needs one refusal to concede, and his vocabulary (should fix)

The reader's count: Guy only ever concedes ("Agreed.", "Nor do I.", "I can work with that."). He causes
the bug, fixes it by adopting Dafna's value, and his class is then declared optional. Finding 1 fixes
most of this. In addition:
- give him one point he holds against Dafna. For example, the owner is the single place that publishes
  the change, so the receipt and summary can't disagree about which discount is current;
- give him OOP terms where they are natural: interface, capability, encapsulation.

Don't make it a speech.

### 4. Forward references and opaque lines (must fix)

- **l.98:** "Both proposed APIs will use it." Only Dafna's exists yet.
- **l.152:** Guy's "my constructor", before `CartPricing` appears.
- **l.154:** Eden names `snapshot()` before it is defined. It also gives away the Turn's fix.
- **l.261:** "the other handler", before Guy's handler.
- **l.74:** "beside it", beside what?
- **l.90:** "there is no assertion to remove" is opaque. Either say it (the promotion call compiles
  with no `as`, so there's nothing to search for), or cut it.
- **l.189:** Eden's constructor line answers nothing Guy said. Set it up, or let Guy say it.
- **l.259:** "callers could keep the current value themselves", then shows a factory that owns it.
  Align the claim with the code.

### 5. Put the migration cost in the debate (should fix)

- **The promotion package's other in-place callers.** "Its existing callers expect it to update that
  price in place" (l.46) is set up and never dealt with. Eden should say what happens to them when
  checkout stops passing a writable price. Either the package keeps its mutating API for them, or it
  gains a value-returning one. That is a real cost of the value approach, and it belongs to Eden.
- **The strict-mode caveat.** Dafna's "fail where it happens" (l.118) is true only in strict code.
  Eden's Take admits this, but the caveat belongs at l.129, where he is already raising migration.
  Move it there and shorten the Take, or cut the Take if nothing remains.

### 6. The preview demo shows nothing failing (should fix)

l.250–254 shows an untouched object staying at 100. Dafna describes the alternative ("apply a
discount, read the price, and undo it"), but it is never shown.

Either:
- show the owner-only preview in one short block (apply, read, `applyDiscount(0)` to undo), which
  briefly makes the checkout show a discounted price; or
- shorten the prose so it doesn't promise a contrast.

Codex decides.

### 7. Voice (fix)

- **Reply tics:** "Yes." (l.131), "Agreed." (l.146), "Good." (l.154) and "Exactly." (l.187).
  Rewrite the openers, or let the line start with its content.
- **Slogan:** "Once you publish it, keep that promise." Cut it, or make it plain.
- **Repetition:**
  - l.305 describes the test the l.227–234 block already ran;
  - re-deriving the total on entry comes up three times.

  Keep one of each.
- **Cover-the-names test:** 1 of 6 passed (Eden). Findings 1 and 3 help Guy and Dafna. Don't add
  biography.
- **Liron** appears only in the Principle. That's allowed for an expert. One short return at the
  Turn is optional: the getter view is a fitting place for him to say what a value is. Don't recycle
  his bio's river.

### 8. Principle wording (fix, small)

The Principle-only reader asked who preserves the old value, the writer or the holder. It also
stumbled on "people holding it" vs "callers" vs "holders". Use one noun. Say that a holder who needs
the old value must *receive* a value that won't change. Who makes it is an implementation choice.

## Not adopted from the readers

- **The Principle's third paragraph isn't paid off in the debate.** Gil's Take pays it off, and the
  settlement deliberately kept it out of the main argument.
- **The Verdict's "value-returning function" isn't in the Principle.** It is the local ruling for this
  service; the Principle shouldn't pre-decide it.
- **"Liron Closure" read as a coined term:** an artifact of the Principle-only extract.

## Next

Codex revises. The fences change for finding 1 and possibly finding 6; update `checks/chapter17.cjs` and
its README entry. It runs `npm ci --offline` plus the full `npm run check`, commits locally (including
these records) and hands off. I'll run a targeted fresh recheck and do the formal second review.

The chapter will need a rebase onto main once PR #18 merges; both branches edit PLAN.md. I'll handle
that before the PR.

# Ch17 Principle — fresh-reader report

## 1. The rule, quoted

> "Preserve the old value for anyone who needs it. For current state, keep changes behind an owner and keep writable references inside that boundary."

Supporting sentences that sharpen it:

> "Having just one writer doesn't make a live view into a snapshot. That writer can still change what everyone sees."

> "You can build something by mutation while nobody else can observe it. The question comes when you hand it over: what have you promised its next holder?"

The testable part is the first quote. The opening paragraph ("ask what the people holding it expect to keep") gives the question you ask before applying it.

## 2. In my own words

Before you mutate an object, find out who else holds a reference to it and what each one is counting on. A holder that wants the current value is fine with in-place changes, as long as one owner does all the writing and no writable reference leaks out of that owner. A holder that needs the value as it was when they got it needs its own copy, or the writer has to produce a new object instead of changing the old one. "Only one writer" and `readonly` don't protect that holder, because a read-only view still shows every change. Mutating something nobody else can see yet, like a local you're still building, is fine. The rule only applies once you hand it to someone.

## 3. Applying it

**(a) Receipt keeps the cart's read-only view to show "was X, now Y": not OK.**
The receipt needs yesterday's value. It holds a live view, so when `applyDiscount()` mutates the cart, "was X" turns into Y as well. Having only one writer doesn't help: "Having just one writer doesn't make a live view into a snapshot." The fix is to preserve the old value, either by having the receipt copy the price when it saves it, or by having `applyDiscount()` produce a new object. The section doesn't say whose job that is (see section 4).

**(b) Summary panel shows the current price through the same view: OK.**
It wants today's value. Changes go through one owner (the class), and the only writable reference stays inside the class. That is the "current state" half of the rule, and a live read-only view is exactly right here.

**(c) Function fills a fresh local `{}` in a loop, then returns it: OK.**
Nobody else can see the object while it's being built, so the mutation is fine: "You can build something by mutation while nobody else can observe it." The open question is what happens at the return. Does the caller get it to own and mutate, or is it a snapshot nobody should touch? I'd guess the return type (for example `Readonly<...>`) should say which, but the section doesn't tell me.

**(d) Function receives `price` from a caller and sets `price.total = ...`: the questions it makes me ask:**
- Who else holds this `price` object? The caller, plus anything the caller already passed it to?
- Do any of them need the old `total` (a receipt, a log, an undo, a comparison)? If so, I'm breaking that promise.
- Is this function the owner of the price? If not, a writable reference has left the owner's boundary, and that leak is the problem whether or not this particular write is harmless.
- Could I return a new price object instead and let the owner decide?
- If I really am the owner and every holder wants current state, then the write is acceptable.

## 4. Sentences that confused me

- **"Liron Closure":** I'm not sure if this is a character's name or a coined term. "Closure" reads like a pun on JS closures, which pulls me toward a meaning (captured variables) that has nothing to do with the rule. If it's a cast member, the surname is distracting.
- **"Preserve the old value for anyone who needs it."** Whose job is the preserving: the writer's (don't mutate, make a new object) or the holder's (copy on receipt)? This decides case (a), and the sentence leaves it open. The passive phrasing reads as if it's the writer's job, but the writer often doesn't know who needs the old value.
- **"Those are different promises, even if both callers only read."** The paragraph starts with "people holding it" and then switches to "callers." In case (a) the receipt isn't really a caller of anything. Using one word throughout ("holders," which the last paragraph uses) would be clearer.
- **"keep changes behind an owner and keep writable references inside that boundary":** "Owner" and "boundary" aren't defined. Is the boundary a class, a module, a function? The section also doesn't connect this to anything in TypeScript. Given earlier chapters, I assume the idea is to expose `Readonly<T>` outside and keep the mutable `T` inside, but that's my guess, not the text.
- **"what have you promised its next holder?"** The section asks the question but doesn't say how a promise gets expressed, whether through the type, a copy, or a convention. That may be intentional and left for the debate, but it means case (c) only half-resolves.

## 5. Filler / narrator voice

Very little. The section is short and every sentence does work. The closest to filler:
- "The question comes when you hand it over" is a bit of a windup before the actual question. "When you hand it over, ask: what have you promised its next holder?" would say the same thing faster.
- Ending on a rhetorical question gives the section a slightly aphoristic, closing-line feel instead of a final rule. It works, but the rule itself sits in the middle paragraph, not at the end where I'd look for it.

## 6. What I expect the debate to be about

- A real bug where something like a receipt or "was/now" display broke because a price object was mutated in place, and someone defending it with "but only one place writes it" or "it's `readonly` everywhere else."
- Mutate vs. return a new object: the cost of copying, and who is responsible for snapshots (writer or holder).
- How TypeScript can or can't express "snapshot" vs. "live view." `readonly` and `Readonly<T>` look the same for both, so maybe someone pushes for deep-readonly types, `Object.freeze`, branded types, or a separate snapshot type.
- What counts as an "owner," and how to stop writable references escaping (private fields, returning `Readonly<T>`, not exposing the mutable object).
- Someone defending local mutation for builders and loops against an "never mutate" purist, with the resolution being the "nobody can observe it" line.
- Given the title "The Price You Were Given," probably a function that mutated a price object it was handed, matching case (d).

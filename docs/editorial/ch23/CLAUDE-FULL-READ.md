# Reader report: Chapter 23, full chapter (draft 1, first-time read)

Draft 1 (`63db6fdf…`, `cf62962`), 2026-10-27. A fresh, isolated reader had the full chapter, with
Chapters 1–22 stated as prerequisites (Ch14's `Result` named) and the cast's pronouns given. It was
asked to verify every claim, follow the story, weigh the repairs, restate the Principle, and report
what it learned, where it enjoyed the chapter and where it got bored. It could run only the book's
TS 7.0.2 binary and Node 22, and installed nothing. The report is copied verbatim.

---

## 1. Claim verification

I found no mismatches. I compiled everything with tsc 7.0.2 and the flags you gave, then ran it with node 22.

**Outputs.** Every printed output matches the text exactly:
- `preview("2")` and `preview("7")`
- the nested map, `{"ok":true,"value":{"ok":false,...}}`
- both array lines
- Sahar's `andThen`
- all three `checkRepair` lines: `{"result":{...}}`, the refusal, and `{"started":2,"closed":2,"failed":0}`

**Counts before the rename.** Running `goodJob` and `refusedJob` and checking after 100ms gives `{"started":2,"closed":1,"failed":0}`. That matches "Two previews started. One closed." `goodJob` fulfils with `{"quantity":2,"offer":"offer-2"}` and no wrapper. `refusedJob` never settles.

**Diagnostics.**
- `onlyBadQty` gives TS2322. The chain includes "Type 'NoStock' is not assignable to type 'BadQty'", so Linoy's paraphrase is fair.
- `inspect` gives TS2339, "Property 'result' does not exist on type 'Preview'.", word for word.
- `loadPreview` compiles with no TS1058 or other complaint. TypeScript quietly treats `Res` as a promise-like of `Preview`.
- Guy's claim holds: removing the first check in `plainPreview` makes `qty.value` fail with TS2339.

**Repairs checked.**
- The rejecting thenable gives `{"started":2,"closed":2,"failed":1}`, which matches Guy's "two closed jobs and one failure".
- Dafna's "ignore its answer and return success, that would compile too" is true. It compiles and prints `ok:true` for 7.

**Additional Take.** `pendingInside` has type `Res<Promise<Result<Offer, NoStock>>, BadQty>`. After the rename, awaiting it gives a `Res` with a `Promise` in its value, as stated. The "after our rename" qualifier is load-bearing. Before the rename, `await pendingInside` returns `{"ok":true,"value":{"id":"offer-2"}}`, because the promise calls `then`, resolves with the inner promise and adopts it. That is a nice extra beat you could use.

**JavaScript claims.** Thenable adoption calls `then(resolve, reject)` and stays pending if neither is called. Optional chaining only handles null and undefined. `flatMap` flattens arrays only. All correct. Two small precision points:
- Adoption happens in a microtask (NewPromiseResolveThenableJob), not synchronously at "resolves".
- The spec link goes to CreateResolvingFunctions. That is acceptable, since the resolve steps sit inside it in current editions.

## 2. Following the story

**Who wants what.** The opening five lines are clear and good. Guy wants the worker to finish; Linoy thinks the preview already did. Then lines 21–23 dump six facts in a row: offer or refusal with no reservation, six synchronous screen callers, the catalogue batch, the job API, the async entry point, the worker's counters. I had to hold all of it before I knew which parts mattered.

**Misreadings.**
- "For two items. Seven items never finishes." Right after "Two previews started", I first read "two items" as two jobs, not quantity 2.
- "In either case it must leave the in-flight count" uses a term that doesn't exist. The counters are started, closed and failed.

**Outer success in `Res<Result<Offer, NoStock>, BadQty>`.** It means the quantity parsed; the value inside is the stock answer. I got it on first read, but only because I already know the pattern. "To parsing seven." is a fragment doing all the work. A reader newer to this needs one more clause, something like "The outer yes is the parser's. The inner no is stock's."

**Why the async entry point exists.** "Its job API requires an async entry point" works as a premise. It is thin, though: `loadPreview` awaits nothing, and a reader may wonder why it returns the class at all.

**Guessing the Turn.** I knew the bug at line 75, the moment `Res` grew a method named `then`. The title, "Still Waiting for No", and the opening ("the one that said no stock" is still running) had already primed me. The Principle had told me the exact mechanism. Sahar's "Why did you choose a name that already accepts both?" and Linoy's cut-off "I could make `Res.then` accept both too—" read as winks. I never got a moment of not understanding, and the suspense is gone.

**When I understood.** Effectively before the Debate started. Linoy's "Wait. The promise is calling *my* `then`?" works as her realisation, but it can't surprise the reader.

## 3. The argument

**Real thenable that rejects.** Fair and strong. Guy's rebuttal ("No stock is a completed preview, not a broken job") is concrete, set up earlier by his invalid-quantity line, and checkable against the counters. This is the best-argued repair.

**Resolve with the whole Result.** Too compressed. The strongest form is real: `await loadPreview()` would give the union, which is arguably what an async caller wants. Dafna's "Which contract would the method named `then` have?" is the right objection: the callback gets a `Result` on the promise path and `T` on the screen path, and one signature can't type both. But Linoy concedes in one line. Spelling out the signature clash would make this land.

**Drop the class for plain functions.** Sahar raises it and then defeats himself: "Here, I can't show that it does." His best point, that plain unions can't accidentally become promise methods, is stated once and dropped. A stronger form nobody makes: the class instance crosses a job API that "passes return values back". The output shows it serialises as `{"result":...}`. If anything downstream ever JSONs or clones it, the class is a liability, and a plain union avoids that. As written, the class side wins too easily.

**Rename to `andThen`.** Not argued so much as assumed. The Principle already names it `andThen`, and Sahar's helper is called `andThen`. The destination is announced in paragraph 1.

**Keep an alias.** Fair, and correctly brief: a callable `then` is a callable `then`, deprecated or not.

**Is the Verdict earned?** By elimination, yes. The scenes do show each other option failing. It still feels decided in advance, because the Principle names the winner and the Debate never seriously threatens it.

**Repairs nobody raised:**
- **Unwrap at the boundary.** Have `loadPreview` return `preview(text).result`. That is one line, the six screens don't change, and the worker gets a plain union. It is the obvious minimal fix and the first thing I'd expect Guy to propose. The rebuttal (the next async path that returns a `Res` hangs again, so the landmine stays armed) is good, but someone has to say it. This is the biggest gap.
- **A lint rule** such as unicorn's `no-thenable`, which forbids defining `then` on objects and classes. That is how a team prevents a repeat.
- **Promise paths besides async functions.** `Promise.resolve(res)` also adopts. One line saying so would show the bug isn't about `async` functions.

## 4. The Principle

**My restatement.** When the next step returns a plain value, use `map`; when it returns another Result, use `andThen`, so a refusal skips the step without a Result nesting inside a Result. Don't give a non-promise object a callable `then`: promises will adopt it, and a `then` that only handles success leaves refusals pending forever.

**What the chapter added:**
- That the failure is a silent hang, not an error.
- That TypeScript models it: `Awaited` follows your `then` to `Preview`, with no diagnostic on `loadPreview`.
- That rejecting is a semantic choice with a cost (it counts as a worker failure), not just "finish both branches".
- What "Compare the actual callers before replacing them" means in practice, via Guy's early-return job.

**Does it give away the Turn?** Yes, completely. The second paragraph's "For an object with a callable then, adoption calls that method with resolve and reject callbacks. If neither is ever called, the promise stays pending. A success-only method that skips its callback on refusal cannot stand in for that protocol" is the Turn, step for step. I understand the stated-rule requirement. You could state the rule ("a method named `then` belongs to the promise protocol, whatever you meant by it") without spelling out pending-forever and success-only.

**The second paragraph reads like a checklist.** Some items are never exercised:
- "don't expect array `flatMap` to wait for promises: an array of promises needs `Promise.all`" never appears in the chapter. The Additional Take is about `Res.map` with an async step, not array `flatMap`.
- The optional-chaining sentence exists in the chapter only to be ticked off.
- "That can remove repeated checks" opens with an unclear "That".

## 5. Learning

**New to me.** TypeScript silently accepts a class with a custom `then` as a valid async return type and computes `Awaited` through its callback's first parameter. `Awaited<Res<Preview, …>>` is `Preview`, with no warning. I also found the pre-rename `pendingInside` behaviour while verifying; that came from my checking, not from the chapter.

**Monad.** At the intended level, yes. It is the shared "use the next step's container instead of wrapping it again" operation: `flatMap` for arrays, `andThen` for Result, adoption in `then` for promises. But the word appears once, hedged ("the chaining pattern people mean when they bring up monads here"), and nobody in the room brought up monads. It's odd that Dafna Functor, the obvious person to own this, sidesteps it. If the chapter's job includes telling the reader what "monad" means, it needs one more confident beat, perhaps noting that `ok`, `[x]` and `Promise.resolve` are the other half.

**Explained too much:**
- The setup narration (lines 21–23).
- The TS2322 `onlyBadQty` detour, which doesn't feed the bug.
- The optional-chaining exchange.
- "She changes `then` to `andThen` in `Res` and in the six callers… The method body stays the same…" reads like a commit message.

**Explained too little:**
- Why the `Res` instance flows through the worker unexamined, and why `Promise<unknown>` hides it.
- How `Awaited` found `Preview`: one sentence on "TypeScript reads your `then`'s callback parameter as the promised value" would turn Eli's reveal into a lesson.

## 6. Enjoyment and pacing

**Fun:**
- The cold open. "Then it's finished." / "I'd like you to tell the worker." is great.
- Guy's "You added a caller that reads `.result`. Put my worker back." It is in character and pushes back on Eli in a good way.
- The run from "Wait. The promise is calling *my* `then`?" through "And I taught it to say nothing on no."

**Attention.** It dropped at "Exactly. It matters which thing you're chaining. With arrays you can see the extra level without opening a union." It came back at "Can we get back to the customer who isn't buying seven things?" That line is the author admitting the detour, and the reader agrees with Guy. Attention dipped again during Sahar's four-sentence "Six isn't a reason to keep a defect…" and returned at "The promise would still find it."

**Scene I'd retell.** The one where a class method named `then` gets called by the promise machinery with `(resolve, reject)`, and it hangs only on "no stock".

**Best lines:**
- "So the stock check has answered. The worker is waiting for an answer about whether it answered."
- "And I taught it to say nothing on no."
- "It bought six callers that knew how to read the expression. It also bought JavaScript a way to call it."
- "Our preview has one offer or a refusal. That has four values." It is grounded and in Guy's voice.

**Weakest lines:**
- Dafna: "It returns here. I want to check which return you're expecting." I don't know what "it" or "here" refer to.
- Sahar: "And `user?.address?.city` already stops when the next address isn't there. I don't need an Option class just to read that property." Nobody proposed an Option class; this answers the Principle, not the room.
- Dafna: "Right. That syntax checks null or undefined. It doesn't unwrap a class, and an empty city string stays an empty string." This is documentation.

## 7. Prose

**Lines I had to reread:**
- "Then I removed the part that let it through. Your worker accepts the return type it actually gets." What was removed, and what does "accepts the return type it actually gets" mean? I think it means `Promise<unknown>` swallows anything, but I had to work it out.
- Eli's "The compiler would have caught this." This overstates. It only catches a caller that reads `.result`; it caught nothing about the hang, and Guy's next line exposes that. If the overstatement is deliberate, let someone name it.
- "Including the places that carry the quantity into the final `map`, like this one. I have to rewrite those expressions. A rename changes the method and the references." Three clipped sentences; the contrast with Sahar's proposal isn't stated.
- Dafna's "The helper saves writing that branch. It doesn't force you to use every result…" rebuts a safety claim Linoy never made; she only said "You're repeating the refusal branch". Early returns don't force you to use every result either, so the logic is muddled.
- Additional Take: "as in Guy's caller". Which one? `plainPreview` is synchronous and isn't a caller of `availabilityAsync`.
- "For two items." reads as two jobs (see section 2).

**Lines that sound authorial or like documentation:**
- "The quantity belongs in the preview too."
- "That's part of what I wanted the class to preserve."
- "These are fresh jobs and fresh counters after the rename."
- Most of Sahar's "Six isn't a reason…" speech.

**Lines a real engineer wouldn't say:**
- "Show the preview before the worker." It works, but it is stagey.
- "Leave that for a moment. Your two calls here already produce the same shape. Your Result calls didn't." It is written to hold off the Turn, and it shows.

## Scratch files

All in /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read1/f/:
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read1/f/common.ts (shared types and checks; also common.mts)
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read1/f/before.ts (pre-rename program: outputs, counts, pre-rename `pendingInside`)
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read1/f/errors.ts (TS2322, TS2339 ×2, the removed-first-check error)
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read1/f/after.mts (post-rename `checkRepair`, Sahar's `andThen`, `plainPreview`, the ignored-answer callback, post-rename `pendingInside`; also after.ts)
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read1/f/repairs.mts (rejecting-thenable repair counts; also repairs.ts)
- /private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/ch23read1/f/out/ (emitted JS)
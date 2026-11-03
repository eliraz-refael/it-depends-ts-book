# Fact-check of disputed review claims

2026-11-03. A fresh, isolated Opus agent settled 21 disputed claims from the whole-book reviewers with TypeScript 7.0.2, Node 22.23.4 and the book's own check profile. Verdicts: 6 confirmed, 6 partly, 9 refuted. The report below is verbatim.

## Fact-check report

**Setup.**
- Book snapshot: `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/fullreview/snapshot/book/`.
- Checks repo: `/Users/elirazk/private/ts-book-worktrees/full-review`. Its checkout is branch `codex/full-book-review` at 69eadac, not main at 87664ca. `git diff 87664ca HEAD -- book checks` is empty, and `diff -r` shows the snapshot is identical to the repo's `book/`.
- Installed versions in full-review/node_modules: typescript 7.0.2, zod, and @types/node 26.5.1.
- Book profile (from `checks/compiler.cjs`): strict, exactOptionalPropertyTypes, ES2022, Node16/Node16, `types: []`, skipLibCheck true, noEmitOnError, run with `--pretty false --noErrorTruncation`.
- All reproductions are under `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/fullreview/verify/factcheck/` (folders i1…i16). `TMPDIR` for the Ch25 check run was `.../factcheck/tmp/`.
- I edited nothing in the repo.

**1. Ch7 TS2769 block (01-conditional-types.md:126-132): CONFIRMED.**
- What the check asserts: `chapters7-8.cjs` line 66 calls `example("ch7-union-caller-rejected", …, [2769])` and compares codes only (`found.map(d => d.code)`). The quoted text is never checked.
- Reproduction (i1/a.ts): the chapter's FrontMatter, two overloads, and `slugify(post.tags)`. The output is the same with `--pretty false`, with `--noErrorTruncation`, and with the default piped output:
  ```
  a.ts(15,23): error TS2769: No overload matches this call.
    The last overload gave the following error.
      Argument of type 'string | string[]' is not assignable to parameter of type 'string[]'.
        Type 'string' is not assignable to type 'string[]'.
  ```
- `--pretty true` adds related info: "The last overload is declared here" and "The call would have succeeded against this implementation, but implementation signatures of overloads are not externally visible." It also never prints "Overload 1 of 2 / Overload 2 of 2".
- Fix: quote the 7.0.2 text. Optionally use the "implementation signatures … not externally visible" line, which supports Daniel's explanation.

**2. Ch7 ~450, misspelled `case`: PARTLY.**
- Reproduction (i2): `Channel` switch with `case "smss"` and Ch4's `const _exhaustive: never = c` default gives:
  - `TS2678: Type '"smss"' is not comparable to type 'Channel'` at the case;
  - `TS2322: Type '"sms"' is not assignable to type 'never'` at the exhaustiveness line.
- Without the exhaustiveness check, TS2678 still fires.
- So the exhaustiveness check does complain, but the typo itself is caught by the comparability check, which needs no exhaustiveness check at all.
- Fix: "the compiler rejects the misspelled case (TS2678), and the exhaustiveness check flags the member you missed."

**3. Ch7 538-584, `slugify` / `slugifyAll`: REFUTED.**
- The Turn's first fence (538-541) is the PR's existing code using the overloaded `slugify`.
- Oded: "Which is what the two functions did."
- Linoy at 555 ("The tags still need a check before they can call `slugifyAll`") is about the two-function alternative, introduced at line 43 and in Oded's "Or two functions. Which I have."
- The normalize fence then calls `slugifyOne`/`slugifyAll`, and the Verdict's "the two functions" has the same referent.
- The check compiles fence 28 against the overloads and fence 29 against the separate functions, and runs them (`chapters7-8.cjs` lines 117 and 212-219).
- At most a readability nit: `slugifyAll` was last named about 500 lines earlier.

**4. Ch25 TS2741 (02-monorepo-type-sharing.md:115-117): REFUTED.**
- What the check asserts: `chapter25.cjs` line 154 checks `[2741]` at the `oldLog` line, plus message fragments `Property '#cents' is missing in type 'import("`, `/money/dist/index").Money' but required in type 'import("`, and `/money/src/index").Money'.`
- I ran `node checks/chapter25.cjs`: PASS. The recorded output was:
  ```
  apps/api/src/main.ts(7,34): error TS2741: Property '#cents' is missing in type 'import(".../story/packages/money/dist/index").Money' but required in type 'import(".../story/packages/money/src/index").Money'.
  ```
- Why the reviewer saw TS2345: their reproduction (`verify/haiku-technical/ch25`) compares two `.ts` source classes. That gives `TS2345 … Property '#cents' in type 'Money' refers to a different member…` (I reproduced this in i4).
- In the chapter, one side is cart's emitted `dist/index.d.ts`, where the private field becomes `#private;`. Comparing source against that emitted declaration gives exactly the book's TS2741 (also reproduced in i4).

**5. Ch13 ~330, conflict location and skipLibCheck: REFUTED for the chapter's setup, with a caveat.**
- What the check asserts: `chapter13.cjs` lines 168-171 model the upgrade realistically. The plugin's `node_modules/label-kit/frame.d.ts` declares a required `frame`, loaded through `labels.ts`'s `import "label-kit/frame"`. The check expects TS2386 in `labels.ts` for both `skipLibCheck: false` and `true`.
- Independent reproduction (i5), same layout: `labels.ts(6,5): error TS2386: Overload signatures must all be optional or required.` appears under both skipLibCheck values, and again with the augmentation placed above the imports.
- The reviewer's setup (`verify/haiku-story/ch13`) differs: it drops `import "label-kit/frame"` and adds a local root `upstream.d.ts` listed after `labels.ts`. Then the error lands in the `.d.ts`, and skipLibCheck hides it. In i5, listing order `["labelsC.ts","upstream.d.ts"]` gives no error with skipLibCheck true and the error in upstream.d.ts with false. Order `["upstream.d.ts","labelsC.ts"]` puts the error in labelsC.ts.
- Rule: TS2386 lands on the later-loaded declaration. Chen's sentence is right for the chapter's plugin-import scenario.
- Optional hardening: "because labels.ts loads the plugin's declarations first, the error lands here."

**6. Ch15 Noam on the optional marker (02-branded-types.md:333): REFUTED, slight ambiguity.**
- Claim: "Then existing callers keep compiling. Including the one that passed the last page."
- Reproduction (i6) with `SoftPageCount = number & { readonly [pageKind]?: "PageCount" }`:
  - the chapter's opening unbranded caller (`{first: 3, last: 4}` passed as `count: plain.last`) compiles;
  - a `number` variable assigned to `SoftPageCount` compiles;
  - the branded line-98 caller fails with `TS2322: Type 'PageNumber' is not assignable to type 'SoftPageCount'.`
- The reviewer tested the branded caller. "Existing callers" means unmigrated ones, which pass plain numbers, and the opening's last-page caller is one of them. Noam is right.
- Optional clarity: "Including the old one that passed the last page as a plain number."

**7. Ch20 Linoy at 07-currying-partial-application.md:276: REFUTED.**
- Line: "I removed the arrow at the package call and left the same shortcut inside both renderers. I'll make them pass only the line."
- The first sentence describes what she had already done. She replaced `line => lineTotal(line, promotion)` (169) with `priceWith(promotion)` (232). The renderers still use point-free `lines.map(price)` (78-84), the same shortcut as her opening `lines.map(lineTotal)`. That is why `priceWithExtra` prints 100,99,98.
- The second sentence announces the fix the next fence applies (`lines.map(line => price(line))` gives 100,100,100). Code and prose agree.

**8. Ch2 ~306 `.filter()`: PARTLY.**
- It is a prose aside with no example fence.
- Reproduction (i8): `maybe.filter(u => u !== undefined)` and `maybe.filter(u => !!u)` on objects infer `User[]` (TS 5.5+ predicate inference).
- These do not infer a predicate:
  - `names.filter(n => !!n)` on strings (TS2322 assigning to `string[]`);
  - `maybe.filter(Boolean)` (TS2322);
  - property filters `users.filter(u => u.manager !== undefined)` followed by `u.manager.name` (TS18048).
- So the remark isn't false, but the classic element-null case no longer needs `!`.
- Fix: name a case that still needs it, e.g. "after a `.filter()` on a property, or `filter(Boolean)`".

**9. Ch2 140/144 "too narrow": CONFIRMED.**
- Oded (140) and Daniel (144) call the declared return type "too narrow" when it omits properties the value has.
- Daniel's own remedy, "assert to that type plus the properties … That's a subtype of what the library declared", shows the declared type is the wider supertype. In TypeScript vocabulary, narrowing means moving to a subtype, so "too narrow" is backwards, and Daniel is the precise character.
- Fix: "too loose / incomplete — it leaves out properties the value has".

**10. Ch22 `Rule` version 1 vs legacy format 1: PARTLY.**
- Rule `{version: 1; when}` (159/182) and legacy templates "format 1" (249) both use 1. Template uses `version: 2`.
- The check's readers (`chapter22.cjs` lines 102-112) are separate: `readSavedTemplate` (TemplateV1|TemplateV2) and `readSavedRule` (RuleV1), with the comment "The proposed tree starts at its first format; only templates have an older shape."
- So it is not a correctness bug: the record kinds are structurally distinct and read separately.
- But the page never says version numbers are per record kind. The Verdict says the service "will still read them when we add trees", in a chapter whose Principle stresses versions.
- Fix: one line saying versions are per kind, or a kind discriminator (e.g. `format: "tree"`).

**11. Bonus 1 `@types/node` 26.5.1 with Node 22.23.4: PARTLY.**
- 26.5.1 arrived transitively: the lockfile has `"@types/node": "*"` under `@types/express`/`@types/connect`. `bonus1.cjs` line 34 only asserts the printed pin equals the installed version.
- The printed code uses only `node:test` and `node:assert/strict`, which exist in Node 22, and the check runs `npm run check` successfully on 22.23.4. A reader running the chapter hits nothing.
- The mismatch is still real. In i11, with `types: ["node"]` and the 26.5.1 typings, `new URLPattern(...)` type-checks (TSC_OK), but `node a.ts` on 22.23.4 throws `ReferenceError: URLPattern is not defined`.
- Fix: pin `@types/node` to 22.x to match the stated runtime (and the root lockfile), or state why not.

**12. Ch18 optional `now`: PARTLY (mechanism confirmed; the chapter does not show or address it).**
- `makeSla` returns `slaStatus(ticket, now = Date.now())` (187, 326). Eden says "The old callers still pass a ticket." The only list caller printed uses an arrow (`tickets.map(ticket => slaStatus(ticket, now))`, 204), and no point-free caller appears.
- Reproduction (i12): `tickets.map(slaStatus)` compiles under the book profile.
  - Old one-parameter `slaStatus` via map(fn): `breached,at-risk`.
  - New optional-`now` version via map(fn): `ok,ok`, with 0 risk records (index 0/1 became `now`, about 1970).
  - With an arrow: `breached,at-risk`, 1 record.
- So the advice creates exactly the Ch20 hazard for any caller that passed `slaStatus` as a callback, and Eden's compatibility claim is unqualified. No printed code is broken.
- Fix: a line (or a Ch20 forward reference) that callback callers must wrap in an arrow. Alternatively, keep the one-argument export and expose `(ticket, now)` under another name.

**13. Ch1 logger payload: CONFIRMED.**
- Before: `logEvent(action, user)`, where `user = event.data.user` (606).
- After: `logEvent(event.type, event.data)` (672). That logs the whole data object (order and user, including `paymentMethod.token`) for every event type.
- The check only compiles it (`chapters1-6.cases.cjs` line 61: `declare function logEvent(action: string, detail: unknown): void`). Nothing on the page mentions the change.
- Fix: keep payload equivalence (e.g. log only a validated user/id), or state the change deliberately and mind the token.

**14. Ch4 `{ ... }` body (04-enums-vs-unions.md:89): CONFIRMED.**
- Fence 4 extracted verbatim (i14) gives `a.ts(3,55): error TS1128: Declaration or statement expected.`
- The harness repairs it: `chapters1-6.cases.cjs` line 149 has `edit: [["{ ... }", "{}"]]`.
- It is the only such body in the book. The same chapter elsewhere elides with `// ...` (46, 57, 227).
- Fix: `{ /* ... */ }` and drop the harness edit.

**15. Ch24 ~185 `@ts-check`: REFUTED.**
- At 140 Noam flips `checkJs` to true as an experiment. That surfaces five implicit-any errors (175).
- At 185 Eden proposes the alternative, per-file `@ts-check` instead of global checking, to avoid lowering `noImplicitAny`. Noam answers "Keep `checkJs` on…" (187), and 203 confirms "Global `checkJs` stays on."
- This is a debate between two strategies with the current state explicit, not a contradiction.

**16. Ch5 ~457: REFUTED.**
- Line: "Keep the predicate tests when the type changes. If `isUser` has its own field checks and a predicate annotation, adding a required field to `User` won't force those checks to change."
- This is a warning that motivates the tests, consistent with Idan at 257.
- Mechanism verified (i16): after adding a required `role` to `User`, the old predicate still compiles, and `u.role.toUpperCase()` type-checks.

**17. Ch16 108 vs 128: REFUTED.**
- The before-state is printed: the narration at 52 says "stores the parsed update", and code at 59-64 calls `inbox.append(parsed.data)`. The raw version comes at 98-101.
- At 108, Eden's "We'd stored every successful update. Or so I thought." sets up the 128 reveal: the old inbox held only `z.object`'s stripped output.
- Consistent as before/after. An optional "Before this change…" would help skimmers.

**18. `RequestState<T>` Ch3 vs Ch5: CONFIRMED (minor).**
- Ch3:267 tags on `status`. Ch5:309 tags on `kind`.
- Same name, same four states (idle/loading/success with `data: T`/error with `error: Error`), and the same "Click to load" copy. Both are presented by Dafna with no acknowledgement that it changed.
- Ironically, Ch5:352-354 then says to translate a different tag in the parser "so the rest of the code can keep using `RequestState`."
- Fix: use one tag in both (update the check fences).

**19. Ch10 ~299 "She": REFUTED.**
- "She tries a courier-specific version" follows Idan's line ("In the courier wrapper…"). Idan is "she" in the cast bio. Idan then presents the result: "Replace our exported `courier` with `safeCourier(raw)`…"
- The referent is Idan, not Sahar.

**20. Cast page :33 "until they've called the function": PARTLY.**
- "they" can be read generically (whoever brings the example: Daniel/Eden), so it isn't necessarily a pronoun error for Noam, who is "he" throughout.
- But it is ambiguous on the canonical cast page.
- Fix: "until someone has called the function" or "until he's seen it called".

**21. Ch7 "Nobody told me": CONFIRMED (continuity).**
- In Ch1 (276-298), Daniel shows `type Unwrap<T> = T extends Promise<infer U> ? U : T`, explicitly flagged as "previews a conditional type". Oded responds directly in that exchange ("But how often are we writing one of those?").
- Ch3:238 also lists "Conditional types" in Dafna's table. Oded speaks later in that chapter but not in that scene, so this is weaker.
- Ch7 itself calls back to it ("Remember `Unwrap<any>`…", ~390, and Linoy's "We still owe `Unwrap` an explanation", 600).
- The beat is funny, but it is literally contradicted.
- Fix: make it self-aware (e.g. someone: "Daniel showed you `Unwrap`." / Oded: "He showed me. Nobody told me that was a ternary.").

**Files of note:**
- Reproductions: `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/fullreview/verify/factcheck/i1` … `i16`.
- Ch25 check run output: `/private/tmp/claude-501/-Users-elirazk-private-ts-book/cac2cbaf-e9ba-47d4-a59f-7126b00d0654/scratchpad/fullreview/verify/factcheck/tmp/ts-book-ch25-7j7kl1/RESULTS.json`.

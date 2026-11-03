# Whole-book finishing pass — self-review

Base: **dad555e**. Branch: `codex/release-recheck`. Followed [WHOLE-BOOK-FIXES.md](WHOLE-BOOK-FIXES.md); both supplied reports and the settled brief are copied byte-for-byte. `codex/print-build` remains at **af7ba9b**, with no changes to its plan. No push.

## Must-fix dispositions

| Item | Smallest repair |
|---|---|
| 1 — Eden's how | One sentence after his Ch24 catchphrase describes temporary exception entries accumulating without old entries being reviewed. No statistic invented; the catalogue caller remains next. |
| 2 — repeated map discovery | Noam recalls Eden's `tickets.map(slaStatus)` after Daniel identifies the index in Ch20. The first result and discount surprise still come before the recall. Ch18 really passes that index as `now`. |
| 3 — comments addressing the page | Applied the Ch8 project-setting wording and named `incomplete` / `createExport({ source: "orders" })` in Ch11. The whole-fence sweep found two more: Ch12 now names the new `panel` binding, and Ch18 names exported `slaStatus`. No fence comment retains “above” or “below”; narrator “below” stays. |
| 4 — spoiler cuts | Cut exactly the specified Ch14/17/11/13/Bonus 1 sentences. In Ch14, “they” becomes “the caller”; in Ch11, removed “Either can be useful, but” and “between them,” whose antecedents were cut. No replacement lesson. |
| 5 — rule first | Ch21 leads with the wrapper rule, then the on-call statement. Ch15 uses the proposed role/type/conversion rule, retains the brand-marker and checked-value requirements, and drops the “outlive the fact” clause. |
| 6 — Ch17 ruling | Used the general history/current-state ruling. The concrete calculation/checkout/receipt decision is folded into Eden's existing local decision. |
| 7 — misplaced scenes | Moved only the Debate headings in Ch14 and Ch16, immediately after the expert's Principle. Scene text, order and fences are unchanged. |
| 8 — repeated link sentences | Cut the three redundant sentences and their links in Ch13, Ch26 and Bonus 2. Their neighboring dialogue already supplies the relevant fact; adding another fact would enlarge this finishing pass. Print inventory changes below. |

## Should-fix dispositions

- **Ch15 disagreement:** Noam replies after Eden's class-revisit line that he still wants to retain the accepted object rather than repeat the conversion. No imposed agreement.
- **Ch20 ruling:** added that creating the function should establish argument validity. The existing invalid empty-run checks demonstrate that requirement.
- **Closers:** cut Guy's Ch11 quickstart echo; replaced Oded's Ch21 filing line with the proposed unconfirmed-owner beat; moved Guy's Ch26 runtime-assertion request to the start of “It shipped,” leaving the previous section on the annotation line.
- **Callbacks:** Ch17 names Eden's `moveStart`; Ch15 locates `UserId` in the style guide; Oded recalls the any budget after Ch24's exception-list update; Noam recalls the Ch2 factory after Ch26's stale-fixture explanation. Checked all against their earlier scenes: Ch1 has the ticket/removal budget, Ch2's factory supplies the missing email, Ch3's style-guide example uses `__brand`, and Ch15's writable parameter accepts the readonly object. No callback requires a new example.
- **Cast setups:** Gil adds Oded's disproved key-cost bet to his spreadsheet as entry **848**, following the bio's exact **847**. Liron starts “In Clojure, we solved this in 2009 by—” in Ch22's Debate, before Dafna proceeds with saved data. It is a short interrupted habit, not another Principle or a new technical claim. Gilad's first Ch25 scene line now uses **Gilad Stacktrace** in full.
- **Manual narration:** Ch27's probe config moves into a comment in the existing probe fence, with Linoy reporting the failed full-project check and successful isolated run; no new fence. The post-repair control run is one summary sentence. Eden speaks Ch26's file-list result and its cause. Ch25 gives the reset to Dima and has one cleanup/build sentence naming both dist directories, API out and incremental files. Bonus 3's runtime/version/module note moves into the cases fence. All state and extraction obligations remain.
- **Prologue:** “take it to their own code” replaces “tear it apart.” Added one explanatory line each for Debate Continues and Additional Takes. Removed only the unused first column from both cast tables.
- **Take headings:** Ch3, Ch10, Ch15 and Ch19 each have one supplemental subject, so now use `Additional Take`. Ch20/21/23 stay singular: several speakers discussing one case are still one take. Multiple independent subjects retain `Additional Takes` elsewhere.
- **Typography:** straight narration quotes in Ch19/26/27; subsection quotation conventions untouched.
- **Union display comments:** reordered Ch3's EventName and Ch9's HandlerName. The brief's Ch8 location is a numbering slip: that HandlerName comment is in Ch9. Existing checks compare union membership, not its display order, and remain unchanged.

Union-order evidence on TS 7.0.2: `node_modules/.bin/tsc -p .probe/recheck-unions/tsconfig.json --pretty false` exits 1 for two deliberate `"wrong"` assignments. TS2322 displays `"onClick" | "onFocus" | "onHover"` and `"onAutoSaveChanged" | "onFontSizeChanged" | "onThemeChanged"`. The comments now match. The probe is not staged.

## Kept, rather than reopened

Kept Sahar's Ch23 catchphrase; Ch4's Turn; Ch1's Principle length; Eli's settled openings; Daniel's caller rule; the Ch19/24/27/Bonus 3 ruling family; narrator “below”; reference-code Verdict closers; subsection quote style; and unquoted Debate Continues openings. Protected the readers' best moments, all 15 catchphrases and the exact final meeting line. Zod remains **4.6.6**; the reader's 4.6.2 claim was refuted.

Future-edition notes only: repeated old-caller/input Turns, the long cold-open sequence and Oded's repeated authorship of regressions. No structural response in this pass.

## Checks and print inventory

Executable fence contents and order are unchanged; comments and prose moved. Ch25's check now matches the spoken reset and single cleanup sentence while retaining real clean-build/restoration assertions. Ch27 reads the complete probe config from its comment and asserts the same extends/files/include values before using it. Bonus 3 still checks its moved runtime pin. Compiler cases, runtime groups and fence counts do not change.

There are now **six external links plus the prologue README link**, all outside dialogue: Ch3 Express declarations, Ch7 TypeScript suggestion, Ch15 readonly documentation, Ch27 pinned checker source, Bonus 1 interface merging, Bonus 3 isolatedDeclarations, plus README. Removed: Ch13 module-augmentation guide, Ch26 Node type-stripping guide, Bonus 2 Zod JSON Schema guide. BUILD-PLAN on the separate branch still records the old inventory; its settlement should use these seven remaining links.

Clean `npm ci` reports **zero vulnerabilities**. The full `npm run check` completes with exit 0 on **TypeScript 7.0.2, Node 22.23.4 and Zod 4.6.6**: **483 fences, 891 compiler cases and 382 runtime groups**, unchanged. All 15 catchphrases occur once outside the bios. The complete manuscript is 59 whitespace words shorter than dad555e. `git diff --check` passes. Clean installation/full suite logs: `/private/tmp/whole-book-install.log` and `/private/tmp/whole-book-full.log`. The independent source audit verifies unchanged executable fences/order, no page-pointer fence comments, seven links, copied reports, moved headings and exact final line. Temporary evidence and `.probe/` are not staged.

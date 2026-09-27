# Chapter 12 — The Same Object, Twice

Status: **SETTLED**. Drafted and revised with Claude; self-review, independent
first-reader rechecks, and the full compiler/runtime suite pass. Claude's final
targeted review found no consequential findings remaining.
Work is isolated on `codex/chapter-12-variance`.

## Question and proposed case

Which operations should an SDK consumer receive, and which substitutions can
those operations support? A result cache that both returns and accepts values
cannot safely be substituted on the same terms as a reader alone.

The cache stores the latest successful export result. `ExportResult`
contains a path; `CsvResult` also contains a row count. A CSV receipt consumer
relies on the latter. A general dashboard can honestly read the path from either,
but an action that replaces the result with a bare path can invalidate the CSV
consumer's promise. Both callers' promises precede the counterexample. Archiving
moves the CSV from hot storage and makes the ZIP the current download. The
receipt still needs the most recent CSV's row count. These requirements force
the owner to preserve two different records after the archive event.

## Probes agreed with Claude

All observations below use the book's TypeScript 7.0.2 profile.

- A method-shaped `ResultCache<T>` with `read(): T` and `write(value: T): void`
  permits a CSV cache to widen. Writing a result without rows through the wider
  reference causes a later `rows.toFixed()` call through the original one to
  throw. No assertion or unchecked JavaScript caller is required.
- An `in out` annotation blocks a direct comparison of those cache types. An
  inferred forwarding object with the same two methods still passes a structural
  comparison against the annotated wide cache and permits the same runtime bug.
- A function-property-shaped `write` blocks both the direct and forwarding
  assignments under `strictFunctionTypes`. Disabling the flag reopens them.
- A reader-only contract is covariant: a CSV reader can supply general results.
  A writer-only contract is contravariant: a general writer can accept CSV values.
  A cache containing both function-property operations is invariant.
- The original cache factory can keep method syntax in its object literal.
  The target contract's function-property signature performs the stricter check.
- A method interface permits a narrowing implementation that a function-property
  target rejects. A function parameter taking a narrower result directly is
  already rejected in strict mode; do not misrepresent callbacks as the hole.
- Adding `out` to the method cache is accepted by the compiler. It records the
  method-shaped type's measured covariance, not a proof that writes are safe.
  A short Additional Take shows this without claiming a performance benefit.

## Chapter 11 callback

`in out` on the existing builder blocks its widening to the default state while
preserving both construction orders and the generic helpers. It also rejects
passing a completed builder to the source-only annotation Dafna offered. That
caller can legitimately choose a different destination, so the rejection has a
real cost.

The annotation does not establish a general structural boundary. A view exposing
`source: (source: string) => unknown` still accepts the selected builder and lets
the call reach its runtime guard. Merely converting `source` into a function
property with an explicit `this` parameter does not reject the original widening.
Avoid claiming that the cache's ordinary-parameter repair applies unchanged to
the recursive builder and receiver constraint.

Keep this callback short. Reproducing the whole builder would turn the chapter
into another advanced-generics chapter and crowd out the variance mechanism.

## Argument and cast

Guy wants the SDK to expose deliberate reader and writer contracts. Noam wants
the faulty replacement rejected before the CSV consumer encounters it. Eden
brings the existing dashboard and its forwarding adapter; a stronger signature
must account for legitimate read-only consumers. Linoy tries an annotation and
tests where it applies. Daniel distinguishes the two kinds of comparison and
the method exception without deciding the team's API policy.

The working cache and callers precede the write that corrupts the receipt's
assumption. Noam's generic dashboard rejects its attempt to invent a replacement
`T`, but cannot supply the archive feature. Linoy's annotation stops the direct
call; an inferred adapter reopens it. Her explicit adapter annotation works,
then an inferred spread copy reopens the structural comparison. Guy wants the
SDK parameter to check callers without a naming convention at every object
construction site.

The function-property contract rejects all three unsafe paths. Eden then shows
that the honest old label-only caller fails too. Its reader contract restores
that call and teaches covariance in the same example. Guy separates retained
CSV metadata from the current download. The CSV publisher's writer contract
teaches contravariance when the general download writer can serve it. The full
cache has both requirements and is invariant for the two result types.

The final sequence keeps the archive feature: the panel reads and writes the
download cache, the receipt reads the CSV cache, and the runner publishes the
next CSV to both. Costs remain explicit: consumer parameter migration and the
owner's two publications. An alternative of widening the original cache and
handling an absent row count is considered, but fails the existing retention
requirement. The verdict also names the limit of a stricter type applied after
a legacy method interface has already discarded the narrow promise.

## Review-driven revisions

- Claude rejected a path-relocation motive because spreading the current result
  preserves its rows. The archive is a genuinely different result, so the write
  follows the dashboard author's declared contract without a careless omission.
- The two retention promises appear before the archive action; separating stores
  names an existing requirement rather than adding one to justify the ending.
- The generic-dashboard alternative is shown and correctly rejected at the
  bare-path write. The next repair, spreading the current value and replacing
  the path, is also shown to work for these callers: it preserves the rows while
  pointing the record at a ZIP. That changes the declared domain meaning of a
  CSV result, whose path identifies the CSV described by its row count. Eden
  raises the need to migrate other readers of that record before changing it.
  The owner may instead retain both records in one combined value and project
  views over its fields. This alternative is acknowledged and tested too; the
  chapter's two-cache implementation is a choice, not a consequence of variance.
- Covariance and contravariance are taught through repairs already needed by the
  case. The chapter does not add unrelated producer/consumer toy examples.
- Claude caught the missing strongest annotation repair: explicitly type the
  adapter. Its success and the spread-copy limit are now both demonstrated.
- The UI harness's reason for copying operations precedes its example. It can
  replace a read operation without modifying the runner's object.
- A fresh reader understood the principle and feature preservation, but flagged
  an unstated scratch-state reset. The manuscript now recreates the CSV cache for
  each experiment. The independent recheck found no consequential obstacle.
- The verdict is three substantive turns, not a closing statement from every
  member of the cast. Claude's formal review caught a clause lost in that trim:
  the writer views themselves must use function-property syntax. The verdict
  now says so, and a regression case shows a method-shaped view reopening the
  bug even with the repaired cache. The converse rejection is checked too.

## References and validation

- [Variance annotations](https://www.typescriptlang.org/docs/handbook/2/generics.html#variance-annotations)
- [Strict function types and the method exception](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-6.html#strict-function-types)
- [The strictFunctionTypes setting](https://www.typescriptlang.org/tsconfig/strictFunctionTypes.html)
- [Optional variance annotations](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#optional-variance-annotations-for-type-parameters)

`checks/chapter12.cjs` covers all **18 fences**, **31 compiler cases** (29 strict
and two with `strictFunctionTypes: false`), and **14 runtime groups** on TypeScript
7.0.2. Printed diagnostic codes and quoted fragments are checked against actual
output. Runtime cases execute accepted faulty assignments and the repaired
callers. The builder callback uses the preceding manuscript's actual class.

Fresh `npm ci` and the full `npm run check` pass. After the final regression
additions, both Codex and Claude reran the complete suite successfully:
**238 fences, 298 compiler cases, 55 runtime groups**, plus two compiler-default
cases and two searches.

## Completion

- [x] Discovery and outline challenged with Claude before drafting.
- [x] Revised manuscript addresses Claude's draft review findings.
- [x] Manuscript-derived checks and full book suite pass.
- [x] Fresh first-reader review and targeted recheck settled.
- [x] Claude formal review and final records settled; independent chapter and full-suite reruns passed.

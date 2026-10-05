# Chapter 3 pilot: fresh first read

Coverage: Read `/tmp/ts-book-ch3-pilot/book/01-the-type-system/03-interface-vs-type.md` in full, lines 1–491, including every code block, in reading order. No other manuscript, plans, guides, reports, branches, or history were consulted. No code was executed and no manuscript was changed. Assigned snapshot: SHA256 `2310ccc57a50148d64f977864d59567a063cff90f2b6c9d3c9f2ae3bbda2a809` (provided by the assignment; not independently checked).

## Principle and disputed decision

The team needs a useful convention for choosing `interface` or `type` when both describe the same object. Matching shapes do not erase differences in reopening declarations, composing conflicting properties, or expressing choices and computed types. The final answer is explicitly a team convention: aliases for data, interfaces for behavioral contracts and deliberate extension points, with an exception for composed data objects when `extends` gives the desired early error.

That principle is understandable without earlier chapters. The opening establishes both the practical decision and the apparent equivalence quickly. The chapter also allows a preference to survive as an exception rather than pretending one keyword wins universally.

## Earliest missing context

At `/tmp/ts-book-ch3-pilot/book/01-the-type-system/03-interface-vs-type.md:57`, Daniel asks, “Do you want the next file to be able to add to this definition?” The example has only shown two declarations together. With the assigned prerequisites, I do not yet know what makes a declaration in another file the *same* declaration. The important restriction arrives much later at line 220: “Two `User` interfaces in separate modules do not merge just because their names match.” This later explanation repairs the understanding, but the first question initially makes cross-file merging sound automatic. A short same-scope qualification at the first question would prevent that detour.

## Each side's strongest answer

- **Guy:** For a named composition of object shapes, report incompatible properties where the composition is declared. The incompatible `id` examples make the practical cost visible. His answer at line 132, `interface UserContract extends Identifiable, Timestamped, Named {}`, also directly defeats the suggestion that independent components require an intersection. His position remains intact in the verdict.
- **Dafna:** A closed collection of states should make affected operations visible when a state is added. “I want to see those places” at line 339 is stronger than the catalog of syntax only aliases can name: it explains why the compiler's demand is desirable for this UI. The second-operation exchange gives Guy a real answer too—adding an implementation can preserve callers—and he concedes this specific UI without surrendering that benefit.
- **The extension-point case:** Linoy's middleware example supplies a concrete reason to want an open declaration. The optional fields and reminder that a declaration does not install middleware keep that reason grounded in runtime behavior.

## Attention and consequential friction

My attention is strongest in the `extends`/intersection disagreement (lines 63–145) and the state-model exchange (lines 266–341). In both, the alternative changes where work or errors appear, and a reply actually changes the discussion. The performance section is comparatively brief and appropriately limits what its source establishes.

The main reading burdens are:

1. At `/tmp/ts-book-ch3-pilot/book/01-the-type-system/03-interface-vs-type.md:103`, “`string & number`, which is `never`” introduces two unfamiliar ideas together. The failed assignment conveys the problem, but one phrase explaining that no value can satisfy both property types would make the argument self-contained for the stated reader. Noam's whiteboard remark at line 115 currently acknowledges the explanatory burden more than it resolves it.
2. At `/tmp/ts-book-ch3-pilot/book/01-the-type-system/03-interface-vs-type.md:237`, `readonly [K in keyof T]: T[K]` begins a dense run through mapped types, `infer`, template literals, and `as const`. I can understand the larger claim without understanding these examples, but the text does not explicitly tell me that this is a preview. The everyday unions response at line 260 restores focus. This is where attention most clearly shifts from the decision to decoding syntax.
3. At `/tmp/ts-book-ch3-pilot/book/01-the-type-system/03-interface-vs-type.md:411`, the blueprint metaphor starts a longer speech after the strongest concrete debate has already happened. Daniel's line 417 correctly marks it as convention, and Guy's objection at line 429 keeps it honest. Still, this feels like an announced lesson arriving from a new speaker rather than the room discovering its final rule. The service/repository versus data proposal itself at line 427 is clearer than the preceding building analogy.
4. The recommendation table sounds more definitive than parts of the discussion. At `/tmp/ts-book-ch3-pilot/book/01-the-type-system/03-interface-vs-type.md:445`, tuples become “Only option,” whereas line 246 said interfaces cannot do them “cleanly.” At line 446, class contracts promise “better error messages,” although the demonstrated diagnostic advantage concerned conflicting composition. These are reader-facing confidence mismatches; I have not compiler-audited either claim.

## Voices and humor

The most natural voices occur when they answer the immediately preceding point: Dafna withdrawing her independent-parts argument at line 141, Guy retaining his composition exception at line 429, and the mutual concession over states. Oded and Noam's “more careful with words” exchange at lines 399–401 is a light joke that arises from their disagreement and does not interrupt the lesson.

The many named arrivals make the room feel partly staged: several people enter to deliver one specialized function, with Liron's entrance for “The Turn” the clearest instance. I can follow the argument without retaining all the names, so this is a texture issue rather than a comprehension failure. The ordinary actions—writing underneath and checking properties—work naturally. The chapter does not need more jokes, gestures, or anecdotes.

## Verdict

A clear, mostly persuasive standalone chapter whose best material is genuine disagreement about error placement and future changes. The conclusion preserves both sides' strongest reasons. The highest-value improvements are the early scope qualification, a small amount of syntax orientation, and making the closing convention and table as carefully qualified as the debate that earns them.

# Chapter 15: What the Number Means

## The Principle

**Prof. Eli Typeworth**: "Two values can have the same representation and different jobs. A page number and a count of pages are both numbers, but putting one where the other belongs changes the result. A brand adds a type-level marker so the compiler can distinguish them."

**Eli**: "Some brands make a further promise: this value passed a check. Before relying on that promise, examine how code can create and change values of that type without bypassing the compiler with assertions or `any`. Those operations must preserve what the check established, or the brand can outlive the fact it claims."

## The Debate

### The name was already right

**Oded Shipley**: "The dialog says pages three to four. The preview has four pages. I'd like the other two removed."

Eden has the export dialog beside its request builder. The dialog has From and To fields, both inclusive. Its renderer takes a first page and a count. Before loading any document pages, the preview uses the renderer's numbering function to list the pages it will request.

**Eden Legacy**: "The renderer also serves the batch exporter. That caller asks for the next fifty pages. The dialog asks where to stop."

He runs that function, including the renderer's numeric guards, on its own:

```typescript
function previewNumbers({ first, count }: { first: number; count: number }): number[] {
  if (!Number.isSafeInteger(first) || first < 1 ||
      !Number.isSafeInteger(count) || count < 1) {
    throw new RangeError("Expected positive whole numbers");
  }
  if (count - 1 > Number.MAX_SAFE_INTEGER - first) {
    throw new RangeError("Last page exceeds safe integer range");
  }
  const last = first + (count - 1);
  const pages: number[] = [];
  for (let page = first; page <= last; page++) pages.push(page);
  return pages;
}

console.log(previewNumbers({ first: 3, count: 2 })); // [3, 4]

const selection = { first: 3, last: 4 };
console.log(previewNumbers({ first: selection.first, count: selection.last }));
// [3, 4, 5, 6]
```

The function checks the arithmetic. Whether those pages exist belongs to the document loader.

**Noam Kiperman**: "Nothing in that signature can complain. It received two perfectly good numbers."

**Oded**: "I was about to ask for named arguments. We have named arguments."

**Eden**: "The name says count. The value is the last page."

**Noam**: "Then make them different types. I want the next caller to get an error on that line."

### Two kinds of number

Noam adds the types and their constructors to the page-request module.

```typescript
declare const pageKind: unique symbol;

type PageNumber = number & { readonly [pageKind]: "PageNumber" };
type PageCount = number & { readonly [pageKind]: "PageCount" };

function pageNumber(raw: number): PageNumber {
  if (!Number.isSafeInteger(raw) || raw < 1) {
    throw new RangeError("Invalid page number");
  }
  return raw as PageNumber;
}

function pageCount(raw: number): PageCount {
  if (!Number.isSafeInteger(raw) || raw < 1) {
    throw new RangeError("Invalid page count");
  }
  return raw as PageCount;
}
```

**Oded**: "Your safety patch has two assertions in it."

**Noam**: "At the two places that make the values. The check establishes a positive safe integer. It doesn't add a property to a number. I have to tell the compiler which type this function produces."

**Chen Override**: "So there isn't a symbol on the number?"

**Noam**: "There isn't even a symbol created by that declaration. `declare` emits nothing. The key belongs to this declaration, and the two types require different values at that key. Both are ordinary numbers when this runs."

This is the intersection technique in TypeScript's [nominal-typing example](https://www.typescriptlang.org/play/typescript/language-extensions/nominal-typing.ts.html). The [symbol documentation](https://www.typescriptlang.org/docs/handbook/symbols.html#unique-symbol) describes the declaration-specific identity of a `unique symbol` key.

Noam keeps the numbering function and puts a typed entry point in front of it:

```typescript
type PageSpan = Readonly<{ first: PageNumber; count: PageCount }>;

function preview(span: PageSpan): number[] {
  return previewNumbers(span);
}

const selection = { first: pageNumber(3), last: pageNumber(4) };
preview({ first: selection.first, count: selection.last }); // Error TS2322
```

The error starts with `Type 'PageNumber' is not assignable to type 'PageCount'`. Its detail ends at the incompatible marker values, `"PageNumber"` and `"PageCount"`.

**Oded**: "That is the line I wanted it to catch. Fine. What's the correct call?"

```typescript
const count = pageCount(selection.last - selection.first + 1);
console.log(preview({ first: selection.first, count })); // [3, 4]

const next: PageNumber = selection.first + 1; // Error TS2322
```

**Noam**: "Arithmetic returns a number. If you want a page number again, call `pageNumber`. An addition can overflow; a subtraction can go below one."

**Oded**: "And I can write `pageCount(selection.last)` and get the original bug back."

**Noam**: "You can. Four passes either numeric check. Choosing which meaning to give it is still the caller's job. Now that choice has a name at the conversion site, where we can review it."

### Checking the pair

The preview and the dialog's Export button each turn the dialog's endpoints into a request. Both currently reject a selection whose first page is after its last.

**Oded**: "Put that comparison in one function. Both places can call it."

**Noam**: "And the next consumer can skip it. I want the signature to require a checked range. Check the pair when we construct it, and only give the consumers accepted selections."

```typescript
declare const rangeKind: unique symbol;
type PageRange = Readonly<{ first: PageNumber; last: PageNumber }> & {
  readonly [rangeKind]: "PageRange";
};

function pageRange(first: PageNumber, last: PageNumber): PageRange {
  if (first > last) throw new RangeError("First page follows last");
  return { first, last } as PageRange;
}

function requestOf(range: PageRange): PageSpan {
  return {
    first: range.first,
    count: (range.last - range.first + 1) as PageCount,
  };
}

const selected = pageRange(pageNumber(3), pageNumber(4));
console.log(preview(requestOf(selected))); // [3, 4]
```

**Oded**: "Another assertion."

**Noam**: "The endpoints are positive safe integers, and the range checked their order. That makes this count a positive safe integer too. We can convert it without checking again."

**Oded**: "It still needs the error in the form when I type five into From."

**Noam**: "The form catches the range error and keeps the edit as a draft. Preview and Export only receive the accepted selection."

**Eden**: "And the dialog's 'Pages 3–4' label can read the endpoints directly. With a count, it has to calculate the last page again."

## The Turn

Oded tries migrating the From-field handler. It used to replace the selection with a spread. He gives the new first page its brand and checks whether the same update still works.

```typescript
const edited = { ...selected, first: pageNumber(5) };
const accepted: PageRange = edited; // Accepted.
console.log(requestOf(accepted)); // { first: 5, count: 0 }
preview(requestOf(accepted));
// Throws RangeError: Expected positive whole numbers
```

**Oded**: "It accepted five to four. Now the preview throws the renderer's error. Where's the form's range check?"

**Noam**: "That handler has to call `pageRange`."

**Chen**: "The assignment to `PageRange` passed. Wasn't that meant to require the check?"

**Noam**: "The new `first` is still a `PageNumber`. The spread carries the range marker in its type. It doesn't rerun the comparison."

**Oded**: "There wasn't a marker on the original object either."

**Noam**: "I asserted that there was. Now the checker carries that property into the copy. And my conversion just stamped zero as `PageCount`. It trusted the range."

Oded replaces the handler:

```typescript
const edited = pageRange(pageNumber(5), selected.last);
// Throws RangeError: First page follows last
```

**Oded**: "That's the right error. The form already shows it."

**Noam**: "Keep that change. But any other handler can still make the first copy, and the consumer won't know. I can't use this type as my reason to remove the consumers' order check."

**Eden**: "Even if the module doesn't export the symbol?"

**Noam**: "The caller didn't name the symbol. It copied a value whose type already had it."

### Keeping the checked object intact

**Noam**: "We can make a checked range that a spread can't recreate. But it needs to survive mutation too. `readonly` by itself won't do that."

He replaces the object brand with a class and changes `requestOf`'s parameter to `CheckedRange`; its body stays the same. The declared private marker emits no field.

```typescript
class CheckedRange {
  declare private readonly checked: void;

  private constructor(readonly first: PageNumber, readonly last: PageNumber) {
    Object.freeze(this);
  }

  static create(first: PageNumber, last: PageNumber): CheckedRange {
    if (first > last) throw new RangeError("First page follows last");
    return new CheckedRange(first, last);
  }
}

const selected = CheckedRange.create(pageNumber(3), pageNumber(4));
const copied: CheckedRange = { ...selected, first: pageNumber(5) }; // Error TS2741
```

`Property 'checked' is missing` is the start of this diagnostic.

**Noam**: "The private member distinguishes instances of this class. A spread copies the public data, so it loses that member in its type. An update has to give the consumers another `CheckedRange`."

**Eden**: "Our old dialog helper takes a mutable shape. It used to update the state object in place."

```typescript
function moveStart(range: { first: PageNumber }, first: PageNumber): void {
  range.first = first;
}

moveStart(selected, pageNumber(5)); // Compiles; throws TypeError in this strict-mode module.
```

**Eden**: "It accepted your first object brand too. There the write succeeded. Here the freeze makes it throw."

**Oded**: "The helper still compiles. We find out when somebody edits From."

**Noam**: "Expose `first()` and `last()` instead of number properties, and `moveStart` won't even compile against it."

**Eden**: "Then every reader changes too. They all read `range.first` today."

**Noam**: "Rebuild through `CheckedRange.create`, retire `moveStart`, and update the readers. I'd pay that to keep an accepted selection intact."

TypeScript's [object-type documentation](https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties) notes that `readonly` does not affect compatibility with a mutable property. Freezing the original object brand alone would not reject a spread: it creates a new object.

### Keeping a count instead

**Eden**: "The batch exporter already stores a count. It doesn't need a second checked object."

He writes its request with the scalar brands:

```typescript
const span: PageSpan = { first: pageNumber(3), count: pageCount(2) };
const moved = { ...span, first: pageNumber(5) };
console.log(preview(moved)); // [5, 6]
```

**Eden**: "Both numbers still have their own meaning. There's no claim about the order of two fields for the copy to break. The renderer keeps its overflow check."

**Noam**: "That also moved To from four to six. Our dialog leaves To alone when you change From."

**Chen**: "If the form keeps a draft anyway, who reads the accepted selection?"

**Eden**: "Preview and Export. They both need a count. The label currently reads the draft. Keep it reading the draft, and let the two actions share one conversion."

The request builder receives individually checked page numbers from the fields. The pair can still be out of order while someone edits it.

```typescript
type PageDraft = Readonly<{ first: PageNumber; last: PageNumber }>;

function requestFrom(draft: PageDraft): PageSpan | undefined {
  const count = draft.last - draft.first + 1;
  if (count < 1) return undefined;
  return { first: draft.first, count: pageCount(count) };
}

console.log(requestFrom({ first: pageNumber(3), last: pageNumber(4) }));
// { first: 3, count: 2 }
console.log(requestFrom({ first: pageNumber(5), last: pageNumber(4) }));
// undefined
```

**Noam**: "You've put the order check back."

**Eden**: "With the conversion we needed anyway. We have a count when it succeeds. The draft keeps your five and four when it doesn't."

**Oded**: "While I'm typing five-to-nine, let Preview show no pages once I've typed the five. Export can tell me why it won't run. Once I type the nine, both should work."

Eden writes the two callers. `render` is the export operation passed in by the application; it takes the same first-and-count request as the preview.

```typescript
function previewDraft(draft: PageDraft): number[] {
  const request = requestFrom(draft);
  return request ? preview(request) : [];
}

function exportDraft(draft: PageDraft, render: (request: PageSpan) => void): string {
  const request = requestFrom(draft);
  if (!request) return "The first page must not follow the last.";
  render(request);
  return "Export started.";
}
```

**Noam**: "And now the renderer never gets that zero count."

**Oded**: "And Export never calls the renderer for that draft. Two callers, one comparison."

## The Verdict

**Eden**: "I'll put `PageNumber` and `PageCount` on the renderer's entry points. The dialog keeps endpoint drafts. Both actions go through `requestFrom`; there's no range brand to maintain."

**Noam**: "I'd still give the export API a `CheckedRange`. I don't want every future consumer converting back from the renderer's request shape. The method version handles the copying problem."

**Eden**: "The class works, and we'd have to adapt the old helpers and every reader to it. Here the dialog edits a draft and rebuilds the request. That request has a positive count from the scalar constructor, with no pair of endpoints to reverse. The renderer keeps its overflow and document checks."

He leaves `requestFrom` in the patch.

**Eden**: "If another consumer needs to retain an accepted selection, we'll revisit the class."

Oded adds the five-to-four edit to both action tests. He leaves the test of `count: selection.last` in the compiler checks.

## Additional Takes

**Chen**: "What if I make the marker optional so existing callers keep compiling?"

```typescript
type SoftPageCount = number & { readonly [pageKind]?: "PageCount" };
const count: SoftPageCount = 4; // Accepted.
```

**Noam**: "Then existing callers keep compiling. Including the one that passed the last page."

---

**Eli**: "If the dialog restores From and To from a shared link, those parameters are input again. The link hasn't stored the brands. You still have to establish what its values mean."

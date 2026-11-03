# Chapter 12: The Same Object, Twice

## The Principle

**Daniel Compiler**: "Before passing an object through a broader type, ask what that reference permits its holder to do. Being able to read the broader value is not enough if the contract also allows writing one back. The original owner may still be using the same object under a more specific promise."

"Follow the permitted operations through both references. If one caller can make another caller's promised result impossible, the assignment isn't safe just because the values were compatible when you made it. This is a question about the contract's members, not how similar the type names look. Start with the reads and writes the consumers actually need; then check the assignments against those operations."

## The Debate

**Noam Kiperman**: "The receipt says `rows` is a number. It just called `toFixed` on `undefined`."

**Eden Legacy**: "It was a number when the export finished."

**Guy Singleton**: "Who wrote to the cache afterward?"

Guy has brought the export runner's cache, as promised. The runner consumes the records `ExportBuilder` produces. Each CSV result pairs its file path with its row count.

```typescript
interface ExportResult {
  path: string;
}

interface CsvResult extends ExportResult {
  rows: number;
}

interface ResultCache<T> {
  read(): T;
  write(value: T): void;
}

// One current result. Writing replaces it; reading returns it.
function createCache<T>(initial: T): ResultCache<T> {
  let current = initial;
  return {
    read() { return current; },
    write(value) { current = value; },
  };
}
```

Two consumers share the CSV job's cache. The receipt reports the row count of the most recent CSV export, even after its file has been archived. The download panel shows where users can get the latest output. Until now, both have been talking about the same result.

```typescript
const csvCache = createCache<CsvResult>({ path: "orders.csv", rows: 120 });

function receipt(cache: ResultCache<CsvResult>): string {
  return `${cache.read().rows.toFixed(0)} rows`;
}

function dashboard(cache: ResultCache<ExportResult>) {
  return { label: () => cache.read().path };
}

receipt(csvCache);          // "120 rows"
dashboard(csvCache).label(); // "orders.csv"
```

**Eden**: "That's the dashboard we shipped. It only reads a path. It works for CSV jobs and the other exporters."

**Noam**: "And the receipt was written by the reporting team. They don't import the dashboard."

Eden opens the archive change they are testing before release. The archiver moves the CSV out of hot storage and provides a ZIP download. The panel must point at that ZIP afterward. Its new action records the archive path in the cache it already receives.

```typescript
function dashboard(cache: ResultCache<ExportResult>) {
  // Replaces the label-only dashboard.
  return {
    label: () => cache.read().path,
    useArchive(path: string) {
      cache.write({ path });
    },
  };
}
```

**Eden**: "The archiver supplies the path. This action records the result. There's no row count on a ZIP result."

```typescript
const panel = dashboard(csvCache); // Accepted.
panel.useArchive("orders.zip");
panel.label();                     // "orders.zip"
receipt(csvCache);                 // Throws a TypeError.
```

**Noam**: "The person who gets paged owns the receipt. The write that broke it is in another package, and both packages compile."

**Linoy Nightly**: "I'd expect the assignment to work. `CsvResult` extends `ExportResult`. There's even an annotation for that kind of assignment."

**Noam**: "The cache fits the dashboard's parameter. The ZIP it let through doesn't fit what the receipt was promised."

**Daniel**: "Whether one cache type can stand in for another depends on what its holder can do. The compiler checks the members. Here the dashboard may write any `ExportResult`, while the receipt expects every read to return a `CsvResult`. Those promises conflict on the same object."

**Guy**: "So the assignment at the dashboard call shouldn't have been accepted. We let one reference grant a write the other reference can't survive."

### "Keep the type the caller supplied"

**Noam**: "Make the dashboard preserve the caller's type. We already know how to stop a helper forgetting it."

He tries a generic parameter on the replacement function.

```typescript
function genericDashboard<T extends ExportResult>(cache: ResultCache<T>) {
  return {
    label: () => cache.read().path,
    useArchive(path: string) {
      cache.write({ path }); // Error: TS2345.
      // '{ path: string; }' is assignable to the constraint of type 'T',
      // but 'T' could be instantiated with a different subtype of constraint 'ExportResult'.
    },
  };
}
```

**Noam**: "Good. Reading works. It can't invent the value it's about to put back."

**Eden**: "Then keep the current one: `cache.write({ ...cache.read(), path })`. That compiles. The receipt keeps its rows, and the label gets the ZIP path."

**Guy**: "The CSV record now points at a ZIP. We'd be changing `CsvResult` to mean the latest download plus some CSV history. Its path currently identifies the CSV that `rows` describes."

**Eden**: "That keeps these two screens working. I'd have to find everyone else reading `CsvResult.path` before changing its meaning."

### "There's an annotation for that"

**Linoy**: "We can stop the assignment at the call instead. Make the cache invariant. `in out T`. We can annotate the reader and writer separately too, and—"

**Eden**: "One cache first. What does invariant reject?"

**Linoy**: "Treating the CSV cache as a general cache. Or going the other way. An owner that accepts arbitrary results can't promise every read has rows either."

Linoy opens a scratch file with the factory and both dashboards.

```typescript
interface ResultCache<in out T> {
  read(): T;
  write(value: T): void;
}
// Only the interface changes. Start each experiment with a fresh csvCache:
// createCache<CsvResult>({ path: "orders.csv", rows: 120 })
```

The archive dashboard now rejects the CSV cache.

```typescript
dashboard(csvCache); // Error: TS2345.
// Argument of type 'ResultCache<CsvResult>' is not assignable
// to parameter of type 'ResultCache<ExportResult>'.
// Property 'rows' is missing in type 'ExportResult' but required in type 'CsvResult'.
```

**Guy**: "That is where I want the error. Before the dashboard can replace anything."

**Eden**: "Try the UI test harness. It copies the operations so a test can replace `read` without changing the runner's object."

Eden replaces the direct call with the inferred adapter:

```typescript
const forwarded = {
  read: csvCache.read,
  write: csvCache.write,
};

const panel = dashboard(forwarded); // Accepted, even with in out T.
panel.useArchive("orders.zip");
receipt(csvCache);                 // Throws a TypeError again.
```

**Linoy**: "It has exactly the same functions."

**Eden**: "And they're still reading and replacing the same `current`."

**Linoy**: "Give the adapter its type. You're not comparing two `ResultCache`s anymore."

```typescript
const named: ResultCache<CsvResult> = {
  read: csvCache.read,
  write: csvCache.write,
};
dashboard(named); // Error: TS2345.
```

**Eden**: "That works. Then a test copies the fixture and wraps `read` to count calls."

```typescript
let reads = 0;
const copied = {
  ...named,
  read: () => { reads++; return named.read(); },
};
const panel = dashboard(copied); // Accepted.
panel.label();                  // "orders.csv"
panel.useArchive("orders.zip");
receipt(csvCache);              // Throws a TypeError.
```

**Eden**: "I added a counter, Linoy. I wasn't trying to write a compiler test."

**Linoy**: "We could annotate the copy too. And the next copy. No, I don't want to approve every test fixture to keep this working."

**Guy**: "These are SDK consumers. The contract should check what they pass, without requiring that convention at every construction site."

**Daniel**: "The annotation affected a comparison between two `ResultCache` instantiations. Here the source is an object type with `read` and `write`. The compiler compares those members. Your annotation doesn't change their signatures."

**Eden**: "Those functions close over `current`. Copying them didn't lose a receiver or give us a new cache."

### "But we're using strict mode"

**Noam**: "Why is the member comparison allowing the write? A function that needs rows can't accept every result."

**Daniel**: "Because the target declares a method: `write(value: T): void`. Method parameters get a bivariant check. For these related argument types, it allows either direction."

**Guy**: "Including the direction where it's handed a result without rows."

**Daniel**: "Including that one."

**Eden**: "Strict mode is enabled in both packages."

**Daniel**: "It doesn't repeal the method exception."

"`strictFunctionTypes` checks ordinary function parameters contravariantly. Methods and constructors are exceptions kept for compatibility. This is what strict checking allows, not a flag either package forgot."

**Noam**: "Then write the function type we want callers checked against."

## The Turn

Noam replaces the interface without the variance annotation:

```typescript
interface ResultCache<T> {
  read: () => T;
  write: (value: T) => void;
}
```

**Guy**: "The factory still uses `write(value) { current = value; }`."

**Noam**: "It can. We're changing the contract's member type. We haven't changed the object it returns."

```typescript
dashboard(csvCache);  // Error: TS2345.
dashboard(forwarded); // Error: TS2345.
// Types of property 'write' are incompatible.
dashboard({ ...csvCache }); // Error: TS2345.
```

**Eden**: "Now run the old dashboard. Before the archive button."

"The old parameter is still `ResultCache<ExportResult>`. Same error at `dashboard(csvCache)`, even though this body only reads a path. That one didn't break a receipt. You've broken its callers too."

**Noam**: "Its parameter asks for a write it never uses."

**Eden**: "I know. So the change isn't finished at the interface. I have to find those consumers and change their parameters."

**Noam**: "You're right. My repair rejects a caller we still support. I'll change its parameter and keep that call in the checks."

**Eden**: "Thank you. Your one-line fix was getting expensive for everyone else."

**Guy**: "Give the label a reader. It shouldn't receive the write operation through its declared contract."

```typescript
interface ResultReader<T> {
  read: () => T;
}

function dashboardLabel(reader: ResultReader<ExportResult>) {
  return () => reader.read().path;
}

const label = dashboardLabel(csvCache); // Accepted.
label();                              // "orders.csv"
```

**Linoy**: "That's covariance. `CsvResult` fits `ExportResult`, and a `ResultReader<CsvResult>` fits `ResultReader<ExportResult>`. The direction stays the same. Every read still produces at least the path the label needs."

**Eden**: "The label keeps the reader so it can get the current path on each render. Passing it today's result would give it a snapshot."

**Noam**: "And it can't replace the result through that parameter."

**Guy**: "The cache hasn't become immutable. Its owner can still write. We've described the operation this consumer gets to use."

### "The archive button still needs a home"

Guy puts the two promises from the original callers above the factory: the last CSV export for the receipt, the latest downloadable output for the panel.

**Guy**: "They happened to be the same record. The archive separates them. We need to keep the CSV metadata after the latest download becomes a ZIP."

**Eden**: "Or make the original cache `ResultCache<ExportResult>` and teach the receipt that rows might be absent."

**Noam**: "That would stop it crashing. It wouldn't let it report the last CSV's row count after we'd thrown that record away. That's still required."

**Guy**: "Keep that record in its own cache. The download cache can accept either kind of output. The runner owns publishing new CSV results to both."

**Eden**: "We could also keep both values in one owner record, with views onto its two fields."

**Guy**: "That works too. I'll use the two caches here. Their owner has to preserve both promises either way."

He gives the CSV publisher a writer contract. It needs to submit CSV results; it doesn't read from the destination.

```typescript
interface ResultWriter<T> {
  write: (value: T) => void;
}

function publishCsv(result: CsvResult, writer: ResultWriter<CsvResult>): void {
  writer.write(result);
}

const firstCsv: CsvResult = { path: "orders.csv", rows: 120 };
const lastCsv = createCache<CsvResult>(firstCsv);
const latestDownload = createCache<ExportResult>(firstCsv);

function recordCsv(result: CsvResult): void {
  publishCsv(result, lastCsv);
  publishCsv(result, latestDownload); // Accepted: this writer accepts every ExportResult.
}
```

**Linoy**: "Now the direction reverses. A writer accepting every `ExportResult` can stand in for one accepting `CsvResult`. That's contravariance. The runner only sends CSV results. The wider writer already handles those."

**Eden**: "The runner's parameter still says CSV. It can't use that reference to publish a ZIP."

**Guy**: "Follow what the caller can do. The label receives a value. The runner supplies one."

**Noam**: "A writer that only accepts CSV results mustn't get the archive action. Show that call too."

```typescript
function archiveAction(writer: ResultWriter<ExportResult>) {
  return (path: string) => writer.write({ path });
}

archiveAction(lastCsv); // Error: TS2345; its write requires CsvResult.
const useArchive = archiveAction(latestDownload); // Accepted.
```

**Daniel**: "The full cache has to satisfy both requirements. For these types it's invariant: neither cache can substitute for the other."

**Eden**: "And we got that without `in out`."

**Linoy**: "TypeScript infers it from the members. `out` would describe the reader, `in` the writer. We don't have to write them."

**Guy**: "Now wire the receipt to the CSV reader and the panel to the download cache:"

```typescript
function receipt(reader: ResultReader<CsvResult>): string {
  // Replaces the earlier receipt; the panel binding below replaces the old panel.
  return `${reader.read().rows.toFixed(0)} rows`;
}

const panel = {
  label: dashboardLabel(latestDownload),
  useArchive,
};

panel.useArchive("orders.zip");
panel.label();     // "orders.zip"
receipt(lastCsv);  // "120 rows"

recordCsv({ path: "next.csv", rows: 140 });
panel.label();     // "next.csv"
receipt(lastCsv);  // "140 rows"
```

**Eden**: "Two actual caches. A reader view on the old object wouldn't have saved that row count."

**Guy**: "And two writes when the next CSV finishes. That publication belongs with the runner. If someone updates just one, the panel and receipt disagree."

## The Verdict

> Give each consumer a contract for the operations it needs. For these writers, use function-property signatures under `strictFunctionTypes` so structural comparisons reject the unsafe writes. Migrate consumer parameters with that contract, and preserve the meaning of the values shared between owners. A reader view limits operations through that reference; it does not stop another owner writing.

**Guy**: "The runner owns the full caches. The archive action can write to the download cache, but it mustn't get a writer for the receipt's CSV record."

**Eden**: "Noam has the label-only caller. I'll migrate the remaining consumers and move the archive action to the download cache."

**Noam**: "Every writer contract needs `write` as a function property, including the views. Keep the failed calls in the checks. And check the old method-shaped adapters on the way out. If one has already widened a CSV cache, putting our new type on the result won't recover the information it lost."

## Additional Takes

**Daniel**: "For anyone tempted to annotate the original cache as a producer: the compiler accepts this."

```typescript
interface MethodCache<out T> {
  read(): T;
  write(value: T): void;
}
```

**Linoy**: "The method exception still permits that direction. `out` agreeing with it doesn't make the writes safe."

**Daniel**: "And the function-property repair depends on `strictFunctionTypes`. Keep it enabled. Turning it off restores the permissive parameter check."

**Guy**: "What about Chen's assignment? The configured builder that became a bare `ExportBuilder`?"

```typescript
// In a copy of ExportBuilder, replace the type parameter with:
// in out S extends Partial<ExportSpec> = {}
// Keep the methods and runtime guards unchanged.
const selected = ExportBuilder.start().source("orders");
const lessSpecific: ExportBuilder = selected; // Error: TS2322.

function withDestination(builder: ExportBuilder<{ source: string }>) {
  return builder.destination("exports/nightly.csv");
}

withDestination(selected); // Accepted.
withDestination(selected.destination("exports/manual.csv")); // Error: TS2345.
```

**Eden**: "That's the source-only parameter Dafna offered. Choosing a new destination on a completed builder was a valid call. Now it fails too."

**Linoy**: "A preserving generic helper can keep that call. But I wouldn't call this annotation a replacement for the guard. We just saw what happens when the next boundary compares members instead."

**Guy**: "Keep the guard. We still need to change the destination on a completed builder. Rejecting one bad assignment doesn't pay for rejecting that call."

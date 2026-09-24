// Case table for chapters1-6.cjs. Fence numbers count ```typescript blocks from 1.
const api = `declare const api: { get<T = any>(url: string): Promise<T> };`;
const expressApp = `import express from "express";
const app = express();
declare function createUser(email: string, name: string): void;`;

module.exports = {
  "01-the-type-system/01-any-vs-unknown.md": {
    cases: [
      {name: "any-assignability", fence: 1, expect: [[1, 8, 2322, "Type 'any' is not assignable to type 'never'."]]},
      {name: "unknown-assignability", fence: 2, expect: [[2, 12, 2322, "Type 'unknown' is not assignable to type 'number'"]]},
      {name: "analytics-any", fence: 3, before: `declare const currentUser: { id: string };`},
      {name: "format-response", fence: 4, after: `
type Formatted = ReturnType<typeof formatResponse>;
type IdIsAny = Expect<IsAny<Formatted["id"]>>;
type NameIsAny = Expect<IsAny<Formatted["name"]>>;
type DateStays = Expect<Equal<Formatted["createdAt"], Date>>;`},
      {name: "process-input-unknown", fence: 5},
      {name: "process-input-any", fence: 6},
      {name: "unknown-member-access", fence: 7, expect: [[7, 2, 18046, "'value' is of type 'unknown'"]]},
      {name: "any-member-access", fence: 8},
      {name: "parse-config-any", fence: 9, before: `declare const input: string;`},
      {name: "parse-config-unknown", fence: 10, before: `declare const input: string;`,
        expect: [[10, 6, 18046, "'config' is of type 'unknown'"]]},
      // One function at three migration stages; each stage is compiled on its own.
      {name: "migration-week-1", fence: 11, lines: [1, 4], before: api},
      {name: "migration-month-2", fence: 11, lines: [6, 9], before: api},
      {name: "migration-month-4", fence: 11, lines: [11, 21], before: api},
      {name: "tracked-any", fence: 12, before: api},
      {name: "any-breaks-inference", fence: 13, after: `
type NumIsNumber = Expect<Equal<typeof num, number>>;
type MysteryIsAny = Expect<IsAny<typeof mystery>>;`},
      {name: "unwrap-any", fence: 14, after: `
type AIsString = Expect<Equal<A, string>>;
type BIsAny = Expect<IsAny<B>>;`},
      {name: "any-versus-assertion", fence: 15, before: `
declare function fetchData(): unknown;
interface User { id: string; process(): void }`},
      {name: "any-spreads", fence: 16, lines: [1, 8], before: `
declare const rawConfig: string;
declare function startServer(port: number, host: string): void;`, after: `
type PortIsAny = Expect<IsAny<typeof port>>;`},
      {name: "assertion-contained", fence: 16, lines: [10, 14], before: `
declare const rawConfig: string;
interface ServerConfig { server: { port: number; host: string } }
declare function startServer(port: number, host: string): void;`, after: `
type PortIsNumber = Expect<Equal<typeof port, number>>;`},
      {name: "express-body-any", fence: 17, before: `declare function createUser(email: string, name: string): void;`, after: `
type BodyIsAny = Expect<IsAny<express.Request["body"]>>;`},
      {name: "parse-at-boundary", fence: 18, before: expressApp + `
class ValidationError extends Error {}`, after: `
type Parsed = Expect<Equal<ReturnType<typeof parseCreateUserRequest>, CreateUserRequest>>;`},
      {name: "any-event-handlers", fence: 19},
      // Continues the registry declared in the previous fence.
      {name: "generic-event-handlers", fence: 20, before: `
type EventHandler = (payload: any) => void;
const handlers: Map<string, EventHandler[]> = new Map();`},
      {name: "interface-event-contract", fence: 21},
      {name: "overload-event-handlers", fence: 22},
      {name: "webhook-before", fence: 23, before: `
declare function logEvent(action: string, detail: unknown): void;
declare function chargeUser(method: any, amount: number): Promise<void>;`},
      {name: "webhook-after", fence: 24, before: `declare function logEvent(action: string, detail: unknown): void;`},
    ],
  },
  "01-the-type-system/02-type-assertions.md": {
    cases: [
      {name: "assertion-without-check", fence: 1},
      {name: "as-const-versus-as-type", fence: 2, after: `
type Narrowed = Expect<Equal<typeof config, { readonly env: "production"; readonly port: 3000 }>>;`},
      {name: "asserted-response", fence: 3, after: `
type JsonIsAny = Expect<IsAny<Awaited<ReturnType<Response["json"]>>>>;`},
      {name: "zod-response", fence: 4, after: `
type Parsed = Expect<Equal<typeof user, { id: string; name: string; email: string }>>;`},
      {name: "centralized-assertion", fence: 5, before: `interface ApiUser { id: string; name: string; email: string }`},
      {name: "double-assertion", fence: 6, after: `const directDog = cat as Dog;`,
        expect: [["after", 1, 2352,
          "Conversion of type 'Cat' to type 'Dog' may be a mistake because neither type sufficiently overlaps with the other.", 6]]},
      {name: "user-shape", fence: 7},
      {name: "incomplete-mock", fence: [7, 8]},
      {name: "complete-mock", fence: [7, 9]},
      {name: "mock-factory", fence: [7, 10]},
      {name: "as-widens-literal", fence: 11, after: `type Widened = Expect<Equal<typeof color1, Color>>;`},
      {name: "satisfies-keeps-literal", fence: [11, 12], after: `type Kept = Expect<Equal<typeof color2, "red">>;`},
      {name: "satisfies-rejects-typo", fence: [11, 13], expect: [[13, 4, 2322, `Type '"purple"' is not assignable to type 'Color'.`]]},
      {name: "as-accepts-typo", fence: [11, 14]},
      {name: "non-null-equivalence", fence: 15, before: `declare const user: { name: string } | null;`},
      // The fence declares name at top level twice to compare forms; each form is compiled separately.
      {name: "optional-chaining-and-narrowing", fence: 16, lines: [1, 10],
        before: `declare const user: { name: string } | undefined;`,
        after: `type Optional = Expect<Equal<typeof name, string | undefined>>;`},
      {name: "non-null-preserves", fence: 16, lines: [12, 15],
        before: `declare const user: { name: string } | undefined;`,
        after: `type Asserted = Expect<Equal<typeof name, string>>;`},
      {name: "map-has-get", fence: 17, before: `interface User { id: string }
declare const userId: string;`},
    ],
  },
  "01-the-type-system/03-interface-vs-type.md": {
    cases: [
      {name: "same-shape", fence: [1, 2]},
      {name: "merge-versus-duplicate", fence: 3, after: `
type Merged = Expect<Equal<Config, { port: number; host: string }>>;
type Settings = { host: string };`,
        expect: [[3, 11, 2300], ["after", 3, 2300, "Duplicate identifier 'Settings'", 3]]},
      {name: "interface-hierarchy", fence: 4},
      {name: "interface-extends-conflict", fence: [4, 5], expect: [[5, 1, 2430,
        "Interface 'Employee' incorrectly extends interface 'Base'. Types of property 'id' are incompatible. Type 'number' is not assignable to type 'string'."]]},
      {name: "intersection-conflict", fence: [6, 7], after: `type Impossible = Expect<Equal<Employee["id"], never>>;`,
        expect: [[7, 2, 2322, "Type 'string' is not assignable to type 'never'"]]},
      {name: "intersection-composition", fence: [8, 9]},
      {name: "express-global-augmentation", fence: 10, separate: true, after: `
app.get("/profile", (req) => {
  type Augmented = Expect<Equal<typeof req.user, AuthenticatedUser | undefined>>;
});`},
      // The prose claims augmenting only the Request exported by "express" misses handler parameters.
      {name: "express-exported-request-only", fence: 10, separate: true, after: `
import type * as core from "express-serve-static-core";
declare module "express" {
  interface Request<P = core.ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = core.Query,
    Locals extends Record<string, any> = Record<string, any>> { exportedOnly?: string }
}
app.get("/profile", (req) => req.exportedOnly);`, expect: [["after", 7, 2339]]},
      {name: "global-interface-merge", fence: 11, separate: true, after: `
type Merged = Expect<Equal<User, { id: string; name: string; email: string; role: "admin" | "user" }>>;`},
      {name: "type-only-constructs", fence: 12, after: `
type Names = Expect<Equal<EventName, "onClick" | "onHover" | "onFocus">>;
type Unwrapped = Expect<Equal<UnwrapPromise<Promise<number>>, number>>;`},
      {name: "discriminated-state", fence: 13, before: `interface User { name: string }`},
      {name: "state-classes", fence: 14},
      {name: "state-class-use", fence: [14, 15]},
      {name: "interface-extends-props", fence: 16, before: `interface BaseProps { id: string }`},
      {name: "intersection-props", fence: 17, before: `interface BaseProps { id: string }`},
      {name: "interface-default", fence: 18},
      {name: "type-default", fence: 19},
      {name: "convention-summary", fence: 20},
    ],
  },
  "01-the-type-system/04-enums-vs-unions.md": {
    cases: [
      // Each fence below presents alternatives under one name; each is compiled on its own.
      {name: "option-a-union", fence: 1, lines: [1, 2]},
      {name: "option-b-enum", fence: 1, lines: [4, 9]},
      {name: "update-with-union", fence: 2, lines: [1, 5]},
      {name: "update-with-enum", fence: 2, lines: [7, 16]},
      {name: "union-catches-typo", fence: [{fence: 2, lines: [1, 4]}, {fence: 3, lines: [1, 5]}], expect: [[3, 4, 2345,
        `Argument of type '"activ"' is not assignable to parameter of type '"active" | "banned" | "inactive"'.`]]},
      {name: "enum-call", fence: [{fence: 2, lines: [7, 15]}, {fence: 3, lines: [7, 9]}]},
      {name: "named-union", fence: 4, edit: [["{ ... }", "{}"]]},
      {name: "const-enum-declaration", fence: 5},
      // The chapter quotes this diagnostic outside a TypeScript fence.
      {name: "ambient-const-enum-isolated", fence: 5, lines: [3, 4], options: {isolatedModules: true},
        edit: [["export const enum Status {", "import { Status } from \"./ambient-status.js\";\nexport const active = Status.Active;"]],
        files: {"ambient-status.d.ts": `export declare const enum Status {\n  Active = "active",\n  Inactive = "inactive"\n}\n`},
        expect: [[5, 4, 2748, "Cannot access ambient const enums when 'isolatedModules' is enabled.", "markdown"]]},
      {name: "numeric-reverse-mapping", fence: 6, after: `export { HttpStatus, statusName };`,
        runtime: async ({HttpStatus, statusName}) => {
          if (statusName !== "OK" || HttpStatus[404] !== "NotFound") throw new Error("reverse mapping changed");
        }},
      {name: "string-enum-no-reverse", fence: 7, expect: [[7, 6, 2551,
        "Property 'red' does not exist on type 'typeof Color'. Did you mean 'Red'?"]]},
      {name: "string-enum-runtime", fence: 21, after: `export { Color };`,
        runtime: async ({Color}) => {
          if (Color.red !== undefined || Object.keys(Color).join() !== "Red,Blue") throw new Error("string enum emitted a reverse map");
        }},
      {name: "as-const-reverse", fence: 8, after: `
type Codes = Expect<Equal<StatusCode, 200 | 404 | 500>>;
export { nameByCode };`, runtime: async ({nameByCode}) => {
          if (nameByCode[404] !== "NotFound") throw new Error("reverse object changed");
        }},
      {name: "as-const-status", fence: 9, after: `type Values = Expect<Equal<Status, "active" | "inactive" | "banned">>;`},
      {name: "value-of", fence: 10, after: `type Values = Expect<Equal<Status, "active" | "inactive" | "banned">>;`},
      {name: "union-exhaustive", fence: 11},
      {name: "enum-exhaustive", fence: 12},
      {name: "union-options-list", fence: 13},
      {name: "enum-values", fence: 14, after: `export { STATUS_OPTIONS };`, runtime: async ({STATUS_OPTIONS}) => {
          if (STATUS_OPTIONS.join() !== "active,inactive,banned") throw new Error("string enum values changed");
        }},
      {name: "object-values", fence: 15, after: `
type Options = Expect<Equal<typeof STATUS_OPTIONS, ("active" | "inactive" | "banned")[]>>;`},
      {name: "numeric-enum-values", fence: 16, after: `export { Direction };`,
        runtime: async ({Direction}) => {
          if (JSON.stringify(Object.values(Direction)) !== JSON.stringify(["Up", "Down", "Left", "Right", 0, 1, 2, 3])) {
            throw new Error("numeric enum values changed");
          }
        }},
      {name: "sdk-enum-boundary", fence: 17, expect: [[17, 17, 2345]]},
      {name: "shape-1", fence: 18},
      {name: "shape-2", fence: 19},
      {name: "shape-3", fence: 20},
    ],
  },
  "01-the-type-system/05-narrowing-strategies.md": {
    cases: [
      {name: "typeof-narrowing", fence: 1},
      {name: "loose-versus-strict-null", fence: 2, after: `
function sameNarrowing(input: string | null | undefined) {
  if (input != null) { type Loose = Expect<Equal<typeof input, string>>; }
  if (input !== null) { type Strict = Expect<Equal<typeof input, string | undefined>>; }
}`},
      {name: "typeof-instanceof-array", fence: 3},
      {name: "in-operator-prototype", fence: 4, after: `export {};`, runtime: async (_, printed) => {
        if (printed.join() !== "true,false") throw new Error(`printed ${printed}`);
      }},
      {name: "checked-predicate", fence: 5},
      {name: "lying-predicate", fence: 6, before: `type User = { id: string; email: string; displayName: string };`},
      {name: "assertion-function", fence: 7, before: `type User = { id: string; email: string; displayName: string };`},
      {name: "parse-result", fence: 8, before: `type User = { id: string; email: string; displayName: string };`},
      {name: "parse-or-throw", fence: [8, 9], before: `type User = { id: string; email: string; displayName: string };`},
      {name: "request-state-switch", fence: 10},
      {name: "parse-event", fence: [{fence: 8, lines: [1, 3]}, 10, 11]},
      {name: "zod-parser", fence: [{fence: 8, lines: [1, 3]}, 12], after: `
type Inferred = Expect<Equal<User, { id: string; email: string; displayName: string }>>;`},
      {name: "result-and-exception-reasons", fence: [8, 9, 13],
        before: `type User = { id: string; email: string; displayName: string };`, after: `export {};`,
        runtime: async (_, printed) => {
          if (printed.join("|") !== "id missing or not a string|id missing or not a string") throw new Error(`printed ${printed}`);
        }},
    ],
  },
  "01-the-type-system/06-generics-basics.md": {
    cases: [
      {name: "identity-inference", fence: 1, after: `
type Word = Expect<Equal<typeof word, "hello">>;
type Shape = Expect<Equal<typeof user, { id: string }>>;`},
      {name: "generic-round-trip", fence: 2, after: `
type Lost = Expect<Equal<typeof element, unknown>>;
type Kept = Expect<Equal<typeof name, string | null>>;`},
      {name: "unused-type-parameter", fence: 3},
      {name: "unknown-parameter", fence: 4},
      {name: "return-only-type-argument", fence: 5, after: `
type Field = Expect<Equal<typeof emailField, HTMLInputElement | null>>;`},
      {name: "constraints", fence: 6},
      {name: "constraint-keeps-fields", fence: [6, 7], after: `
type Sorted = Expect<Equal<typeof sorted, Employee[]>>;
type Flattened = Expect<Equal<typeof flattened, { name: string }[]>>;`},
      {name: "keyof-lookup", fence: 8, after: `
type Theme = Expect<Equal<typeof theme, string>>;
type Size = Expect<Equal<typeof size, number>>;`, expect: [[8, 10, 2345,
        `Argument of type '"fontsize"' is not assignable to parameter of type '"fontSize" | "telemetry" | "theme"'`]]},
      {name: "null-inference", fence: 9, expect: [[9, 12, 2345,
        "Argument of type '{ id: string; }' is not assignable to parameter of type 'null'"]]},
      {name: "explicit-type-argument", fence: [{fence: 9, lines: [1, 7]}, 10], after: `
userStore.set({ id: "u1" });
userStore.set(null);`},
      {name: "asserted-generic-return", fence: 11},
      {name: "any-to-generic-return", fence: 12},
      {name: "honest-parse", fence: 13, after: `export { result };`, runtime: async ({result}) => {
        const expected = {ok: false, reason: "retries missing or not a number", input: {retires: 3}};
        if (JSON.stringify(result) !== JSON.stringify(expected)) throw new Error(JSON.stringify(result));
      }},
      {name: "pluck", fence: [{fence: 7, lines: [1, 6]}, 14], after: `
type Departments = Expect<Equal<typeof departments, string[]>>;`},
      {name: "return-only-anti-pattern", fence: 15},
    ],
  },
};

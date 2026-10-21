// Editorial checks for inline claims and Additional Takes; not part of the book-suite totals.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../..');
const { compile, version } = require(path.join(root, 'checks/compiler.cjs'));
const manuscript = fs.readFileSync(path.join(root, 'book/01-the-type-system/06-generics-basics.md'), 'utf8');
const fences = [...manuscript.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(m => m[1]);
assert.equal(fences.length, 15);
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'ch6-inline-'));
const equal = 'type Equal<A,B> = (<T>()=>T extends A ? 1:2) extends (<T>()=>T extends B ? 1:2) ? true:false; type Expect<T extends true> = T;';
function check(name, source, expected = []) {
  const file = path.join(scratch, name + '.ts');
  fs.writeFileSync(file, source + '\nexport {};\n');
  const result = compile([file], {outDir: path.join(scratch, 'out')}, scratch);
  assert.deepEqual(result.diagnostics.map(d => d.code), expected, result.output);
  assert.equal(result.status === 0, expected.length === 0, result.output);
  return result;
}
const route = manuscript.match(/`(function routes<const T extends readonly string\[\]>\(paths: T\): T)`/)[1];
check('literal-routes', 'declare ' + route + ';\n' + 'declare ' + route.replace('function routes<const T', 'function ordinary<T') + ';\n' + `
const precise = routes(['/home', '/about']);
const ordinaryResult = ordinary(['/home', '/about']);
${equal}
type Precise = Expect<Equal<typeof precise, readonly ['/home','/about']>>;
type Wide = Expect<Equal<typeof ordinaryResult, string[]>>;
`);
const fallback = manuscript.match(/`(function setDefault<T extends string>\(values: T\[\], fallback: NoInfer<T>\))`/)[1];
const fallbackCall = '\nsetDefault(["red", "green"], "red");\nsetDefault(["red", "green"], "blue");\n';
check('fallback-excluded', 'declare ' + fallback + ': void;\n' + fallbackCall, [2345]);
check('fallback-contributes', 'declare ' + fallback.replace('NoInfer<T>', 'T') + ': void;\n' + fallbackCall);
// Keep the call and function name fixed while changing only the sort signature.
const sorter = fences[5].slice(fences[5].indexOf('function sortByName'));
const employee = fences[6].split('\n')[0];
const caller = employee + `
const team: Employee[] = [{name:'Ada', department:'Infra'}];
const sorted = sortEmployees(team);
${equal}
type Kept = Expect<Equal<typeof sorted, Employee[]>>;
`;
check('concrete-sort-caller', sorter.replace('sortByName<T extends { name: string }>(items: T[]): T[]', 'sortEmployees(items: Employee[]): Employee[]') + '\n' + caller);
check('generalized-sort-caller', sorter.replace('sortByName', 'sortEmployees') + '\n' + caller + '\nsortEmployees([{name:"Ada"}]);');
const parser = manuscript.match(/`(function parseWith<T>\(input: string, parse: \(value: unknown\) => ParseResult<T>\): ParseResult<T>)`/)[1];
check('parser-argument', fences[12] + '\n' + parser + ` {
  const raw: unknown = JSON.parse(input);
  return parse(raw);
}
export const accepted = parseWith('{"retries":3}', parseRetryConfig);
export const rejected = parseWith('{"retires":3}', parseRetryConfig);
export const malformed = () => parseWith('not json', parseRetryConfig);
${equal}
type Output = Expect<Equal<typeof accepted, ParseResult<RetryConfig>>>;
`);
const parsed = require(path.join(scratch, 'out', 'parser-argument.js'));
assert.deepEqual(parsed.accepted, {ok:true, value:{retries:3}});
assert.deepEqual(parsed.rejected, {ok:false, reason:'retries missing or not a number', input:{retires:3}});
// The signature relates types; it does not promise to catch JSON syntax failures.
assert.throws(parsed.malformed, SyntaxError);
console.log(JSON.stringify({typescript:version, compilerProbes:6, runtimeGroups:1, status:'PASS', scratch}, null, 2));

// Editorial probes for the inline claims added in draft 2; separate from the book suite.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../..');
const { compile, version } = require(path.join(root, 'checks/compiler.cjs'));
const manuscript = fs.readFileSync(path.join(root, 'book/01-the-type-system/05-narrowing-strategies.md'), 'utf8');
const fences = [...manuscript.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(m => m[1]);
assert.equal(fences.length, 13);
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'ch5-inline-'));
fs.symlinkSync(path.join(root, 'node_modules'), path.join(scratch, 'node_modules'), 'dir');
function run(name, source) {
  const file = path.join(scratch, name + '.ts');
  fs.writeFileSync(file, source);
  const result = compile([file], {outDir:path.join(scratch, 'out')}, scratch);
  assert.equal(result.status, 0, result.output);
  return require(path.join(scratch, 'out', name + '.js'));
}
const predicate = manuscript.match(/`(const isUser = \(v: unknown\): v is User => parseUser\(v\)\.ok)`/)[1];
const filtered = run('predicate', fences[4].split('\n\nfunction isUser')[0] + '\n' + fences[7] + '\n' + predicate + `;
export const good = {id:'1', email:'plain string', displayName:'Ada', extra:true};
const inputs: unknown[] = [good, null, {id:42,email:'e',displayName:'A'}, {id:'1',email:'e'}];
export const users = inputs.filter(isUser);
type Equal<A,B> = (<T>()=>T extends A ? 1:2) extends (<T>()=>T extends B ? 1:2) ? true:false;
const inferred: Equal<typeof users, User[]> = true;
`);
assert.deepEqual(filtered.users, [filtered.good]);
assert.equal(filtered.users[0], filtered.good);
const schema = run('schema', fences[7].split('\n\nfunction parseUser')[0] + '\n' + fences[11] + '\nexport { parseUser };');
const failed = schema.parseUser({id:42,email:'ada@example.com',displayName:'Ada'});
assert.equal(failed.ok, false);
const issues = JSON.parse(failed.reason);
assert(Array.isArray(issues));
assert.deepEqual(issues[0].path, ['id']);
console.log(JSON.stringify({typescript:version, compilerProbes:2, runtimeGroups:2, status:'PASS', scratch}, null, 2));

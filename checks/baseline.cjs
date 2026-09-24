// Keep claims about compiler defaults separate from our explicit fixture options.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert/strict");
const {compile, describe, version} = require("./compiler.cjs");
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "ts-book-defaults-"));
try {
  const file = path.join(scratch, "defaults.ts");
  fs.writeFileSync(file, `export {};
function echo(value) { return value; }
try { throw "failure"; } catch (error) { error.message; }
const optional: {email?: string} = {email: undefined};
const items: string[] = [];
const first: string = items[0];
`);
  const options = {
    noEmit: true,
    strict: undefined,
    exactOptionalPropertyTypes: undefined,
    target: undefined,
    module: undefined,
    moduleResolution: undefined,
    types: undefined,
  };
  const defaults = compile([file], options, scratch);
  assert.deepEqual(defaults.diagnostics.map(d => d.code).sort(), [7006, 18046].sort(),
    describe(defaults.diagnostics));
  const disabled = compile([file], {...options, strict: false}, scratch);
  assert.equal(disabled.diagnostics.length, 0, describe(disabled.diagnostics));
  console.log(JSON.stringify({typescript: version, baselineCases: 2,
    verifiedDefaults: {strict: true, exactOptionalPropertyTypes: false, noUncheckedIndexedAccess: false}}, null, 2));
} finally {
  fs.rmSync(scratch, {recursive: true, force: true});
}

'use strict';
// One evolving repository follows the story. Separate controls are explicitly marked below.
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const cp = require('node:child_process'), assert = require('node:assert/strict');
const {version, defaults} = require('./compiler.cjs');
const text = fs.readFileSync(path.resolve(__dirname, '../book/04-the-real-world/02-monorepo-type-sharing.md'), 'utf8');
const fences = [...text.matchAll(/```(typescript|json)\n([\s\S]*?)\n```/g)].map(m => ({language:m[1], body:m[2]}));
const used = new Set();
function block(prefix) {
  const found = fences.map((f,i) => ({...f,i})).filter(f => f.body.startsWith(prefix));
  assert.equal(found.length, 1, prefix); used.add(found[0].i); return found[0].body+'\n';
}
function files(source) {
  const result = {}; let name;
  for (const line of source.split('\n')) {
    const label = line.match(/^\/\/ ((?:packages|apps|generated)\/[\w/.-]+\.ts)(?:\s.*)?$/);
    if (label) { name=label[1]; assert(!result[name]); result[name]=''; }
    else if (name) result[name]+=line+'\n';
    else assert(!line.trim(), line);
  }
  return result;
}
function replace(s,a,b) { assert.equal(s.split(a).length,2,'Unique replacement: '+a); return s.replace(a,b); }
const manifest=JSON.parse(block('{\n  "name"'));
const initial=files(block('// packages/money/src/index.ts\n'));
const parser=files(block('// packages/money/src/parse.ts'));
const apiConfig=JSON.parse(block('{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "Node16",\n    "types": [],\n    "strict": true,\n    "noEmitOnError"'));
const incident=files(block('// apps/api/src/main.ts — Idan'));
const assertion=files(block('// apps/api/src/main.ts — replace the console'));
const lines=files(block('// apps/api/src/order-line.ts'));
const repair=files(block('// packages/money/src/index.ts — add'));
const formatter=files(block('// packages/money/src/index.ts — replace'));
const references=JSON.parse(block('[\n  { "path"'));
const conditional=JSON.parse(block('{\n  "."'));
const devBase=JSON.parse(block('{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "Node16",\n    "types": [],\n    "strict": true,\n    "noEmit": true'));
const devConfigMatch=text.match(/tsconfig\.dev\.json` contains `([^`]+)`/);
assert(devConfigMatch,'Printed dev extender'); const devConfig=JSON.parse(devConfigMatch[1]);
const rootMode=text.match(/repository root and all three packages have `([^`]+)` in their manifests/);
assert(rootMode,'Root module mode must be on the page');
const moduleManifest=JSON.parse('{'+rootMode[1]+'}');
assert.deepEqual(moduleManifest,{type:'module'});
const newCall=files(block('// apps/api/src/main.ts — update'));
assert.equal(used.size,fences.length,'Every fence extracted'); assert.equal(fences.length,13);
const money='packages/money/src/index.ts', main='apps/api/src/main.ts';
const oldFormat='format(): string { return `$${(this.#cents / 100).toFixed(2)}`; }';
const oldLog='console.log(buildId, amount.plus(shipping()).format());';
const sourceImport='import { parseMoney } from "../../../packages/money/src/parse.js";';
const publicMain=replace(incident[main],sourceImport,repair[main].trim());
const publicMoney=initial[money]+repair[money];
const currentMoney=replace(publicMoney,oldFormat,formatter[money].trim());
const currentMain=replace(publicMain,oldLog,newCall[main].trim());
assert(text.includes('"references": [{ "path": "../money" }]'));
assert(text.includes('three relative imports'));
assert(text.includes('only one failing call'));
assert(text.includes('already-emitted JavaScript'));
assert(text.includes('remove money\'s `dist`, cart\'s `dist`, the API\'s `out` and the build metadata'));
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'ts-book-ch25-'));
const executable=path.join(path.dirname(require.resolve('typescript/package.json')),'bin/tsc');
const results=[]; let cases=0, groups=0, queries=0;
function write(root,file,value) {
  const target=path.join(root,file); fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,typeof value==='string'?value:JSON.stringify(value,null,2));
}
function read(root,file) { return fs.readFileSync(path.join(root,file),'utf8'); }
function installFiles(root,table) { for(const [file,source] of Object.entries(table)) write(root,file,source); }
function config(root,file,value) { write(root,file,{...value,compilerOptions:{...defaults,...value.compilerOptions}}); }
function links(root) {
  fs.mkdirSync(path.join(root,'node_modules/@shop'),{recursive:true});
  for(const name of ['money','cart']) fs.symlinkSync('../../packages/'+name,path.join(root,'node_modules/@shop',name));
}
function clone(name,from) {
  const root=path.join(scratch,name);
  fs.cpSync(from,root,{recursive:true,preserveTimestamps:true,filter:p=>path.basename(p)!=='node_modules'}); links(root); return root;
}
function command(name,root,args,status) {
  const r=cp.spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',timeout:60000,maxBuffer:10*1024*1024});
  if(r.error) throw r.error;
  const output=r.stdout+r.stderr;
  results.push({name,root,args,status:r.status,stdout:r.stdout,stderr:r.stderr});
  fs.writeFileSync(path.join(scratch,'RESULTS.json'),JSON.stringify(results,null,2));
  assert.equal(r.status,status,name+'\n'+output); return {output,stdout:r.stdout,stderr:r.stderr};
}
function check(name,root,project,codes=[],mode='-p',location) {
  // All printed configurations retain noEmitOnError:true. Error cases do not emit.
  const r=command(name,root,[executable,mode,project,'--pretty','false',...(mode==='-p'?['--noErrorTruncation']:[])],codes.length?1:0);
  const actual=[...r.output.matchAll(/error TS(\d+):/g)].map(m=>+m[1]).sort();
  assert.deepEqual(actual,[...codes].sort(),name+'\n'+r.output);
  if(location) {
    const [file,needle,code]=location;
    const lines=read(root,file).split('\n').flatMap((s,i)=>s.includes(needle)?[i+1]:[]);
    assert.equal(lines.length,1,'Diagnostic source anchor '+needle);
    assert(r.output.includes(`${file}(${lines[0]},`),name+' diagnostic location');
    assert(r.output.includes(`error TS${code}:`));
  }
  cases++; return r.output;
}
function run(name,root,expected,args=['apps/api/out/apps/api/src/main.js']) {
  const r=command(name,root,args,0); assert.equal(r.stdout.trim(),expected,name); groups++; return r;
}
function fails(name,root,needle,args=['apps/api/out/apps/api/src/main.js']) {
  const r=command(name,root,args,1); assert(r.output.includes(needle),name+'\n'+r.output); groups++; return r;
}
function list(name,root,project) {
  queries++; return command(name,root,[executable,'-p',project,'--listFilesOnly'],0).output;
}
function graph(root) {
  config(root,'packages/cart/tsconfig.json',{...JSON.parse(read(root,'packages/cart/tsconfig.json')),references:[{path:'../money'}]});
  config(root,'apps/api/tsconfig.json',{...apiConfig,references});
}
function dev(root) {
  for(const name of ['money','cart']) write(root,`packages/${name}/package.json`,{...manifest,name:'@shop/'+name,exports:conditional});
  config(root,'tsconfig.dev-base.json',devBase); write(root,'apps/api/tsconfig.dev.json',devConfig);
}
function clean(root) {
  for(const dir of ['packages/money/dist','packages/cart/dist','apps/api/out']) fs.rmSync(path.join(root,dir),{recursive:true,force:true});
  function visit(dir) { for(const e of fs.readdirSync(dir,{withFileTypes:true})) {
    if(e.isSymbolicLink()||e.name==='node_modules') continue;
    const p=path.join(dir,e.name); if(e.isDirectory()) visit(p); else if(e.name.endsWith('.tsbuildinfo')) fs.rmSync(p);
  }} visit(root);
}
function changed(root) {
  write(root,money,currentMoney);
  // Force an out-of-date input even on a filesystem with coarse timestamps; not a time measurement.
  const future=new Date(Date.now()+2000); fs.utimesSync(path.join(root,money),future,future);
}
// Narrative states: no copied output/metadata is used to establish a stale-build result.
const story=path.join(scratch,'story'); fs.mkdirSync(story);
write(story,'package.json',moduleManifest); links(story);
installFiles(story,{...initial,...parser,...lines});
write(story,'apps/api/package.json',moduleManifest);
for(const name of ['money','cart']) {
  write(story,`packages/${name}/package.json`,{...manifest,name:'@shop/'+name});
  config(story,`packages/${name}/tsconfig.json`,{compilerOptions:{composite:true,rootDir:'src',outDir:'dist'},include:['src']});
  check('story-initial-build-'+name,story,`packages/${name}`);
}
config(story,'apps/api/tsconfig.json',apiConfig);
check('story-working-stamped-quote',story,'apps/api');
run('story-working-total',story,'release-42 $15.00');
// Type-only source imports already emit a second Money. Observe module execution separately.
const openingCopies=['apps/api/out/packages/money/src/index.js','packages/money/dist/index.js'];
assert.deepEqual(moneyImplementations(story),openingCopies);
const openingBodies=Object.fromEntries(openingCopies.map(f=>[f,read(story,f)]));
try {
 for(const [file,body] of Object.entries(openingBodies)) {
  write(story,file,`(globalThis.__ch25LoadedMoney ??= []).push(${JSON.stringify(file)});\n`+body);
 }
 run('opening-emits-two-loads-only-built-Money',story,
  'release-42 $15.00\n["packages/money/dist/index.js"]',
  ['--input-type=module','-e','await import("./apps/api/out/apps/api/src/main.js"); console.log(JSON.stringify(globalThis.__ch25LoadedMoney));']);
} finally { installFiles(story,openingBodies); }
// This seed is only for counterfactual controls, never for narrative freshness claims.
const seed=clone('control-seed',story);
installFiles(story,incident);
const diagnostic=check('story-two-Money-declarations',story,'apps/api',[2741],'-p',[main,oldLog,2741]);
assert(diagnostic.includes("Property '#cents' is missing in type 'import(\""));
assert(diagnostic.includes('/money/dist/index").Money\' but required in type \'import("'));
assert(diagnostic.includes('/money/src/index").Money\'.'));
for(const quoted of ["Property '#cents' is missing in type",'but required in type']) assert(text.includes(quoted));
// Gil's census includes the two existing type-only imports, not newly invented scratch files.
const sourceImports=Object.entries({...incident,...lines}).flatMap(([file,body])=>
 body.split('\n').filter(l=>l.startsWith('import ')&&l.includes('../../../packages/money/src/')).map(line=>({file,line})));
assert.equal(sourceImports.length,3); assert.equal(sourceImports.filter(x=>x.line.startsWith('import type ')).length,2);
assert.deepEqual(sourceImports.map(x=>x.file).sort(),[main,...Object.keys(lines)].sort());
write(story,main,replace(incident[main],oldLog,assertion[main].trim()));
check('story-laptop-assertion-compiles',story,'apps/api');
const stack=fails('story-native-private-slot-crash',story,'TypeError: Cannot read private member #cents from an object whose class did not declare it');
assert(text.includes('TypeError: Cannot read private member #cents from an object whose class did not declare it'));
assert(stack.output.includes('apps/api/out/packages/money/src/index.js'));
assert(!stack.output.includes('packages/money/dist/index.js'),'Stack does not identify the supplier');
function moneyImplementations(root) {
 const found=[];
 function visit(dir) { for(const e of fs.readdirSync(dir,{withFileTypes:true})) {
  if(e.isSymbolicLink()) continue;
  const f=path.join(dir,e.name); if(e.isDirectory()) visit(f);
  else if(e.name.endsWith('.js')&&fs.readFileSync(f,'utf8').includes('class Money')) found.push(path.relative(root,f));
 }} visit(root); return found.sort();
}
assert.deepEqual(moneyImplementations(story),['apps/api/out/packages/money/src/index.js','packages/money/dist/index.js']);
// Repair all three imports in this same tree. No implicit cleanup of previous output.
write(story,money,publicMoney); write(story,main,publicMain);
for(const [file,body] of Object.entries(lines)) write(story,file,replace(body,'../../../packages/money/src/index.js','@shop/money'));
for(const project of ['packages/money','packages/cart','apps/api']) check('story-public-repair-'+project,story,project);
run('story-public-parser-same-total',story,'release-42 $15.00');
assert.equal(moneyImplementations(story).length,2,'tsc did not delete old output');
changed(story);
check('story-plain-p-reads-old-declarations',story,'apps/api');
check('story-build-without-edges-also-stale',story,'apps/api',[],'-b');
graph(story);
const arity=check('story-real-graph-catches-new-arity',story,'apps/api',[2554],'-b',[main,oldLog,2554]);
assert(arity.includes('Expected 1 arguments, but got 0.')); assert(text.includes('Expected 1 arguments, but got 0.'));
write(story,main,currentMain);
check('story-fixed-call-dependency-build',story,'apps/api',[],'-b');
run('story-rebuilt-label',story,'release-42 USD 15.00');
dev(story);
check('story-source-dev-check',story,'apps/api/tsconfig.dev.json');
// The one fresh-checkout demonstration copies tracked inputs only. No output or metadata is copied.
const fresh=path.join(scratch,'fresh-checkout');
fs.cpSync(story,fresh,{recursive:true,filter:p=> !['node_modules','dist','out'].includes(path.basename(p))&&!p.endsWith('.tsbuildinfo')});
links(fresh);
assert(text.includes('The release stamp is committed.'));
assert.equal(read(fresh,'generated/release.ts'),initial['generated/release.ts']);
for(const p of ['money','cart']) assert.equal(fs.realpathSync(path.join(fresh,'node_modules/@shop',p)),fs.realpathSync(path.join(fresh,'packages',p)));
assert.equal(moneyImplementations(fresh).length,0);
for(const p of ['money','cart']) assert(!fs.existsSync(path.join(fresh,'packages',p,'dist')));
check('fresh-checkout-source-check-before-any-build',fresh,'apps/api/tsconfig.dev.json');
const sourceFiles=list('fresh-source-check-file-list',fresh,'apps/api/tsconfig.dev.json');
for(const p of ['money','cart']) { assert(sourceFiles.includes(`/packages/${p}/src/index.ts`)); assert(!sourceFiles.includes(`/packages/${p}/dist/`)); }
// Experimental branch: change tracked files IN PLACE, leaving the already-emitted API intact.
const branchFiles=['packages/money/package.json','packages/cart/package.json',money,'packages/money/src/parse.ts','tsconfig.dev-base.json'];
const saved=Object.fromEntries(branchFiles.map(f=>[f,read(story,f)]));
for(const p of ['money','cart']) write(story,`packages/${p}/package.json`,{...manifest,name:'@shop/'+p,exports:{'.':{...conditional['.'],default:'./src/index.ts'}}});
for(const f of [money,'packages/money/src/parse.ts']) write(story,f,read(story,f).replaceAll('./parse.js','./parse.ts').replaceAll('./index.js','./index.ts'));
config(story,'tsconfig.dev-base.json',{...devBase,compilerOptions:{...devBase.compilerOptions,allowImportingTsExtensions:true}});
assert(text.includes('`allowImportingTsExtensions` goes in the dev base on this branch'));
assert.equal(JSON.parse(read(story,'tsconfig.dev-base.json')).compilerOptions.allowImportingTsExtensions,true);
check('story-raw-branch-noEmit-with-ts-extensions',story,'apps/api/tsconfig.dev.json');
run('story-linked-source-runtime-wins',story,'release-42 USD 15.00');
function deployment(name,from,source) {
 const r=path.join(scratch,name); assert(!fs.existsSync(r),'Each image uses a fresh layout');
 write(r,'package.json',read(from,'apps/api/package.json'));
 fs.cpSync(path.join(from,'apps/api/out'),path.join(r,'api-out'),{recursive:true});
 for(const p of ['money','cart']) {
  const dest=`node_modules/@shop/${p}`;
  if(source) fs.cpSync(path.join(from,`packages/${p}`),path.join(r,dest),{recursive:true});
  else {
   write(r,dest+'/package.json',read(from,`packages/${p}/package.json`));
   fs.cpSync(path.join(from,`packages/${p}/dist`),path.join(r,dest,'dist'),{recursive:true});
  }
 }
 return r;
}
const sourceDeploy=deployment('story-copied-source-image',story,true);
const refusal=fails('story-image-refuses-type-stripping',sourceDeploy,'ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING',['api-out/apps/api/src/main.js']);
assert.equal(refusal.stdout,''); assert(refusal.output.includes('node_modules/@shop/money/src/index.ts'));
// Return from the branch; runtime defaults and internal imports are restored, not the old source.
installFiles(story,saved);
assert(text.includes('removing `allowImportingTsExtensions` from the dev base'));
for(const [file,body] of Object.entries(saved)) assert.equal(read(story,file),body);
assert.equal(JSON.parse(read(story,'tsconfig.dev-base.json')).compilerOptions.allowImportingTsExtensions,undefined);
assert.equal(read(story,money),currentMoney);
assert.equal(moneyImplementations(story).length,2,'old API source-copy output still exists before cleanup');
clean(story);
assert.equal(moneyImplementations(story).length,0);
check('story-clean-release-build-through-real-graph',story,'apps/api',[],'-b');
assert.deepEqual(moneyImplementations(story),['packages/money/dist/index.js']);
assert(!fs.existsSync(path.join(story,'apps/api/out/packages')));
const builtFiles=list('release-check-file-list',story,'apps/api');
for(const p of ['money','cart']) assert(builtFiles.includes(`/packages/${p}/dist/index.d.ts`));
assert(text.includes('into a fresh image layout'));
const builtDeploy=deployment('story-clean-built-image',story,false);
run('story-copied-built-release',builtDeploy,'release-42 USD 15.00',['api-out/apps/api/src/main.js']);
for(const p of ['money','cart']) assert(!fs.existsSync(path.join(builtDeploy,`node_modules/@shop/${p}/src`)));
assert(!fs.existsSync(path.join(builtDeploy,'api-out/packages')));
assert.deepEqual(moneyImplementations(builtDeploy),['node_modules/@shop/money/dist/index.js']);

// Counterfactual controls below are not presented as extra copies in the narrative.
const noRoot=clone('control-missing-root-module-mode',seed);
write(noRoot,'package.json',{});
check('missing-root-mode-still-compiles',noRoot,'apps/api');
assert(read(noRoot,'apps/api/out/generated/release.js').includes('exports.buildId'));
fails('missing-root-mode-breaks-opening',noRoot,"does not provide an export named 'buildId'");
const deep=clone('control-unexported-subpath',seed);
write(deep,main,replace(incident[main],sourceImport,'import { parseMoney } from "@shop/money/src/parse.js";'));
check('package-map-rejects-internal-parser',deep,'apps/api',[2307],'-p',[main,'@shop/money/src/parse.js',2307]);
fails('node-map-rejects-subpath',deep,'ERR_PACKAGE_PATH_NOT_EXPORTED',['--input-type=module','-e','import("@shop/money/src/parse.js")']);
const subpath=clone('control-public-subpath',story);
write(subpath,'packages/money/package.json',{...manifest,exports:{...manifest.exports,'./parse':{types:'./dist/parse.d.ts',default:'./dist/parse.js'}}});
write(subpath,main,replace(currentMain,'from "@shop/money"','from "@shop/money/parse"'));
check('public-subpath-same-Money',subpath,'apps/api'); run('public-subpath-total',subpath,'release-42 USD 15.00');
run('parser-produces-or-refuses',story,'USD 10.00 true true true true',['--input-type=module','-e',
 'import {parseMoney} from "@shop/money"; console.log(parseMoney(1000).format("USD"), ...["1000",1.5,-1,Number.MAX_SAFE_INTEGER+1].map(v=>parseMoney(v)===undefined));']);
const same=clone('control-two-spellings-one-declaration',seed);
write(same,main,'import {Money as A} from "@shop/money"; import {Money as B} from "../../../packages/money/dist/index.js"; const b:B=new A(100); console.log(A===B,new B(10).plus(b).format());');
check('two-spellings-one-declaration',same,'apps/api'); run('same-constructor',same,'true $1.10',[main]);
const alias=clone('control-paths-unifies-types-only',seed); installFiles(alias,incident);
config(alias,'apps/api/tsconfig.json',{...apiConfig,compilerOptions:{...apiConfig.compilerOptions,paths:{'@shop/money':['../../packages/money/src/index.ts']}}});
check('paths-hides-the-type-split',alias,'apps/api'); fails('paths-keeps-runtime-split',alias,'Cannot read private member #cents');
for(const kind of ['public','private']) {
 const r=clone('control-'+kind+'-fields',seed); installFiles(r,incident);
 let m=initial[money].replaceAll('#cents','cents');
 if(kind==='private') m=replace(m,'  cents: number;','  private cents: number;');
 write(r,money,m);
 for(const p of ['money','cart']) check(kind+'-rebuild-'+p,r,'packages/'+p);
 check(kind+'-two-declarations',r,'apps/api',kind==='private'?[2345]:[]);
 if(kind==='private') {
  write(r,main,replace(incident[main],oldLog,assertion[main].trim()));
  check('TS-private-assertion-compiles',r,'apps/api');
 }
 run(kind+'-fields-no-native-slot-crash',r,'release-42 $15.00');
}
const implicitRoot=clone('control-implicit-root',seed);
write(implicitRoot,main,replace(incident[main],oldLog,assertion[main].trim()));
const withoutRoot=structuredClone(apiConfig); delete withoutRoot.compilerOptions.rootDir;
config(implicitRoot,'apps/api/tsconfig.json',withoutRoot); check('implicit-root-separate-diagnostic',implicitRoot,'apps/api',[5011]);
console.log(JSON.stringify({typescript:version,node:process.version,fences:fences.length,compilerCases:cases,runtimeGroups:groups,fileListQueries:queries,scratch},null,2));
console.log('Chapter 25: PASS');

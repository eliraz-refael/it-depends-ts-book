'use strict';
// A repository per timeline/control. Printed files and replacement excerpts are extracted below.
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
const lineCheck=files(block('// apps/api/src/line-check.ts'));
const repair=files(block('// packages/money/src/index.ts — add'));
const formatter=files(block('// packages/money/src/index.ts — replace'));
const references=JSON.parse(block('[\n  { "path"'));
const conditional=JSON.parse(block('{\n  "."'));
const devBase=JSON.parse(block('{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "Node16",\n    "types": [],\n    "strict": true,\n    "noEmit": true'));
const devConfig=JSON.parse(block('{\n  "extends"'));
const newCall=files(block('// apps/api/src/main.ts — update'));
assert.equal(used.size,fences.length,'Every fence extracted'); assert.equal(fences.length,14);
const money='packages/money/src/index.ts', main='apps/api/src/main.ts';
const oldFormat='format(): string { return `$${(this.#cents / 100).toFixed(2)}`; }';
const oldLog='console.log(buildId, amount.plus(shipping()).format());';
const sourceImport='import { parseMoney } from "../../../packages/money/src/parse.js";';
const publicMain=replace(incident[main],sourceImport,repair[main].trim());
const publicMoney=initial[money]+repair[money];
const currentMoney=replace(publicMoney,oldFormat,formatter[money].trim());
const currentMain=replace(publicMain,oldLog,newCall[main].trim());
assert(text.includes('"references": [{ "path": "../money" }]'));
assert(text.includes('removes its scratch file'));
assert(text.includes('original emitting config the source condition'));
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
  fs.cpSync(from,root,{recursive:true,filter:p=>path.basename(p)!=='node_modules'}); links(root); return root;
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
const base=path.join(scratch,'baseline'); fs.mkdirSync(base); write(base,'package.json',{type:'module'}); links(base);
installFiles(base,{...initial,...parser}); write(base,'apps/api/package.json',{type:'module'});
for(const name of ['money','cart']) {
  write(base,`packages/${name}/package.json`,{...manifest,name:'@shop/'+name});
  config(base,`packages/${name}/tsconfig.json`,{compilerOptions:{composite:true,rootDir:'src',outDir:'dist'},include:['src']});
  check('initial-build-'+name,base,`packages/${name}`);
}
config(base,'apps/api/tsconfig.json',apiConfig);
check('working-stamped-quote',base,'apps/api'); run('working-total',base,'release-42 $15.00');
const broken=clone('relative-parser',base); installFiles(broken,incident);
const diagnostic=check('two-Money-declarations',broken,'apps/api',[2741],'-p',[main,oldLog,2741]);
assert(diagnostic.includes("Property '#cents' is missing in type 'import(\""));
assert(diagnostic.includes('/money/dist/index").Money\' but required in type \'import("'));
assert(diagnostic.includes('/money/src/index").Money\'.'));
for(const quoted of ["Property '#cents' is missing in type",'but required in type']) assert(text.includes(quoted));
const deep=clone('unexported-subpath',broken);
write(deep,main,replace(incident[main],sourceImport,'import { parseMoney } from "@shop/money/src/parse.js";'));
check('package-map-rejects-internal-parser',deep,'apps/api',[2307],'-p',[main,'@shop/money/src/parse.js',2307]);
fails('node-map-rejects-subpath',deep,'ERR_PACKAGE_PATH_NOT_EXPORTED',['--input-type=module','-e','import("@shop/money/src/parse.js")']);
const asserted=clone('double-assertion',broken);
write(asserted,main,replace(incident[main],oldLog,assertion[main].trim()));
check('laptop-assertion-compiles',asserted,'apps/api');
const stack=fails('native-private-slot-crash',asserted,'TypeError: Cannot read private member #cents from an object whose class did not declare it');
assert(text.includes('TypeError: Cannot read private member #cents from an object whose class did not declare it'));
assert(stack.output.includes('apps/api/out/packages/money/src/index.js'));
assert(!stack.output.includes('packages/money/dist/index.js'),'Stack does not identify the supplier');
for(const file of ['apps/api/out/packages/money/src/index.js','packages/money/dist/index.js']) assert(fs.existsSync(path.join(asserted,file)));
const structural=clone('structural-line',base);
write(structural,main,lineCheck['apps/api/src/line-check.ts']); check('Line-compatible-across-declarations',structural,'apps/api');
const fixed=clone('public-parser',base); write(fixed,money,publicMoney); write(fixed,main,publicMain);
for(const p of ['packages/money','packages/cart','apps/api']) check('public-repair-build-'+p,fixed,p);
run('public-parser-same-total',fixed,'release-42 $15.00');
assert(!fs.existsSync(path.join(fixed,'apps/api/out/packages/money/src/index.js')));
run('parser-produces-or-refuses',fixed,'$10.00 true true true true',['--input-type=module','-e',
 'import {parseMoney} from "@shop/money"; console.log(parseMoney(1000).format(), ...["1000",1.5,-1,Number.MAX_SAFE_INTEGER+1].map(v=>parseMoney(v)===undefined));']);
const subpath=clone('public-subpath',fixed);
write(subpath,'packages/money/package.json',{...manifest,exports:{...manifest.exports,'./parse':{types:'./dist/parse.d.ts',default:'./dist/parse.js'}}});
write(subpath,main,replace(publicMain,'from "@shop/money"','from "@shop/money/parse"'));
check('public-subpath-same-Money',subpath,'apps/api'); run('public-subpath-total',subpath,'release-42 $15.00');
const stale=clone('stale-artifacts',fixed); changed(stale);
check('plain-p-reads-old-declarations',stale,'apps/api');
check('build-without-edges-also-stale',stale,'apps/api',[],'-b');
const graphCopy=clone('reference-graph-in-copy',stale); graph(graphCopy);
const arity=check('dependency-build-catches-new-arity',graphCopy,'apps/api',[2554],'-b',[main,oldLog,2554]);
assert(arity.includes('Expected 1 arguments, but got 0.')); assert(text.includes('Expected 1 arguments, but got 0.'));
dev(stale);
check('source-check-finds-new-arity',stale,'apps/api/tsconfig.dev.json',[2554],'-p',[main,oldLog,2554]);
const fresh=clone('source-check-without-any-output',stale); clean(fresh);
for(const p of ['money','cart']) assert(!fs.existsSync(path.join(fresh,'packages',p,'dist')));
check('clean-source-check-finds-new-arity',fresh,'apps/api/tsconfig.dev.json',[2554]);
const sourceFiles=list('clean-source-check-file-list',fresh,'apps/api/tsconfig.dev.json');
for(const p of ['money','cart']) { assert(sourceFiles.includes(`/packages/${p}/src/index.ts`)); assert(!sourceFiles.includes(`/packages/${p}/dist/`)); }
write(fresh,main,currentMain); check('clean-source-check-with-correct-argument',fresh,'apps/api/tsconfig.dev.json');
write(stale,main,currentMain); check('source-check-with-old-output-and-correct-argument',stale,'apps/api/tsconfig.dev.json');
config(stale,'apps/api/laptop.json',{...apiConfig,compilerOptions:{...apiConfig.compilerOptions,customConditions:['@shop/source']}});
check('laptop-source-typed-emit',stale,'apps/api/laptop.json');
assert(read(stale,'apps/api/out/apps/api/src/main.js').includes('from "@shop/money"'));
run('live-types-stale-default-runtime',stale,'release-42 $15.00');
graph(stale); check('release-build-with-edges',stale,'apps/api',[],'-b');
run('rebuilt-default-runtime',stale,'release-42 USD 15.00');
const builtFiles=list('release-check-file-list',stale,'apps/api');
for(const p of ['money','cart']) assert(builtFiles.includes(`/packages/${p}/dist/index.d.ts`));
// Strong final combination also builds from no artifacts, not merely the repaired incremental state.
graph(fresh); check('release-build-from-empty-outputs',fresh,'apps/api',[],'-b');
run('fresh-built-runtime',fresh,'release-42 USD 15.00');
function deployment(name,from,source) {
  const r=path.join(scratch,name); write(r,'package.json',{type:'module'});
  fs.cpSync(path.join(from,'apps/api/out'),path.join(r,'api-out'),{recursive:true});
  for(const p of ['money','cart']) {
    const dest=`node_modules/@shop/${p}`; write(r,dest+'/package.json',read(from,`packages/${p}/package.json`));
    fs.cpSync(path.join(from,`packages/${p}/${source?'src':'dist'}`),path.join(r,dest,source?'src':'dist'),{recursive:true});
  }
  return r;
}
const raw=clone('raw-source-runtime',fresh);
for(const p of ['money','cart']) write(raw,`packages/${p}/package.json`,{...manifest,name:'@shop/'+p,exports:{'.':'./src/index.ts'}});
for(const f of [money,'packages/money/src/parse.ts']) write(raw,f,read(raw,f).replaceAll('./parse.js','./parse.ts').replaceAll('./index.js','./index.ts'));
run('native-Node-linked-source',raw,'release-42 USD 15.00');
const sourceDeploy=deployment('copied-source-dependencies',raw,true);
fails('native-Node-copied-source-refused',sourceDeploy,'ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING',['api-out/apps/api/src/main.js']);
const builtDeploy=deployment('copied-built-dependencies',fresh,false);
run('copied-built-release',builtDeploy,'release-42 USD 15.00',['api-out/apps/api/src/main.js']);
for(const p of ['money','cart']) assert(!fs.existsSync(path.join(builtDeploy,`node_modules/@shop/${p}/src`)));
// Unprinted controls restrict the rule: filenames and import spellings alone do not decide identity.
const same=clone('two-spellings-one-declaration',fixed);
write(same,main,'import {Money as A} from "@shop/money"; import {Money as B} from "../../../packages/money/dist/index.js"; const b:B=new A(100); console.log(A===B,new B(10).plus(b).format());');
check('two-spellings-one-declaration',same,'apps/api'); run('same-constructor',same,'true $1.10',[main]);
const alias=clone('paths-unifies-types-only',broken);
config(alias,'apps/api/tsconfig.json',{...apiConfig,compilerOptions:{...apiConfig.compilerOptions,paths:{'@shop/money':['../../packages/money/src/index.ts']}}});
check('paths-hides-the-type-split',alias,'apps/api'); fails('paths-keeps-runtime-split',alias,'Cannot read private member #cents');
for(const kind of ['public','private']) {
  const r=clone(kind+'-field-control',broken);
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
// TS5011 is a separate root configuration issue; the printed stamp configuration avoids it.
const noRoot=clone('implicit-root-control',asserted);
const withoutRoot=structuredClone(apiConfig); delete withoutRoot.compilerOptions.rootDir;
config(noRoot,'apps/api/tsconfig.json',withoutRoot); check('implicit-root-separate-diagnostic',noRoot,'apps/api',[5011]);
console.log(JSON.stringify({typescript:version,node:process.version,fences:fences.length,compilerCases:cases,runtimeGroups:groups,fileListQueries:queries,scratch},null,2));
console.log('Chapter 25: PASS');

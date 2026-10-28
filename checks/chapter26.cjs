'use strict';
// One working repository follows the page, including temporary mutations and restores.
const fs=require('node:fs'), os=require('node:os'), path=require('node:path');
const cp=require('node:child_process'), assert=require('node:assert/strict');
const {version,defaults}=require('./compiler.cjs');
const repo=path.resolve(__dirname,'..');
const manuscript=fs.readFileSync(path.join(repo,'book/04-the-real-world/03-testing-typed-code.md'),'utf8');
const fences=[...manuscript.matchAll(/```(\w+)\n([\s\S]*?)\n```/g)].map(m=>({language:m[1],body:m[2]}));
const used=new Set(), coveredDirectives=new Set();
function block(prefix) {
 const matches=fences.flatMap((f,i)=>f.body.startsWith(prefix)?[{...f,i}]:[]);
 assert.equal(matches.length,1,prefix);used.add(matches[0].i);return matches[0].body+'\n';
}
function files(source) {
 const out={};let file;
 for(const line of source.split('\n')) {
  const m=line.match(/^\/\/ ((?:src|test|test-support|type-tests)\/[\w.-]+\.ts)(?: —.*)?$/);
  if(m){file=m[1];assert(!out[file]);out[file]='';}
  else if(file)out[file]+=line+'\n';else assert(!line.trim());
 }return out;
}
function replace(s,from,to) {assert.equal(s.split(from).length,2,'Unique replacement: '+from);return s.replace(from,to);}
const orders='src/orders.ts', tests='test/ship.test.ts', rowFile='src/order-row.ts', typesFile='type-tests/ship.types.ts';
const baseOrders=files(block('// src/orders.ts — before'))[orders];
const baseTests=files(block('// test/ship.test.ts — before'))[tests];
const printedConfig=JSON.parse(block('{\n  "compilerOptions"'));
const pr=files(block('// src/orders.ts — add'))[orders];
const validDraft=files(block('// test/ship.test.ts — replace the draft'))[tests];
const permitted=files(block('// src/orders.ts — replace ship'));
const helpers=files(block('// src/order-row.ts\n'));
const assignment=files(block('// test/ship.test.ts — import orderRow'))[tests];
const comparison=files(block('// test-support/types.ts'));
const negative=files(block('// test/ship.test.ts — add after row'))[tests];
const flatReturn=files(block('// src/order-row.ts — replace the return'))[rowFile].trim();
const statusAssertion=files(block('// test/ship.test.ts — replace the Row'))[tests];
const cardTest=files(block('// test/ship.test.ts — also import paidCard'))[tests];
const compileOnly=files(block('// type-tests/ship.types.ts\n'))[typesFile];
const falseAssertion=files(block('// type-tests/ship.types.ts — temporary'))[typesFile];
const fixedInclude=JSON.parse(block('{\n  "include"'));
assert.equal((manuscript.match(/^```/gm)||[]).length,fences.length*2,'Every fence has a language and is extracted');
assert.equal(used.size,fences.length,'Every printed fence is extracted');assert.equal(fences.length,16);
assert(fences.every(f=>['typescript','json'].includes(f.language)));
const rootMode=manuscript.match(/root package has `([^`]+)`/);assert(rootMode);
const manifest=JSON.parse('{'+rootMode[1]+'}');assert.deepEqual(manifest,{type:'module'});
const directiveIds=fences.flatMap((f,i)=>f.body.split('\n').flatMap((s,j)=>s.includes('@ts-expect-error')?[`${i}:${j}`]:[]));
function directiveId(prefix,operation) {
 const i=fences.findIndex(f=>f.body.startsWith(prefix));assert(i>=0);
 const lines=fences[i].body.split('\n'),j=lines.findIndex(l=>l.includes(operation));
 assert(lines[j-1].includes('@ts-expect-error'));return `${i}:${j-1}`;
}
const ids={inline:directiveId('// test/ship.test.ts — before','ship({'),draft:directiveId('// test/ship.test.ts — replace the draft','ship(draft)'),row:directiveId('// test/ship.test.ts — add after row','const wrong'),finalDraft:directiveId('// type-tests/ship.types.ts\n','ship(draft)')};
const scratch=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'ts-book-ch26-')));
const story=path.join(scratch,'story'), results=[];
const executable=path.join(repo,'node_modules/.bin/tsc');
let cases=0,groups=0,queries=0;
function write(root,file,value) {const p=path.join(root,file);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,typeof value==='string'?value:JSON.stringify(value,null,2));}
function read(root,file){return fs.readFileSync(path.join(root,file),'utf8');}
function config(root,value){write(root,'tsconfig.json',{...value,compilerOptions:{...defaults,...value.compilerOptions}});}
function route(root){fs.symlinkSync(path.join(repo,'node_modules'),path.join(root,'node_modules'),'dir');}
function command(name,root,exe,args,status) {
 const r=cp.spawnSync(exe,args,{cwd:root,encoding:'utf8',timeout:60000,maxBuffer:10*1024*1024});if(r.error)throw r.error;
 results.push({name,root,exe,args,status:r.status,stdout:r.stdout,stderr:r.stderr});
 write(scratch,'RESULTS.json',results);const output=r.stdout+r.stderr;
 assert.equal(r.status,status,name+'\n'+output);return output;
}
function at(file,needle,code,message){return {file,needle,code,message};}
function check(name,expected=[],root=story) {
 const output=command(name,root,executable,['-p','tsconfig.json','--pretty','false','--noErrorTruncation'],expected.length?1:0);
 const found=[...output.matchAll(/^(?:(.+)\((\d+),(\d+)\): )?error TS(\d+): (.*)$/gm)];
 assert.equal(found.length,expected.length,name+'\n'+output);
 for(const e of expected) {
  let line;
  if(e.file){const lines=read(root,e.file).split('\n').flatMap((l,i)=>l.includes(e.needle)?[i+1]:[]);assert.equal(lines.length,1,e.needle);line=lines[0];}
  assert(found.some(m=>+m[4]===e.code && (!e.file || (m[1]===e.file && +m[2]===line))),name+' diagnostic location\n'+output);
  if(e.message)assert(output.includes(e.message),name+' diagnostic reason\n'+output);
 }cases++;return output;
}
function expose(name,file,operation,expected,id) {
 const original=read(story,file),lines=original.split('\n'),i=lines.findIndex(l=>l.includes(operation));
 assert(lines[i-1].includes('@ts-expect-error'));
 lines[i-1]='// Directive removed for diagnostic verification.';
 try{write(story,file,lines.join('\n'));check(name,expected);coveredDirectives.add(id);}
 finally{write(story,file,original);}
 check(name+'-restored');
}
function run(name,args=['--test',tests],needles=[],absent=[],status=0,root=story) {
 const output=command(name,root,process.execPath,args,status);
 for(const s of needles)assert(output.includes(s),name+' missing '+s+'\n'+output);
 for(const s of absent)assert(!output.includes(s),name+' unexpected '+s+'\n'+output);
 groups++;return output;
}
function list(name,has,lacks,root=story) {
 const output=command(name,root,executable,['-p','tsconfig.json','--listFilesOnly'],0);
 const entries=output.trim().split(/\r?\n/).map(p=>fs.realpathSync(p));
 for(const f of has)assert(entries.includes(fs.realpathSync(path.join(root,f))),name+' missing '+f);
 for(const f of lacks)assert(!entries.includes(fs.realpathSync(path.join(root,f))),name+' unexpected '+f);
 assert(entries.some(f=>f===fs.realpathSync(path.join(repo,'node_modules/@types/node/index.d.ts'))),'Explicit route supplies Node declarations');
 queries++;return entries;
}
const unused="Unused '@ts-expect-error' directive.";
const falseType="Type 'false' does not satisfy the constraint 'true'.";
const paidAt="Property 'paidAt' is missing in type 'Draft' but required in type 'Paid'.";
const currency="Property 'currency' is missing in type '{ id: string; status: \"draft\"; }' but required in type 'Draft'.";
const statusError="Type '\"draft\"' is not assignable to type '\"paid\"'.";
for(const message of [unused,falseType,paidAt,currency,statusError])assert(manuscript.includes(message),'Quoted diagnostic on page: '+message);
const oldDraftBlock=baseTests.slice(baseTests.indexOf('test("can\'t ship a draft"'));
const oldShip=baseOrders.slice(baseOrders.indexOf('export function ship'));
const prOrders=replace(replace(baseOrders,'export type Order = Draft | Paid;',pr.slice(0,pr.indexOf('export function ship')).trim()),oldShip,pr.slice(pr.indexOf('export function ship')));
const finalOrders=replace(prOrders,prOrders.slice(prOrders.indexOf('export function ship')),permitted[orders]);
const guardedPr=replace(prOrders,'ship(order: Order)','ship(order: Paid)');
const initialRow=helpers[rowFile],flatRow=replace(initialRow,'return Object.assign({ id }, { status });',flatReturn);
const anyRow=s=>replace(s,'status: S) {','status: S): any {');
write(story,'package.json',manifest);config(story,printedConfig);route(story);
write(story,orders,baseOrders);write(story,tests,baseTests);
// These existing source files appear later on the page but are present from the start.
for(const [f,s]of Object.entries(helpers))write(story,f,s);
check('before-PR');run('before-PR-runtime',['--test'],['ok 1 - ships a paid order',"can't ship a draft"],['not ok']);
expose('before-PR-status',tests,'ship({',[at(tests,'ship({',2322,statusError)],ids.inline);
write(story,orders,prOrders);check('PR-widening-hidden-by-fixture');
expose('PR-missing-currency',tests,'ship({',[at(tests,'ship({',2345,currency)],ids.inline);
write(story,orders,guardedPr);check('old-signature-still-green');
expose('old-signature-status',tests,'ship({',[at(tests,'ship({',2322,statusError)],ids.inline);
// Historical state predates both currency and this PR; the paid fixture loses its old field too.
write(story,orders,baseOrders.replaceAll('; currency: string',''));
write(story,tests,replace(baseTests,', currency: "USD"',''));
check('history-original-test');
write(story,orders,replace(read(story,orders),'ship(order: Paid)','ship(order: Order)'));
check('history-original-catches-widening',[at(tests,'@ts-expect-error',2578,unused)]);
write(story,orders,baseOrders.replaceAll('; currency: string',''));check('history-restored');
write(story,orders,prOrders);write(story,tests,baseTests);check('return-to-current-PR');
write(story,tests,replace(baseTests,oldDraftBlock,validDraft));
check('valid-draft-exposes-widening',[at(tests,'@ts-expect-error',2578,unused)]);
write(story,orders,guardedPr);check('valid-draft-Paid-only');
expose('valid-draft-paidAt',tests,'ship(draft)',[at(tests,'ship(draft)',2741,paidAt)],ids.draft);
write(story,orders,finalOrders);
write(story,tests,replace(read(story,tests),'type Paid, type Draft','type Paid, type Draft, type PreOrder')+permitted[tests]);
check('paid-and-preorder-accepted');run('paid-and-preorder-records',undefined,['ships a paid order','ships a pre-order'],['not ok']);
write(story,orders,replace(finalOrders,'ship(order: Paid | PreOrder)','ship(order: Paid)'));
check('preorder-positive-regression',[at(tests,'ship(preorder)',2741,"Property 'paidAt' is missing in type 'PreOrder'")]);
write(story,orders,finalOrders);check('preorder-positive-restored');
const cardProbe='import assert from "node:assert/strict"; import {paidCard} from "./src/admin.ts"; import {orderRow} from "./src/order-row.ts"; assert.deepEqual(orderRow("o1","paid"), {id:"o1",status:"paid"}); console.log(paidCard("o1"));';
const beforeCard=run('admin-before-refactor',['--input-type=module','-e',cardProbe],['Paid order o1']);
assert.equal(beforeCard.trim(),'Paid order o1');
write(story,tests,read(story,tests)+'import { orderRow } from "../src/order-row.ts";\n'+assignment);
check('positive-result-assignment');
write(story,rowFile,anyRow(initialRow));check('any-passes-assignment-and-admin');
write(story,'test-support/types.ts',comparison['test-support/types.ts']);
write(story,tests,read(story,tests)+'import type { Equal, Expect } from "../test-support/types.ts";\n'+comparison[tests]);
check('exact-result-catches-any',[at(tests,'type Row',2344,falseType)]);
write(story,rowFile,initialRow);check('exact-result-restored');
write(story,tests,replace(read(story,tests),comparison[tests],'')+negative);
check('negative-result-usage');
expose('negative-result-paid-not-draft',tests,'const wrong',[at(tests,'const wrong',2322,"Type '\"paid\"' is not assignable to type '\"draft\"'.")],ids.row);
write(story,rowFile,anyRow(initialRow));
check('negative-result-catches-any',[at(tests,"@ts-expect-error: a paid",2578,unused)]);
write(story,rowFile,initialRow);check('negative-result-restored');
write(story,tests,read(story,tests)+comparison[tests]);check('both-result-tests-restored');
write(story,rowFile,flatRow);check('flattening-breaks-whole-equality',[at(tests,'type Row',2344,falseType)]);
const withWhole=read(story,tests);write(story,tests,replace(withWhole,comparison[tests],''));
check('flattened-admin-and-usage-still-compile');
assert.equal(run('flattened-admin-runtime',['--input-type=module','-e',cardProbe],['Paid order o1']),beforeCard);
write(story,tests,replace(withWhole,comparison[tests],statusAssertion));check('assert-promised-status');
write(story,rowFile,initialRow);check('status-assertion-before-flattening');
write(story,rowFile,flatRow);check('status-assertion-after-flattening');
// Independently mutate inference with the negative test removed to expose the equality's contribution.
const bothTests=read(story,tests);write(story,tests,replace(bothTests,negative,''));
write(story,rowFile,anyRow(flatRow));check('status-alone-catches-any',[at(tests,'type Status',2344,falseType)]);
write(story,rowFile,flatRow);check('status-alone-restored');
write(story,rowFile,replace(flatRow,'status: S) {','status: S): { id: string; status: Order["status"] } {'));
check('status-widening-breaks-contract',[at(tests,'type Status',2344,falseType),at(tests,'const expected',2322,"Types of property 'status' are incompatible."),at('src/admin.ts','return renderPaid',2345,'Types of property \'status\' are incompatible.')]);
const selectedTests=replace(bothTests,negative,'');
write(story,rowFile,flatRow);write(story,tests,selectedTests);check('status-widening-restored');
// The page's temporary logging is derived from its described location, then removed byte-for-byte.
assert(manuscript.includes('clears `shipped` immediately before `ship(draft)`'));
write(story,tests,replace(selectedTests,'  // @ts-expect-error: can\'t ship a draft','  shipped.length = 0;\n  // @ts-expect-error: can\'t ship a draft').replace('  ship(draft);','  ship(draft);\n  console.log("shipped:", shipped);'));
check('logged-negative-still-type-checks');
run('negative-call-executes',undefined,["shipped: [ 'o2' ]"],['not ok']);
write(story,tests,selectedTests);check('logging-removed');
// Move all compile-only expressions; runtime retains its two positive calls and gains the card test.
const runtime=replace(replace(baseTests,oldDraftBlock,''),'type Paid, type Draft','type Paid, type PreOrder')+permitted[tests]+'import { paidCard } from "../src/admin.ts";\n'+cardTest;
write(story,tests,runtime);
const logCalls='\nimport { shipped } from "../src/orders.ts";\nconsole.log("TYPE_FILE_EXECUTED");\nconsole.log("shipped:", shipped);\n';
write(story,'test/ship.types.ts',compileOnly+logCalls);
run('types-suffix-under-test-still-executes',['--test'],['test/ship.types.ts','TYPE_FILE_EXECUTED',"shipped: [ 'o2' ]"],['not ok']);
fs.mkdirSync(path.join(story,'type-tests'));fs.renameSync(path.join(story,'test/ship.types.ts'),path.join(story,typesFile));
// Check both the actual explicit command and default discovery, including accidental imports.
run('outside-test-explicit-runtime',['--test',tests],['renders the paid card'],['TYPE_FILE_EXECUTED','shipped:','not ok']);
run('outside-test-default-discovery',['--test'],['renders the paid card'],['TYPE_FILE_EXECUTED','ship.types.ts','not ok']);
write(story,typesFile,compileOnly+falseAssertion);check('moved-false-assertion-invisible');
list('omitted-type-file',[tests],[typesFile]);
config(story,{...printedConfig,...fixedInclude});
list('included-type-file',[tests,typesFile],[]);
check('included-false-assertion-red',[at(typesFile,'type DeliberatelyWrong',2344,falseType)]);
write(story,typesFile,compileOnly);check('false-assertion-removed');
write(story,orders,replace(finalOrders,'ship(order: Paid | PreOrder)','ship(order: Order)'));
check('moved-real-regression-red',[at(typesFile,"@ts-expect-error: can't",2578,unused)]);
write(story,orders,finalOrders);check('moved-real-regression-restored');
write(story,typesFile,compileOnly+falseAssertion);
run('Node-erases-false-assertion',['--test',typesFile],['type-tests/ship.types.ts'],['not ok']);
write(story,typesFile,compileOnly);check('Node-demonstration-restored');
run('final-runtime-command',undefined,['ships a paid order','ships a pre-order','renders the paid card'],['not ok','ship.types.ts',"can't ship a draft"]);
expose('final-draft-reason',typesFile,'ship(draft)',[at(typesFile,'ship(draft)',2345,"Type '\"draft\"' is not assignable to type '\"preorder\"'.")],ids.finalDraft);
assert.deepEqual([...coveredDirectives].sort(),directiveIds.sort(),'Every printed directive has an exposed diagnostic');
// Extra regression controls preserve and restore the final repository exactly.
write(story,orders,replace(finalOrders,'status: "draft"; currency: string','status: "draft"; currency: string; region: string'));
check('new-Draft-field-outside-suppression',[at(typesFile,'const draft',2741,"Property 'region' is missing")]);
write(story,orders,finalOrders);check('new-Draft-field-restored');
config(story,printedConfig);write(story,typesFile,compileOnly+falseAssertion);
write(story,tests,runtime+'import "../type-tests/ship.types.ts";\n');
check('import-reaches-unmatched-file',[at(typesFile,'type DeliberatelyWrong',2344,falseType)]);
write(story,tests,runtime);write(story,typesFile,compileOnly);config(story,{...printedConfig,...fixedInclude});check('import-control-restored');
// Separate controls, outside the narrative working repository.
function control(name,source,options={},withRoute=false) {
 const root=path.join(scratch,name);write(root,'package.json',manifest);write(root,'case.ts',source);
 config(root,{compilerOptions:{noEmit:true,allowImportingTsExtensions:true,...options},files:['case.ts'],include:[]});
 if(withRoute)route(root);return root;
}
const eq=comparison['test-support/types.ts'];
const mutual='type Mutual<X,Y> = [X] extends [Y] ? ([Y] extends [X] ? true : false) : false;\n';
const lax=control('mutual-controls',eq+mutual+'type Any=Expect<Mutual<any,string>>;\ntype RO=Expect<Mutual<{readonly a:1},{a:1}>>;');
check('mutual-is-not-strict-equality',[],lax);
const readOnly=control('readonly-control','const x: {readonly a: 1} = {a:1};\nx.a = 1;');
check('readonly-is-observable',[at('case.ts','x.a =',2540,"Cannot assign to 'a' because it is a read-only property.")],readOnly);
write(readOnly,'case.ts','const x: {a: 1} = {a:1};\nx.a = 1;');check('mutable-control',[],readOnly);
const optionalSource=eq+'type Optional=Expect<Equal<{a?:number},{a?:number|undefined}>>;\nconst optional: {a?:number} = {a:undefined};';
const optional=control('optional-control',optionalSource,{exactOptionalPropertyTypes:false});
check('optional-flag-off',[],optional);
config(optional,{compilerOptions:{noEmit:true,exactOptionalPropertyTypes:true},files:['case.ts'],include:[]});
check('optional-flag-on',[at('case.ts','type Optional',2344,falseType),at('case.ts','const optional',2375,"Type '{ a: undefined; }' is not assignable to type '{ a?: number; }'")],optional);
config(optional,{compilerOptions:{noEmit:true,exactOptionalPropertyTypes:false},files:['case.ts'],include:[]});check('optional-control-restored',[],optional);
const notAnySource=eq+'type IsAny<T> = 0 extends (1 & T) ? true : false;\ntype A=Expect<Equal<IsAny<string>,false>>;';
const notAny=control('not-any-control',notAnySource);check('not-any-baseline',[],notAny);
write(notAny,'case.ts',replace(notAnySource,'IsAny<string>','IsAny<any>'));check('not-any-detects-any',[at('case.ts','type A=',2344,falseType)],notAny);
write(notAny,'case.ts',notAnySource);check('not-any-restored',[],notAny);
const nodeSource='import {test} from "node:test";\ntest("Node import works",()=>{});';
// No resolution route and no requested global types: the original TS2591 diagnostic.
const noRoute=control('no-node-route',nodeSource,{types:[]});
check('no-route-no-types-TS2591',[at('case.ts','import {test}',2591,"Cannot find name 'node:test'.")],noRoute);
// The printed types:[node] instead stops at the missing requested type library.
config(noRoute,{compilerOptions:{noEmit:true,types:['node']},files:['case.ts'],include:[]});
check('no-route-requested-node',[{code:2688,message:"Cannot find type definition file for 'node'."}],noRoute);
route(noRoute);check('explicit-node-route-restores-check',[],noRoute);
list('explicit-node-route-file-list',['case.ts'],[],noRoute);
run('Node-test-import-executes',['--test','case.ts'],['Node import works'],['not ok'],0,noRoute);
const boundarySource=eq+'import {test} from "node:test";\nimport assert from "node:assert/strict";\ntype User={id:number};\nfunction parseUsers(raw:string):User[]{return JSON.parse(raw);}\ntype Users=Expect<Equal<ReturnType<typeof parseUsers>,User[]>>;\ntest("parsed value",()=>{const users=parseUsers(\'[ {"id":7} ]\');assert.equal(typeof users[0].id,"number");});';
const boundary=control('runtime-boundary',boundarySource,{types:['node']},true);
check('boundary-typed-baseline',[],boundary);run('boundary-runtime-baseline',['--test','case.ts'],['parsed value'],['not ok'],0,boundary);
write(boundary,'case.ts',replace(boundarySource,'"id":7','"id":"wrong"'));
check('boundary-exact-type-still-passes',[],boundary);run('boundary-runtime-detects-lie',['--test','case.ts'],['not ok','AssertionError'],[],1,boundary);
write(boundary,'case.ts',boundarySource);check('boundary-type-restored',[],boundary);run('boundary-runtime-restored',['--test','case.ts'],['parsed value'],['not ok'],0,boundary);
// Freeze-state assertions guard against a counterfactual leaking into the delivered example.
assert.equal(read(story,orders),finalOrders);assert.equal(read(story,rowFile),flatRow);
assert.equal(read(story,tests),runtime);assert.equal(read(story,typesFile),compileOnly);
assert.deepEqual(JSON.parse(read(story,'tsconfig.json')).include,fixedInclude.include);
assert.equal(require(path.join(repo,'node_modules/@types/node/package.json')).version,'26.5.1');
console.log(JSON.stringify({typescript:version,node:process.version,fences:fences.length,compilerCases:cases,runtimeGroups:groups,fileListQueries:queries,directivesVerified:coveredDirectives.size,scratch},null,2));
console.log('Chapter 26: PASS');

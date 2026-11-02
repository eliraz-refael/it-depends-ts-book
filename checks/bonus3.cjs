'use strict';
// One repository follows the manuscript. Review experiments reset to named states.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {defaults,version}=require('./compiler.cjs');
const repo=path.resolve(__dirname,'..'),tsc=path.join(repo,'node_modules/.bin/tsc');
const manuscript=fs.readFileSync(path.join(repo,'book/05-bonus-ai-and-typescript/03-reviewing-ai-code.md'),'utf8');
const fences=[...manuscript.matchAll(/```(\w+)\n([\s\S]*?)\n```/g)].map(m=>({language:m[1],body:m[2]}));
assert.equal(fences.length,10);assert(fences.length<=10);assert.equal((manuscript.match(/^```/gm)||[]).length,20);
assert.deepEqual(fences.map(f=>f.language),['typescript','json','json','typescript','diff','diff','typescript','diff','diff','typescript']);
assert(manuscript.includes('TypeScript '+version));assert(manuscript.includes('Node '+process.versions.node));
assert(manuscript.includes("With the assistant's fallback, it passes the flag."));
const consumed=new Set();
function block(i){assert(!consumed.has(i));consumed.add(i);return fences[i].body+'\n';}
function files(source){const result={};let file;for(const line of source.trimEnd().split('\n')){const match=line.match(/^\/\/ ([\w.-]+\.ts)(?: —.*)?$/);if(match){file=match[1];assert(!result[file]);result[file]='';}else if(file)result[file]+=line+'\n';else assert(!line.trim());}return result;}
function replace(source,from,to){assert.equal(source.split(from).length,2,'Unique replacement: '+from);return source.replace(from,to);}
// Apply standard unified hunks, checking every context/removal and both range lengths.
function patch(inputs,text){const out={...inputs},lines=text.trimEnd().split('\n');let i=0;while(i<lines.length){assert(lines[i].startsWith('--- a/'));const file=lines[i++].slice(6);assert.equal(lines[i++],'+++ b/'+file);assert(Object.hasOwn(out,file),file);const src=out[file].trimEnd().split('\n'),dest=[];let cursor=0;
 while(i<lines.length&&!lines[i].startsWith('--- ')){const m=lines[i++].match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@$/);assert(m,'Hunk header');const start=+m[1]-1;assert(start>=cursor);dest.push(...src.slice(cursor,start));cursor=start;assert.equal(dest.length,+m[3]-1);let oldCount=0,newCount=0;
  while(i<lines.length&&!lines[i].startsWith('@@ ')&&!lines[i].startsWith('--- ')){const line=lines[i++],kind=line[0],body=line.slice(1);assert([' ','-','+'].includes(kind),line);if(kind!=='+' ){assert.equal(src[cursor++],body,file+' context');oldCount++;}if(kind!=='-'){dest.push(body);newCount++;}}
  assert.equal(oldCount,m[2]===undefined?1:+m[2]);assert.equal(newCount,m[4]===undefined?1:+m[4]);}
 dest.push(...src.slice(cursor));out[file]=dest.join('\n')+'\n';}return out;}
const chapterPackage=JSON.parse(block(1)),chapterConfig=JSON.parse(block(2));
assert.deepEqual(chapterPackage,{type:'module'});
assert.deepEqual(chapterConfig,{compilerOptions:{...defaults,declaration:true,emitDeclarationOnly:true,allowImportingTsExtensions:true,rootDir:'.',outDir:'types'},include:['*.ts']});
const initial={...files(block(0)),...files(block(3))};
const submitted=patch(initial,block(4));
const declarationPatch=block(5),mobile=files(block(6))['mobile.ts'];
const typo=patch(submitted,block(7));
const constRepair=patch(submitted,block(8));
const final={...constRepair,...files(block(9))};
assert.equal(consumed.size,fences.length,'Every fence extracted');
assert.equal(submitted['badge.ts'],replace(initial['badge.ts'],'return assertNever(status);','return status;'));
assert.equal(typo['status.ts'],replace(submitted['status.ts'],'all: "refunded"','all: "refund"'));
assert.equal(constRepair['badge.ts'],initial['badge.ts']);assert.equal(final['badge.ts'],initial['badge.ts']);
assert(!/\bany\b|\bas\s|\w!/.test(submitted['status.ts']+submitted['badge.ts']),'Candidate has no escapes');
const summary=manuscript.match(/^> Refactor `orderStatus`[^\n]+/m)?.[0].slice(2);
const reply=manuscript.match(/^> The inferred status[^\n]+/m)?.[0].slice(2);
assert.equal(summary,'Refactor `orderStatus` into a lookup table. No public API changes. Also fixed a type error in `badge.ts`.');
assert.equal(reply,'The inferred status is a string. Returning it in the fallback handles strings outside the three named cases. No exported type annotation changed, and the existing status cases retain their behavior.');
const revisedSummary=manuscript.match(/Oded replaces the summary: \*([^*]+)\*/)?.[1];assert(revisedSummary);
const question=manuscript.match(/\*\*Noam\*\*, in a comment: \*([^*]+)\*/)?.[1];assert.equal(question,'What error required the change to badge.ts?');
const scratch=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'ts-book-bonus3-'))),story=path.join(scratch,'story');fs.mkdirSync(story);
const results=[];let compilerCases=0,runtimeGroups=0,fileListQueries=0;
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
const write=(file,s)=>{const p=path.join(story,file);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,typeof s==='string'?s:JSON.stringify(s,null,2)+'\n');};
const read=file=>fs.readFileSync(path.join(story,file),'utf8');
const remove=file=>fs.rmSync(path.join(story,file),{force:true});
const owned=Object.fromEntries(['order.ts','cases.ts','check.ts'].map(file=>[file,digest(initial[file])]));
function verifyOwned(){for(const [file,hash] of Object.entries(owned))assert.equal(digest(read(file)),hash,file+' stays owned and unchanged');}
function config(extra={}){write('tsconfig.json',{...chapterConfig,compilerOptions:{...chapterConfig.compilerOptions,...extra}});}
function state(s){for(const file of fs.readdirSync(story))if(file.endsWith('.ts'))remove(file);for(const [f,text] of Object.entries(s))write(f,text);config();verifyOwned();}
function command(name,exe,args,expected=0){const r=cp.spawnSync(exe,args,{cwd:story,encoding:'utf8',timeout:60000,maxBuffer:12e6});if(r.error)throw r.error;results.push({name,exe,args,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(scratch,'RESULTS.json'),JSON.stringify(results,null,2)+'\n');assert.equal(r.status,expected,name+'\n'+r.stdout+r.stderr);return r;}
function diagnostic(file,needle,code,message,column){return {file,needle,code,message,column};}
function compile(name,expected=[]){verifyOwned();fs.rmSync(path.join(story,'types'),{recursive:true,force:true});const r=command(name,tsc,['-p','tsconfig.json','--pretty','false','--noErrorTruncation'],expected.length?1:0);const output=r.stdout+r.stderr,found=[...output.matchAll(/^(.+)\((\d+),(\d+)\): error TS(\d+): (.*)$/gm)];assert.equal(found.length,expected.length,name+'\n'+output);
 for(const e of expected){const locations=read(e.file).split('\n').flatMap((line,i)=>line.includes(e.needle)?[i+1]:[]);assert.equal(locations.length,1,e.needle);assert(found.some(m=>path.resolve(story,m[1])===path.join(story,e.file)&&+m[2]===locations[0]&&+m[4]===e.code&&(e.message===undefined||m[5]===e.message)&&(e.column===undefined||+m[3]===e.column)),name+'\n'+output);}
 if(expected.length)assert(!fs.existsSync(path.join(story,'types')),'No stale or partial declarations');compilerCases++;return output;}
function declarations(){return Object.fromEntries(fs.readdirSync(path.join(story,'types')).filter(f=>f.endsWith('.d.ts')).sort().map(f=>['types/'+f,read('types/'+f)]));}
const pass=manuscript.match(/prints `([^`]+)` on the old commit/)[1];assert.equal(pass,'3 statuses, 3 badges: passed');
function testRun(name,error){const r=command(name,process.execPath,['check.ts'],error?1:0);if(error){assert(r.stderr.includes('Error: '+error));assert.equal(r.stdout,'');}else assert.equal(r.stdout.trim(),pass);runtimeGroups++;}
function js(name,source,want){const r=command(name,process.execPath,['--input-type=module','-e',source]);assert.deepEqual(JSON.parse(r.stdout),want,name);runtimeGroups++;}
const current=[{status:'paid',badge:'Paid'},{status:'partial',badge:'Partially refunded'},{status:'refunded',badge:'Refunded'}];
const values=`import {orderStatus} from './status.ts';import {badge} from './badge.ts';console.log(JSON.stringify([0,500,1000].map(refundedCents=>{const order={paidCents:1000,refundedCents};return {status:orderStatus(order),badge:badge(order)}})));`;
const stringNever="Argument of type 'string' is not assignable to parameter of type 'never'.";
const refundNever="Argument of type '\"refund\"' is not assignable to parameter of type 'never'.";
const typoCase="Type '\"refunded\"' is not comparable to type '\"paid\" | \"partial\" | \"refund\"'.";
const mobileMessage="Type 'string' is not assignable to type '\"paid\" | \"partial\" | \"refunded\"'.";
const tableMessage="Type '\"refund\"' is not assignable to type 'OrderStatus'. Did you mean '\"refunded\"'?";
const returnMessage="Type '\"paid\" | \"partial\" | \"refund\"' is not assignable to type 'OrderStatus'.";
const isolatedMessage='Function must have an explicit return type annotation with --isolatedDeclarations.';
for(const message of [stringNever,refundNever,typoCase,mobileMessage,tableMessage,isolatedMessage])assert(manuscript.includes('`'+message+'`'),'Quoted diagnostic: '+message);
const oldCallerError=diagnostic('badge.ts','default: return assertNever',2345,stringNever,33);
const oldTypoErrors=[diagnostic('badge.ts','case "refunded"',2678,typoCase,10),diagnostic('badge.ts','default: return assertNever',2345,refundNever,33)];
const finalTypoErrors=[diagnostic('status.ts','all: "refund"',2820,tableMessage,3),diagnostic('status.ts','return labels[',2322,returnMessage,3)];
const adapterError=diagnostic('mobile.ts','return orderStatus',2322,mobileMessage,3);
write('package.json',chapterPackage);state(initial);
fs.writeFileSync(path.join(scratch,'ASSISTANT-ARTIFACTS.json'),JSON.stringify({summary,question,reply,revisedSummary},null,2)+'\n');
compile('original');const originalDts=declarations();testRun('original-retained-tests');js('original-current-values',values,current);
js('fixed-owned-case-contents',`import {cases} from './cases.ts';console.log(JSON.stringify(cases));`,[0,500,1000].map((refundedCents,i)=>({refundedCents,...current[i]})));
state(submitted);compile('submitted-patch');testRun('submitted-retained-tests');js('submitted-current-values',values,current);
// The optional clue is an unused declaration, not a change to the book profile.
assert(manuscript.includes('It left `assertNever` with nothing to assert.'));
assert.equal((submitted['badge.ts'].match(/\bassertNever\s*\(/g)||[]).length,1);
config({noUnusedLocals:true});compile('orphaned-helper-under-unused-control',[diagnostic('badge.ts','function assertNever',6133,"'assertNever' is declared but its value is never read.",10)]);
config();compile('book-profile-restored-after-unused-control');
write('badge.ts',initial['badge.ts']);compile('new-provider-old-caller',[oldCallerError]);
write('badge.ts',submitted['badge.ts']);compile('submitted-caller-restored');testRun('submitted-restored-tests');
state(initial);compile('declaration-report-original');assert.deepEqual(declarations(),originalDts);
fs.writeFileSync(path.join(scratch,'DECLARATIONS-BEFORE.json'),JSON.stringify(originalDts,null,2)+'\n');
state(submitted);compile('declaration-report-submitted');const submittedDts=declarations();
fs.writeFileSync(path.join(scratch,'DECLARATIONS-AFTER.json'),JSON.stringify(submittedDts,null,2)+'\n');
assert.deepEqual(patch(originalDts,declarationPatch),submittedDts,'Printed declaration diff is complete');
assert.equal(originalDts['types/status.d.ts'],'import type { Order } from "./order.ts";\nexport declare function orderStatus(order: Order): "paid" | "partial" | "refunded";\n');
assert.equal(submittedDts['types/status.d.ts'],'import type { Order } from "./order.ts";\nexport declare function orderStatus(order: Order): string;\n');
const referencedDeclaration=manuscript.match(/I checked `([^`]+)` too\./)[1];
assert.equal(referencedDeclaration,'order.d.ts');
assert.equal(originalDts['types/'+referencedDeclaration],submittedDts['types/'+referencedDeclaration]);
assert(originalDts['types/status.d.ts'].includes('import type { Order } from "./order.ts";'));
assert(submittedDts['types/status.d.ts'].includes('import type { Order } from "./order.ts";'));
state({...initial,'mobile.ts':mobile});compile('unchanged-mobile-original');
state({...submitted,'mobile.ts':mobile});compile('unchanged-mobile-submitted',[adapterError]);
state(submitted);compile('mobile-copy-set-aside');
state(typo);compile('scratch-typo-candidate-green');
const scratchCall=manuscript.match(/He calls `([^`]+)` directly/)[1];assert.equal(scratchCall,'badge({ paidCents: 1000, refundedCents: 1000 })');
js('printed-raw-refund',`import {badge} from './badge.ts';console.log(JSON.stringify(${scratchCall}));`,'refund');
const fail=manuscript.match(/It fails: `([^`]+)`/)[1];assert.equal(fail,'Expected refunded, got refund');testRun('scratch-typo-retained-tests-fail',fail);
state({...initial,'status.ts':replace(initial['status.ts'],'return "refunded";','return "refund";')});compile('scratch-typo-original-rejects',oldTypoErrors);
state(submitted);compile('scratch-experiments-undone');testRun('scratch-restored-green');
state(constRepair);compile('oded-as-const');assert.deepEqual(declarations(),originalDts,'as const restores exact original declaration set');testRun('as-const-tests');js('as-const-values',values,current);
state(final);compile('explicit-private-contract');const finalDts=declarations();testRun('explicit-contract-tests');
assert.notEqual(finalDts['types/status.d.ts'],originalDts['types/status.d.ts']);
assert.equal(finalDts['types/status.d.ts'],'import type { Order } from "./order.ts";\ntype OrderStatus = "paid" | "partial" | "refunded";\nexport declare function orderStatus(order: Order): OrderStatus;\nexport {};\n');
write('status.ts',replace(final['status.ts'],'all: "refunded"','all: "refund"'));compile('explicit-contract-typo',finalTypoErrors);
write('status.ts',final['status.ts']);compile('explicit-contract-typo-undone');testRun('explicit-contract-restored-tests');
write('mobile.ts',mobile);compile('unchanged-mobile-final');const chosen={...final,'mobile.ts':mobile};
// The flag experiment returns to the original project, before the copied consumer existed.
state(initial);config({isolatedDeclarations:true});compile('flag-on-original',[diagnostic('status.ts','export function orderStatus',9007,isolatedMessage,17)]);
state(submitted);write('status.ts',replace(submitted['status.ts'],'orderStatus(order: Order) {','orderStatus(order: Order): string {'));config({isolatedDeclarations:true});compile('flag-accepts-explicit-string');assert.equal(declarations()['types/status.d.ts'],submittedDts['types/status.d.ts']);testRun('wrong-contract-still-same-values');
write('badge.ts',initial['badge.ts']);compile('explicit-string-flag-with-original-badge',[oldCallerError]);
write('badge.ts',submitted['badge.ts']);compile('assistant-fallback-restored-under-flag');
state(chosen);compile('flag-experiment-discarded');testRun('chosen-version-restored');
// Additional Takes and off-page controls: same story repository; no check mutates owned cases.
write('status.ts',replace(replace(final['status.ts'],'none: "paid"','none: "refunded"'),'all: "refunded"','all: "paid"'));compile('same-declarations-wrong-behavior');assert.deepEqual(declarations(),{...finalDts,'types/mobile.d.ts':read('types/mobile.d.ts')});
testRun('declarations-cannot-establish-behavior','Expected paid, got refunded');js('swapped-values',values,[current[2],current[1],current[0]]);
state(chosen);compile('swapped-values-undone');testRun('swapped-values-restored');
// Named alias is private, even though its definition appears in the declaration output.
write('negative.ts','import type {OrderStatus} from "./status.ts";\n');compile('private-alias-not-importable',[diagnostic('negative.ts','import type',2724)]);remove('negative.ts');compile('private-alias-probe-removed');
// Satisfies alone is another minimal repair; its aliases do not enter the emitted signature.
state(constRepair);write('status.ts',replace(replace(constRepair['status.ts'],'const labels =','type RefundLevel = "none" | "some" | "all";\ntype OrderStatus = "paid" | "partial" | "refunded";\nconst labels ='),'} as const;','} satisfies Record<RefundLevel, OrderStatus>;'));
compile('satisfies-only-control');assert.deepEqual(declarations(),originalDts);testRun('satisfies-only-runtime');
state(submitted);config({isolatedDeclarations:true});compile('unannotated-table-under-flag',[diagnostic('status.ts','return labels[',9013,"Expression type can't be inferred with --isolatedDeclarations.",10)]);
state(constRepair);config({isolatedDeclarations:true});compile('as-const-under-flag',[diagnostic('status.ts','return labels[',9013,"Expression type can't be inferred with --isolatedDeclarations.",10)]);
state(chosen);config({isolatedDeclarations:true});compile('chosen-under-flag');testRun('chosen-under-flag-runtime');
write('control.ts','export function label() { return "paid"; }\nexport const answer = 42;\n');compile('flag-trivial-inference-before');const trivialBefore=read('types/control.d.ts');
write('control.ts','export function label() { return 42; }\nexport const answer = "forty-two";\n');compile('flag-trivial-inference-after');assert.equal(trivialBefore,'export declare function label(): string;\nexport declare const answer = 42;\n');assert.equal(read('types/control.d.ts'),'export declare function label(): number;\nexport declare const answer = "forty-two";\n');remove('control.ts');compile('trivial-probe-removed');
write('domain.ts','export type Status = "paid" | "partial" | "refunded";\n');write('api.ts','import type {Status} from "./domain.ts";\nexport function identity(value:Status):Status{return value;}\n');compile('referenced-type-before');const entryBefore=read('types/api.d.ts'),domainBefore=read('types/domain.d.ts');
write('domain.ts','export type Status = string;\n');compile('referenced-type-after');assert.equal(read('types/api.d.ts'),entryBefore);assert.notEqual(read('types/domain.d.ts'),domainBefore);remove('api.ts');remove('domain.ts');compile('referenced-type-probe-removed');
config();write('control.ts','export const reasons = ["paid", "partial", "refunded"] as const;\nexport type Reason = (typeof reasons)[number];\n');compile('derived-type-before');assert.equal(read('types/control.d.ts'),'export declare const reasons: readonly ["paid", "partial", "refunded"];\nexport type Reason = (typeof reasons)[number];\n');
write('control.ts',replace(read('control.ts'),' as const',''));compile('derived-type-after');assert.equal(read('types/control.d.ts'),'export declare const reasons: string[];\nexport type Reason = (typeof reasons)[number];\n');remove('control.ts');compile('derived-type-probe-removed');
write('api.ts','export function format(status:string):string{return status.toUpperCase();}\n');write('local.ts','import {format} from "./api.ts";\nexport const shown = format("paid");\n');write('external.ts','import {format} from "./api.ts";\nexport function display(status:string):string{return format(status);}\n');compile('parameter-before-with-old-caller');const external=read('external.ts');remove('external.ts');
write('api.ts',replace(read('api.ts'),'status:string','status:"paid" | "partial" | "refunded"'));compile('parameter-narrowed-local-green');write('external.ts',external);compile('parameter-narrowed-old-caller-rejected',[diagnostic('external.ts','return format',2345)]);
state(chosen);compile('all-controls-restored');testRun('final-retained-tests');js('final-current-values',values,current);
const membership=command('final-membership',tsc,['-p','tsconfig.json','--listFilesOnly']).stdout.trim().split(/\r?\n/).map(f=>fs.realpathSync(f));fileListQueries++;
const local=membership.filter(f=>f.startsWith(story+path.sep)).map(f=>path.relative(story,f)).sort();assert.deepEqual(local,Object.keys(chosen).sort());
for(const [f,s] of Object.entries(chosen))assert.equal(read(f),s,f+' final source');verifyOwned();
const report={typescript:version,node:process.version,fences:fences.length,compilerCases,runtimeGroups,fileListQueries,ownedSha256:owned,assistantArtifactSha256:digest(JSON.stringify({summary,question,reply,revisedSummary})),scratch};
fs.writeFileSync(path.join(scratch,'SUMMARY.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));console.log('Bonus 3: PASS');

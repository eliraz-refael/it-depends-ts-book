'use strict';
// One repository follows the manuscript; controls use separate programs.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {version,defaults}=require('./compiler.cjs');
const repo=path.resolve(__dirname,'..'),executable=path.join(repo,'node_modules/.bin/tsc');
const manuscript=fs.readFileSync(path.join(repo,'book/05-bonus-ai-and-typescript/01-prompting-for-typescript.md'),'utf8');
const fences=[...manuscript.matchAll(/```(\w+)\n([\s\S]*?)\n```/g)].map(m=>({language:m[1],body:m[2]}));
const used=new Set();
function block(prefix){const found=fences.flatMap((f,i)=>f.body.startsWith(prefix)?[{...f,i}]:[]);assert.equal(found.length,1,prefix);used.add(found[0].i);return found[0].body+'\n';}
function files(source){const out={};let name;for(const line of source.split('\n')){const m=line.match(/^\/\/ ((?:(?:src|test)\/[\w.-]+\.ts)|reset\.d\.ts)(?: —.*)?$/);if(m){name=m[1];assert(!out[name]);out[name]='';}else if(name)out[name]+=line+'\n';else assert(!line.trim());}return out;}
function replace(source,from,to){assert.equal(source.split(from).length,2,'Unique replacement: '+from);return source.replace(from,to);}
const parser='src/parse-refund.ts',contract='src/contract.ts',testFile='test/refund.test.ts',probe='src/probe.ts';
const initial=files(block('// src/contract.ts — initial'));
const firstProbe=files(block('// src/probe.ts — first'))[probe];
const manifest=JSON.parse(block('{\n  "private"'));
const config=JSON.parse(block('{\n  "compilerOptions"'));
const reset=files(block('// reset.d.ts'))['reset.d.ts'];
const resultContract=files(block('// src/contract.ts — replacement'))[contract];
const initialTests=files(block('// test/refund.test.ts — initial'))[testFile];
const coercing=files(block('// src/parse-refund.ts — second'))[parser];
const strictLine=files(block('// src/parse-refund.ts — alternative'))[parser].trim();
const strict=replace(coercing,'const cents = Number(value.cents);',strictLine);
const emptyProbe=files(block('// src/probe.ts — empty'))[probe];
const addedTests=files(block('// test/refund.test.ts — append'))[testFile];
const finalTests=initialTests+addedTests;
assert.equal(used.size,fences.length,'Every fence extracted');assert.equal(fences.length,11);
assert.equal((manuscript.match(/^```/gm)||[]).length,2*fences.length);
assert(fences.every(f=>['typescript','json'].includes(f.language)));
for(const [key,value] of Object.entries(defaults))if(key!=='types')assert.deepEqual(config.compilerOptions[key],value,key);
assert.deepEqual(config.compilerOptions.types,['node']);
assert.equal(config.compilerOptions.noUncheckedIndexedAccess,undefined);
assert.equal(manifest.devDependencies.typescript,version);
assert.equal(manifest.devDependencies['@types/node'],require(path.join(repo,'node_modules/@types/node/package.json')).version);
assert.equal(manifest.type,'module');
const scriptMatch=manifest.scripts.check.match(/^tsc -p tsconfig.json && node --test "([^"]+)"$/);assert(scriptMatch);
assert.equal(scriptMatch[1],'test/**/*.test.ts');
// Extract assistant requests, not the Verdict's editorial blockquote.
const requests=[...manuscript.matchAll(/^> ((?:Write a TypeScript function|Implement (?:only )?src\/parse-refund\.ts).*)$/gm)].map(m=>m[1]);
assert.equal(requests.length,3);
for(const request of requests.slice(1))assert(request.includes('npm run check'));
const finalRequest=requests.at(-1);
assert(manuscript.includes('He saves this request for the next time they ask the assistant to regenerate the parser:'),'Final request is saved for regeneration, not a new claimed response');
for(const file of [parser,contract,testFile,'tsconfig.json','package.json','reset.d.ts'])assert(finalRequest.includes(file),file+' in final request');
assert(finalRequest.includes('reject strings rather than coercing them'));
assert(finalRequest.includes('Keep the contract, tests and project files unchanged'));
assert(finalRequest.includes('report the conflict before implementing'));
assert(finalRequest.includes("Don't replace a failing check with a cast or suppression"));
const printedInitial=manuscript.match(/prints `(string \d+)`/)[1];
const printedEmpty=manuscript.match(/prints `(\{"ok":true,[^`]+\})`/)[1];
const quoted="Type 'unknown' is not assignable to type 'Refund'.";
assert(manuscript.includes('TS2322: '+quoted));
const scratch=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'ts-book-bonus1-'))),story=path.join(scratch,'story');
let compilerCases=0,runtimeGroups=0,fileListQueries=0,ownershipVerifications=0;
const results=[];
function write(root,file,value){const p=path.join(root,file);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,typeof value==='string'?value:JSON.stringify(value,null,2)+'\n');}
function read(root,file){return fs.readFileSync(path.resolve(root,file),'utf8');}
function remove(root,file){fs.unlinkSync(path.join(root,file));}
function route(root){fs.symlinkSync(path.join(repo,'node_modules'),path.join(root,'node_modules'),'dir');}
function command(name,root,exe,args,status){const r=cp.spawnSync(exe,args,{cwd:root,encoding:'utf8',timeout:60000,maxBuffer:12e6});if(r.error)throw r.error;results.push({name,root,exe,args,status:r.status,stdout:r.stdout,stderr:r.stderr});write(scratch,'RESULTS.json',results);assert.equal(r.status,status,name+'\n'+r.stdout+r.stderr);return r.stdout+r.stderr;}
function diagnostic(file,needle,code,message){return {file,needle,code,message};}
function compile(name,expected=[],root=story){const output=command(name,root,executable,['-p','tsconfig.json','--pretty','false','--noErrorTruncation'],expected.length?1:0);const found=[...output.matchAll(/^(.+)\((\d+),(\d+)\): error TS(\d+): (.*)$/gm)];assert.equal(found.length,expected.length,name+'\n'+output);for(const e of expected){const source=read(root,e.file).split('\n');const lines=source.flatMap((l,i)=>l.includes(e.needle)?[i+1]:[]);assert.equal(lines.length,1,e.needle);assert(found.some(m=>path.resolve(root,m[1])===path.resolve(root,e.file)&&+m[2]===lines[0]&&+m[4]===e.code&&(e.column===undefined||+m[3]===e.column)&&(e.message===undefined||m[5]===e.message)),name+' exact diagnostic\n'+output);}compilerCases++;return output;}
function run(name,args,expected,root=story){const output=command(name,root,process.execPath,args,0);assert.equal(output.trim(),expected,name);runtimeGroups++;return output;}
const owned=[contract,testFile,'package.json','tsconfig.json','reset.d.ts'];
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function hashes(){return Object.fromEntries(owned.map(f=>[f,hash(read(story,f))]));}
let acceptedHashes;
function freeze(){acceptedHashes=hashes();}
function unchanged(){assert.deepEqual(hashes(),acceptedHashes,'Owned files unchanged between candidates');ownershipVerifications++;}
function testNames(source){return [...source.matchAll(/test\("([^"]+)"/g)].map(m=>m[1]);}
assert.equal(testNames(initialTests).length,2);assert.equal(testNames(finalTests).length,5);
function suite(name,source,failures=[]){unchanged();const names=testNames(source);const output=command(name,story,'npm',['run','--silent','check'],failures.length?1:0);assert(!/error TS\d+:/.test(output),name+' reaches runtime');assert.deepEqual([...output.matchAll(/^# Subtest: (.*)$/gm)].map(m=>m[1]),names,name+' selected tests');assert(output.includes('# tests '+names.length));assert(output.includes('# pass '+(names.length-failures.length)));assert(output.includes('# fail '+failures.length));const failed=[...output.matchAll(/^not ok \d+ - (.*)$/gm)].map(m=>m[1]);assert.deepEqual(failed,failures,name+' exact failing tests');compilerCases++;runtimeGroups++;unchanged();return output;}
write(story,'package.json',manifest);write(story,'tsconfig.json',config);route(story);
for(const [f,s] of Object.entries(initial))write(story,f,s);write(story,probe,firstProbe);
compile('initial-unchecked-return');run('initial-real-caller',[probe],printedInitial);
write(story,'reset.d.ts',reset);
const rawError={...diagnostic(parser,'return JSON.parse(raw)',2322,quoted),column:3};
compile('reset-stops-unchecked-return',[rawError]);
remove(story,'reset.d.ts');compile('removing-reset-restores-original');run('removing-reset-runtime-control',[probe],printedInitial);
write(story,'reset.d.ts',reset);compile('reset-restored',[rawError]);
remove(story,probe);write(story,contract,resultContract);write(story,testFile,initialTests);write(story,parser,coercing);freeze();
const firstOwned={...acceptedHashes};
suite('returned-coercing-numeric-cases',initialTests);
write(story,parser,strict);suite('alternative-strict-same-numeric-cases',initialTests);
write(story,parser,coercing);suite('returned-candidate-restored',initialTests);
assert.deepEqual(hashes(),firstOwned);
write(story,probe,emptyProbe);compile('empty-amount-probe-compiles');run('empty-amount-printed-output',[probe],printedEmpty);unchanged();
remove(story,probe);write(story,testFile,finalTests);freeze();
// Only the owner-authored acceptance file changes at the Turn.
for(const file of owned.filter(f=>f!==testFile))assert.equal(acceptedHashes[file],firstOwned[file]);
assert.notEqual(acceptedHashes[testFile],firstOwned[testFile]);
const textFailure=suite('coercion-fails-owned-text-cases',finalTests,['rejects text amounts']);
const otherPasses=[...textFailure.matchAll(/^ok \d+ - (.*)$/gm)].map(m=>m[1]);
assert.deepEqual(otherPasses,testNames(finalTests).filter(name=>name!=='rejects text amounts'));
assert.equal(otherPasses.length,4,'The other four tests pass, including malformed input');
assert(addedTests.includes('for (const cents of ["", "100"])'),'Motivating empty string is first');
assert(textFailure.includes('cents: ""'),'Failure identifies the empty-string input');
assert(!textFailure.includes('cents: "100"'),'Failing loop stops before the second input');
assert(/actual:\s*\n\s+ok: true\s*\n\s+value:\s*\n\s+id: 'r1'\s*\n\s+cents: 0/.test(textFailure),'Actual failing result is the zero-cent refund');
write(story,parser,strict);suite('strict-restores-all-five',finalTests);
// Verify that both contrasting values fail independently, despite the loop stopping at its first assertion.
function values(name,expected){const source='import {parseRefund} from "./src/parse-refund.ts"; console.log(JSON.stringify([100,-1,"100","",0].map(cents=>parseRefund(JSON.stringify({id:"r1",cents})))));';run(name,['--input-type=module','-e',source],JSON.stringify(expected));unchanged();}
const good=n=>({ok:true,value:{id:'r1',cents:n}}),bad={ok:false,error:'invalid amount'};
values('strict-both-text-values-reject',[good(100),bad,bad,bad,good(0)]);
write(story,parser,coercing);values('coercing-both-text-values-convert',[good(100),bad,good(100),good(0),good(0)]);
// Restore the selected implementation after validation-only value comparisons.
// The saved request is not sent; the page's five-test run already occurred above.
write(story,parser,strict);
const selected=read(story,parser),finalOwned={...acceptedHashes};
// Check the ownership verifier itself, then restore before any candidate runs.
write(story,contract,resultContract+'// unauthorized change\n');assert.throws(unchanged,/Owned files unchanged/);write(story,contract,resultContract);unchanged();
// Run the reject-everything mutation separately from the scene's two candidates.
write(story,parser,'import type {Result} from "./contract.ts";\nexport function parseRefund(raw:string):Result{return {ok:false,error:"invalid amount"};}\n');
suite('always-reject-fails-positive-contract',finalTests,['keeps numeric cents','keeps numeric zero']);
// Its rejection-only subset really is green; selection uses the same owned file.
const rejections=command('always-reject-negative-only',story,process.execPath,['--test','--test-name-pattern','^rejects',scriptMatch[1]],0);
assert(rejections.includes('# pass 3'));assert(rejections.includes('# fail 0'));assert.deepEqual([...rejections.matchAll(/^# Subtest: (.*)$/gm)].map(m=>m[1]),testNames(finalTests).filter(n=>n.startsWith('rejects')));assert(!/^not ok /m.test(rejections));runtimeGroups++;unchanged();
write(story,parser,selected);suite('always-reject-restored',finalTests);
// A lying annotated predicate has none of the proposed banned tokens and still fails behavior.
write(story,parser,'import type {Refund,Result} from "./contract.ts";\nfunction isRefund(value:unknown):value is Refund{return true;}\nexport function parseRefund(raw:string):Result {try {const value=JSON.parse(raw);if(isRefund(value))return {ok:true,value};return {ok:false,error:"invalid refund"};}catch{return {ok:false,error:"invalid JSON"};}}\n');
suite('predicate-passes-compiler-fails-behavior',finalTests,['rejects a negative amount','rejects text amounts','rejects malformed input']);
write(story,parser,selected);suite('predicate-restored',finalTests);
const list=command('final-file-membership',story,executable,['-p','tsconfig.json','--listFilesOnly'],0).trim().split(/\r?\n/).map(f=>fs.realpathSync(f));fileListQueries++;
for(const file of [...owned.filter(f=>f.endsWith('.ts')),parser])assert(list.includes(fs.realpathSync(path.join(story,file))));
assert(!list.includes(path.join(story,probe)));assert(list.includes(fs.realpathSync(path.join(repo,'node_modules/@types/node/index.d.ts'))));
// Validation-only programs use the same book defaults; no global reset leaks into other chapters.
function control(name,source,options={},extra={}){const root=path.join(scratch,name);write(root,'package.json',{type:'module'});write(root,'case.ts',source);write(root,'tsconfig.json',{compilerOptions:{...defaults,noEmit:true,...options},files:['case.ts',...Object.keys(extra)],include:[]});for(const [f,s] of Object.entries(extra))write(root,f,s);return root;}
const refund='type Refund={id:string;cents:number};\n';
let root=control('book-profile',refund+'export function parse(raw:string):Refund{return JSON.parse(raw);}\n');compile('book-profile-baseline',[],root);
write(root,'reset.d.ts',reset);write(root,'tsconfig.json',{compilerOptions:{...defaults,noEmit:true},files:['case.ts','reset.d.ts'],include:[]});
compile('book-profile-reset',[diagnostic('case.ts','return JSON.parse',2322,quoted)],root);
root=control('array-profile','export function first(lines:{cents:number}[]):number{return lines[0].cents;}\n');compile('indexed-access-book-default',[],root);
write(root,'tsconfig.json',{compilerOptions:{...defaults,noEmit:true,noUncheckedIndexedAccess:true},files:['case.ts'],include:[]});
compile('indexed-access-opt-in',[diagnostic('case.ts','return lines',2532,"Object is possibly 'undefined'.")],root);
write(root,'case.ts','export function first(lines:{cents:number}[]):number{const value=lines[0];return value===undefined?0:value.cents;}\n');compile('indexed-access-checked-restored',[],root);
root=control('response-json',refund+'export async function parse(response:Response):Promise<Refund>{return response.json();}\n',{}, {'reset.d.ts':reset});compile('DOM-response-not-reset',[],root);
const moduleSource=refund+'export function parse(raw:string):Refund{return JSON.parse(raw);}\n';
root=control('reset-module-scope',moduleSource,{}, {'reset.d.ts':'export {};\n'+reset});compile('module-local-reset-no-effect',[],root);
write(root,'reset.d.ts','export {};\ndeclare global {\n'+reset+'}\n');compile('explicit-global-reset',[diagnostic('case.ts','return JSON.parse',2322,quoted)],root);
write(root,'reset.d.ts','export {};\n'+reset);compile('module-scope-control-restored',[],root);
// Imported source joins the program even when include selects only generated/.
root=control('import-scope','');remove(root,'case.ts');
write(root,'generated/task.ts','import {first} from "../legacy.js"; export const cents=first([{cents:100}]);\n');
write(root,'legacy.ts','export function first(lines:{cents:number}[]):number{return lines[0].cents;}\n');
write(root,'tsconfig.json',{compilerOptions:{...defaults,noEmit:true},include:['generated/*.ts']});compile('generated-directory-baseline',[],root);
write(root,'tsconfig.json',{compilerOptions:{...defaults,noEmit:true,noUncheckedIndexedAccess:true},include:['generated/*.ts']});
compile('imports-join-stricter-program',[diagnostic('legacy.ts','return lines',2532,"Object is possibly 'undefined'.")],root);
write(root,'tsconfig.json',{compilerOptions:{...defaults,noEmit:true},include:['generated/*.ts']});compile('import-scope-restored',[],root);
// Published dependency declarations and directly compiled source are distinct compatibility checks.
root=control('dependency-declarations','import {z} from "zod"; import type {Request,Response} from "express"; import {Buffer} from "node:buffer";\nexport const parse=z.object({id:z.string(),cents:z.number()}).parse; export type Handler=(req:Request,res:Response)=>void; export const bytes=Buffer.from("{}");\n',{skipLibCheck:false});route(root);compile('installed-declarations-baseline',[],root);
write(root,'reset.d.ts',reset);write(root,'tsconfig.json',{compilerOptions:{...defaults,noEmit:true,skipLibCheck:false},files:['case.ts','reset.d.ts'],include:[]});compile('installed-declarations-reset-compatible',[],root);
const zodSource=path.join(repo,'node_modules/zod/src/v4/classic/from-json-schema.ts');
root=control('zod-source','',{skipLibCheck:false,allowImportingTsExtensions:true});
const sourceConfig={compilerOptions:{...defaults,noEmit:true,skipLibCheck:false,allowImportingTsExtensions:true},files:[zodSource],include:[]};
write(root,'tsconfig.json',sourceConfig);compile('Zod-source-baseline',[],root);
write(root,'reset.d.ts',reset);write(root,'tsconfig.json',{...sourceConfig,files:[zodSource,path.join(root,'reset.d.ts')]});
const zf=f=>path.join(repo,'node_modules/zod/src/v4',f);
compile('Zod-source-reset-impact',[
 diagnostic(zf('classic/from-json-schema.ts'),'normalized = JSON.parse',2322,"Type 'unknown' is not assignable to type 'JSONSchema'."),
 diagnostic(zf('core/schemas.ts'),'if ("typ" in parsedHeader',18046,"'parsedHeader' is of type 'unknown'."),
 diagnostic(zf('core/schemas.ts'),'if (!parsedHeader.alg)',18046,"'parsedHeader' is of type 'unknown'."),
 diagnostic(zf('core/schemas.ts'),'if (algorithm &&',18046,"'parsedHeader' is of type 'unknown'."),
 diagnostic(zf('core/to-json-schema.ts'),'return finalized',2322,"Type 'unknown' is not assignable to type 'ZodStandardJSONSchemaPayload<T>'.")
],root);
write(root,'tsconfig.json',sourceConfig);compile('Zod-source-restored',[],root);
assert.equal(read(story,parser),strict);assert.equal(read(story,testFile),finalTests);assert.deepEqual(hashes(),finalOwned);assert(!fs.existsSync(path.join(story,probe)));
write(scratch,'OWNED-HASHES.json',{numericCases:firstOwned,finalAcceptance:finalOwned});
const summary={typescript:version,node:process.version,fences:fences.length,compilerCases,runtimeGroups,fileListQueries,ownershipVerifications,scratch};
write(scratch,'SUMMARY.json',summary);console.log(JSON.stringify(summary,null,2));console.log('Bonus 1: PASS');

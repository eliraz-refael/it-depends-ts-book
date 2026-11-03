'use strict';
// Extracted states evolve in one repository. Mutations are separate and restore green.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {defaults,version}=require('./compiler.cjs');
const repo=path.resolve(__dirname,'..'),tsc=path.join(repo,'node_modules/.bin/tsc');
const manuscript=fs.readFileSync(path.join(repo,'book/05-bonus-ai-and-typescript/02-type-safe-agent-patterns.md'),'utf8');
const fences=[...manuscript.matchAll(/```(\w+)\n([\s\S]*?)\n```/g)].map(m=>({language:m[1],body:m[2]}));
assert.equal(fences.length,9);assert(fences.length<=10);assert.equal((manuscript.match(/^```/gm)||[]).length,18);
assert(fences.every(f=>f.language==='typescript'));
const used=new Set();
function block(prefix){const matches=fences.flatMap((f,i)=>f.body.startsWith(prefix)?[{...f,i}]:[]);assert.equal(matches.length,1,prefix);used.add(matches[0].i);return matches[0].body+'\n';}
function files(source){const out={};let name;for(const line of source.split('\n')){const m=line.match(/^\/\/ ([\w.-]+\.ts)(?: —.*)?$/);if(m){name=m[1];assert(!out[name],name);out[name]='';}else if(name)out[name]+=line+'\n';else assert(!line.trim());}return out;}
function replace(source,from,to){assert.equal(source.split(from).length,2,'Unique replacement: '+from);return source.replace(from,to);}
const initial=files(block('// contract.ts'));
const artifacts=files(block('// calls.ts'));
const plumbing=files(block('// tool.ts'));
const generated=files(block('// replay.ts — generated description'));
const outgoingDefinition=generated['replay.ts'].match(/const outgoing = \[[\s\S]*?\n\}\];/)[0];
const requiredField=files(block('// shop.ts — replace the currency property'))['shop.ts'].trim();
const turn=block('// shop.ts — replace Refund');
const turnParts=turn.split('// shop.ts — replace the inner refund function\n');assert.equal(turnParts.length,2);
const intentSchema=turnParts[0].replace('// shop.ts — replace Refund\n','').trim();
const intentHandler=turnParts[1].trim();
const finalShop=files(block('// shop.ts — final replacement'))['shop.ts'];
const replayBeforeOutcome=files(block('// replay.ts — final replacement'))['replay.ts'];
const outcome=files(block('// replay.ts — append outcome'))['replay.ts'];
const finalReplay=replayBeforeOutcome+outcome;
assert.equal(used.size,fences.length,'Every fence extracted');
assert(manuscript.indexOf('## The Turn')<manuscript.indexOf('### \"Why does that field decide anything?\"'));
assert(!manuscript.includes('refund_help'));
const printedRequired=Object.fromEntries([...plumbing['tool.ts'].matchAll(/^\s*\/\/ Initial Refund, (default \(output\) mode|\{ io: "input" \}): required (\[[^\n]+\])/gm)]
 .map(m=>[m[1],JSON.parse(m[2])]));
assert.deepEqual(Object.keys(printedRequired),['default (output) mode','{ io: "input" }'],'Both generated required lists are printed');
assert(manuscript.includes('The old `refund` entry point is gone'));
assert(manuscript.includes('`\"default\":\"USD\"`'));
assert(manuscript.includes('The replay keeps both calls on hand:'));
assert(manuscript.includes('TypeScript '+version));assert(manuscript.includes('Node '+process.versions.node));
assert.equal(require('../node_modules/zod/package.json').version,'4.6.6');assert(manuscript.includes('4.6.6'));
const projectNotes=initial['contract.ts'].split('\n').filter(line=>line.startsWith('// ')).join('\n');
for(const flag of ['noEmit','allowImportingTsExtensions','strict','exactOptionalPropertyTypes','ES2022','Node16','moduleResolution','"type": "module"'])assert(projectNotes.includes(flag),'Project comment: '+flag);
const scratch=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'ts-book-bonus2-'))),story=path.join(scratch,'story');
const results=[];let compilerCases=0,runtimeGroups=0,fileListQueries=0;
function write(file,value){const p=path.join(story,file);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,typeof value==='string'?value:JSON.stringify(value,null,2)+'\n');}
const read=file=>fs.readFileSync(path.join(story,file),'utf8');
const remove=file=>fs.unlinkSync(path.join(story,file));
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
function save(){fs.writeFileSync(path.join(scratch,'RESULTS.json'),JSON.stringify(results,null,2)+'\n');}
function command(name,exe,args,status=0){const r=cp.spawnSync(exe,args,{cwd:story,encoding:'utf8',timeout:60000,maxBuffer:12e6});if(r.error)throw r.error;results.push({name,exe,args,status:r.status,stdout:r.stdout,stderr:r.stderr});save();assert.equal(r.status,status,name+'\n'+r.stdout+r.stderr);return r.stdout;}
function compile(name,expected=[]){const output=command(name,tsc,['-p','tsconfig.json','--pretty','false','--noErrorTruncation'],expected.length?1:0);const found=[...output.matchAll(/^(.+)\((\d+),(\d+)\): error TS(\d+): (.*)$/gm)];assert.equal(found.length,expected.length,output);for(const e of expected){const lines=read(e.file).split('\n').flatMap((l,i)=>l.includes(e.needle)?[i+1]:[]);assert.equal(lines.length,1,e.needle);assert(found.some(m=>path.resolve(story,m[1])===path.join(story,e.file)&&+m[2]===lines[0]&&+m[4]===e.code&&(e.message===undefined||m[5]===e.message)&&(e.column===undefined||+m[3]===e.column)),name+'\n'+output);}compilerCases++;}
function run(name,expected){const output=command(name,process.execPath,['replay.ts']).trim();assert.equal(output,expected,name);runtimeGroups++;return output;}
function js(name,source,expected){const output=command(name,process.execPath,['--input-type=module','-e',source]).trim();assert.deepEqual(JSON.parse(output),expected,name);runtimeGroups++;}
const imports='import {z} from "zod"; import {makeShop,Refund} from "./shop.ts"; import {dispatch,defineTool} from "./tool.ts"; import {help,dispatchRegistry} from "./registry-control.ts"; import {ownCall,friendCall,friendReply} from "./calls.ts";\n';
function scenario(name,source,expected){js(name,imports+source,expected);}
const usd={orderId:'o-12',cents:500,currency:'USD'},eur={...usd,currency:'EUR'},foreign={orderId:'o-17',cents:500,currency:'USD'};
const ok=value=>({ok:true,value}),bad=error=>({ok:false,error});
const line=value=>JSON.stringify(value);
const dollarLedger=line([usd]),dollarResult=line(ok(usd)),foreignResult=line(ok(foreign)),euroResult=line(ok(eur));
// Every printed JSON result is tied to the manuscript, rather than silently copied into tests.
const printed=[...manuscript.matchAll(/`(\{[^`]*\}|\[[^`]*\])`/g)].map(m=>m[1]);
for(const value of [dollarLedger,dollarResult,foreignResult,euroResult,line(bad('invalid arguments')),line(bad('order unavailable')),'[]','{"refundIssued":true}','{"refundIssued":false}'])assert(printed.includes(value),'Printed value: '+value);
assert(manuscript.includes('prints `true`, then'));assert(manuscript.includes('then `0`'));
write('package.json',{private:true,type:'module'});
write('tsconfig.json',{compilerOptions:{...defaults,noEmit:true,allowImportingTsExtensions:true},include:['*.ts']});
fs.symlinkSync(path.join(repo,'node_modules'),path.join(story,'node_modules'),'dir');
for(const [f,s] of Object.entries({...initial,...artifacts}))write(f,s);
compile('initial-typed-replay');run('initial-dollar-ledger',dollarLedger);
const artifactHash=digest(read('calls.ts'));
js('handwritten-contract-and-default',`import {z} from 'zod';import {description} from './description.ts';import {Refund} from './shop.ts';import {ownCall} from './calls.ts';console.log(JSON.stringify({name:description.name,required:description.parameters.required,input:JSON.parse(ownCall.arguments),parsed:Refund.parse(JSON.parse(ownCall.arguments))}));`,{name:'refund_order',required:['orderId','cents'],input:{orderId:'o-12',cents:500},parsed:usd});
for(const [f,s] of Object.entries({...plumbing,...generated}))write(f,s);
// General receiver and differently shaped second handler are validation-only, not manuscript fences.
write('registry-control.ts',`import {z} from 'zod';import {defineTool} from './tool.ts';import type {Result} from './contract.ts';
export const help=defineTool({name:'refund_help',description:'Explain partial refunds.',schema:z.strictObject({language:z.enum(['en','fr'])}),run:args=>({ok:true,value:args.language==='fr'?'Remboursement partiel':'Partial refund'})});
const Envelope=z.strictObject({name:z.string(),arguments:z.string()});
export function dispatchRegistry(input:unknown,tools:readonly {name:string;invoke:(raw:unknown)=>Result<unknown>}[]):Result<unknown>{
 const call=Envelope.safeParse(input);if(!call.success)return {ok:false,error:'invalid envelope'};
 const tool=tools.find(t=>t.name===call.data.name);if(!tool)return {ok:false,error:'unknown tool'};
 let raw:unknown;try{raw=JSON.parse(call.data.arguments)}catch{return {ok:false,error:'invalid JSON'}}
 return tool.invoke(raw);
}
`);
remove('description.ts');compile('generated-replay-and-validation-registry');run('generation-still-dollars',dollarResult+'\n'+dollarLedger);
assert.equal(digest(read('calls.ts')),artifactHash);
scenario('input-output-schema-beat',`const output=z.toJSONSchema(Refund),input=z.toJSONSchema(Refund,{io:'input'});const shop=makeShop();const tool=defineTool({name:'refund_order',description:'refund',schema:Refund,run:shop.refund});const refund=tool;${outgoingDefinition}
console.log(JSON.stringify({outgoingMatches:JSON.stringify(outgoing)===JSON.stringify([{name:tool.name,description:tool.description,parameters:input}]),outgoingKeys:Object.keys(outgoing[0]).sort(),output:output.required,input:input.required,outputAdditional:output.additionalProperties,inputHasAdditional:Object.hasOwn(input,'additionalProperties'),default:input.properties.currency.default,same:JSON.stringify(tool.parameters)===JSON.stringify(input)}));`,{outgoingMatches:true,outgoingKeys:['description','name','parameters'],output:printedRequired['default (output) mode'],input:printedRequired['{ io: "input" }'],outputAdditional:false,inputHasAdditional:false,default:'USD',same:true});
scenario('single-tool-replay-invalid-envelope-and-JSON',`const shop=makeShop();const refund=defineTool({name:'refund_order',description:'refund',schema:Refund,run:shop.refund});const inputs=[{name:'refund_order',arguments:'{'},{name:'refund_order',arguments:{}},{name:'missing',arguments:'{}'}];const thrown=inputs.map(input=>{try{dispatch(input,refund);return false}catch{return true}});console.log(JSON.stringify({thrown,receipts:shop.receipts()}));`,{thrown:[true,true,true],receipts:[]});
scenario('second-tool-and-bad-wire',`const shop=makeShop();const refund=defineTool({name:'refund_order',description:'refund',schema:Refund,run:shop.refund});const tools=[refund,help];console.log(JSON.stringify({answers:[dispatchRegistry({name:'refund_help',arguments:'{"language":"en"}'},tools),dispatchRegistry({name:'refund_help',arguments:'{"language":"fr"}'},tools),dispatchRegistry({name:'refund_help',arguments:'{"language":"xx"}'},tools),dispatchRegistry({name:'refund_order',arguments:'{'},tools),dispatchRegistry({name:'refund_order',arguments:{}},tools),dispatchRegistry({name:'missing',arguments:'{}'},tools),dispatchRegistry({name:'refund_order',arguments:'{"orderId":"o-12"}'},tools)],receipts:shop.receipts()}));`,{answers:[ok('Partial refund'),ok('Remboursement partiel'),bad('invalid arguments'),bad('invalid JSON'),bad('invalid envelope'),bad('unknown tool'),bad('invalid arguments')],receipts:[]});
write('shop.ts',replace(read('shop.ts'),'currency: z.enum(["USD", "EUR"]).default("USD"),',requiredField));
compile('required-currency');run('original-call-now-refused',line(bad('invalid arguments'))+'\n[]');
const explicitCall=manuscript.match(/He replaces `ownCall` at the dispatch site with `(\{ name: "refund_order", arguments: '[^']+' \})`/)[1];
write('replay.ts',replace(read('replay.ts'),'dispatch(ownCall, refund)',`dispatch(${explicitCall}, refund)`));
compile('explicit-wrong-currency');run('explicit-USD-still-recorded',dollarResult+'\n'+dollarLedger);
scenario('required-currency-positive-and-enum-control',`const shop=makeShop();const tool=defineTool({name:'refund_order',description:'refund',schema:Refund,run:shop.refund});console.log(JSON.stringify([tool.invoke({orderId:'o-12',cents:500,currency:'GBP'}),tool.invoke({orderId:'o-12',cents:500,currency:'EUR'}),shop.receipts()]));`,[bad('invalid arguments'),ok(eur),[eur]]);
const oldSchema=read('shop.ts').match(/export const Refund = z.object\([\s\S]*?\n\}\);/)[0];
const oldHandler=read('shop.ts').match(/  function refund\([\s\S]*?\n  \}/)[0];
write('shop.ts',replace(replace(read('shop.ts'),oldSchema,intentSchema),oldHandler,intentHandler));
compile('strict-schema-rejects-explicit-USD');run('explicit-USD-no-longer-an-argument',line(bad('invalid arguments'))+'\n[]');
write('replay.ts',generated['replay.ts']);compile('currency-from-record');run('original-call-now-euros',euroResult+'\n'+line([eur]));
const intentShop=read('shop.ts');
write('shop.ts',replace(intentShop,'  const order = orders.get(args.orderId);','  args.currency;\n  const order = orders.get(args.orderId);'));
const currencyMessage="Property 'currency' does not exist on type '{ orderId: string; cents: number; }'.";
assert(manuscript.includes('**TS2339**: `'+currencyMessage+'`'));
compile('removed-field-diagnostic',[{file:'shop.ts',needle:'args.currency;',code:2339,column:8,message:currencyMessage}]);
write('shop.ts',intentShop);compile('removed-field-restored');run('removed-field-restored-euro',euroResult+'\n'+line([eur]));
write('replay.ts',replace(read('replay.ts'),'dispatch(ownCall, refund)','dispatch(friendCall, refund)'));
compile('foreign-order-valid-before-authorization');run('foreign-order-recorded-before-authorization',foreignResult+'\n'+line([foreign]));
write('shop.ts',finalShop);write('replay.ts',replayBeforeOutcome);compile('session-bound-final');
const sessionOutput='true\n'+line(bad('order unavailable'))+'\n0\n'+foreignResult+'\n'+euroResult;
run('same-schema-two-sessions',sessionOutput);
write('replay.ts',finalReplay);compile('saved-outcome-and-executor-result');
const finalOutput=sessionOutput+'\n'+line({refundIssued:true})+'\n'+line({refundIssued:false});
run('printed-outcome-payoff',finalOutput);
scenario('ledger-receipts-and-input-schema',`const shop=makeShop(),alice=shop.forSession({customerId:'alice'}),bob=shop.forSession({customerId:'bob'});const denied=dispatch(friendCall,alice);const empty=shop.receipts();dispatch(friendCall,bob);dispatch(ownCall,alice);console.log(JSON.stringify({denied,empty,receipts:shop.receipts(),same:JSON.stringify(alice.parameters)===JSON.stringify(z.toJSONSchema(Refund,{io:'input'})),strict:alice.parameters.additionalProperties}));`,{denied:bad('order unavailable'),empty:[],receipts:[foreign,eur],same:true,strict:false});
const remainderScenario=`const shop=makeShop(),alice=shop.forSession({customerId:'alice'});const first=alice.invoke({orderId:'o-12',cents:600});const second=alice.invoke({orderId:'o-12',cents:600});console.log(JSON.stringify({first,second,receipts:shop.receipts()}));`;
const six={...eur,cents:600};
scenario('repeated-refunds-maintain-balance',remainderScenario,{first:ok(six),second:bad('amount exceeds remaining'),receipts:[six]});
scenario('invalid-inputs-and-balance-no-effects',`const shop=makeShop(),alice=shop.forSession({customerId:'alice'});const inputs=[null,{}, {orderId:'o-12',cents:-1},{orderId:'o-12',cents:0},{orderId:'o-12',cents:1.5},{orderId:'o-12',cents:'500'},{orderId:'o-12',cents:Infinity},{orderId:'o-12',cents:500,currency:'USD'},{orderId:'o-17',cents:500,customerId:'bob'}];console.log(JSON.stringify({invalid:inputs.map(x=>alice.invoke(x)),missing:alice.invoke({orderId:'none',cents:100}),excess:alice.invoke({orderId:'o-12',cents:1001}),receipts:shop.receipts()}));`,{invalid:Array(9).fill(bad('invalid arguments')),missing:bad('order unavailable'),excess:bad('amount exceeds remaining'),receipts:[]});
scenario('captured-customer-not-mutable-session',`const shop=makeShop(),session={customerId:'alice'},alice=shop.forSession(session);session.customerId='bob';console.log(JSON.stringify([alice.invoke({orderId:'o-17',cents:500}),alice.invoke({orderId:'o-12',cents:500}),shop.receipts()]));`,[bad('order unavailable'),ok(eur),[eur]]);
scenario('two-sessions-both-directions',`const shop=makeShop(),alice=shop.forSession({customerId:'alice'}),bob=shop.forSession({customerId:'bob'});console.log(JSON.stringify([dispatch(ownCall,bob),dispatch(friendCall,alice),shop.receipts()]));`,[bad('order unavailable'),bad('order unavailable'),[]]);
scenario('copied-receipts-do-not-change-ledger',`const shop=makeShop(),alice=shop.forSession({customerId:'alice'});dispatch(ownCall,alice);const copy=shop.receipts();copy[0].currency='USD';copy.length=0;console.log(JSON.stringify(shop.receipts()));`,[eur]);
// Remove precisely the owner comparison, then restore both compiler and replay.
write('shop.ts',replace(finalShop,'!order || order.customerId !== customerId','!order'));
compile('owner-comparison-removed');scenario('removing-owner-check-restores-bad-effect',`const shop=makeShop(),alice=shop.forSession({customerId:'alice'});console.log(JSON.stringify([dispatch(friendCall,alice),shop.receipts()]));`,[ok(foreign),[foreign]]);
write('shop.ts',finalShop);compile('owner-comparison-restored');run('owner-comparison-restored-replay',finalOutput);
// An always-deny replacement must fail the positive contract even though its denials look right.
write('shop.ts',replace(finalShop,'if (!order || order.customerId !== customerId)','if (customerId.length >= 0 || !order || order.customerId !== customerId)'));
compile('always-deny-control');scenario('always-deny-loses-both-owners',`const shop=makeShop();console.log(JSON.stringify([dispatch(ownCall,shop.forSession({customerId:'alice'})),dispatch(friendCall,shop.forSession({customerId:'bob'})),shop.receipts()]));`,[bad('order unavailable'),bad('order unavailable'),[]]);
write('shop.ts',finalShop);compile('always-deny-restored');run('positive-contract-restored',finalOutput);
// The old callable entry is actually absent; restore before testing the already-private effect.
write('negative.ts','import {makeShop} from "./shop.ts";\nmakeShop().refund;\n');compile('old-refund-entry-removed',[{file:'negative.ts',needle:'.refund',code:2339}]);
remove('negative.ts');compile('old-entry-probe-restored');
// Private effect access is checked separately; no suppressed diagnostics are needed.
write('negative.ts','import { recordRefund } from "./shop.ts";\n');compile('private-effect-import-rejected',[{file:'negative.ts',needle:'import',code:2305,message:'Module \'"./shop.ts"\' has no exported member \'recordRefund\'.'}]);
remove('negative.ts');compile('private-import-restored');
write('negative.ts','import {makeShop} from "./shop.ts";\nmakeShop().recordRefund;\n');compile('private-effect-member-rejected',[{file:'negative.ts',needle:'recordRefund',code:2339}]);
remove('negative.ts');compile('private-member-restored');
// Test-only access to private state establishes fresh lookup and the refinement/export distinction.
const finalReturn='return { forSession, receipts: () => ledger.map(receipt => ({ ...receipt })) };';
const debugReturn=`return { forSession, receipts: () => ledger.map(receipt => ({ ...receipt })),
    transfer(id:string,customerId:string) { const order=orders.get(id); if(order) order.customerId=customerId; },
    policy(customerId:string) { return Refund.refine(args=>orders.get(args.orderId)?.customerId===customerId); }
  };`;
write('shop.ts',replace(finalShop,finalReturn,debugReturn));compile('test-only-transfer-and-contextual-refinement');
scenario('fresh-record-after-transfer',`const shop=makeShop(),alice=shop.forSession({customerId:'alice'});shop.transfer('o-12','bob');console.log(JSON.stringify([dispatch(ownCall,alice),shop.receipts()]));`,[bad('order unavailable'),[]]);
scenario('contextual-refinement-not-in-generated-schema',`const shop=makeShop(),policy=shop.policy('alice');console.log(JSON.stringify({plain:Refund.safeParse({orderId:'o-17',cents:500}).success,own:policy.safeParse({orderId:'o-12',cents:500}).success,foreign:policy.safeParse({orderId:'o-17',cents:500}).success,same:JSON.stringify(z.toJSONSchema(policy,{io:'input'}))===JSON.stringify(z.toJSONSchema(Refund,{io:'input'}))}));`,{plain:true,own:true,foreign:false,same:true});
write('shop.ts',finalShop);compile('test-access-removed');run('fresh-lookup-control-restored',finalOutput);
scenario('model-outcome-vs-executor-result',`const shop=makeShop(),alice=shop.forSession({customerId:'alice'});const result=dispatch(friendCall,alice);const model=z.object({refundIssued:z.boolean()}).parse(friendReply);console.log(JSON.stringify({model,host:{refundIssued:result.ok},receipts:shop.receipts()}));`,{model:{refundIssued:true},host:{refundIssued:false},receipts:[]});
// A synchronous helper that wraps arbitrary R in success accepts a Promise: off-page regression.
write('control.ts',`import {z} from 'zod';
import type {Result} from './contract.ts';
function wrap<S extends z.ZodType,R>(schema:S,run:(x:z.output<S>)=>R) {
 return (raw:unknown):Result<R> => {const parsed=schema.safeParse(raw);return parsed.success?{ok:true,value:run(parsed.data)}:{ok:false,error:'invalid arguments'};};
}
const invoke=wrap(z.string(),async () => {throw new Error('effect failed');});
const result=invoke('go');const serialized=JSON.stringify(result);let rejected='';
if(result.ok)try{await result.value}catch(e){rejected=e instanceof Error?e.message:String(e)}
console.log(JSON.stringify({serialized,rejected}));
`);compile('unsafe-async-wrapper-compiles');js('unsafe-async-wrapper-reports-early',`await import('./control.ts');`,{serialized:'{"ok":true,"value":{}}',rejected:'effect failed'});remove('control.ts');compile('async-control-removed');
write('negative.ts',`import {z} from 'zod';import {defineTool} from './tool.ts';
defineTool({name:'async',description:'not supported',schema:z.string(),run:async value=>({ok:true,value})});
`);compile('page-helper-rejects-async-handler',[{file:'negative.ts',needle:'run:async',code:2322}]);remove('negative.ts');compile('synchronous-handler-restored');run('final-replay-restored',finalOutput);
const membership=command('final-membership',tsc,['-p','tsconfig.json','--listFilesOnly']).trim().split(/\r?\n/).map(f=>fs.realpathSync(f));fileListQueries++;
for(const file of ['contract.ts','shop.ts','tool.ts','registry-control.ts','calls.ts','replay.ts'])assert(membership.includes(fs.realpathSync(path.join(story,file))),file);
for(const file of ['negative.ts','control.ts','description.ts'])assert(!fs.existsSync(path.join(story,file)),file+' removed');
assert.equal(read('shop.ts'),finalShop);assert.equal(read('replay.ts'),finalReplay);assert.equal(read('tool.ts'),plumbing['tool.ts']);assert.equal(digest(read('calls.ts')),artifactHash);
const summary={typescript:version,zod:require('../node_modules/zod/package.json').version,node:process.version,fences:fences.length,compilerCases,runtimeGroups,fileListQueries,artifactSha256:artifactHash,scratch};
fs.writeFileSync(path.join(scratch,'SUMMARY.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary,null,2));console.log('Bonus 2: PASS');

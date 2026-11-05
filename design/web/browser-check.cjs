// Local Chrome + built-in Node CDP client. No browser package or download.
const { spawn, execFileSync } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const pins = require('../print/trial-toolchain.json');
const siteOrigin = `http://127.0.0.1:${process.env.WEB_PORT || 8765}`;
const buyOrigin = `http://127.0.0.1:${process.env.WEB_BUY_PORT || 8766}`;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  assert.equal(process.version, pins.node, 'Node pin');
  assert.equal(execFileSync(chrome, ['--version'], { encoding: 'utf8' }).trim(), pins.chrome, 'Chrome pin');

  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'book-cover-'));
  const browser = spawn(chrome, ['--headless', '--remote-debugging-port=0', '--allow-file-access-from-files',
    `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check',
    '--disable-background-networking', '--disable-component-update', 'about:blank'],
    { stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  browser.stderr.on('data', chunk => { stderr += chunk; });
  let socket;
  const pending = new Map();
  try {
    let port;
    for (let n = 0; n < 200; n++) {
      try { port = (await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; }
      catch { await delay(100); }
    }
    assert.ok(port, `Chrome did not become ready: ${stderr}`);
    const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    let id = 0;
    let commandTimeout = 60000;
    const external = [];
    const errors = [];
    socket.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.id && pending.has(msg.id)) {
        const task = pending.get(msg.id);
        pending.delete(msg.id); clearTimeout(task.timer);
        if (msg.error) task.reject(new Error(JSON.stringify(msg.error)));
        else task.resolve(msg.result);
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        const value = msg.params.args[0]?.value;
        if (typeof value === 'string' && value.startsWith('PROOF_PROGRESS')) console.log(value);
      }
      if (msg.method === 'Network.requestWillBeSent' && /^https?:/.test(msg.params.request.url) && ![siteOrigin,buyOrigin].includes(new URL(msg.params.request.url).origin)) external.push(msg.params.request.url);
      if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails);
    };
    function cdp(method, params = {}) {
      return new Promise((resolve, reject) => {
        const key = ++id;
        const timer = setTimeout(() => { pending.delete(key); reject(new Error(`${method} timed out`)); }, commandTimeout);
        pending.set(key, { resolve, reject, timer });
        socket.send(JSON.stringify({ id: key, method, params }));
      });
    }
    async function evaluate(expression) {
      const result = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
      return result.result.value;
    }
    await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable');
    const base = siteOrigin;
    const config = JSON.parse(await fs.readFile(path.join(__dirname,'config.json'),'utf8'));
    const prefix = new URL(config.base_url).pathname;
    const site = path.join(__dirname,'output/site');
    const manifest = JSON.parse(await fs.readFile(path.join(__dirname,'output/site.manifest.json'),'utf8'));
    const output = path.join(__dirname,'output/screenshots'); await fs.mkdir(output,{recursive:true});
    const results=[];
    async function navigate(route,width,js=true) {
      await cdp('Emulation.setScriptExecutionDisabled',{value:!js});
      await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
      await cdp('Page.navigate',{url:base+prefix+route});
      let ready=false;
      for (let n=0;n<120;n++) {
        ready=await evaluate(`document.readyState==='complete' && location.pathname===${JSON.stringify(prefix+route)}`);
        if(ready) break;await delay(50);
      }
      assert.ok(ready,route+' loaded');
      await evaluate('document.fonts.ready.then(()=>true)');
      await delay(50);
    }
    async function shot(name,full=false) {
      await delay(150);
      const metrics=await cdp('Page.getLayoutMetrics');
      const params={format:'png',captureBeyondViewport:full,fromSurface:true};
      if(full)params.clip={x:0,y:0,width:metrics.cssContentSize.width,height:Math.min(metrics.cssContentSize.height,16000),scale:1};
      const result=await cdp('Page.captureScreenshot',params);
      await fs.writeFile(path.join(output,name+'.png'),Buffer.from(result.data,'base64'));
    }
    for(const width of [1280,390,360]) {
      for(const entry of Object.values(manifest.pages)) {
        await navigate(entry.route,width);
        const measure=await evaluate(`(() => {
          const pre=[...document.querySelectorAll('pre')];
          return {width:innerWidth,scroll:document.documentElement.scrollWidth,bodyScroll:document.body.scrollWidth,
            h1:document.querySelectorAll('h1').length,buy:document.querySelectorAll('[data-buy]').length,
            gutters:document.querySelector('.book-body') ? (()=>{const e=document.querySelector('.book-body'),s=getComputedStyle(e),r=e.getBoundingClientRect();return [r.left+parseFloat(s.paddingLeft),innerWidth-r.right+parseFloat(s.paddingRight)];})():null,
            blocks:pre.map(e=>({outside:e.getBoundingClientRect().right>innerWidth+.5,overflow:getComputedStyle(e).overflowX})),
            prose:document.querySelector('.book-body') ? (()=>{const e=document.querySelector('.book-body'),r=e.getBoundingClientRect(),s=getComputedStyle(e);return {width:r.width-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight),center:r.x+r.width/2};})():null,
            wide:[...document.querySelectorAll('.book-body .code-block,.book-body .table-scroll,.symbol-key .symbol-group > table')].map(e=>{const r=e.getBoundingClientRect();return {width:r.width,center:r.x+r.width/2};}),
            headerLinks:[...document.querySelectorAll('.header-inner nav > a:not([data-buy])')].map(e=>e.textContent),
            fenceWidths:[...document.querySelectorAll('[data-fence]')].map(e=>({id:e.dataset.fence,client:e.parentElement.clientWidth,scroll:e.parentElement.scrollWidth})),
            code:[...document.querySelectorAll('[data-fence]')].map(e=>[e.dataset.fence,e.textContent]),
            storage:[localStorage.length,sessionStorage.length,document.cookie],
            key:[...document.querySelectorAll('[data-key-literal]')].map(e=>getComputedStyle(e).fontVariantLigatures)};
        })()`);
        assert.ok(measure.scroll<=width && measure.bodyScroll<=width,`${entry.route} @ ${width}: horizontal overflow ${measure.scroll}`);
        assert.equal(measure.h1,1);assert.equal(measure.buy,0);assert.deepEqual(measure.storage,[0,0,'']);
        if(!process.env.WEB_MEASURE_ONLY) {
          assert.deepEqual(measure.headerLinks,entry.route==='' ? ['Start reading'] : [],'Header reading link');
          if(width===1280 && measure.prose) {
            assert.equal(measure.prose.width,660,'Prose width');
            assert.ok(measure.wide.every(x=>Math.abs(x.width-880)<1 && Math.abs(x.center-measure.prose.center)<1),'Wide examples centred at 880px: '+entry.route);
          }
        }
        if(width===360 && measure.gutters)assert.ok(measure.gutters.every(x=>x>=15.9),'Phone gutters');
        assert.ok(measure.blocks.every(x=>!x.outside),entry.route+' code outside page');
        assert.ok(measure.key.every(x=>x==='none'),'Typing column ligatures');
        for(const [id,text] of measure.code)assert.equal(text,manifest.fences[id].text,id);
        results.push({route:entry.route,width,noOverflow:true,fences:measure.code.length,fenceWidths:measure.fenceWidths});
      }
      console.log(`PASS all 36 pages at ${width}px`);
    }
    if(process.env.WEB_MEASURE_ONLY) {
      await fs.writeFile(process.env.WEB_MEASURE_ONLY,JSON.stringify({results},null,2)+'\n');
      return;
    }
    const chapter1=manifest.routes.find(x=>x.route.startsWith('chapters/01-')).route;
    const ch27=manifest.routes.find(x=>x.route.startsWith('chapters/27-')).route;
    const b3=manifest.routes.find(x=>x.route.startsWith('bonus/03-')).route;
    for(const width of [1280,390]) {
      for(const [name,route] of [['home',''],['chapter-01',chapter1],['cast','meet-the-cast/'],['chapter-27',ch27],['bonus-03-ending',b3]]) {
        await navigate(route,width);
        if(name==='chapter-27' || (name==='chapter-01' && width===1280))await evaluate(`document.querySelector('.code-block').scrollIntoView();window.scrollBy(0,-120)`);
        if(name==='bonus-03-ending')await evaluate(`document.querySelector('article').lastElementChild.scrollIntoView({block:'end'});window.scrollBy(0,130)`);
        await shot(`${name}-${width}`,name==='home');
        if(name==='bonus-03-ending')assert.ok(await evaluate('parseFloat(document.querySelector(".reading-progress > div").style.width)>99'), 'Reading progress at article end');
      }
      await navigate(chapter1,width);
      await evaluate(`document.querySelector('summary').click();document.querySelector('summary').focus()`);
      assert.ok(await evaluate('document.querySelector(".contents-menu").open'));
      await shot(`contents-${width}`);
      await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
      assert.ok(await evaluate('!document.querySelector(".contents-menu").open && document.activeElement===document.querySelector("summary")'),'Escape focus restoration');
    }
    for(const route of ['',chapter1,'meet-the-cast/',ch27,b3,'reading-the-code-symbols/']) {
      await navigate(route,390,false);
      // Physical pointer activation checks native disclosure with page scripts disabled.
      const r=await evaluate('(()=>{const r=document.querySelector("summary").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()');
      await cdp('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...r});
      await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...r});
      await delay(100);
      assert.ok(await evaluate('document.querySelector(".contents-menu").open'),'No-JS contents inaccessible: '+route);
      await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32});
      await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32});
      await delay(100);
      assert.ok(await evaluate('!document.querySelector(".contents-menu").open'),'No-JS keyboard toggle inaccessible: '+route);
    }
    await cdp('Emulation.setScriptExecutionDisabled',{value:false});
    // Test-only server/site has a nonempty paperback URL; production remains empty.
    await cdp('Page.navigate',{url:buyOrigin+prefix});
    await delay(500);await evaluate('document.fonts.ready.then(()=>true)');
    assert.ok(await evaluate('document.querySelectorAll("[data-buy]").length===2'),'Test buy links missing');
    await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
    await shot('home-buy-test-1280');
    assert.deepEqual(external,[],'Third-party requests');assert.deepEqual(errors,[],'Browser errors');
    await fs.writeFile(path.join(__dirname,'output/browser-check.json'),JSON.stringify({status:'PASS',pages:36,widths:[1280,390,360],results,noJavaScriptPages:6,external,errors,screenshots:await fs.readdir(output)},null,2)+'\n');
  } finally {
    for (const item of pending.values()) clearTimeout(item.timer);
    if (socket) socket.close();
    browser.kill('SIGTERM');
    await new Promise(resolve => { if (browser.exitCode !== null) resolve(); else { browser.once('exit', resolve); setTimeout(() => { browser.kill('SIGKILL'); resolve(); }, 3000).unref(); } });
    await fs.rm(profile, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

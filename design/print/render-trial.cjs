// Local Chrome + built-in Node CDP client. No browser package or download.
const { spawn, execFileSync } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const chrome = process.env.PRINT_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const pins = require('./trial-toolchain.json');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  assert.equal(process.version, pins.node, 'Node pin');
  const chromeVersion = execFileSync(chrome, ['--version'], { encoding: 'utf8' }).trim();
  assert.equal(chromeVersion.replace(' for Testing', ''), pins.chrome, 'Chrome pin');
  const spec = JSON.parse(await fs.readFile(process.argv[2], 'utf8'));
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'book-footnotes-'));
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
      if (msg.method === 'Network.requestWillBeSent' && /^https?:/.test(msg.params.request.url)) external.push(msg.params.request.url);
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
    await cdp('Network.setBlockedURLs', { urls: ['http://*', 'https://*'] });
    for (const fixture of spec) {
      commandTimeout = fixture.timeoutMs || 60000;
      await cdp('Page.navigate', { url: pathToFileURL(fixture.html).href });
      let ready = false;
      for (let n = 0; n < 300; n++) {
        ready = await evaluate('document.readyState === "complete" && typeof PagedPolyfill !== "undefined"');
        if (ready) break;
        await delay(100);
      }
      assert.ok(ready, 'Local page failed to load');
      const pagination = await evaluate(`(async () => {
        await Promise.all(['11pt Plex', '600 11pt Plex', '24pt Oxanium', '8.5pt JetBrains'].map(f => document.fonts.load(f)));
        await document.fonts.ready;
        window.measureSymbolKey?.();
        const flow = await PagedPolyfill.preview();
        await document.fonts.ready;
        return { pages: flow.total, fonts: [...document.fonts].map(f => ({ family: f.family, status: f.status })) };
      })()`);
      const layout = fixture.kind === 'book' ? await evaluate('window.collectProof()') : await evaluate(`(() => {
        const rect = e => { const r = e.getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:r.height, right:r.right, bottom:r.bottom }; };
        return [...document.querySelectorAll('.pagedjs_page')].map((p,i) => ({
          page:i+1, rect:rect(p), body:rect(p.querySelector('.pagedjs_page_content')),
          footnotes:rect(p.querySelector('.pagedjs_footnote_area')),
          calls:[...p.querySelectorAll('[data-footnote-call]')].map(e => ({ref:e.dataset.footnoteCall, rect:rect(e), marker:getComputedStyle(e,'::after').content})),
          notes:[...p.querySelectorAll('.pagedjs_footnote_area [data-note-id]')].map(e => ({id:e.dataset.noteId, ref:e.dataset.ref, text:e.textContent, rect:rect(e), marker:getComputedStyle(e,'::marker').content})),
          markers:[...p.querySelectorAll('[data-body-marker]')].map(e => ({id:e.dataset.bodyMarker,rect:rect(e)})),
          lines:[...p.querySelectorAll('.code-line')].map(e => ({text:e.textContent,rect:rect(e)})),
          rows:[...p.querySelectorAll('tbody tr')].map(e => ({text:e.textContent,rect:rect(e)})),
          tables:[...p.querySelectorAll('table[data-book-table]')].map(e => ({id:e.dataset.bookTable,rect:rect(e),cells:[...e.querySelectorAll('th, td')].map(c => c.textContent)})),
          text:p.innerText
        }));
      })()`);
      const pdf = await cdp('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false });
      await fs.writeFile(fixture.pdf, Buffer.from(pdf.data, 'base64'));
      await fs.writeFile(fixture.dom, await evaluate('document.documentElement.outerHTML'));
      await fs.writeFile(fixture.layout, JSON.stringify({ pagination, layout, external, errors }, null, 2) + '\n');
      console.log(`${fixture.name}: rendered ${pagination.pages} pages`);
    }
    assert.deepEqual(external, [], 'Render attempted network fetches');
    assert.deepEqual(errors, [], 'Browser exceptions');
  } finally {
    for (const item of pending.values()) clearTimeout(item.timer);
    if (socket) socket.close();
    browser.kill('SIGTERM');
    await new Promise(resolve => { if (browser.exitCode !== null) resolve(); else { browser.once('exit', resolve); setTimeout(() => { browser.kill('SIGKILL'); resolve(); }, 3000).unref(); } });
    await fs.rm(profile, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

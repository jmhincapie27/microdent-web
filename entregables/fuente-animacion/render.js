const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const http = require('http');
const root = __dirname;
const [,, outDir, fps, start, end, step, extra] = process.argv;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.jpg': 'image/jpeg' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(root) || !fs.existsSync(f)) { r.statusCode = 404; return r.end(); } r.setHeader('Content-Type', types[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); });
srv.listen(0, async () => {
  const port = srv.address().port;
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('console', m => console.log('[page]', m.text())); page.on('pageerror', e => console.log('[err]', e.message));
  await page.goto(`http://localhost:${port}/index.html?fps=${fps}${extra || ''}`);
  await page.waitForFunction('window.ready === true', null, { timeout: 120000 });
  fs.mkdirSync(outDir, { recursive: true });
  const F = parseFloat(fps);
  for (let f = parseInt(start); f <= parseInt(end); f += parseInt(step)) {
    const t0 = Date.now();
    const url = await page.evaluate(t => window.renderAt(t), f / F);
    const b64 = url.split(',')[1];
    fs.writeFileSync(path.join(outDir, `f${String(f).padStart(5, '0')}.${url.startsWith('data:image/jpeg') ? 'jpg' : 'png'}`), Buffer.from(b64, 'base64'));
    console.log(`frame ${f} ${(Date.now() - t0)}ms`);
  }
  await browser.close(); srv.close();
});

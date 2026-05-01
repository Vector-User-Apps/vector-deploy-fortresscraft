const { chromium } = require('playwright');
const { mkdirSync, readFileSync, existsSync } = require('node:fs');
const path = require('node:path');

(async () => {
  const dir = path.join(__dirname, 'tests', 'screenshots');
  mkdirSync(dir, { recursive: true });

  let browser;
  let ownsBrowser = true;
  const wsFile = '/tmp/pw-ws';
  if (existsSync(wsFile)) {
    const ws = readFileSync(wsFile, 'utf8').trim();
    try {
      console.log('Connecting to pre-warmed browser: ' + ws);
      browser = await chromium.connect(ws);
      ownsBrowser = false;
    } catch (e) {
      console.log('Pre-warmed connect failed, cold launching: ' + e.message);
      browser = await chromium.launch();
    }
  } else {
    console.log('No pre-warmed browser, cold launching...');
    browser = await chromium.launch();
  }

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(dir, 'LandingPage.png'), fullPage: true });
  await page.close();
  if (ownsBrowser) { await browser.close(); }
  console.log('OK');
  process.exit(0);
})().catch(e => { console.error('SCREENSHOT_ERROR: ' + e.message); process.exit(1); });

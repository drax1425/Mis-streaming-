#!/usr/bin/env node
/**
 * render.js — CS2 Thumbnail Generator
 *
 * Usage:
 *   node render.js                  → renders index.html → output.png
 *   node render.js --all            → renders v1, v2, v3 variants
 *   node render.js --file index-v2.html --out thumb-v2.png
 */

const puppeteer = require('puppeteer');
const path      = require('path');
const fs        = require('fs');

// ─── Configuration ──────────────────────────────────────────
const CONFIG = {
  width:        1280,
  height:       720,
  deviceScaleFactor: 2,          // 2x = 2560×1440 physical → sharper PNG
  maxSizeBytes: 2 * 1024 * 1024, // 2 MB YouTube limit
  quality:      92,              // JPEG quality fallback (PNG is lossless, always preferred)
};

const VARIANTS = [
  { html: 'index-v1.html', out: 'output-v1.png' },
  { html: 'index-v2.html', out: 'output-v2.png' },
  { html: 'index-v3.html', out: 'output-v3.png' },
];

// ─── CLI args ────────────────────────────────────────────────
const args        = process.argv.slice(2);
const renderAll   = args.includes('--all');
const fileIdx     = args.indexOf('--file');
const outIdx      = args.indexOf('--out');
const targetFile  = fileIdx  !== -1 ? args[fileIdx  + 1] : 'index.html';
const targetOut   = outIdx   !== -1 ? args[outIdx   + 1] : 'output.png';

// ─── Helpers ─────────────────────────────────────────────────
function bytesToMB(n) { return (n / 1024 / 1024).toFixed(2); }

async function renderFile(browser, htmlFile, outFile) {
  const htmlPath = path.resolve(__dirname, htmlFile);
  const outPath  = path.resolve(__dirname, outFile);

  if (!fs.existsSync(htmlPath)) {
    console.error(`  ✗  File not found: ${htmlFile}`);
    return;
  }

  const page = await browser.newPage();

  await page.setViewport({
    width:             CONFIG.width,
    height:            CONFIG.height,
    deviceScaleFactor: CONFIG.deviceScaleFactor,
  });

  // Load the page via file:// protocol
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30_000 });

  // Wait for Google Fonts and custom fonts to finish loading
  await page.evaluate(() =>
    document.fonts.ready.then(() => new Promise(r => setTimeout(r, 400)))
  );

  // Capture screenshot — full page = false keeps exact 1280×720 viewport
  await page.screenshot({
    path:     outPath,
    type:     'png',
    clip:     { x: 0, y: 0, width: CONFIG.width, height: CONFIG.height },
    omitBackground: false,
  });

  await page.close();

  // ── Size check ───────────────────────────────────────────
  const { size } = fs.statSync(outPath);
  const mb = bytesToMB(size);
  const ok = size <= CONFIG.maxSizeBytes;

  console.log(`  ${ok ? '✓' : '⚠'} ${outFile}  (${mb} MB)${ok ? '' : '  ← exceeds 2 MB limit!'}`);

  if (!ok) {
    console.log('    → Re-saving as JPEG to reduce file size…');
    const jpgPath = outPath.replace('.png', '.jpg');
    // Puppeteer doesn't re-encode an existing PNG, so we open a new page
    const page2 = await browser.newPage();
    await page2.setViewport({
      width: CONFIG.width, height: CONFIG.height,
      deviceScaleFactor: CONFIG.deviceScaleFactor,
    });
    await page2.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30_000 });
    await page2.evaluate(() =>
      document.fonts.ready.then(() => new Promise(r => setTimeout(r, 400)))
    );
    await page2.screenshot({
      path:    jpgPath,
      type:    'jpeg',
      quality: CONFIG.quality,
      clip:    { x: 0, y: 0, width: CONFIG.width, height: CONFIG.height },
    });
    await page2.close();

    const { size: jpgSize } = fs.statSync(jpgPath);
    console.log(`    → JPEG saved: ${jpgPath}  (${bytesToMB(jpgSize)} MB)`);
  }
}

// ─── Main ────────────────────────────────────────────────────
(async () => {
  console.log('\n🎮  CS2 Thumbnail Renderer');
  console.log('   Canvas:', CONFIG.width, '×', CONFIG.height,
              `(${CONFIG.deviceScaleFactor}x scale → ${CONFIG.width * CONFIG.deviceScaleFactor}×${CONFIG.height * CONFIG.deviceScaleFactor} physical pixels)`);
  console.log('');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--font-render-hinting=none',  // crisper text rendering
    ],
  });

  try {
    if (renderAll) {
      console.log('  Rendering all variants…\n');
      for (const v of VARIANTS) {
        process.stdout.write(`  → ${v.html}  `);
        await renderFile(browser, v.html, v.out);
      }
    } else {
      process.stdout.write(`  → ${targetFile}  `);
      await renderFile(browser, targetFile, targetOut);
    }
  } finally {
    await browser.close();
  }

  console.log('\n  Done! Open the PNG file(s) to review.\n');
})();

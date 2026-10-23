// Record docs/demo.gif from the real-time preview: `npm run demo`.
//
// Frames come from Chromium's screencast (so animations play exactly as they do
// for a user) and are encoded by scripts/frames-to-gif.py, which needs Python 3
// with Pillow. Fonts matter as for `npm run shots`.
import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const WIDTH = 720
const HEIGHT = 450
const FPS = 10
/** Splash, sign-in and picker, stopping just before the picker's countdown ends. */
const LENGTH_MS = 8600

const version = JSON.parse(readFileSync(root + 'package.json', 'utf8')).version
const dir = mkdtempSync(join(tmpdir(), 'dsh-gov-boot-demo-'))
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.addInitScript((v) => {
  window.__dshGovVersion = v
  document.addEventListener('DOMContentLoaded', () => document.getElementById('bar')?.remove())
}, version)

const cdp = await page.context().newCDPSession(page)
const frames = []
cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
  frames.push({ t: metadata.timestamp * 1000, data })
  cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
})
await cdp.send('Page.startScreencast', { format: 'png', maxWidth: WIDTH, maxHeight: HEIGHT, everyNthFrame: 1 })
await page.goto('file://' + root + 'preview/index.html?mode=full')
const start = Date.now()
await page.waitForTimeout(LENGTH_MS + 400)
await cdp.send('Page.stopScreencast')
await browser.close()

// Resample to a steady frame rate: for each tick, the newest frame not after it.
const t0 = frames.find((frame) => frame.t >= start - 50)?.t ?? frames[0].t
const files = []
for (let tick = 0, i = 0; tick <= LENGTH_MS; tick += 1000 / FPS) {
  while (i + 1 < frames.length && frames[i + 1].t <= t0 + tick) i++
  const file = join(dir, String(files.length).padStart(4, '0') + '.png')
  writeFileSync(file, Buffer.from(frames[i].data, 'base64'))
  files.push(file)
}
execFileSync('python3', [root + 'scripts/frames-to-gif.py', dir, root + 'docs/demo.gif', String(Math.round(1000 / FPS))], { stdio: 'inherit' })
rmSync(dir, { recursive: true, force: true })

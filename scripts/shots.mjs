// Regenerate preview/stills/* from the real client: `npm run shots`.
//
// Stills are rendered at 1440×900 through preview/index.html?seek=…, which pins
// the timeline, so the same code always produces the same frames. They do depend
// on the installed fonts: macOS gives Songti SC / PingFang SC; elsewhere install
// Noto Serif SC + Noto Sans SC for a close match.
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const preview = 'file://' + root + 'preview/index.html'
const out = root + 'preview/stills/'

const FRAMES = {
  splash: 'seek=2900',
  signin: 'seek=4400',
  qr: 'seek=4400&tab=qr',
  ca: 'seek=4400&tab=ca',
  choose: 'seek=6400',
  red: 'seek=4400&theme=red',
  night: 'seek=6400&theme=night',
}

const browser = await chromium.launch()
const frames = {}
for (const [name, query] of Object.entries(FRAMES)) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(preview + '?' + query)
  await page.waitForTimeout(600)
  frames[name] = await page.screenshot({ type: 'png' })
  await page.close()
}

/** Lay out PNG buffers with plain HTML and screenshot the result. */
async function compose(file, width, height, html, type = 'jpeg') {
  const page = await browser.newPage({ viewport: { width, height } })
  await page.setContent(`<body style="margin:0;background:#000">${html}</body>`)
  await page.waitForTimeout(200)
  await page.screenshot({ path: out + file, type, ...(type === 'jpeg' ? { quality: 86 } : {}) })
  await page.close()
}
const img = (name, style) => `<img src="data:image/png;base64,${frames[name].toString('base64')}" style="display:block;${style}">`
const crop = (name, style) =>
  `<div style="width:440px;height:440px;overflow:hidden;${style}">${img(name, 'margin:-230px 0 0 -880px')}</div>`

for (const name of ['splash', 'signin', 'choose']) await compose(name + '.jpg', 1440, 900, img(name, ''))
await compose('tabs.jpg', 900, 440, `<div style="display:flex;gap:20px;background:#2c80c5">${crop('qr', '')}${crop('ca', '')}</div>`)
await compose('themes.jpg', 1450, 450, `<div style="display:flex;gap:10px">${img('red', 'width:720px')}${img('night', 'width:720px')}</div>`)

// The settings row, rendered by the test harness with real React.
const page = await browser.newPage({ viewport: { width: 820, height: 120 }, deviceScaleFactor: 2 })
await page.goto('file://' + root + 'test/harness.html')
await page.keyboard.press('Escape')
await page.waitForTimeout(800)
await page.evaluate(() => {
  document.body.style.cssText = 'margin:0;padding:16px 24px;background:#fff;font-family:"PingFang SC","Noto Sans SC",sans-serif'
  document.getElementById('app').remove()
  const ctx = {
    slots: { inject: (name, callback) => callback(), register: (entry, Component) => { window.__row = Component; return () => {} } },
    effect: () => {},
  }
  window.__mod.apply(ctx)
  const box = document.createElement('div')
  document.body.appendChild(box)
  ReactDOM.createRoot(box).render(React.createElement(window.__row))
})
await page.waitForTimeout(300)
await page.screenshot({ path: out + 'settings.png' })
await page.close()

await browser.close()
console.log('stills written to ' + out + ': ' + JSON.parse(readFileSync(root + 'package.json', 'utf8')).version)

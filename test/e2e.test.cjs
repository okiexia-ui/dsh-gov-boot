// End-to-end behaviour in headless Chromium: `npm run test:e2e`.
// Needs the dev dependencies (playwright, react, react-dom) and a Chromium
// (`npx playwright install chromium`).
const { test, before, after } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { chromium } = require('playwright')

const HARNESS = 'file://' + path.join(__dirname, 'harness.html')
let browser

before(async () => { browser = await chromium.launch() })
after(async () => { await browser.close() })

/** A fresh context per test, so localStorage never leaks between them. */
async function open(t, { qs = '', storage = {}, context = {} } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...context })
  t.after(() => ctx.close())
  const page = await ctx.newPage()
  page.errors = []
  page.on('pageerror', (error) => page.errors.push(String(error)))
  page.on('console', (message) => {
    if (message.type() === 'error') page.errors.push(message.text())
  })
  await page.addInitScript((entries) => {
    for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value)
  }, storage)
  await page.goto(HARNESS + qs)
  return page
}

/** Evaluate an expression with `s` bound to the overlay's shadow root (null once removed). */
const inShadow = (page, body) =>
  page.evaluate(new Function(`const h = document.querySelector('.dsh-gov-boot-host'); if (!h) return null; const s = h.shadowRoot; return (${body})`))
const removed = (page, timeout) => page.waitForFunction(() => !document.querySelector('.dsh-gov-boot-host'), null, { timeout })

test('full mode plays splash → sign-in → picker and removes itself', async (t) => {
  const page = await open(t)
  const t0 = Date.now()
  await removed(page, 20000)
  const ms = Date.now() - t0
  assert.ok(ms > 8000 && ms < 14000, `took ${ms} ms`)
  assert.equal((await page.evaluate(() => window.__entered))[0].name, '智能问答')
  assert.deepEqual(page.errors, [])
})

test('splash-only mode ends after the splash', async (t) => {
  const page = await open(t, { storage: { 'dsh-gov-boot:mode': 'splash' } })
  assert.equal(await inShadow(page, "s.querySelector('.gb-auth')"), null)
  const t0 = Date.now()
  await removed(page, 10000)
  const ms = Date.now() - t0
  assert.ok(ms > 2500 && ms < 6000, `took ${ms} ms`)
  assert.deepEqual(page.errors, [])
})

test('off mode mounts nothing', async (t) => {
  const page = await open(t, { storage: { 'dsh-gov-boot:mode': 'off' } })
  await page.waitForTimeout(500)
  assert.equal(await page.evaluate(() => document.querySelector('.dsh-gov-boot-host')), null)
})

test('keys go to the overlay, not to the app behind it', async (t) => {
  const page = await open(t)
  await page.waitForTimeout(400)
  await page.keyboard.type('hi')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(150)
  await page.keyboard.press('Tab')
  await page.keyboard.press('Meta+a')
  const leak = await page.evaluate(() => window.__leak)
  for (const key of ['h', 'i', 'Enter', 'Tab']) assert.ok(!leak.includes(key), `${key} leaked: ${leak}`)
  assert.ok(leak.includes('a'), 'modifier shortcuts should pass through')
  assert.equal(await inShadow(page, "s.querySelector('.gb-auth').classList.contains('in')"), true, 'Enter advances to sign-in')
  await page.keyboard.press('Escape')
  await removed(page, 2000)
  await page.keyboard.press('Enter')
  assert.ok((await page.evaluate(() => window.__leak)).includes('Enter'), 'keys reach the app once the overlay is gone')
})

test('reduced motion still shows every element', async (t) => {
  const page = await open(t, { context: { reducedMotion: 'reduce' } })
  await page.waitForTimeout(2900)
  const opacities = await inShadow(page, "['.sp-land', '.sp-wave', '.sp-seal', '.sp-title'].map((x) => Number(getComputedStyle(s.querySelector(x)).opacity))")
  for (const value of opacities) assert.ok(value > 0.9, String(opacities))
  const clip = await inShadow(page, "getComputedStyle(s.querySelector('.sp-wall')).clipPath")
  assert.match(clip, /^(none|inset\((0(px|%)?\s*){1,4}\))$/)
})

test('progress holds at 86% until the DSH boot card is gone', async (t) => {
  const page = await open(t, { qs: '?card=1' })
  await page.waitForTimeout(6600)
  assert.equal(await inShadow(page, "s.querySelector('.au-pct').textContent"), '86%')
  await page.evaluate(() => document.querySelector('[data-dsh-boot]').remove())
  await page.waitForTimeout(400)
  assert.equal(await inShadow(page, "s.querySelector('.au-pct').textContent"), '100%')
  await page.waitForTimeout(900)
  assert.equal(await inShadow(page, "s.querySelector('.gb-auth').classList.contains('choosing')"), true)
})

test('login tabs switch without skipping ahead', async (t) => {
  const page = await open(t)
  await page.waitForTimeout(3300)
  await inShadow(page, "s.querySelector('[data-tab=\"qr\"]').click()")
  assert.equal(await inShadow(page, "s.querySelector('[data-pane=\"qr\"]').classList.contains('on')"), true)
  assert.equal(await inShadow(page, "s.querySelector('.gb-auth').classList.contains('choosing')"), false)
})

test('workbench picker: arrows pause, digits enter, choice is remembered', async (t) => {
  const page = await open(t)
  await page.waitForFunction(() => document.querySelector('.dsh-gov-boot-host')?.shadowRoot.querySelector('.gb-auth.choosing'), null, { timeout: 9000 })
  await page.waitForTimeout(300)
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(1300)
  assert.match(await inShadow(page, "s.querySelector('.ch-sub').textContent"), /已暂停/)
  assert.equal(await inShadow(page, "s.querySelector('.ch-card.on').dataset.app"), '1')
  await page.keyboard.press('3')
  await removed(page, 3000)
  assert.equal((await page.evaluate(() => window.__entered))[0].index, 2)
  assert.equal(await page.evaluate(() => localStorage.getItem('dsh-gov-boot:app')), '2')

  await page.reload()
  await page.waitForTimeout(300)
  await page.mouse.click(700, 500)
  await page.waitForTimeout(150)
  await page.mouse.click(700, 500)
  await page.waitForTimeout(1000)
  assert.equal(await inShadow(page, "s.querySelector('.ch-card.on').dataset.app"), '2', 'remembered card is the default')
  assert.equal(await inShadow(page, "s.querySelector('.ch-card.last').dataset.app"), '2')
  assert.deepEqual(page.errors, [])
})

test('desktop: drag fix sheet and drag band, removed with the overlay', async (t) => {
  const page = await open(t, { qs: '?platform=darwin' })
  assert.ok(await page.evaluate(() => document.getElementById('dsh-gov-boot-host-sheet').textContent.includes('-webkit-app-region:initial')))
  assert.ok(await page.evaluate(() => !!document.querySelector('.dsh-gov-boot-dragband')))
  await page.keyboard.press('Escape')
  await removed(page, 2000)
  assert.ok(await page.evaluate(() => !document.querySelector('.dsh-gov-boot-dragband')))
})

test('settings row (React 18) stores choices, previews, and tears down', async (t) => {
  const page = await open(t)
  await page.keyboard.press('Escape')
  await removed(page, 2000)
  const meta = await page.evaluate(() => {
    const registered = []
    const effects = []
    const ctx = {
      slots: {
        inject: (name, callback) => { registered.push({ inject: name, dispose: callback() }) },
        register: (entry, Component) => { registered.push({ entry, Component }); return () => {} },
      },
      effect: (fn, label) => effects.push({ fn, label }),
    }
    window.__mod.apply(ctx)
    window.__effects = effects
    const row = registered.find((item) => item.Component)
    const box = document.createElement('div')
    box.id = 'settings'
    document.body.appendChild(box)
    ReactDOM.createRoot(box).render(React.createElement(row.Component))
    return { name: row.entry.name, id: row.entry.id, inject: window.__mod.inject, effects: effects.length }
  })
  assert.deepEqual(meta, { name: 'settings.general.item', id: 'boot-gov', inject: ['slots'], effects: 1 })
  await page.waitForTimeout(200)
  const button = (label) => page.locator('#settings button', { hasText: label }).first()
  assert.equal(await page.locator('#settings button').count(), 7)

  await button('仅片头').click()
  assert.equal(await page.evaluate(() => localStorage.getItem('dsh-gov-boot:mode')), 'splash')
  assert.equal(await page.locator('#settings .dshgov-seg.disabled').count(), 1, 'theme is disabled in splash-only mode')

  await button('完整').click()
  await button('中国红').click()
  assert.deepEqual(await page.evaluate(() => [localStorage.getItem('dsh-gov-boot:mode'), localStorage.getItem('dsh-gov-boot:theme')]), ['full', 'red'])

  await button('关闭').click()
  await button('预览').click()
  await page.waitForTimeout(300)
  assert.equal(await inShadow(page, "s.querySelector('.gb-root').dataset.theme + '/' + !!s.querySelector('.gb-auth')"), 'red/true', 'preview plays even when off')

  await page.evaluate(() => window.__effects[0].fn()())
  await removed(page, 2000)
  assert.deepEqual(page.errors.filter((error) => !/React DevTools/.test(error)), [])
})

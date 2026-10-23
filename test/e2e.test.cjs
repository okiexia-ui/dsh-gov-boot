// End-to-end behaviour in headless Chromium: `npm run test:e2e`.
// Needs the dev dependencies (playwright, react, react-dom) and a Chromium
// (`npx playwright install chromium`). The same flows against a real DSH are in
// test/dsh.test.cjs.
const { test, before, after } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { chromium } = require('playwright')

const HARNESS = 'file://' + path.join(__dirname, 'harness.html')
const FULL = { 'dsh-gov-boot:mode': 'full' }
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
    if (sessionStorage.getItem('seeded')) return
    sessionStorage.setItem('seeded', '1')
    for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value)
  }, storage)
  await page.goto(HARNESS + qs)
  return page
}

/** Evaluate an expression with `s` bound to the overlay's shadow root (null once removed). */
const inShadow = (page, body) =>
  page.evaluate(new Function(`const h = document.querySelector('.dsh-gov-boot-host'); if (!h) return null; const s = h.shadowRoot; return (${body})`))
const removed = (page, timeout) => page.waitForFunction(() => !document.querySelector('.dsh-gov-boot-host'), null, { timeout })
const choosing = (page) =>
  page.waitForFunction(() => document.querySelector('.dsh-gov-boot-host')?.shadowRoot.querySelector('.gb-auth.choosing'), null, { timeout: 9000 })

/** Apply the plugin with a fake DSH context whose uiWorkspace records startSession calls. */
const applyWithWorkspace = (page, items = [{ workspaceId: 'w1' }]) =>
  page.evaluate((items) => {
    window.__started = []
    const service = {
      workspaces: { list: { getSnapshot: () => ({ phase: 'ready', items }) } },
      sessions: { list: { getSnapshot: () => ({ phase: 'ready' }) } },
      startSession: (workspaceId, options) => window.__started.push({ workspaceId, options }),
    }
    window.__mod.apply({
      slots: { inject() {}, register() { return () => {} } },
      effect() {},
      get: (name) => (name === 'uiWorkspace' ? service : undefined),
    })
  }, items)

test('full mode plays splash → sign-in → picker and removes itself', async (t) => {
  const page = await open(t, { storage: FULL })
  await applyWithWorkspace(page)
  const t0 = Date.now()
  await removed(page, 20000)
  const ms = Date.now() - t0
  assert.ok(ms > 8000 && ms < 14000, `took ${ms} ms`)
  const entered = (await page.evaluate(() => window.__entered))[0]
  assert.equal(entered.name, '智能问答')
  assert.equal(entered.explicit, false)
  assert.deepEqual(await page.evaluate(() => window.__started), [], 'the countdown alone never opens a session')
  assert.deepEqual(page.errors, [])
})

test('auto mode: the full show once per version, then the splash only', async (t) => {
  const page = await open(t, { qs: '?version=9.9.9' })
  await page.waitForTimeout(3600)
  assert.equal(await inShadow(page, "!!s.querySelector('.gb-auth.in')"), true, 'first boot of 9.9.9 plays the full show')
  assert.equal(await page.evaluate(() => localStorage.getItem('dsh-gov-boot:seen')), '9.9.9')
  await page.reload()
  await page.waitForTimeout(3600)
  assert.equal(await inShadow(page, "s.querySelector('.gb-auth')"), null, 'second boot is splash only')
  await page.goto(HARNESS + '?version=9.10.0')
  await page.waitForTimeout(3600)
  assert.equal(await inShadow(page, "!!s.querySelector('.gb-auth.in')"), true, 'an upgrade plays the full show again')
})

test('splash-only mode ends after the splash', async (t) => {
  const page = await open(t, { storage: { 'dsh-gov-boot:mode': 'splash' } })
  const t0 = Date.now()
  await page.waitForTimeout(2500)
  assert.equal(await inShadow(page, "s.querySelector('.gb-auth')"), null, 'the sign-in scene is never built')
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

test('the sign-in scene is built while the splash plays, not at mount', async (t) => {
  const page = await open(t, { storage: FULL })
  await page.waitForTimeout(300)
  assert.equal(await inShadow(page, "s.querySelector('.gb-auth')"), null)
  const early = await inShadow(page, "s.querySelectorAll('*').length")
  assert.ok(early < 200, `${early} nodes at mount`)
  await page.waitForTimeout(1700)
  assert.equal(await inShadow(page, "!!s.querySelector('.gb-auth')"), true)
  const total = await inShadow(page, "s.querySelectorAll('*').length")
  assert.ok(total < 500, `${total} nodes in total`)
})

test('keys go to the overlay, not to the app behind it', async (t) => {
  const page = await open(t, { storage: FULL })
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
  const page = await open(t, { storage: FULL, context: { reducedMotion: 'reduce' } })
  await page.waitForTimeout(2900)
  const opacities = await inShadow(page, "['.sp-land', '.sp-wave', '.sp-seal', '.sp-title'].map((x) => Number(getComputedStyle(s.querySelector(x)).opacity))")
  for (const value of opacities) assert.ok(value > 0.9, String(opacities))
  assert.match(await inShadow(page, "getComputedStyle(s.querySelector('.sp-wall')).transform"), /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/, 'the wall is fully unrolled')
})

test('progress holds at 86% until the DSH boot card is gone', async (t) => {
  const page = await open(t, { qs: '?card=1', storage: FULL })
  await page.waitForTimeout(6600)
  assert.equal(await inShadow(page, "s.querySelector('.au-pct').textContent"), '86%')
  await page.evaluate(() => document.querySelector('[data-dsh-boot]').remove())
  await page.waitForTimeout(400)
  assert.equal(await inShadow(page, "s.querySelector('.au-pct').textContent"), '100%')
  await page.waitForTimeout(900)
  assert.equal(await inShadow(page, "s.querySelector('.gb-auth').classList.contains('choosing')"), true)
})

test('login tabs switch without skipping ahead', async (t) => {
  const page = await open(t, { storage: FULL })
  await page.waitForTimeout(3300)
  await inShadow(page, "s.querySelector('[data-tab=\"qr\"]').click()")
  assert.equal(await inShadow(page, "s.querySelector('[data-pane=\"qr\"]').classList.contains('on')"), true)
  assert.equal(await inShadow(page, "s.querySelector('.gb-auth').classList.contains('choosing')"), false)
})

test('picker: arrows pause, a digit opens that workbench with its prompt, the choice is remembered', async (t) => {
  const page = await open(t, { storage: FULL })
  await applyWithWorkspace(page)
  await choosing(page)
  await page.waitForTimeout(300)
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(1300)
  assert.match(await inShadow(page, "s.querySelector('.ch-sub').textContent"), /已暂停/)
  assert.equal(await inShadow(page, "s.querySelector('.ch-card.on').dataset.app"), '1')
  await page.keyboard.press('3')
  await removed(page, 3000)
  await page.waitForTimeout(100)
  const entered = (await page.evaluate(() => window.__entered))[0]
  assert.equal(entered.index, 2)
  assert.equal(entered.explicit, true)
  const started = await page.evaluate(() => window.__started)
  assert.equal(started.length, 1)
  assert.equal(started[0].workspaceId, undefined, 'DSH picks the current or most recent workspace')
  assert.match(started[0].options.prompt, /^请分析以下数据/)
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

test('picker: with no workspace yet, nothing is opened', async (t) => {
  const page = await open(t, { storage: FULL })
  await applyWithWorkspace(page, [])
  await choosing(page)
  await page.keyboard.press('2')
  await removed(page, 3000)
  await page.waitForTimeout(100)
  assert.deepEqual(await page.evaluate(() => window.__started), [])
})

test('custom texts are shown as text, never as markup', async (t) => {
  const custom = { title: '<img src=x onerror="window.__xss=1">测试', seal: '安', countdown: 5, apps: [{ name: '问政', prompt: '' }] }
  const page = await open(t, { storage: { ...FULL, 'dsh-gov-boot:custom': JSON.stringify(custom) } })
  await page.waitForTimeout(400)
  assert.equal(await inShadow(page, "s.querySelector('.sp-title span').textContent"), Array.from(custom.title).slice(0, 16).join(''))
  assert.equal(await inShadow(page, "s.querySelectorAll('img').length"), 0)
  assert.equal(await inShadow(page, "Array.from(s.querySelectorAll('.sp-seal text')).map((n) => n.textContent).join('')"), '安')
  await choosing(page)
  assert.match(await inShadow(page, "s.querySelector('.ch-sub').textContent"), /^5 秒后/)
  assert.equal(await inShadow(page, "s.querySelector('.ch-card[data-app=\"0\"] b').textContent"), '问政')
  assert.equal(await page.evaluate(() => window.__xss), undefined)
})

test('desktop: drag fix sheet and drag band, removed with the overlay', async (t) => {
  const page = await open(t, { qs: '?platform=darwin', storage: FULL })
  assert.ok(await page.evaluate(() => document.getElementById('dsh-gov-boot-host-sheet').textContent.includes('-webkit-app-region:initial')))
  assert.ok(await page.evaluate(() => !!document.querySelector('.dsh-gov-boot-dragband')))
  await page.keyboard.press('Escape')
  await removed(page, 2000)
  assert.ok(await page.evaluate(() => !document.querySelector('.dsh-gov-boot-dragband')))
})

test('settings row (React 18): modes, palette, customisation, preview, teardown', async (t) => {
  const page = await open(t, { storage: FULL })
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
      get: () => undefined,
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
  assert.equal(await page.locator('#settings button').count(), 9)

  await button('自动').click()
  assert.equal(await page.evaluate(() => localStorage.getItem('dsh-gov-boot:mode')), 'auto')
  await button('仅片头').click()
  assert.equal(await page.locator('#settings .dshgov-seg.disabled').count(), 1, 'palette is disabled in splash-only mode')
  await button('完整').click()
  await button('中国红').click()
  assert.deepEqual(await page.evaluate(() => [localStorage.getItem('dsh-gov-boot:mode'), localStorage.getItem('dsh-gov-boot:theme')]), ['full', 'red'])

  await button('自定义').click()
  const title = page.locator('#settings .dshgov-panel input').first()
  await title.fill('数字政务平台')
  assert.equal(JSON.parse(await page.evaluate(() => localStorage.getItem('dsh-gov-boot:custom'))).title, '数字政务平台')
  assert.equal(await page.locator('#settings .dshgov-panel textarea').count(), 4)
  await button('恢复默认').click()
  assert.equal(await page.evaluate(() => localStorage.getItem('dsh-gov-boot:custom')), null)
  assert.equal(await title.inputValue(), '智能政务工作平台')

  await button('关闭').click()
  await button('预览').click()
  await page.waitForTimeout(300)
  assert.equal(await inShadow(page, "s.querySelector('.gb-root').dataset.theme"), 'red', 'preview plays even when off')
  await page.waitForTimeout(2000)
  assert.equal(await inShadow(page, "!!s.querySelector('.gb-auth')"), true, 'preview is the full show')

  await page.evaluate(() => window.__effects[0].fn()())
  await removed(page, 2000)
  assert.deepEqual(page.errors.filter((error) => !/React DevTools/.test(error)), [])
})

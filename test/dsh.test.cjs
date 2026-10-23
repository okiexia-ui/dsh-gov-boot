// The plugin inside a real DeepSeek Harness web server: `npm run test:dsh`.
//
// Packs this repo, installs the tarball into a throwaway DSH profile, boots
// `dsh --profile web`, and drives it with Playwright. Needs the DSH CLI and pnpm
// on PATH (`npm i -g @deepseek-ai/dsh pnpm`), or DSH_BIN pointing at a dsh binary.
const { test, before, after } = require('node:test')
const assert = require('node:assert/strict')
const { spawn, execFileSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { chromium } = require('playwright')

const ROOT = path.join(__dirname, '..')
const DSH = process.env.DSH_BIN || 'dsh'
const VERSION = require('../package.json').version
let tmp
let server
let url
let browser

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-gov-boot-'))
  const env = { ...process.env, DSH_HOME: path.join(tmp, 'home') }
  const tarball = execFileSync('npm', ['pack', '--silent', '--pack-destination', tmp], { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').pop()
  execFileSync(DSH, ['plugin', '--profile', 'web', 'add', path.join(tmp, tarball)], { cwd: tmp, env, stdio: 'pipe' })
  fs.mkdirSync(path.join(tmp, 'workspace'))
  server = spawn(DSH, ['--profile', 'web', '--no-open', '--port', '0'], { cwd: tmp, env, stdio: ['ignore', 'pipe', 'pipe'] })
  url = await new Promise((resolve, reject) => {
    let log = ''
    const timer = setTimeout(() => reject(new Error('dsh web did not start:\n' + log)), 120000)
    const onData = (chunk) => {
      log += chunk
      const match = log.match(/https?:\/\/127\.0\.0\.1:\d+\/\?token=\S+/)
      if (match) { clearTimeout(timer); resolve(match[0]) }
    }
    server.stdout.on('data', onData)
    server.stderr.on('data', onData)
    server.on('exit', (code) => reject(new Error(`dsh web exited with ${code}:\n${log}`)))
  })
  browser = await chromium.launch()
})

after(async () => {
  if (browser) await browser.close()
  if (server) server.kill()
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true })
})

async function open(t, storage = {}, options = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options })
  t.after(() => ctx.close())
  await ctx.addInitScript((entries) => {
    if (sessionStorage.getItem('seeded')) return
    sessionStorage.setItem('seeded', '1')
    for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value)
  }, storage)
  const page = await ctx.newPage()
  page.errors = []
  page.on('pageerror', (error) => page.errors.push(String(error)))
  page.on('console', (message) => {
    if (message.type() === 'error' && /gov-boot/.test(message.text())) page.errors.push(message.text())
  })
  await page.goto(url)
  return page
}

/** DSH's own first-run dialogs (preview notice, sign-in prompt) appear a moment after the shell; close them until none show up. */
async function dismissDialogs(page) {
  await page.getByText('More', { exact: true }).waitFor({ timeout: 20000 })
  const deadline = Date.now() + 8000
  let quiet = 0
  while (Date.now() < deadline && quiet < 3) {
    let clicked = false
    for (const name of ['Continue', 'Close']) {
      const button = page.getByRole('button', { name, exact: true })
      if (await button.count()) {
        await button.first().click().catch(() => {})
        clicked = true
        await page.waitForTimeout(300)
      }
    }
    quiet = clicked ? 0 : quiet + 1
    await page.waitForTimeout(400)
  }
}

async function openSettings(page) {
  await dismissDialogs(page)
  await page.getByText('More', { exact: true }).click()
  await page.getByRole('menuitem', { name: 'Settings' }).click()
  const row = page.locator('.dshgov-row')
  await row.waitFor({ timeout: 10000 })
  await row.scrollIntoViewIfNeeded()
  return row
}

const removed = (page, timeout = 5000) => page.waitForFunction(() => !document.querySelector('.dsh-gov-boot-host'), null, { timeout })

test('host half injects the package version and the splash mounts', async (t) => {
  const page = await open(t, { 'dsh-gov-boot:mode': 'full' })
  assert.equal(await page.evaluate(() => window.__dshGovVersion), VERSION)
  await page.waitForFunction(() => document.querySelector('.dsh-gov-boot-host'), null, { timeout: 10000 })
  assert.match(await page.evaluate(() => document.querySelector('.dsh-gov-boot-host').shadowRoot.querySelector('.sp-meta').textContent), new RegExp('V' + VERSION.split('.').slice(0, 2).join('\\.')))
  await page.keyboard.press('Escape')
  await removed(page)
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dshgov-first')), false, 'first-frame cover retired')
  assert.deepEqual(page.errors, [])
})

test('off mode leaves DSH untouched', async (t) => {
  const page = await open(t, { 'dsh-gov-boot:mode': 'off' })
  await page.waitForTimeout(2500)
  assert.equal(await page.evaluate(() => document.querySelector('.dsh-gov-boot-host')), null)
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dshgov-first')), false)
})

for (const colorScheme of ['light', 'dark']) {
  test(`settings row in Settings → General (${colorScheme})`, async (t) => {
    const page = await open(t, { 'dsh-gov-boot:mode': 'off' }, { colorScheme })
    const row = await openSettings(page)
    assert.equal(await row.locator('button').count(), 9)
    const [color, background] = await page.evaluate(() => {
      const style = getComputedStyle(document.querySelector('.dshgov-seg button.on'))
      return [style.color, style.backgroundColor]
    })
    assert.notEqual(color, background, 'the selected segment label must be readable')
    await row.getByText('完整', { exact: true }).click()
    await row.getByText('深夜蓝', { exact: true }).click()
    assert.deepEqual(await page.evaluate(() => [localStorage.getItem('dsh-gov-boot:mode'), localStorage.getItem('dsh-gov-boot:theme')]), ['full', 'night'])
    await row.getByText('预览', { exact: true }).click()
    await page.waitForTimeout(500)
    assert.equal(await page.evaluate(() => document.querySelector('.dsh-gov-boot-host')?.shadowRoot.querySelector('.gb-root').dataset.theme), 'night')
    await page.keyboard.press('Escape')
    await removed(page)
    assert.ok(await page.locator('.dshgov-row').isVisible(), 'settings stay open after a preview')
    assert.deepEqual(page.errors, [])
  })
}

test('picking a workbench opens a session with its prompt in the input box', async (t) => {
  // A workspace first, through DSH's own directory picker.
  const setup = await open(t, { 'dsh-gov-boot:mode': 'off' })
  await dismissDialogs(setup)
  await setup.getByRole('button', { name: 'Add workspace' }).first().click()
  await setup.getByRole('button', { name: 'Edit path' }).click()
  const input = setup.locator('[role=dialog] input').first()
  await input.fill(path.join(tmp, 'workspace'))
  await input.press('Enter')
  await setup.getByRole('button', { name: 'Open', exact: true }).click()
  await setup.getByText('workspace', { exact: true }).first().waitFor({ timeout: 10000 })

  const page = await open(t, { 'dsh-gov-boot:mode': 'full' })
  await page.waitForFunction(() => document.querySelector('.dsh-gov-boot-host')?.shadowRoot.querySelector('.gb-auth.choosing'), null, { timeout: 20000 })
  await page.keyboard.press('2')
  await removed(page)
  await page.waitForFunction(() => Array.from(document.querySelectorAll('[contenteditable=true]')).some((e) => e.innerText.includes('请帮我起草一份公文')), null, { timeout: 10000 })
  assert.deepEqual(page.errors, [])
})

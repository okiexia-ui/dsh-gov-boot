/* ------------------------------------------------------------------ */
/* Preferences: localStorage only, every read survives a broken store. */
/* ------------------------------------------------------------------ */

function readRaw(key) {
  try { return window.localStorage.getItem(key) } catch (error) { return null }
}

function readPref(key, values, fallback) {
  const raw = readRaw(key)
  return values.indexOf(raw) >= 0 ? raw : fallback
}

function writePref(key, value) {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch (error) { /* private mode: not persisted */ }
}

const readMode = () => readPref(MODE_KEY, MODE_VALUES, DEFAULT_MODE)
const readTheme = () => readPref(THEME_KEY, THEME_VALUES, DEFAULT_THEME)
const readApp = () => Number(readPref(APP_KEY, ['0', '1', '2', '3'], '0'))

/** The mode this boot actually plays: auto resolves to full once per version. */
function resolveMode(mode) {
  if (mode !== 'auto') return mode
  return readRaw(SEEN_KEY) === VERSION ? 'splash' : 'full'
}

/** The stored customisation, clamped to LIMITS; anything missing or invalid falls back to DEFAULTS. */
function readCustom() {
  let stored = null
  try { stored = JSON.parse(readRaw(CUSTOM_KEY) || 'null') } catch (error) { stored = null }
  const c = stored !== null && typeof stored === 'object' ? stored : {}
  const text = (value, max, fallback) => (typeof value === 'string' && value.trim() !== '' ? Array.from(value.trim()).slice(0, max).join('') : fallback)
  const seconds = Number(c.countdown)
  return {
    title: text(c.title, LIMITS.title, DEFAULTS.title),
    subtitle: text(c.subtitle, LIMITS.subtitle, DEFAULTS.subtitle),
    seal: text(c.seal, LIMITS.seal, DEFAULTS.seal),
    countdown: Number.isInteger(seconds) && seconds >= 1 && seconds <= 9 ? seconds : DEFAULTS.countdown,
    actions: typeof c.actions === 'boolean' ? c.actions : DEFAULTS.actions,
    apps: DEFAULTS.apps.map((app, i) => {
      const a = Array.isArray(c.apps) && c.apps[i] !== null && typeof c.apps[i] === 'object' ? c.apps[i] : {}
      return {
        name: text(a.name, LIMITS.name, app.name),
        desc: text(a.desc, LIMITS.desc, app.desc),
        prompt: typeof a.prompt === 'string' ? a.prompt.slice(0, LIMITS.prompt) : app.prompt,
      }
    }),
  }
}

/** Store only what differs from DEFAULTS, so a later default change still reaches untouched fields. */
function writeCustom(custom) {
  const out = {}
  for (const key of ['title', 'subtitle', 'seal', 'countdown', 'actions']) {
    if (custom[key] !== DEFAULTS[key]) out[key] = custom[key]
  }
  const apps = custom.apps.map((app, i) => {
    const diff = {}
    for (const key of ['name', 'desc', 'prompt']) if (app[key] !== DEFAULTS.apps[i][key]) diff[key] = app[key]
    return diff
  })
  if (apps.some((app) => Object.keys(app).length > 0)) out.apps = apps
  writePref(CUSTOM_KEY, Object.keys(out).length > 0 ? JSON.stringify(out) : null)
}

/** DSH's boot card is gone (or has dropped its spinner, i.e. failed). */
function appReady() {
  if (window.__DSH_BOOT_READY__ === true) return true
  const card = document.querySelector('[data-dsh-boot]')
  if (card === null) return true
  return card.querySelector('[data-dsh-boot-spinner]') === null
}

function today() {
  const d = new Date()
  return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 星期' + '日一二三四五六'[d.getDay()]
}

/** 'V1.2' for 1.2.x, 'DEV' outside DSH. */
const versionLabel = () => (VERSION === 'dev' ? 'DEV' : 'V' + VERSION.split('.').slice(0, 2).join('.'))

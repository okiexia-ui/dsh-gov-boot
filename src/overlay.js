/* ------------------------------------------------------------------ */
/* The overlay                                                          */
/* ------------------------------------------------------------------ */

let live = null

/**
 * @param options.preview - from the settings row: plays even when the mode is
 *   'off' (as the full show), does not wait for the app, and never navigates.
 */
function mount(options) {
  if (live !== null) return live
  const preview = options !== undefined && options.preview === true
  const stored = readMode()
  let mode = resolveMode(stored)
  if (mode === 'off') {
    if (!preview) return null
    mode = 'full'
  }
  if (preview && mode === 'splash' && stored !== 'splash') mode = 'full'
  if (document.body === null) {
    document.addEventListener('DOMContentLoaded', () => mount(options), { once: true })
    return null
  }
  if (!preview && stored === 'auto' && mode === 'full') writePref(SEEN_KEY, VERSION)

  const cfg = readCustom()
  ensureHostSheet()
  const host = document.createElement('div')
  host.className = 'dsh-gov-boot-host'
  host.setAttribute('aria-hidden', 'true')
  const shadow = host.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = STYLE
  shadow.appendChild(style)
  const root = document.createElement('div')
  root.className = 'gb-root'
  root.dataset.theme = readTheme()
  root.style.setProperty('--tick', cfg.countdown + 's')
  const platform = document.documentElement.getAttribute('data-platform')
  if (platform !== null) root.dataset.platform = platform
  // Only the splash is built now; the later scenes are built while it plays.
  root.innerHTML = splashMarkup(cfg)
  shadow.appendChild(root)
  document.body.appendChild(host)

  let band = null
  if (platform !== null) {
    band = document.createElement('div')
    band.className = 'dsh-gov-boot-dragband'
    document.body.appendChild(band)
  }

  // Same-task handoff from the host cover to this paper background.
  try {
    const cover = window[FIRST_FRAME_GLOBAL]
    if (cover && typeof cover.end === 'function') cover.end()
  } catch (error) { /* the boot watch retires it */ }

  const q = (selector) => root.querySelector(selector)
  const qa = (selector) => Array.prototype.slice.call(root.querySelectorAll(selector))
  const splash = q('.gb-splash')

  const timers = new Set()
  const at = (ms, fn) => {
    const id = window.setTimeout(() => { timers.delete(id); fn() }, ms)
    timers.add(id)
    return id
  }
  const clearTimers = () => {
    for (const id of timers) window.clearTimeout(id)
    timers.clear()
  }
  const ceiling = window.setTimeout(() => finish(), MAX_MS)

  /** Calls back once the app behind is up; polls on `at` so phase changes cancel it. */
  const waitReady = (callback) => {
    if (preview) { callback(); return }
    const started = Date.now()
    const poll = () => {
      if (appReady() || Date.now() - started >= READY_MAX_MS) callback()
      else at(200, poll)
    }
    poll()
  }

  let phase = 'splash'
  let finished = false
  /** What to do once the overlay is gone: an explicitly picked workbench. */
  let afterwards = null

  const finish = () => {
    if (finished) return
    finished = true
    clearTimers()
    root.classList.add('gb-out')
    window.setTimeout(remove, FADE_MS + 40)
  }

  const remove = () => {
    clearTimers()
    window.clearTimeout(ceiling)
    if (host.parentNode !== null) host.parentNode.removeChild(host)
    if (band !== null && band.parentNode !== null) band.parentNode.removeChild(band)
    window.removeEventListener('keydown', onKey, true)
    if (live === handle) live = null
    if (afterwards !== null) afterwards()
  }

  /* ---- sign-in + picker, built lazily ---- */
  let auth = null
  let bar = null
  let status = null
  let pct = null
  let cards = []
  let sub = null

  const buildAuth = () => {
    if (auth !== null || mode !== 'full') return
    root.insertAdjacentHTML('beforeend', authMarkup(cfg))
    auth = q('.gb-auth')
    bar = q('.au-fill')
    status = q('.au-status')
    pct = q('.au-pct')
    cards = qa('.ch-card')
    sub = q('.ch-sub')
    q('.au-date').textContent = today()
    q('.au-where').textContent = '本机服务 ' + (window.location.host || 'localhost')
  }

  const setProgress = (value, text) => {
    bar.style.width = value + '%'
    pct.textContent = value + '%'
    if (text !== undefined) status.textContent = text
  }

  const showTab = (name) => {
    for (const tab of qa('[data-tab]')) tab.classList.toggle('on', tab.dataset.tab === name)
    for (const pane of qa('[data-pane]')) pane.classList.toggle('on', pane.dataset.pane === name)
  }

  const markVerified = () => {
    setProgress(100, '核验通过，请选择工作台')
    for (const button of qa('.au-btn')) {
      button.classList.add('done')
      button.textContent = '✓ 核验通过'
    }
  }

  const startAuth = () => {
    if (phase !== 'splash') return
    phase = 'auth'
    clearTimers()
    buildAuth()
    void auth.offsetWidth // commit the hidden state so the cross-fade runs even if it was built just now
    splash.classList.add('out')
    auth.classList.add('in')
    at(150, () => setProgress(14, '正在连接本地服务…'))
    at(650, () => setProgress(38, '正在加载插件与配置…'))
    at(1150, () => setProgress(62, '正在核验操作员身份…'))
    at(1650, () => setProgress(86, '正在准备工作台…'))
    at(2150, () => waitReady(() => {
      markVerified()
      at(700, startChoose)
    }))
  }

  /** Click or Enter during sign-in: the user asked to move on, so do not wait. */
  const completeAuth = () => {
    clearTimers()
    markVerified()
    at(450, startChoose)
  }

  const last = readApp()
  let selected = last
  let ticking = false
  let left = cfg.countdown

  const renderSub = () => {
    const name = '「' + esc(cfg.apps[selected].name) + '」'
    if (phase === 'entering') sub.innerHTML = '正在进入 <b>' + name + '</b>…'
    else if (ticking) sub.innerHTML = '<b>' + left + '</b> 秒后自动进入 <b>' + name + '</b>'
    else sub.innerHTML = '已暂停自动进入 · 按 Enter 进入 <b>' + name + '</b>'
  }

  const select = (index, byUser) => {
    selected = (index + cards.length) % cards.length
    cards.forEach((card, i) => card.classList.toggle('on', i === selected))
    if (byUser && ticking) {
      ticking = false
      clearTimers()
      for (const card of cards) card.classList.remove('ticking')
    }
    renderSub()
  }

  const tick = () => {
    at(1000, () => {
      left -= 1
      if (left <= 0) enter(selected, false)
      else { renderSub(); tick() }
    })
  }

  const startChoose = () => {
    if (phase === 'choose' || phase === 'entering') return
    phase = 'choose'
    clearTimers()
    auth.classList.add('choosing')
    if (cards[last]) cards[last].classList.add('last')
    ticking = true
    left = cfg.countdown
    select(selected, false)
    cards[selected].classList.add('ticking')
    tick()
  }

  /** @param explicit - the user picked this card (click, digit, Enter), not the countdown. */
  const enter = (index, explicit) => {
    if (phase !== 'choose') return
    select(index, false)
    phase = 'entering'
    ticking = false
    clearTimers()
    for (const card of cards) card.classList.remove('ticking')
    cards[selected].classList.add('go')
    renderSub()
    writePref(APP_KEY, String(selected))
    const app = cfg.apps[selected]
    try {
      document.dispatchEvent(new CustomEvent('dsh-gov-boot:enter', { detail: { index: selected, name: app.name, prompt: app.prompt, explicit } }))
    } catch (error) { /* listeners are someone else's business */ }
    if (explicit && cfg.actions && !preview) afterwards = () => openWorkbench(app)
    at(420, finish)
  }

  /* ---- input ---- */
  const advance = () => {
    if (finished) return
    if (phase === 'splash') { if (mode === 'full') startAuth(); else finish(); return }
    if (phase === 'auth') { completeAuth(); return }
    if (phase === 'choose') enter(selected, false)
  }

  root.addEventListener('click', (event) => {
    const target = event.target
    const tab = target.closest ? target.closest('[data-tab]') : null
    if (tab !== null && phase === 'auth') { showTab(tab.dataset.tab); return }
    const card = target.closest ? target.closest('[data-app]') : null
    if (card !== null && phase === 'choose') { enter(Number(card.dataset.app), true); return }
    advance()
  })

  const SWALLOW = ['Enter', 'Escape', 'Tab', 'Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']

  /* Keys go to the overlay, not to whatever is focused in the app behind it:
     Enter must not send a message the user cannot see. Shortcuts with a
     modifier and function keys pass through untouched. */
  const onKey = (event) => {
    if (finished || event.isComposing) return
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const key = event.key
    if (key.length !== 1 && SWALLOW.indexOf(key) < 0) return
    event.preventDefault()
    event.stopPropagation()
    if (key === 'Escape') { finish(); return }
    if (phase === 'choose') {
      if (key >= '1' && key <= String(cards.length)) { enter(Number(key) - 1, true); return }
      if (key === 'ArrowLeft' || key === 'ArrowUp') { select(selected - 1, true); return }
      if (key === 'ArrowRight' || key === 'ArrowDown' || key === 'Tab') { select(selected + 1, true); return }
      if (key === 'Enter') { enter(selected, true); return }
    }
    if (key === 'Enter' || key === ' ') advance()
  }
  window.addEventListener('keydown', onKey, true)

  /* ---- splash beats ---- */
  const on = (selector) => () => q(selector).classList.add('on')
  at(80, on('.sp-frame'))
  at(160, on('.sp-sun'))
  at(240, on('.sp-land'))
  at(380, on('.sp-cloud.c1'))
  at(460, on('.sp-eyebrow'))
  at(560, on('.sp-cloud.c2'))
  at(620, on('.sp-wall'))
  at(700, on('.sp-title'))
  at(900, on('.sp-geese'))
  at(1380, on('.sp-rule'))
  at(1520, on('.sp-sub'))
  at(1650, on('.sp-wave'))
  if (mode === 'full') at(BUILD_AUTH_AT, buildAuth)
  at(2050, on('.sp-seal'))
  at(2250, on('.sp-meta'))
  if (mode === 'full') at(AUTH_AT, startAuth)
  else at(AUTH_AT + 200, () => waitReady(finish))

  const handle = { host, dispose: finish }
  live = handle
  return handle
}

/* ------------------------------------------------------------------ */
/* Settings → General row                                               */
/* ------------------------------------------------------------------ */

/* DSH's own tokens. The selected segment uses the primary-button pair
   (button-primary-fill + label-primary-foreground): brand-text is the same
   colour as brand-primary in DSH 0.2.1, which made the label invisible. */
const ROW_CSS = `
.dshgov-row{display:flex;align-items:center;gap:12px 16px;padding:12px 0;flex-wrap:wrap}
.dshgov-row-text{flex:1;min-width:220px}
.dshgov-row-title{font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary,#0f1115)}
.dshgov-row-desc{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary,#81858c)}
.dshgov-row-ctrl{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dshgov-seg{display:inline-flex;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.35));border-radius:8px;overflow:hidden}
.dshgov-seg button{border:0;background:transparent;color:var(--dsw-alias-label-secondary,#666);font-family:inherit;font-size:12.5px;line-height:1.4;padding:5px 12px;cursor:pointer}
.dshgov-seg button+button{border-left:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.35))}
.dshgov-seg button:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.14))}
.dshgov-seg button.on{background:var(--dsw-alias-button-primary-fill,#0f1115);color:var(--dsw-alias-label-primary-foreground,#fff)}
.dshgov-seg.disabled{opacity:.45;pointer-events:none}
.dshgov-btn{border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.35));background:transparent;color:var(--dsw-alias-label-primary,#0f1115);font-family:inherit;font-size:12.5px;line-height:1.4;padding:5px 14px;border-radius:8px;cursor:pointer}
.dshgov-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.14))}
.dshgov-panel{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 16px;padding:4px 0 16px}
.dshgov-field{display:flex;flex-direction:column;gap:4px;min-width:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary,#81858c)}
.dshgov-field.wide,.dshgov-app,.dshgov-panel-foot{grid-column:1/-1}
.dshgov-input{width:100%;min-width:0;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.35));background:transparent;
  color:var(--dsw-alias-label-primary,#0f1115);border-radius:8px;padding:6px 10px;font:inherit;font-size:13px;line-height:20px;resize:vertical}
.dshgov-input:focus-visible{outline:2px solid var(--dsw-alias-brand-primary-new-colorprimary-new-color,#4176e6);outline-offset:1px}
.dshgov-app{display:grid;grid-template-columns:minmax(0,140px) minmax(0,1fr);gap:8px;padding-top:10px;border-top:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.2))}
.dshgov-app .dshgov-field.prompt{grid-column:1/-1}
.dshgov-check{display:flex;align-items:center;gap:8px;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary,#0f1115)}
.dshgov-panel-foot{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
@media (max-width: 620px){.dshgov-panel{grid-template-columns:minmax(0,1fr)}}
`

function ensureRowStyle() {
  if (document.getElementById(ROW_STYLE_ID) !== null) return
  const style = document.createElement('style')
  style.id = ROW_STYLE_ID
  style.textContent = ROW_CSS
  document.head.appendChild(style)
}

const MODE_OPTIONS = [
  { value: 'off', label: '关闭' },
  { value: 'auto', label: '自动' },
  { value: 'splash', label: '仅片头' },
  { value: 'full', label: '完整' },
]
const THEME_OPTIONS = [
  { value: 'blue', label: '科技蓝' },
  { value: 'red', label: '中国红' },
  { value: 'night', label: '深夜蓝' },
]

/** Plain createElement, no JSX: the loader hands this module `require`, and react is one of its externals. */
function makeSettingsRow(React) {
  const h = React.createElement

  const segmented = (value, options, pick, disabled) =>
    h(
      'div',
      { className: disabled ? 'dshgov-seg disabled' : 'dshgov-seg' },
      options.map((option) =>
        h(
          'button',
          { key: option.value, type: 'button', className: value === option.value ? 'on' : '', onClick: () => pick(option.value) },
          option.label,
        ),
      ),
    )

  const field = (label, value, max, onChange, extra) =>
    h(
      'label',
      { className: 'dshgov-field' + (extra && extra.className ? ' ' + extra.className : '') },
      label,
      h(extra && extra.multiline ? 'textarea' : 'input', {
        className: 'dshgov-input',
        type: extra && extra.multiline ? undefined : 'text',
        rows: extra && extra.multiline ? 2 : undefined,
        value,
        maxLength: max,
        onChange: (event) => onChange(event.target.value),
      }),
    )

  function CustomPanel() {
    const [cfg, setCfg] = React.useState(readCustom)
    const update = (patch) => {
      const next = Object.assign({}, cfg, patch)
      setCfg(next)
      writeCustom(next)
    }
    const updateApp = (index, patch) => update({ apps: cfg.apps.map((app, i) => (i === index ? Object.assign({}, app, patch) : app)) })
    const reset = () => {
      writePref(CUSTOM_KEY, null)
      setCfg(readCustom())
    }
    return h(
      'div',
      { className: 'dshgov-panel' },
      field('片头标题', cfg.title, LIMITS.title, (title) => update({ title })),
      field('副标题', cfg.subtitle, LIMITS.subtitle, (subtitle) => update({ subtitle })),
      field('印章文字（1–4 字）', cfg.seal, LIMITS.seal, (seal) => update({ seal })),
      h(
        'label',
        { className: 'dshgov-field' },
        '选择工作台倒计时',
        h(
          'select',
          { className: 'dshgov-input', value: String(cfg.countdown), onChange: (event) => update({ countdown: Number(event.target.value) }) },
          [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => h('option', { key: n, value: String(n) }, n + ' 秒')),
        ),
      ),
      cfg.apps.map((app, i) =>
        h(
          'div',
          { key: i, className: 'dshgov-app' },
          field('工作台 ' + (i + 1), app.name, LIMITS.name, (name) => updateApp(i, { name })),
          field('说明', app.desc, LIMITS.desc, (desc) => updateApp(i, { desc })),
          field('进入后预填的提示词', app.prompt, LIMITS.prompt, (prompt) => updateApp(i, { prompt }), { multiline: true, className: 'prompt' }),
        ),
      ),
      h(
        'div',
        { className: 'dshgov-panel-foot' },
        h(
          'label',
          { className: 'dshgov-check' },
          h('input', { type: 'checkbox', checked: cfg.actions, onChange: (event) => update({ actions: event.target.checked }) }),
          '点选工作台后，新建会话并把提示词填进输入框（不会自动发送）',
        ),
        h('button', { type: 'button', className: 'dshgov-btn', onClick: reset }, '恢复默认'),
      ),
    )
  }

  return function SettingsRow() {
    const [mode, setMode] = React.useState(readMode)
    const [theme, setTheme] = React.useState(readTheme)
    const [open, setOpen] = React.useState(false)
    React.useEffect(() => { ensureRowStyle() }, [])
    const pickMode = (next) => { writePref(MODE_KEY, next); setMode(next) }
    const pickTheme = (next) => { writePref(THEME_KEY, next); setTheme(next) }
    return h(
      'div',
      null,
      h(
        'div',
        { className: 'dshgov-row' },
        h(
          'div',
          { className: 'dshgov-row-text' },
          h('div', { className: 'dshgov-row-title' }, '政务开机动画'),
          h('div', { className: 'dshgov-row-desc' }, '宣纸片头 → 统一身份认证 → 选择工作台。「自动」在每个版本第一次启动时放完整版，之后只放片头；配色只影响认证页。下次启动生效。'),
        ),
        h(
          'div',
          { className: 'dshgov-row-ctrl' },
          segmented(mode, MODE_OPTIONS, pickMode, false),
          segmented(theme, THEME_OPTIONS, pickTheme, mode === 'off' || mode === 'splash'),
          h('button', { type: 'button', className: 'dshgov-btn', onClick: () => mount({ preview: true }) }, '预览'),
          h('button', { type: 'button', className: 'dshgov-btn', 'aria-expanded': open, onClick: () => setOpen(!open) }, open ? '收起' : '自定义…'),
        ),
      ),
      open ? h(CustomPanel) : null,
    )
  }
}

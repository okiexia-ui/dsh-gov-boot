/* Keys shared with lib/index.js (MODE_KEY, FIRST_FRAME_GLOBAL, VERSION_GLOBAL) — keep in sync. */
const MODE_KEY = 'dsh-gov-boot:mode'
/** auto: the full show once per installed version, then the splash only. */
const MODE_VALUES = ['off', 'auto', 'splash', 'full']
const DEFAULT_MODE = 'auto'
/** Palette of the sign-in and workbench scenes; the paper splash never changes. */
const THEME_KEY = 'dsh-gov-boot:theme'
const THEME_VALUES = ['blue', 'red', 'night']
const DEFAULT_THEME = 'blue'
/** Index of the workbench picked last time; it becomes the default card. */
const APP_KEY = 'dsh-gov-boot:app'
/** The version whose full show has played (auto mode). */
const SEEN_KEY = 'dsh-gov-boot:seen'
/** The user's own texts and prompts, as JSON (see readCustom). */
const CUSTOM_KEY = 'dsh-gov-boot:custom'
/** Same handshake as lib/index.js. */
const FIRST_FRAME_GLOBAL = '__dshGovFirstFrame'
/** The host half injects package.json's version here; the preview has none. */
const VERSION_GLOBAL = '__dshGovVersion'
const VERSION = typeof window[VERSION_GLOBAL] === 'string' && window[VERSION_GLOBAL] !== '' ? window[VERSION_GLOBAL] : 'dev'
/** One above the host cover (2147482000). */
const Z = 2147482001
/** Splash ends and the sign-in scene takes over. */
const AUTH_AT = 3000
/** The sign-in and picker scenes are built while the splash plays, not at mount. */
const BUILD_AUTH_AT = 1700
/** Fade-out length; keep in sync with .gb-root.gb-out transition. */
const FADE_MS = 620
/** The progress bar holds at 86% until the app is up, but never longer than this. */
const READY_MAX_MS = 10000
/** Last-resort ceiling: a stalled timeline must never leave the overlay up. */
const MAX_MS = 60000
const HOST_SHEET_ID = 'dsh-gov-boot-host-sheet'
const ROW_STYLE_ID = 'dsh-gov-boot-row-style'

const SANS = '"PingFang SC","Noto Sans SC","Noto Sans CJK SC","Source Han Sans SC","Microsoft YaHei","Heiti SC",sans-serif'
const SERIF = '"Songti SC","Noto Serif SC","Noto Serif CJK SC","Source Han Serif SC","STSong","SimSun",serif'
const KAI = '"Kaiti SC","STKaiti","KaiTi","LXGW WenKai","LXGW WenKai TC","Songti SC",serif'
const LATIN = '"Helvetica Neue",Arial,"PingFang SC","Noto Sans SC",sans-serif'

/** Everything the user can rename in Settings, with its limits. */
const DEFAULTS = {
  title: '智能政务工作平台',
  subtitle: '统一身份认证 · 安全可信接入',
  seal: '智能政务',
  countdown: 3,
  /** Picking a card explicitly opens a new session with its prompt in the input box. */
  actions: true,
  apps: [
    { name: '智能问答', desc: '政策咨询、业务办理问答，即问即答', prompt: '请就以下政策或业务问题给出解答，并注明依据：\n' },
    { name: '公文写作', desc: '通知、请示、报告等公文起草与润色', prompt: '请帮我起草一份公文。\n文种：通知\n主题：\n主要内容：\n' },
    { name: '数据分析', desc: '报表解读、统计分析与图表生成', prompt: '请分析以下数据，概括主要结论，并给出可视化建议：\n' },
    { name: '知识库', desc: '法规制度与业务文档检索', prompt: '请在当前工作区的资料中检索，回答以下问题并列出出处：\n' },
  ],
}
const LIMITS = { title: 16, subtitle: 30, seal: 4, name: 8, desc: 30, prompt: 500 }

const APP_ICONS = [
  '<path d="M6 7h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H14l-6 5v-5H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/><path d="M11 15h.01M16 15h.01M21 15h.01" stroke-width="3"/>',
  '<path d="M8 4h12l6 6v18H8z"/><path d="M20 4v6h6M12 15h10M12 19h10M12 23h6"/>',
  '<path d="M4 27h24"/><path d="M8 23v-5M13 23V12M18 23v-7M23 23V8" stroke-width="3"/><path d="M7 13l6-5 5 3 7-6"/>',
  '<path d="M4 7c4-2 8-2 12 1 4-3 8-3 12-1v19c-4-2-8-2-12 1-4-3-8-3-12-1z"/><path d="M16 8v19"/>',
]

/** User text goes into template-built markup; it must never become markup. */
const esc = (text) =>
  String(text).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch])

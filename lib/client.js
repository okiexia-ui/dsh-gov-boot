window.__ModuleLoader__.load({
  id: 'dsh-gov-boot',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports

    /** Same key as lib/index.js — 'off' boots straight through. */
    const MODE_KEY = 'dsh-gov-boot:mode'
    const MODE_VALUES = ['off', 'splash', 'full']
    const DEFAULT_MODE = 'full'
    /** Palette of the sign-in and workbench scenes; the paper splash never changes. */
    const THEME_KEY = 'dsh-gov-boot:theme'
    const THEME_VALUES = ['blue', 'red', 'night']
    const DEFAULT_THEME = 'blue'
    /** Index of the workbench picked last time; it becomes the default card. */
    const APP_KEY = 'dsh-gov-boot:app'
    /** Same handshake as lib/index.js. */
    const FIRST_FRAME_GLOBAL = '__dshGovFirstFrame'
    /** One above the host cover (2147482000). */
    const Z = 2147482001
    /** Splash ends and the sign-in scene takes over. */
    const AUTH_AT = 3000
    /** Seconds the workbench picker waits before entering the default card. */
    const CHOOSE_SECONDS = 3
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

    const APPS = [
      {
        name: '智能问答',
        desc: '政策咨询、业务办理问答，即问即答',
        icon: '<path d="M6 7h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H14l-6 5v-5H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/><path d="M11 15h.01M16 15h.01M21 15h.01" stroke-width="3"/>',
      },
      {
        name: '公文写作',
        desc: '通知、请示、报告等公文起草与润色',
        icon: '<path d="M8 4h12l6 6v18H8z"/><path d="M20 4v6h6M12 15h10M12 19h10M12 23h6"/>',
      },
      {
        name: '数据分析',
        desc: '报表解读、统计分析与图表生成',
        icon: '<path d="M4 27h24"/><path d="M8 23v-5M13 23V12M18 23v-7M23 23V8" stroke-width="3"/><path d="M7 13l6-5 5 3 7-6"/>',
      },
      {
        name: '知识库',
        desc: '法规制度与业务文档检索',
        icon: '<path d="M4 7c4-2 8-2 12 1 4-3 8-3 12-1v19c-4-2-8-2-12 1-4-3-8-3-12-1z"/><path d="M16 8v19"/>',
      },
    ]

    /* ------------------------------------------------------------------ */
    /* Procedural artwork. Seeded, so every boot draws the same picture.   */
    /* ------------------------------------------------------------------ */

    function rng(seed) {
      let a = seed >>> 0
      return () => {
        a = (a + 0x6d2b79f5) >>> 0
        let t = a
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
      }
    }

    const n1 = (value) => Math.round(value * 10) / 10

    /** Catmull-Rom through the points, as cubic Béziers. */
    function smooth(points) {
      let d = 'M' + n1(points[0][0]) + ' ' + n1(points[0][1])
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] || points[i]
        const p1 = points[i]
        const p2 = points[i + 1]
        const p3 = points[i + 2] || p2
        d +=
          ' C' +
          [
            p1[0] + (p2[0] - p0[0]) / 6,
            p1[1] + (p2[1] - p0[1]) / 6,
            p2[0] - (p3[0] - p1[0]) / 6,
            p2[1] - (p3[1] - p1[1]) / 6,
            p2[0],
            p2[1],
          ]
            .map(n1)
            .join(' ')
      }
      return d
    }

    /** An organic ridge line closed down to the bottom of a 1440×460 box. */
    function ridge(seed, base, amp, step) {
      const r = rng(seed)
      const ph = [r() * 6.28, r() * 6.28, r() * 6.28]
      const points = []
      for (let x = -40; x <= 1480; x += step) {
        const wave = 0.55 * Math.sin(x / 260 + ph[0]) + 0.3 * Math.sin(x / 118 + ph[1]) + 0.15 * Math.sin(x / 51 + ph[2])
        points.push([x, base - amp * wave])
      }
      return smooth(points) + ' L1480 460 L-40 460 Z'
    }

    /* The Great Wall's crest line; towers stand on the listed indices. */
    const WALL = [
      [-40, 362], [40, 354], [120, 336], [190, 318], [250, 302], [300, 292], [352, 276], [396, 270],
      [440, 280], [500, 302], [560, 316], [620, 310], [680, 292], [730, 270], [772, 260], [820, 270],
      [880, 292], [940, 306], [1000, 300], [1060, 282], [1110, 266], [1150, 260], [1196, 270],
      [1260, 290], [1330, 304], [1400, 310], [1480, 314],
    ]
    const TOWERS = [[3, 16], [7, 24], [11, 17], [14, 26], [18, 18], [21, 25], [24, 16]]

    function tower(x, y, w) {
      const h = w * 0.95
      const left = x - w / 2
      let s = `<rect x="${n1(left)}" y="${n1(y - h)}" width="${n1(w)}" height="${n1(h + 5)}"/>`
      s += `<rect x="${n1(left - 1.6)}" y="${n1(y - h - 2.4)}" width="${n1(w + 3.2)}" height="3"/>`
      const gap = (w + 3.2 - 2.6) / 3
      for (let i = 0; i < 4; i++) {
        s += `<rect x="${n1(left - 1.6 + i * gap)}" y="${n1(y - h - 6)}" width="2.6" height="3.8"/>`
      }
      s += `<rect class="win" x="${n1(x - w * 0.11)}" y="${n1(y - h * 0.62)}" width="${n1(w * 0.22)}" height="${n1(h * 0.3)}" rx="${n1(w * 0.11)}"/>`
      return s
    }

    const LAND_SVG = 'viewBox="0 0 1440 460" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"'

    function landBack() {
      const mid = smooth(WALL.map(([x, y]) => [x, y + 3])) + ' L1480 460 L-40 460 Z'
      return `<svg ${LAND_SVG}>
  <defs>
    <linearGradient id="gbFar2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4a289" stop-opacity=".24"/><stop offset="1" stop-color="#d4a289" stop-opacity="0"/></linearGradient>
    <linearGradient id="gbFar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4846a" stop-opacity=".3"/><stop offset="1" stop-color="#c4846a" stop-opacity=".02"/></linearGradient>
    <linearGradient id="gbMid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a95a44" stop-opacity=".36"/><stop offset=".6" stop-color="#a95a44" stop-opacity=".12"/><stop offset="1" stop-color="#a95a44" stop-opacity=".05"/></linearGradient>
    <filter id="gbBlur3" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="gbBlur1" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="1.4"/></filter>
  </defs>
  <path fill="url(#gbFar2)" filter="url(#gbBlur3)" d="${ridge(11, 196, 46, 48)}"/>
  <path fill="url(#gbFar)" filter="url(#gbBlur1)" d="${ridge(23, 246, 40, 40)}"/>
  <path fill="url(#gbMid)" d="${mid}"/>
</svg>`
    }

    function landWall() {
      const crest = smooth(WALL)
      const merlons = smooth(WALL.map(([x, y]) => [x, y - 3.4]))
      const walk = smooth(WALL.map(([x, y]) => [x, y + 0.8]))
      const towers = TOWERS.map(([i, w]) => tower(WALL[i][0], WALL[i][1] + 2, w)).join('')
      return `<svg ${LAND_SVG}>
  <g fill="none" stroke="#6b2f25" stroke-linejoin="round">
    <path d="${crest}" stroke-opacity=".5" stroke-width="5.5"/>
    <path d="${merlons}" stroke-opacity=".55" stroke-width="2.8" stroke-dasharray="2.2 2.6"/>
  </g>
  <path d="${walk}" fill="none" stroke="#f7ecd9" stroke-opacity=".55" stroke-width=".9"/>
  <g class="sp-towers" fill="#6b2f25" fill-opacity=".58">${towers}</g>
</svg>`
    }

    function landFront() {
      return `<svg ${LAND_SVG}>
  <defs>
    <linearGradient id="gbMist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf5e8" stop-opacity="0"/><stop offset=".5" stop-color="#fbf5e8" stop-opacity=".8"/><stop offset="1" stop-color="#fbf5e8" stop-opacity="0"/></linearGradient>
    <linearGradient id="gbNear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a4434" stop-opacity=".34"/><stop offset="1" stop-color="#8a4434" stop-opacity=".12"/></linearGradient>
  </defs>
  <rect x="-40" y="318" width="1520" height="74" fill="url(#gbMist)"/>
  <path fill="url(#gbNear)" d="${ridge(37, 412, 16, 60)}"/>
</svg>`
    }

    /** Auspicious cloud: puffs outlined in gold, curls drawn inside. */
    function cloud() {
      const puffs = [[40, 36, 16], [72, 26, 22], [106, 32, 18], [134, 42, 12]]
      const outline = puffs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('') + '<rect x="18" y="38" width="130" height="16" rx="8"/>'
      const curls = puffs
        .slice(0, 3)
        .map(([x, y, r]) => {
          const a = r * 0.55
          return `<path d="M${x - a} ${y + a * 0.2} a${a} ${a} 0 1 1 ${a} ${a * 0.9} a${a * 0.5} ${a * 0.5} 0 1 1 ${-a * 0.42} ${-a * 0.6}"/>`
        })
        .join('')
      return `<svg viewBox="0 0 160 62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g fill="none" stroke="#c09a5c" stroke-width="2.4" stroke-opacity=".6">${outline}</g>
  <g fill="#fbf6ea">${outline}</g>
  <g fill="none" stroke="#c09a5c" stroke-width="1.3" stroke-linecap="round" stroke-opacity=".62">${curls}<path d="M150 46c6 0 9 3 9 6"/></g>
</svg>`
    }

    const GEESE = `<svg viewBox="0 0 130 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g fill="none" stroke="#6b2f25" stroke-opacity=".42" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 30q6-6 10 0q4-6 10 0"/><path d="M38 20q5-5 8 0q3-5 8 0"/><path d="M60 34q5-5 8 0q3-5 8 0"/>
    <path d="M82 14q4-4 7 0q3-4 7 0"/><path d="M104 26q4-4 7 0q3-4 7 0"/>
  </g>
</svg>`

    /* 回纹 corner: an L of the frame plus one meander unit. */
    const CORNER = `<svg viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g fill="none" stroke="#b08a4a" stroke-width="1.7" stroke-linecap="square">
    <path d="M1.5 45V1.5H45"/><path d="M7 31V7h24v18H13V13h12v6h-6"/>
  </g>
</svg>`

    const SEAL = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><filter id="gbWorn" x="-6%" y="-6%" width="112%" height="112%">
    <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="7"/>
    <feDisplacementMap in="SourceGraphic" scale="3.4"/>
  </filter></defs>
  <g filter="url(#gbWorn)">
    <rect x="4" y="4" width="92" height="92" rx="6" fill="#b3121a"/>
    <rect x="10.5" y="10.5" width="79" height="79" rx="2" fill="none" stroke="#fbf1e0" stroke-width="2.4"/>
    <g fill="#fbf1e0" font-family="Songti SC, Noto Serif SC, STSong, serif" font-weight="900" font-size="33" text-anchor="middle">
      <text x="32" y="45">智</text><text x="68" y="45">能</text><text x="32" y="82">政</text><text x="68" y="82">务</text>
    </g>
  </g>
</svg>`

    function splashMarkup() {
      return `
<div class="gb-splash">
  <div class="sp-fiber"></div>
  <div class="sp-sun"></div>
  <div class="sp-cloud c1">${cloud()}</div>
  <div class="sp-geese">${GEESE}</div>
  <div class="sp-land">
    <div>${landBack()}</div>
    <div class="sp-wall">${landWall()}</div>
    <div>${landFront()}</div>
  </div>
  <div class="sp-cloud c2">${cloud()}</div>
  <div class="sp-vignette"></div>
  <div class="sp-frame">
    <i class="sp-corner tl">${CORNER}</i><i class="sp-corner tr">${CORNER}</i>
    <i class="sp-corner bl">${CORNER}</i><i class="sp-corner br">${CORNER}</i>
  </div>
  <div class="sp-main">
    <div class="sp-eyebrow">DEEPSEEK HARNESS · GOVERNMENT EDITION</div>
    <h1 class="sp-title"><span>智能政务工作平台</span></h1>
    <div class="sp-rule"><i></i><b></b><i></i></div>
    <div class="sp-sub">统一身份认证 · 安全可信接入</div>
  </div>
  <div class="sp-seal">${SEAL}</div>
  <div class="sp-meta"><b>DSH 政务版</b><span>SECURE WORKSPACE · V0.4</span></div>
  <div class="sp-wave">
    <svg viewBox="0 0 1440 74" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#b3121a" d="M0 34 C220 4 360 20 540 34 C760 52 900 54 1080 38 C1240 24 1340 26 1440 38 L1440 74 L0 74 Z"/>
      <path fill="none" stroke="#e2bf7a" stroke-width="1.4" stroke-opacity=".85" d="M0 40 C220 10 360 26 540 40 C760 58 900 60 1080 44 C1240 30 1340 32 1440 44"/>
      <path fill="#8c0e14" opacity=".6" d="M0 54 C240 36 420 48 620 56 C840 65 1040 62 1220 52 C1320 46 1390 48 1440 52 L1440 74 L0 74 Z"/>
    </svg>
  </div>
</div>`
    }

    /* ---------- sign-in scene artwork ---------- */

    function city() {
      const r = rng(7)
      let far = ''
      for (let x = -10; x < 1450; ) {
        const w = 22 + r() * 40
        const h = 70 + r() * 120
        far += `<rect x="${n1(x)}" y="${n1(300 - h)}" width="${n1(w)}" height="${n1(h)}"/>`
        x += w + 2 + r() * 6
      }
      const T = 330
      let near = ''
      let win = ''
      for (let x = -10; x < 1450; ) {
        const w = 30 + r() * 46
        if (x + w > T - 124 && x < T + 124) {
          x = T + 126
          continue
        }
        const h = 56 + r() * 140
        const top = 300 - h
        const kind = r()
        near += `<rect x="${n1(x)}" y="${n1(top)}" width="${n1(w)}" height="${n1(h)}"/>`
        if (kind > 0.45 && kind <= 0.65) {
          near += `<rect x="${n1(x + w * 0.2)}" y="${n1(top - 18)}" width="${n1(w * 0.6)}" height="19"/>`
        } else if (kind > 0.65 && kind <= 0.82) {
          near += `<path d="M${n1(x + w * 0.2)} ${n1(top)}L${n1(x + w / 2)} ${n1(top - 26)}L${n1(x + w * 0.8)} ${n1(top)}Z"/><rect x="${n1(x + w / 2 - 0.8)}" y="${n1(top - 44)}" width="1.6" height="20"/>`
        } else if (kind > 0.82) {
          near += `<path d="M${n1(x)} ${n1(top)}L${n1(x + w)} ${n1(top - 16)}V${n1(top)}Z"/>`
        }
        if (w > 34) {
          for (let wy = top + 10; wy < 286; wy += 9) {
            for (let wx = x + 5; wx < x + w - 6; wx += 7) {
              if (r() < 0.3) win += `<rect x="${n1(wx)}" y="${n1(wy)}" width="3" height="4"/>`
            }
          }
        }
        x += w + 3 + r() * 8
      }
      // Hall of Prayer for Good Harvests: three terraces, three round roofs.
      const t = (dx) => n1(T + dx)
      const roof = (half, base, peak) =>
        `<path d="M${t(-half)} ${base}C${t(-half * 0.55)} ${base - 9} ${t(-half * 0.4)} ${peak + 6} ${T} ${peak}C${t(half * 0.4)} ${peak + 6} ${t(half * 0.55)} ${base - 9} ${t(half)} ${base}Z"/>`
      const temple =
        `<rect x="${t(-118)}" y="284" width="236" height="16"/><rect x="${t(-96)}" y="270" width="192" height="14"/><rect x="${t(-76)}" y="258" width="152" height="12"/>` +
        `<rect x="${t(-50)}" y="226" width="100" height="32"/>` +
        roof(74, 230, 204) +
        `<rect x="${t(-38)}" y="196" width="76" height="16"/>` +
        roof(58, 200, 176) +
        `<rect x="${t(-27)}" y="166" width="54" height="13"/>` +
        roof(44, 169, 142) +
        `<rect x="${t(-2)}" y="128" width="4" height="15"/><circle cx="${T}" cy="125" r="4"/>`
      // A broadcast tower on the right.
      const tv = `<path d="M1046 300L1060 160H1068L1082 300Z"/><rect x="1061" y="70" width="6" height="92"/><circle cx="1064" cy="130" r="11"/><circle cx="1064" cy="96" r="6"/><rect x="1063" y="36" width="2" height="36"/>`
      return `<svg viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><linearGradient id="auTrail" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" style="stop-color:var(--trail)" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient></defs>
  <g class="c-far">${far}</g>
  <g class="c-near">${near}${temple}${tv}</g>
  <g class="c-win">${win}</g>
  <rect class="c-water" x="0" y="262" width="1440" height="38"/>
  <path d="M-20 292C300 270 640 286 900 280C1120 275 1300 262 1460 268" fill="none" stroke="url(#auTrail)" stroke-width="2"/>
  <path d="M-20 298C360 284 700 296 980 290C1180 286 1330 278 1460 282" fill="none" stroke="url(#auTrail)" stroke-width="1.2" stroke-opacity=".7"/>
</svg>`
    }

    function network() {
      const r = rng(42)
      const nodes = []
      for (let i = 0; i < 22; i++) nodes.push([1010 + r() * 420, 96 + r() * 300, 1.4 + r() * 1.6])
      let lines = ''
      for (const a of nodes) {
        const near = nodes
          .filter((b) => b !== a)
          .sort((p, q) => (p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2 - (q[0] - a[0]) ** 2 - (q[1] - a[1]) ** 2)
          .slice(0, 2)
        for (const b of near) lines += `<path d="M${n1(a[0])} ${n1(a[1])}L${n1(b[0])} ${n1(b[1])}"/>`
      }
      const dots = nodes.map(([x, y, s]) => `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(s)}"/>`).join('')
      return `<svg class="au-net" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g fill="none" stroke-width=".8">${lines}</g><g>${dots}</g>
</svg>`
    }

    /** Decorative 25×25 code with three finder squares and a seal in the middle. */
    function qr() {
      const r = rng(20261022)
      const n = 25
      const inFinder = (x, y) => (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8)
      let cells = ''
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          if (inFinder(x, y)) continue
          if (x >= 9 && x <= 15 && y >= 9 && y <= 15) continue
          if (r() < 0.5) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`
        }
      }
      const finder = (x, y) =>
        `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`
      return `<svg class="code" viewBox="0 0 25 25" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g fill="#1d3247">${cells}${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}</g>
  <rect x="10" y="10" width="5" height="5" rx=".6" fill="#b3121a"/><rect x="10.8" y="10.8" width="3.4" height="3.4" rx=".3" fill="none" stroke="#fbf1e0" stroke-width=".35"/>
</svg>`
    }

    const CAPTCHA = `<svg class="cap" viewBox="0 0 104 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect width="104" height="42" fill="#eef3f8"/>
  <g fill="none" stroke-width="1"><path d="M4 30C24 12 40 36 62 18S92 10 100 26" stroke="#9db6cc"/><path d="M2 14C20 22 46 6 70 28S96 30 102 12" stroke="#d0a3a3"/></g>
  <g font-family="Georgia, serif" font-size="22" font-weight="700" font-style="italic">
    <text x="12" y="30" fill="#1a6fbd" transform="rotate(-8 18 24)">7</text><text x="34" y="29" fill="#b3121a" transform="rotate(6 40 24)">K</text>
    <text x="57" y="31" fill="#2b4a60" transform="rotate(-4 62 24)">3</text><text x="78" y="28" fill="#1a6fbd" transform="rotate(9 84 24)">D</text>
  </g>
</svg>`

    const I = (body, view = 20) =>
      `<svg viewBox="0 0 ${view} ${view}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`
    const ICON_USER = I('<circle cx="10" cy="7" r="3.4"/><path d="M3.5 17.5c.9-3.4 3.4-5.2 6.5-5.2s5.6 1.8 6.5 5.2"/>')
    const ICON_LOCK = I('<rect x="4" y="9" width="12" height="8.5" rx="1.5"/><path d="M6.8 9V6.6a3.2 3.2 0 0 1 6.4 0V9"/>')
    const ICON_SHIELD = I('<path d="M10 2.5l6 2.2v4.6c0 4-2.6 6.9-6 8.2-3.4-1.3-6-4.2-6-8.2V4.7z"/><path d="M7.4 9.8l1.8 1.8 3.6-3.6"/>')
    const ICON_KEY = I('<rect x="9" y="4" width="16" height="22" rx="3"/><path d="M13 4V1.5h8V4M14 11h6M14 15h6"/><circle cx="17" cy="21" r="1.6"/>', 34)
    const FEAT = [
      ['统一入口', '一次认证，多端可用', '<rect x="5" y="5" width="8" height="8" rx="1"/><rect x="17" y="5" width="8" height="8" rx="1"/><rect x="5" y="17" width="8" height="8" rx="1"/><rect x="17" y="17" width="8" height="8" rx="1"/>'],
      ['本机部署', '服务运行在这台电脑上', '<rect x="4" y="5" width="22" height="15" rx="1.5"/><path d="M11 25h8M15 20v5"/>'],
      ['智能辅助', '大模型驱动的工作台', '<path d="M15 4l2.4 6.6L24 13l-6.6 2.4L15 22l-2.4-6.6L6 13l6.6-2.4z"/><path d="M23 21l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z"/>'],
    ]

    function authMarkup() {
      const feats = FEAT.map(
        ([title, sub, body]) =>
          `<li><svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">${body}</svg><span><b>${title}</b><small>${sub}</small></span></li>`,
      ).join('')
      const cards = APPS.map(
        (app, i) =>
          `<button class="ch-card" type="button" data-app="${i}">
        <span class="ch-no">0${i + 1}</span><span class="ch-tag">上次使用</span>
        <span class="ch-ico"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${app.icon}</svg></span>
        <b>${app.name}</b><span class="ch-desc">${app.desc}</span><span class="ch-go">进入工作台 →</span><i class="ch-bar"></i>
      </button>`,
      ).join('')
      return `
<div class="gb-auth">
  <div class="au-rays"></div>
  ${network()}
  <div class="au-city">${city()}</div>
  <header class="au-top">
    <span class="au-logo"><b>政</b></span>
    <span class="au-brand"><b>智能政务工作平台</b><em>INTELLIGENT GOVERNMENT WORKSPACE</em></span>
    <span class="au-info"><span class="au-date"></span><i></i><span class="au-where"></span></span>
  </header>
  <div class="au-line"></div>
  <div class="au-stage">
    <div class="au-wrap">
      <section class="au-hero">
        <div class="au-kicker"><i></i>UNIFIED IDENTITY AUTHENTICATION</div>
        <h1>统一身份认证平台</h1>
        <p class="au-slogan">一次认证 · 全网通行 · 安全可信</p>
        <ul class="au-feats">${feats}</ul>
        <div class="au-tip">
          <h3>温馨提示</h3>
          <p>尊敬的用户：您好！身份核验完成后可选择要进入的工作台，${CHOOSE_SECONDS} 秒内未选择将自动进入上次使用的工作台。</p>
          <p>本页为启动界面，无需输入口令；点击任意处可加快，按 Esc 直接进入。</p>
        </div>
      </section>
      <section class="au-card">
        <nav class="au-tabs"><button type="button" data-tab="account" class="on">账号登录</button><button type="button" data-tab="qr">扫码登录</button><button type="button" data-tab="ca">CA 证书</button></nav>
        <div class="au-panes">
          <div class="au-pane on" data-pane="account">
            <div class="au-input">${ICON_USER}<span>本地操作员</span></div>
            <div class="au-input">${ICON_LOCK}<span class="dots">●●●●●●●●</span></div>
            <div class="au-cap"><div class="au-input">${ICON_SHIELD}<span>7K3D</span></div>${CAPTCHA}</div>
            <div class="au-opts"><span class="au-check"><i></i>记住登录状态</span><span class="au-link">忘记口令？</span></div>
            <button type="button" class="au-btn">登 录</button>
          </div>
          <div class="au-pane" data-pane="qr">
            <div class="au-qr">${qr()}<p>请使用移动端 App 扫一扫登录</p><small>演示界面 · 无需扫码，核验完成后自动进入</small></div>
          </div>
          <div class="au-pane" data-pane="ca">
            <div class="au-ca">${ICON_KEY}<span><b>请插入 CA 证书介质</b><small>已识别：本机操作员证书（演示）</small></span></div>
            <div class="au-input select"><span>本机操作员证书（演示）</span><i>▾</i></div>
            <div class="au-input">${ICON_LOCK}<span class="dots">●●●●●●</span></div>
            <button type="button" class="au-btn">证书登录</button>
          </div>
        </div>
        <div class="au-progress">
          <div class="au-track"><i class="au-fill"></i></div>
          <div class="au-meta"><span class="au-status">正在连接本地服务…</span><b class="au-pct">0%</b></div>
        </div>
      </section>
    </div>
    <div class="ch-wrap">
      <div class="ch-badge"><i>✓</i>身份核验通过 · 欢迎您，本地操作员</div>
      <h2>请选择要进入的工作台</h2>
      <p class="ch-sub"></p>
      <div class="ch-grid">${cards}</div>
      <p class="ch-keys">按 1–4 直接进入 · ← → 切换 · Enter 确认 · Esc 跳过</p>
    </div>
  </div>
  <div class="au-foot">智能政务工作平台 · 基于 DeepSeek Harness · 点击任意处继续，Esc 跳过</div>
</div>`
    }

    const STYLE = `
:host{position:fixed;inset:0;z-index:${Z};display:block}
*{box-sizing:border-box;margin:0;padding:0}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;text-align:inherit}
ul{list-style:none}
.gb-root{position:absolute;inset:0;overflow:hidden;cursor:pointer;user-select:none;-webkit-user-select:none;
  background:#f6efe2;color:#3a2a22;font-family:${SANS};-webkit-font-smoothing:antialiased}
.gb-root.gb-out{opacity:0;transition:opacity ${FADE_MS}ms ease}

/* ---------- paper splash ---------- */
.gb-splash,.gb-auth{position:absolute;inset:0;overflow:hidden}
.gb-splash{transition:opacity .6s ease;background:radial-gradient(120% 90% at 50% 28%,#fcf7ec 0%,#f6efe2 48%,#ede0ca 100%)}
.gb-splash.out{opacity:0}
.sp-fiber{position:absolute;inset:0;pointer-events:none;opacity:.5;
  background:
    repeating-linear-gradient(90deg,rgba(140,105,70,.035) 0 1px,transparent 1px 4px),
    repeating-linear-gradient(0deg,rgba(140,105,70,.025) 0 1px,transparent 1px 5px)}
.sp-vignette{position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(130% 100% at 50% 42%,transparent 58%,rgba(120,80,40,.14) 100%)}
.sp-sun{position:absolute;right:16%;top:12%;width:clamp(120px,13vw,190px);aspect-ratio:1;border-radius:50%;opacity:0;transform:translateY(16px);
  background:radial-gradient(circle,rgba(201,58,36,.3) 0 55%,rgba(201,58,36,.12) 57%,rgba(201,58,36,0) 71%)}
.sp-sun.on{animation:sp-rise 2s ease forwards}
.sp-cloud{position:absolute;opacity:0}
.sp-cloud svg{display:block;width:100%;height:auto}
.sp-cloud.c1{left:7%;top:16%;width:clamp(150px,15vw,230px);transform:translateX(-14px)}
.sp-cloud.c2{right:11%;top:24%;width:clamp(110px,11vw,170px);transform:translateX(14px)}
.sp-cloud.on{animation:sp-drift 2.4s ease forwards}
.sp-geese{position:absolute;right:31%;top:17%;width:clamp(90px,8vw,130px);opacity:0}
.sp-geese svg{display:block;width:100%;height:auto}
.sp-geese.on{animation:sp-geese 3.2s ease-out forwards}
.sp-land{position:absolute;left:0;right:0;bottom:0;height:60%;opacity:0;transform:translateY(22px)}
.sp-land.on{animation:sp-rise 1.6s ease forwards}
.sp-land>div{position:absolute;inset:0}
.sp-land svg{width:100%;height:100%;display:block}
.sp-towers .win{fill:#f6ecd9;fill-opacity:.75}
.sp-wall{clip-path:inset(0 100% 0 0)}
.sp-wall.on{animation:sp-wipe 1.8s cubic-bezier(.45,.05,.3,1) forwards}

.sp-wave{position:absolute;left:0;right:0;bottom:0;height:74px;opacity:0}
.sp-wave svg{width:100%;height:100%;display:block}
.sp-wave.on{animation:sp-fade 1s ease forwards}

.sp-frame{position:absolute;inset:clamp(16px,3.4vw,44px);border:1px solid rgba(176,138,74,.55);opacity:0}
.sp-frame::before{content:"";position:absolute;inset:7px;border:1px solid rgba(176,138,74,.18)}
.sp-frame.on{animation:sp-fade .9s ease forwards}
.sp-corner{position:absolute;width:46px;height:46px}
.sp-corner svg{display:block;width:100%;height:100%}
.sp-corner.tl{left:-2px;top:-2px}
.sp-corner.tr{right:-2px;top:-2px;transform:scaleX(-1)}
.sp-corner.bl{left:-2px;bottom:-2px;transform:scaleY(-1)}
.sp-corner.br{right:-2px;bottom:-2px;transform:scale(-1,-1)}

.sp-main{position:absolute;left:50%;top:41%;transform:translate(-50%,-50%);width:min(980px,88vw);text-align:center}
.sp-eyebrow{font-family:${LATIN};font-size:11.5px;letter-spacing:.6em;text-indent:.6em;color:#9a7a56;opacity:0}
.sp-eyebrow.on{animation:sp-fade .9s ease forwards}
.sp-title{font-family:${SERIF};font-weight:900;font-size:clamp(40px,5.4vw,78px);line-height:1.22;
  letter-spacing:.14em;text-indent:.14em;margin:22px 0 0;opacity:0}
.sp-title span{display:inline-block;clip-path:inset(0 0 102% 0);color:#a50f19;
  background:linear-gradient(180deg,#c3141e 0%,#9a0c15 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.sp-title.on{animation:sp-fade .3s ease forwards}
.sp-title.on span{animation:sp-reveal .95s ease forwards}
.sp-rule{display:flex;align-items:center;justify-content:center;gap:12px;width:min(360px,60vw);margin:26px auto 22px;opacity:0}
.sp-rule i{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(176,138,74,.85))}
.sp-rule i:last-child{background:linear-gradient(90deg,rgba(176,138,74,.85),transparent)}
.sp-rule b{width:7px;height:7px;background:#b3121a;transform:rotate(45deg);box-shadow:0 0 0 3px rgba(176,138,74,.25)}
.sp-rule.on{animation:sp-rule-in .7s ease forwards}
.sp-sub{font-family:${KAI};font-size:clamp(16px,1.6vw,22px);letter-spacing:.42em;text-indent:.42em;color:#6f5040;opacity:0}
.sp-sub.on{animation:sp-fade .9s ease forwards}

.sp-seal{position:absolute;right:clamp(40px,8.5vw,110px);bottom:clamp(84px,9.6vh,96px);width:clamp(58px,5vw,72px);
  opacity:0;transform:rotate(-5deg) scale(1.12)}
.sp-seal svg{display:block;width:100%;height:auto}
.sp-seal.on{animation:sp-stamp .45s cubic-bezier(.3,.7,.4,1) forwards}

.sp-meta{position:absolute;left:clamp(40px,8.5vw,110px);bottom:clamp(88px,10vh,100px);
  display:flex;flex-direction:column;gap:6px;opacity:0;
  font-family:${LATIN};font-size:10.5px;letter-spacing:.26em;color:rgba(104,74,54,.9)}
.sp-meta b{font-family:${SANS};font-size:12.5px;font-weight:600;color:#a50f19;letter-spacing:.3em}
.sp-meta.on{animation:sp-fade .9s ease forwards}

/* ---------- sign-in scene ---------- */
.gb-root[data-theme="blue"]{--sky:linear-gradient(180deg,#a6d6f6 0%,#62b2e8 32%,#2c80c5 64%,#0c4b86 100%);
  --top:linear-gradient(180deg,#0c4f8d,#093f74);--top-line:#c8161d;--glow:rgba(255,255,255,.45);
  --brand:#1a6fbd;--brand2:#0f569e;--brand-hi:#62b0ea;--brand-ink:#0f4c84;--brand-soft:#e8f2fb;
  --city-far:rgba(255,255,255,.15);--city-near:rgba(8,58,108,.34);--city-win:rgba(255,255,255,.22);--foot:rgba(3,34,70,.5);--water:rgba(220,240,255,.12);
  --trail:#ffffff;--ray:rgba(255,255,255,.075);--net:rgba(255,255,255,.55);--tip:rgba(5,40,78,.4)}
.gb-root[data-theme="red"]{--sky:linear-gradient(180deg,#d9473b 0%,#b5161c 36%,#8e0d14 70%,#5e070c 100%);
  --top:linear-gradient(180deg,#8a0c12,#6c070c);--top-line:#e3c27a;--glow:rgba(255,226,170,.38);
  --brand:#c4161d;--brand2:#9c0f15;--brand-hi:#ea5a5e;--brand-ink:#9c0f15;--brand-soft:#fbeeee;
  --city-far:rgba(255,214,150,.12);--city-near:rgba(70,4,8,.36);--city-win:rgba(255,214,150,.32);--foot:rgba(50,2,6,.5);--water:rgba(255,220,170,.08);
  --trail:#ffd68a;--ray:rgba(255,220,160,.065);--net:rgba(255,220,160,.5);--tip:rgba(60,4,8,.38)}
.gb-root[data-theme="night"]{--sky:linear-gradient(180deg,#1b3f72 0%,#0f2b54 40%,#081b38 72%,#040d1f 100%);
  --top:linear-gradient(180deg,#0b2244,#071733);--top-line:#c8161d;--glow:rgba(120,190,255,.3);
  --brand:#2b86e0;--brand2:#1a64b8;--brand-hi:#6cb5f5;--brand-ink:#16508f;--brand-soft:#eaf3fc;
  --city-far:rgba(120,180,255,.1);--city-near:rgba(2,10,26,.6);--city-win:rgba(255,212,120,.62);--foot:rgba(1,6,16,.55);--water:rgba(90,160,255,.08);
  --trail:#7cc4ff;--ray:rgba(120,190,255,.06);--net:rgba(120,200,255,.6);--tip:rgba(2,12,30,.5)}

.gb-auth{opacity:0;pointer-events:none;transition:opacity .6s ease;background:var(--sky);color:#fff}
.gb-auth.in{opacity:1;pointer-events:auto}
.au-rays{position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(70% 55% at 14% 4%,var(--glow),transparent 70%),
    repeating-conic-gradient(from 100deg at 10% -12%,var(--ray) 0deg 4deg,transparent 4deg 13deg);
  -webkit-mask:linear-gradient(180deg,#000 0%,transparent 56%);mask:linear-gradient(180deg,#000 0%,transparent 56%)}
.au-net{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:.38}
.au-net g:first-child{stroke:var(--net);stroke-opacity:.45}
.au-net g:last-child{fill:var(--net)}
.au-city{position:absolute;left:0;right:0;bottom:0;height:34%;pointer-events:none}
.au-city svg{width:100%;height:100%;display:block}
.c-far{fill:var(--city-far)}
.c-near{fill:var(--city-near)}
.c-win{fill:var(--city-win)}
.c-water{fill:var(--water)}

.au-top{position:absolute;left:0;right:0;top:0;height:64px;z-index:2;display:flex;align-items:center;gap:14px;
  padding:0 clamp(20px,3vw,44px);background:var(--top);box-shadow:0 2px 16px rgba(0,20,50,.22)}
.gb-root[data-platform="darwin"] .au-top{padding-left:max(88px,3vw)}
.gb-root[data-platform="win32"] .au-top{padding-right:150px}
.au-logo{display:grid;place-items:center;width:38px;height:38px;flex:none;background:#c0141c;border:1.5px solid #e3c27a;border-radius:4px;
  box-shadow:inset 0 0 0 2px rgba(255,236,200,.3)}
.au-logo b{font-family:${SERIF};font-weight:900;font-size:22px;line-height:1;color:#fff6e4}
.au-brand{display:flex;flex-direction:column;gap:4px}
.au-brand b{font-family:${SERIF};font-weight:900;font-size:19px;letter-spacing:.16em;color:#fff;line-height:1.1}
.au-brand em{font-style:normal;font-family:${LATIN};font-size:9px;letter-spacing:.28em;color:rgba(255,255,255,.62)}
.au-info{margin-left:auto;display:flex;align-items:center;gap:14px;font-size:12.5px;letter-spacing:.08em;color:rgba(255,255,255,.84)}
.au-info i{width:1px;height:14px;background:rgba(255,255,255,.3)}
.au-line{position:absolute;left:0;right:0;top:64px;height:4px;z-index:2;background:linear-gradient(var(--top-line) 0 3px,#e3c27a 3px 4px)}

.au-stage{position:absolute;left:0;right:0;top:68px;bottom:0}
.au-wrap{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:min(1160px,92vw);
  display:flex;align-items:center;justify-content:space-between;gap:56px;transition:opacity .45s ease,transform .45s ease}
.gb-auth.choosing .au-wrap{opacity:0;transform:translate(-50%,-54%);pointer-events:none}

.au-hero{flex:1;min-width:0;max-width:580px}
.au-kicker{display:flex;align-items:center;gap:12px;font-family:${LATIN};font-size:11px;letter-spacing:.34em;color:#f6dca2}
.au-kicker i{width:36px;height:2px;background:linear-gradient(90deg,#c8161d 0 50%,#e3c27a 50%)}
.au-hero h1{margin-top:16px;font-family:${SERIF};font-weight:900;font-size:clamp(34px,3.7vw,54px);letter-spacing:.1em;line-height:1.25;
  text-shadow:0 2px 14px rgba(0,30,70,.3)}
.au-slogan{margin-top:12px;font-size:16px;letter-spacing:.32em;color:rgba(255,255,255,.92)}
.au-feats{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
.au-feats li{display:flex;align-items:center;gap:10px;padding:10px 16px 10px 12px;background:rgba(255,255,255,.12);
  border:1px solid rgba(255,255,255,.26);border-radius:3px}
.au-feats svg{width:28px;height:28px;flex:none;color:#f6dca2}
.au-feats b{display:block;font-size:13.5px;font-weight:600;letter-spacing:.1em}
.au-feats small{display:block;font-size:11px;color:rgba(255,255,255,.76);margin-top:2px}
.au-tip{margin-top:22px;padding:14px 18px;background:var(--tip);border-left:3px solid #e3c27a;font-size:13px;line-height:1.85;color:rgba(255,255,255,.95)}
.au-tip h3{font-size:13.5px;font-weight:600;letter-spacing:.2em;color:#f6dca2;margin-bottom:4px}

.au-card{position:relative;width:404px;flex:none;background:#fff;color:#2b3f52;cursor:default;box-shadow:0 26px 60px rgba(4,30,60,.32)}
.au-card::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,var(--brand) 0 72%,#c8161d 72% 86%,#e3c27a 86%)}
.au-tabs{display:flex;border-bottom:1px solid #e3ebf3;padding-top:3px}
.au-tabs button{flex:1;height:50px;text-align:center;font-size:14.5px;letter-spacing:.1em;color:#6c8197;position:relative}
.au-tabs button:hover{color:var(--brand-ink)}
.au-tabs button.on{color:var(--brand-ink);font-weight:600}
.au-tabs button.on::after{content:"";position:absolute;left:26%;right:26%;bottom:-1px;height:2px;background:var(--brand)}
.au-panes{position:relative;height:282px}
.au-pane{position:absolute;inset:0;padding:22px 28px 0;opacity:0;visibility:hidden;transition:opacity .25s ease,visibility 0s .25s}
.au-pane.on{opacity:1;visibility:visible;transition:opacity .25s ease}
.au-input{height:42px;display:flex;align-items:center;gap:10px;margin-bottom:12px;padding:0 12px;background:#f6f9fc;
  border:1px solid #d3e0ec;font-size:13.5px;letter-spacing:.04em;color:#2b4a60}
.au-input svg{width:16px;height:16px;flex:none;color:#7f97ad}
.au-input .dots{font-size:10px;letter-spacing:.32em;color:#47637c}
.au-input.select{justify-content:space-between}
.au-input.select i{font-style:normal;color:#7f97ad}
.au-cap{display:flex;gap:10px}
.au-cap .au-input{flex:1}
.au-cap svg.cap{width:104px;height:42px;flex:none;border:1px solid #d3e0ec}
.au-opts{display:flex;justify-content:space-between;align-items:center;margin:0 0 14px;font-size:12px;color:#7a8fa3}
.au-check{display:flex;align-items:center;gap:7px}
.au-check i{position:relative;width:13px;height:13px;background:var(--brand)}
.au-check i::after{content:"";position:absolute;left:4px;top:1.5px;width:3.5px;height:7px;border:solid #fff;border-width:0 1.6px 1.6px 0;transform:rotate(45deg)}
.au-link{color:var(--brand)}
.au-btn{display:block;width:100%;height:44px;text-align:center;color:#fff;font-size:15px;letter-spacing:.5em;text-indent:.5em;
  background:linear-gradient(180deg,var(--brand),var(--brand2));box-shadow:0 3px 10px rgba(10,60,110,.2)}
.au-btn:hover{filter:brightness(1.06)}
.au-btn.done{letter-spacing:.24em;text-indent:.24em}
.au-qr{display:flex;flex-direction:column;align-items:center;padding-top:2px}
.au-qr svg.code{width:152px;height:152px;padding:8px;border:1px solid #d3e0ec;background:#fff}
.au-qr p{margin-top:14px;font-size:13.5px;letter-spacing:.06em;color:#2b4a60}
.au-qr small{margin-top:6px;font-size:11.5px;color:#8a9db0}
.au-ca{display:flex;align-items:center;gap:14px;margin-bottom:14px;padding:12px 14px;background:var(--brand-soft);border:1px dashed #b9cde0}
.au-ca svg{width:34px;height:34px;flex:none;color:var(--brand)}
.au-ca b{display:block;font-size:13.5px;color:#1f3a52}
.au-ca small{display:block;margin-top:3px;font-size:11.5px;color:#6c8197}
.au-progress{padding:14px 28px 22px;border-top:1px solid #eef3f8}
.au-track{height:12px;background:#eef4f9;border:1px solid #c5d7e8;overflow:hidden;box-shadow:inset 0 1px 2px rgba(20,60,100,.08)}
.au-fill{display:block;height:100%;width:0;transition:width .6s cubic-bezier(.25,.8,.25,1);
  background:repeating-linear-gradient(90deg,rgba(255,255,255,.2) 0 1px,transparent 1px 10px),linear-gradient(180deg,var(--brand-hi),var(--brand));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.45)}
.au-meta{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-top:8px;font-size:11.5px;letter-spacing:.06em;color:#6c8197}
.au-meta b{font-family:${LATIN};font-weight:700;color:var(--brand-ink)}
.au-foot{position:absolute;left:0;right:0;bottom:0;z-index:1;padding:22px 0 clamp(12px,2.2vh,20px);text-align:center;font-size:11.5px;letter-spacing:.2em;
  color:rgba(255,255,255,.86);background:linear-gradient(180deg,transparent,var(--foot))}

/* ---------- workbench picker ---------- */
.ch-wrap{position:absolute;left:50%;top:46%;transform:translate(-50%,-44%);width:min(1060px,92vw);text-align:center;
  opacity:0;pointer-events:none;transition:opacity .5s ease .15s,transform .5s ease .15s}
.gb-auth.choosing .ch-wrap{opacity:1;transform:translate(-50%,-50%);pointer-events:auto}
.ch-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px 6px 8px;border-radius:999px;
  background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.34);font-size:13px;letter-spacing:.1em}
.ch-badge i{display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:#2fa86a;font-style:normal;font-size:12px}
.ch-wrap h2{margin-top:18px;font-family:${SERIF};font-weight:900;font-size:clamp(28px,2.8vw,40px);letter-spacing:.14em;
  text-shadow:0 2px 14px rgba(0,30,70,.3)}
.ch-sub{min-height:1.6em;margin-top:10px;font-size:14px;letter-spacing:.1em;color:rgba(255,255,255,.9)}
.ch-sub b{font-weight:600;color:#f6dca2}
.ch-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;margin-top:30px}
.ch-card{position:relative;display:flex;flex-direction:column;align-items:center;overflow:hidden;padding:32px 18px 22px;text-align:center;
  background:#fff;color:#2b3f52;border-top:3px solid #e3c27a;box-shadow:0 14px 34px rgba(4,30,60,.22);
  transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
.ch-card:hover{transform:translateY(-3px)}
.ch-card.on{transform:translateY(-8px);border-top-color:#c8161d;box-shadow:0 22px 46px rgba(4,30,60,.34),0 0 0 2px var(--brand)}
.ch-no{position:absolute;left:12px;top:10px;font-family:${LATIN};font-size:11px;letter-spacing:.1em;color:#a9b8c6}
.ch-tag{display:none;position:absolute;right:10px;top:9px;padding:1px 6px;border:1px solid #c8161d;font-size:10.5px;letter-spacing:.1em;color:#c8161d}
.ch-card.last .ch-tag{display:block}
.ch-ico{display:grid;place-items:center;width:64px;height:64px;border-radius:50%;background:var(--brand-soft);color:var(--brand)}
.ch-ico svg{width:32px;height:32px}
.ch-card b{margin-top:16px;font-size:18px;letter-spacing:.14em;color:var(--brand-ink)}
.ch-desc{min-height:3.4em;margin-top:8px;font-size:12.5px;line-height:1.7;color:#6c8197}
.ch-go{margin-top:12px;font-size:12.5px;letter-spacing:.1em;color:var(--brand)}
.ch-bar{position:absolute;left:0;bottom:0;width:0;height:3px;background:var(--brand)}
.ch-card.on.ticking .ch-bar{animation:ch-tick ${CHOOSE_SECONDS}s linear forwards}
.ch-card.go .ch-bar{width:100%}
.ch-keys{margin-top:26px;font-size:12px;letter-spacing:.14em;color:rgba(255,255,255,.75)}

/* Small windows: the card and the picker win, decoration gives way. */
@media (max-height: 760px){
  .au-tip{display:none}
  .au-hero h1{font-size:clamp(30px,3.2vw,44px)}
  .au-feats{margin-top:20px}
}
@media (max-height: 640px){
  .au-feats,.ch-desc,.ch-keys{display:none}
  .ch-grid{margin-top:22px}
  .ch-card{padding:24px 14px 18px}
}
@media (max-width: 980px){
  .au-hero{display:none}
  .au-wrap{justify-content:center}
  .au-info .au-where,.au-info i{display:none}
}
@media (max-width: 720px){
  .ch-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
  .au-brand em{display:none}
}

@keyframes sp-fade{to{opacity:1}}
@keyframes sp-rise{to{opacity:1;transform:none}}
@keyframes sp-drift{to{opacity:1;transform:none}}
@keyframes sp-geese{from{opacity:0;transform:translate(26px,6px)}to{opacity:1;transform:none}}
@keyframes sp-wipe{to{clip-path:inset(0 0 0 0)}}
@keyframes sp-rule-in{from{opacity:0;transform:scaleX(.4)}to{opacity:1;transform:scaleX(1)}}
@keyframes sp-reveal{from{clip-path:inset(0 0 102% 0)}to{clip-path:inset(0 0 -8% 0)}}
@keyframes sp-stamp{to{opacity:.94;transform:rotate(-5deg) scale(1)}}
@keyframes ch-tick{to{width:100%}}

/* Reduced motion: every beat still lands on time, it just does not move there. */
@media (prefers-reduced-motion: reduce){
  .gb-root *,.gb-root *::before,.gb-root *::after{animation-duration:1ms!important;animation-delay:0s!important;transition-duration:1ms!important;transition-delay:0s!important}
  .gb-root.gb-out{transition-duration:1ms}
}
`

    /* Lives in the DOCUMENT, not the shadow root: a document-level rule from
       another plugin outranks :host, and on macOS DSH's base sheet makes every
       body child a no-drag region, which would freeze the window while the
       overlay is up. The drag band gives the title strip back. */
    const HOST_SHEET_CSS =
      'body>.dsh-gov-boot-host{position:fixed!important;inset:0!important;display:block!important;z-index:' + String(Z) + '!important;pointer-events:auto!important}\n' +
      'html[data-platform="darwin"] body>.dsh-gov-boot-host{-webkit-app-region:initial!important}\n' +
      'body>.dsh-gov-boot-dragband{position:fixed;top:0;left:0;right:0;height:28px;z-index:' + String(Z + 1) + ';-webkit-app-region:drag}'

    function ensureHostSheet() {
      if (document.getElementById(HOST_SHEET_ID) !== null) return
      const style = document.createElement('style')
      style.id = HOST_SHEET_ID
      style.textContent = HOST_SHEET_CSS
      document.head.appendChild(style)
    }

    /* ------------------------------------------------------------------ */
    /* Preferences                                                          */
    /* ------------------------------------------------------------------ */

    function readPref(key, values, fallback) {
      try {
        const raw = window.localStorage.getItem(key)
        return values.indexOf(raw) >= 0 ? raw : fallback
      } catch (error) {
        return fallback
      }
    }

    function writePref(key, value) {
      try { window.localStorage.setItem(key, value) } catch (error) { /* private mode: not persisted */ }
    }

    const readMode = () => readPref(MODE_KEY, MODE_VALUES, DEFAULT_MODE)
    const readTheme = () => readPref(THEME_KEY, THEME_VALUES, DEFAULT_THEME)
    const readApp = () => Number(readPref(APP_KEY, ['0', '1', '2', '3'], '0'))

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

    /* ------------------------------------------------------------------ */
    /* The overlay                                                          */
    /* ------------------------------------------------------------------ */

    let live = null

    /**
     * @param options.preview - from the settings row: plays even when the mode is
     *   'off' (as the full show) and does not wait for the app, which is already up.
     */
    function mount(options) {
      if (live !== null) return live
      const preview = options !== undefined && options.preview === true
      let mode = readMode()
      if (mode === 'off') {
        if (!preview) return null
        mode = 'full'
      }
      if (document.body === null) {
        document.addEventListener('DOMContentLoaded', () => mount(options), { once: true })
        return null
      }

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
      const platform = document.documentElement.getAttribute('data-platform')
      if (platform !== null) root.dataset.platform = platform
      root.innerHTML = splashMarkup() + (mode === 'full' ? authMarkup() : '')
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
      const auth = q('.gb-auth')

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
      }

      /* ---- sign-in ---- */
      const bar = q('.au-fill')
      const status = q('.au-status')
      const pct = q('.au-pct')

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

      /* ---- workbench picker ---- */
      const cards = qa('.ch-card')
      const sub = q('.ch-sub')
      const last = readApp()
      let selected = last
      let ticking = false
      let left = CHOOSE_SECONDS

      const renderSub = () => {
        const name = '「' + APPS[selected].name + '」'
        if (phase === 'entering') sub.innerHTML = '正在进入 <b>' + name + '</b>…'
        else if (ticking) sub.innerHTML = '<b>' + left + '</b> 秒后自动进入 <b>' + name + '</b>'
        else sub.innerHTML = '已暂停自动进入 · 按 Enter 进入 <b>' + name + '</b>'
      }

      const select = (index, byUser) => {
        selected = (index + APPS.length) % APPS.length
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
          if (left <= 0) enter(selected)
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
        left = CHOOSE_SECONDS
        select(selected, false)
        cards[selected].classList.add('ticking')
        tick()
      }

      const enter = (index) => {
        if (phase !== 'choose') return
        select(index, false)
        phase = 'entering'
        ticking = false
        clearTimers()
        for (const card of cards) card.classList.remove('ticking')
        cards[selected].classList.add('go')
        renderSub()
        writePref(APP_KEY, String(selected))
        try {
          document.dispatchEvent(new CustomEvent('dsh-gov-boot:enter', { detail: { index: selected, name: APPS[selected].name } }))
        } catch (error) { /* listeners are someone else's business */ }
        at(420, finish)
      }

      /* ---- input ---- */
      const advance = () => {
        if (finished) return
        if (phase === 'splash') { if (mode === 'full') startAuth(); else finish(); return }
        if (phase === 'auth') { completeAuth(); return }
        if (phase === 'choose') enter(selected)
      }

      root.addEventListener('click', (event) => {
        const target = event.target
        const tab = target.closest ? target.closest('[data-tab]') : null
        if (tab !== null && phase === 'auth') { showTab(tab.dataset.tab); return }
        const card = target.closest ? target.closest('[data-app]') : null
        if (card !== null && phase === 'choose') { enter(Number(card.dataset.app)); return }
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
          if (key >= '1' && key <= String(APPS.length)) { enter(Number(key) - 1); return }
          if (key === 'ArrowLeft' || key === 'ArrowUp') { select(selected - 1, true); return }
          if (key === 'ArrowRight' || key === 'ArrowDown' || key === 'Tab') { select(selected + 1, true); return }
        }
        if (key === 'Enter' || key === ' ') advance()
      }
      window.addEventListener('keydown', onKey, true)

      if (auth !== null) {
        q('.au-date').textContent = today()
        q('.au-where').textContent = '本机服务 ' + (window.location.host || 'localhost')
      }

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
      at(2050, on('.sp-seal'))
      at(2250, on('.sp-meta'))
      if (mode === 'full') at(AUTH_AT, startAuth)
      else at(AUTH_AT + 200, () => waitReady(finish))

      const handle = { host, dispose: finish }
      live = handle
      return handle
    }

    const splash = mount()

    /* ------------------------------------------------------------------ */
    /* Settings → General row                                               */
    /* ------------------------------------------------------------------ */

    const ROW_CSS = `
.dshgov-row{display:flex;align-items:center;gap:16px;padding:10px 0;flex-wrap:wrap}
.dshgov-row-text{flex:1;min-width:220px}
.dshgov-row-title{font-size:13px;line-height:1.5;color:var(--dsw-alias-label-primary,#191919)}
.dshgov-row-desc{margin-top:2px;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-secondary,#666)}
.dshgov-row-ctrl{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dshgov-seg{display:inline-flex;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.35));border-radius:8px;overflow:hidden}
.dshgov-seg button{border:0;background:transparent;color:var(--dsw-alias-label-secondary,#666);font-family:inherit;font-size:12.5px;line-height:1.4;padding:5px 12px;cursor:pointer}
.dshgov-seg button+button{border-left:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.35))}
.dshgov-seg button:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.14))}
.dshgov-seg button.on{background:var(--dsw-alias-brand-primary,#4d6bfe);color:var(--dsw-alias-brand-text,#fff)}
.dshgov-seg.disabled{opacity:.45;pointer-events:none}
.dshgov-preview{border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.35));background:transparent;color:var(--dsw-alias-label-primary,#191919);font-family:inherit;font-size:12.5px;line-height:1.4;padding:5px 14px;border-radius:8px;cursor:pointer}
.dshgov-preview:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.14))}
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

      return function SettingsRow() {
        const [mode, setMode] = React.useState(readMode)
        const [theme, setTheme] = React.useState(readTheme)
        React.useEffect(() => { ensureRowStyle() }, [])
        const pickMode = (next) => { writePref(MODE_KEY, next); setMode(next) }
        const pickTheme = (next) => { writePref(THEME_KEY, next); setTheme(next) }
        return h(
          'div',
          { className: 'dshgov-row' },
          h(
            'div',
            { className: 'dshgov-row-text' },
            h('div', { className: 'dshgov-row-title' }, '政务开机动画'),
            h('div', { className: 'dshgov-row-desc' }, '宣纸片头 → 统一身份认证 → 选择工作台；配色只影响认证页。下次启动生效，点击推进，Esc 跳过。'),
          ),
          h(
            'div',
            { className: 'dshgov-row-ctrl' },
            segmented(mode, MODE_OPTIONS, pickMode, false),
            segmented(theme, THEME_OPTIONS, pickTheme, mode !== 'full'),
            h('button', { type: 'button', className: 'dshgov-preview', onClick: () => mount({ preview: true }) }, '预览'),
          ),
        )
      }
    }

    exports.name = 'boot-gov'
    exports.inject = ['slots']
    exports.apply = (ctx) => {
      if (ctx.slots && typeof ctx.slots.inject === 'function') {
        const SettingsRow = makeSettingsRow(require('react'))
        ctx.slots.inject('settings.general.item', () => {
          try {
            return ctx.slots.register({ name: 'settings.general.item', id: 'boot-gov', order: 36 }, SettingsRow)
          } catch (error) {
            // A client reconnect can apply twice; a duplicate id throws.
            console.info('[dsh-gov-boot] settings row already registered', error)
            return () => {}
          }
        })
      }
      ctx.effect(
        () => () => {
          if (splash !== null) splash.dispose()
          if (live !== null) live.dispose()
        },
        'dsh-gov-boot: splash teardown',
      )
    }

    return module.exports
  },
})

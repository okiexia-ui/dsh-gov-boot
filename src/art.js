/* ------------------------------------------------------------------ */
/* Procedural artwork. Seeded, so every boot draws the same picture.   */
/* Repeated shapes are merged into one <path> each: the DOM stays small */
/* enough to build inside one frame on a slow machine.                 */
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

/** A clockwise rectangle sub-path (so overlapping shapes union under nonzero fill). */
const box = (x, y, w, h) => `M${n1(x)} ${n1(y)}h${n1(w)}v${n1(h)}h${n1(-w)}z`
/** A clockwise circle sub-path. */
const disc = (cx, cy, r) => `M${n1(cx - r)} ${n1(cy)}a${r} ${r} 0 1 1 ${2 * r} 0a${r} ${r} 0 1 1 ${-2 * r} 0z`

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

/** One watchtower: body, parapet, four merlons; the doorway is returned separately. */
function tower(x, y, w) {
  const h = w * 0.95
  const left = x - w / 2
  let body = box(left, y - h, w, h + 5) + box(left - 1.6, y - h - 2.4, w + 3.2, 3)
  const gap = (w + 3.2 - 2.6) / 3
  for (let i = 0; i < 4; i++) body += box(left - 1.6 + i * gap, y - h - 6, 2.6, 3.8)
  const door = box(x - w * 0.11, y - h * 0.62, w * 0.22, h * 0.3)
  return { body, door }
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
  const towers = TOWERS.map(([i, w]) => tower(WALL[i][0], WALL[i][1] + 2, w))
  return `<svg ${LAND_SVG}>
  <g fill="none" stroke="#6b2f25" stroke-linejoin="round">
    <path d="${crest}" stroke-opacity=".5" stroke-width="5.5"/>
    <path d="${merlons}" stroke-opacity=".55" stroke-width="2.8" stroke-dasharray="2.2 2.6"/>
  </g>
  <path d="${walk}" fill="none" stroke="#f7ecd9" stroke-opacity=".55" stroke-width=".9"/>
  <path fill="#6b2f25" fill-opacity=".58" d="${towers.map((t) => t.body).join('')}"/>
  <path fill="#f6ecd9" fill-opacity=".75" d="${towers.map((t) => t.door).join('')}"/>
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
  const outline = puffs.map(([x, y, r]) => disc(x, y, r)).join('') + 'M26 38h114a8 8 0 0 1 0 16H26a8 8 0 0 1 0-16z'
  const curls = puffs
    .slice(0, 3)
    .map(([x, y, r]) => {
      const a = r * 0.55
      return `M${n1(x - a)} ${n1(y + a * 0.2)}a${n1(a)} ${n1(a)} 0 1 1 ${n1(a)} ${n1(a * 0.9)}a${n1(a * 0.5)} ${n1(a * 0.5)} 0 1 1 ${n1(-a * 0.42)} ${n1(-a * 0.6)}`
    })
    .join('')
  return `<svg viewBox="0 0 160 62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path fill="none" stroke="#c09a5c" stroke-width="2.4" stroke-opacity=".6" d="${outline}"/>
  <path fill="#fbf6ea" d="${outline}"/>
  <path fill="none" stroke="#c09a5c" stroke-width="1.3" stroke-linecap="round" stroke-opacity=".62" d="${curls}M150 46c6 0 9 3 9 6"/>
</svg>`
}

const GEESE = `<svg viewBox="0 0 130 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path fill="none" stroke="#6b2f25" stroke-opacity=".42" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
    d="M10 30q6-6 10 0q4-6 10 0M38 20q5-5 8 0q3-5 8 0M60 34q5-5 8 0q3-5 8 0M82 14q4-4 7 0q3-4 7 0M104 26q4-4 7 0q3-4 7 0"/>
</svg>`

/* 回纹 corner: an L of the frame plus one meander unit. */
const CORNER = `<svg viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path fill="none" stroke="#b08a4a" stroke-width="1.7" stroke-linecap="square" d="M1.5 45V1.5H45M7 31V7h24v18H13V13h12v6h-6"/>
</svg>`

/** A square vermilion seal with worn edges; 1–4 characters, read left to right, top row first. */
function seal(text) {
  const chars = Array.from(text)
  const layouts = {
    1: [[50, 70]],
    2: [[50, 46], [50, 83]],
    3: [[32, 45], [68, 45], [50, 82]],
    4: [[32, 45], [68, 45], [32, 82], [68, 82]],
  }
  const at = layouts[Math.min(4, Math.max(1, chars.length))]
  const size = chars.length === 1 ? 58 : chars.length === 2 ? 34 : 33
  const glyphs = at.map(([x, y], i) => `<text x="${x}" y="${y}">${esc(chars[i] || '')}</text>`).join('')
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><filter id="gbWorn" x="-6%" y="-6%" width="112%" height="112%">
    <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="7"/>
    <feDisplacementMap in="SourceGraphic" scale="3.4"/>
  </filter></defs>
  <g filter="url(#gbWorn)">
    <rect x="4" y="4" width="92" height="92" rx="6" fill="#b3121a"/>
    <rect x="10.5" y="10.5" width="79" height="79" rx="2" fill="none" stroke="#fbf1e0" stroke-width="2.4"/>
    <g fill="#fbf1e0" font-family="Songti SC, Noto Serif SC, STSong, serif" font-weight="900" font-size="${size}" text-anchor="middle">${glyphs}</g>
  </g>
</svg>`
}

/* ---------- sign-in scene artwork ---------- */

function city() {
  const r = rng(7)
  let far = ''
  for (let x = -10; x < 1450; ) {
    const w = 22 + r() * 40
    const h = 70 + r() * 120
    far += box(x, 300 - h, w, h)
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
    near += box(x, top, w, h)
    if (kind > 0.45 && kind <= 0.65) {
      near += box(x + w * 0.2, top - 18, w * 0.6, 19)
    } else if (kind > 0.65 && kind <= 0.82) {
      near += `M${n1(x + w * 0.2)} ${n1(top)}L${n1(x + w / 2)} ${n1(top - 26)}L${n1(x + w * 0.8)} ${n1(top)}Z` + box(x + w / 2 - 0.8, top - 44, 1.6, 20)
    } else if (kind > 0.82) {
      near += `M${n1(x)} ${n1(top)}L${n1(x + w)} ${n1(top - 16)}V${n1(top)}Z`
    }
    if (w > 34) {
      for (let wy = top + 10; wy < 286; wy += 9) {
        for (let wx = x + 5; wx < x + w - 6; wx += 7) {
          if (r() < 0.3) win += box(wx, wy, 3, 4)
        }
      }
    }
    x += w + 3 + r() * 8
  }
  // Hall of Prayer for Good Harvests: three terraces, three round roofs.
  const t = (dx) => n1(T + dx)
  const roof = (half, base, peak) =>
    `M${t(-half)} ${base}C${t(-half * 0.55)} ${base - 9} ${t(-half * 0.4)} ${peak + 6} ${T} ${peak}C${t(half * 0.4)} ${peak + 6} ${t(half * 0.55)} ${base - 9} ${t(half)} ${base}Z`
  near +=
    box(T - 118, 284, 236, 16) + box(T - 96, 270, 192, 14) + box(T - 76, 258, 152, 12) + box(T - 50, 226, 100, 32) +
    roof(74, 230, 204) + box(T - 38, 196, 76, 16) + roof(58, 200, 176) + box(T - 27, 166, 54, 13) + roof(44, 169, 142) +
    box(T - 2, 128, 4, 15) + disc(T, 125, 4)
  // A broadcast tower on the right.
  near += 'M1046 300L1060 160H1068L1082 300Z' + box(1061, 70, 6, 92) + disc(1064, 130, 11) + disc(1064, 96, 6) + box(1063, 36, 2, 36)
  return `<svg viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><linearGradient id="auTrail" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" style="stop-color:var(--trail)" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient></defs>
  <path class="c-far" d="${far}"/>
  <path class="c-near" d="${near}"/>
  <path class="c-win" d="${win}"/>
  <rect class="c-water" x="0" y="262" width="1440" height="38"/>
  <path d="M-20 292C300 270 640 286 900 280C1120 275 1300 262 1460 268M-20 298C360 284 700 296 980 290C1180 286 1330 278 1460 282" fill="none" stroke="url(#auTrail)" stroke-width="1.6"/>
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
    for (const b of near) lines += `M${n1(a[0])} ${n1(a[1])}L${n1(b[0])} ${n1(b[1])}`
  }
  const dots = nodes.map(([x, y, s]) => disc(x, y, n1(s))).join('')
  return `<svg class="au-net" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path class="lines" fill="none" stroke-width=".8" d="${lines}"/><path class="dots" d="${dots}"/>
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
      if (r() < 0.5) cells += `M${x} ${y}h1v1h-1z`
    }
  }
  const ring = (x, y) => `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`
  return `<svg class="code" viewBox="0 0 25 25" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path fill="#1d3247" d="${cells}${ring(0, 0)}${ring(n - 7, 0)}${ring(0, n - 7)}"/>
  <rect x="10" y="10" width="5" height="5" rx=".6" fill="#b3121a"/><rect x="10.8" y="10.8" width="3.4" height="3.4" rx=".3" fill="none" stroke="#fbf1e0" stroke-width=".35"/>
</svg>`
}

const CAPTCHA = `<svg class="cap" viewBox="0 0 104 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect width="104" height="42" fill="#eef3f8"/>
  <path fill="none" stroke-width="1" stroke="#9db6cc" d="M4 30C24 12 40 36 62 18S92 10 100 26"/><path fill="none" stroke-width="1" stroke="#d0a3a3" d="M2 14C20 22 46 6 70 28S96 30 102 12"/>
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

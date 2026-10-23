/* ------------------------------------------------------------------ */
/* Scene markup. Every user-supplied string goes through esc().         */
/* ------------------------------------------------------------------ */

function splashMarkup(cfg) {
  return `
<div class="gb-splash">
  <div class="sp-fiber"></div>
  <div class="sp-sun"></div>
  <div class="sp-cloud c1">${cloud()}</div>
  <div class="sp-geese">${GEESE}</div>
  <div class="sp-land">
    <div>${landBack()}</div>
    <div class="sp-wall"><div class="sp-wall-in">${landWall()}</div></div>
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
    <h1 class="sp-title" style="--len:${Array.from(cfg.title).length}"><span>${esc(cfg.title)}</span></h1>
    <div class="sp-rule"><i></i><b></b><i></i></div>
    <div class="sp-sub">${esc(cfg.subtitle)}</div>
  </div>
  <div class="sp-seal">${seal(cfg.seal)}</div>
  <div class="sp-meta"><b>DSH 政务版</b><span>SECURE WORKSPACE · ${versionLabel()}</span></div>
  <div class="sp-wave">
    <svg viewBox="0 0 1440 74" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#b3121a" d="M0 34 C220 4 360 20 540 34 C760 52 900 54 1080 38 C1240 24 1340 26 1440 38 L1440 74 L0 74 Z"/>
      <path fill="none" stroke="#e2bf7a" stroke-width="1.4" stroke-opacity=".85" d="M0 40 C220 10 360 26 540 40 C760 58 900 60 1080 44 C1240 30 1340 32 1440 44"/>
      <path fill="#8c0e14" opacity=".6" d="M0 54 C240 36 420 48 620 56 C840 65 1040 62 1220 52 C1320 46 1390 48 1440 52 L1440 74 L0 74 Z"/>
    </svg>
  </div>
</div>`
}

function authMarkup(cfg) {
  const feats = FEAT.map(
    ([title, sub, body]) =>
      `<li><svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">${body}</svg><span><b>${title}</b><small>${sub}</small></span></li>`,
  ).join('')
  const cards = cfg.apps
    .map(
      (app, i) =>
        `<button class="ch-card" type="button" data-app="${i}">
        <span class="ch-no">0${i + 1}</span><span class="ch-tag">上次使用</span>
        <span class="ch-ico"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${APP_ICONS[i]}</svg></span>
        <b>${esc(app.name)}</b><span class="ch-desc">${esc(app.desc)}</span><span class="ch-go">进入工作台 →</span><i class="ch-bar"></i>
      </button>`,
    )
    .join('')
  return `
<div class="gb-auth">
  <div class="au-rays"></div>
  ${network()}
  <div class="au-city">${city()}</div>
  <header class="au-top">
    <span class="au-logo"><b>政</b></span>
    <span class="au-brand"><b>${esc(cfg.title)}</b><em>INTELLIGENT GOVERNMENT WORKSPACE</em></span>
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
          <p>尊敬的用户：您好！身份核验完成后可选择要进入的工作台，${cfg.countdown} 秒内未选择将自动进入上次使用的工作台。</p>
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
  <div class="au-foot">${esc(cfg.title)} · 基于 DeepSeek Harness · 点击任意处继续，Esc 跳过</div>
</div>`
}

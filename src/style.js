/* ------------------------------------------------------------------ */
/* Styles: STYLE lives in the overlay's shadow root.                    */
/* ------------------------------------------------------------------ */

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
.sp-land{position:absolute;left:0;right:0;bottom:0;height:60%;opacity:0;transform:translateY(22px);will-change:transform,opacity}
.sp-land.on{animation:sp-rise 1.6s ease forwards}
.sp-land>div{position:absolute;inset:0}
.sp-land svg{width:100%;height:100%;display:block}
.sp-land .sp-wall-in{position:absolute;inset:0}
/* The wall unrolls left to right by sliding a clipping box in while its content
   slides back by the same amount: two composited transforms, no repaint per frame. */
.sp-wall{overflow:hidden;transform:translateX(-100%);will-change:transform}
.sp-wall-in{transform:translateX(100%);will-change:transform}
.sp-wall.on,.sp-wall.on .sp-wall-in{animation:sp-slide 1.8s cubic-bezier(.45,.05,.3,1) forwards}

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
.sp-title{font-family:${SERIF};font-weight:900;font-size:min(clamp(40px,5.4vw,78px),calc(86vw / (var(--len,8) * 1.16)));line-height:1.22;
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
  opacity:0;transform:rotate(-5deg) scale(1.12);will-change:transform,opacity}
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
.au-net .lines{stroke:var(--net);stroke-opacity:.45}
.au-net .dots{fill:var(--net)}
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
.au-brand{min-width:0}
.au-brand b{font-family:${SERIF};font-weight:900;font-size:19px;letter-spacing:.16em;color:#fff;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
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
.ch-card.on.ticking .ch-bar{animation:ch-tick var(--tick,3s) linear forwards}
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
@keyframes sp-slide{to{transform:none}}
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

/**
 * Host half of dsh-gov-boot.
 *
 * DSH draws its own boot card ("HARNESS / Loading plugins…") before any client
 * plugin is evaluated, so a splash that only paints from client JS still lets
 * that card flash for a few hundred milliseconds. The only surface earlier than
 * the shell is the served document: `webserver/index-inject` contributes rows
 * that the carrier renders into index.html right after <head>, ahead of the
 * shell kernel.
 *
 * We contribute one `style` row (an opaque cover) and one synchronous `script`
 * row (apply the cover class, expose the handshake, watch the boot card). The
 * client half retires the cover on the same task that puts its shadow root on
 * screen, so there is no seam between cover and animation.
 *
 * Contract with lib/client.js:
 *   MODE_KEY            same localStorage key; 'off' boots straight through.
 *   FIRST_FRAME_GLOBAL  window.__dshGovFirstFrame.end() retires the cover.
 *
 * The first-frame technique (cover row + boot-card watch + 12 s ceiling) follows
 * dsh-550c-boot, MIT © Ziyang Song — see LICENSE.
 *
 * @module dsh-gov-boot
 */

export const name = 'boot-gov'

/** lib/client.js MODE_KEY — keep in sync. */
const MODE_KEY = 'dsh-gov-boot:mode'
/** lib/client.js FIRST_FRAME_GLOBAL — keep in sync. */
const FIRST_FRAME_GLOBAL = '__dshGovFirstFrame'
/** Read by the preview and by future settings rows. */
const VERSION_GLOBAL = '__dshGovVersion'
const VERSION = '0.4.0'

/** Matches the paper background so the handoff never flashes. */
const FIRST_FRAME_BG = '#f6efe2'
/** Absolute ceiling (ms): a broken client bundle must never leave a cover. */
const FIRST_FRAME_MAX_MS = 12000
/** One below the splash host's z-index. */
const FIRST_FRAME_Z = 2147482000

const FIRST_FRAME_CSS =
  'html.dshgov-first::before{content:"";position:fixed;inset:0;background:' +
  FIRST_FRAME_BG +
  ';z-index:' +
  String(FIRST_FRAME_Z) +
  ';pointer-events:none}\n' +
  'html.dshgov-first{background:' +
  FIRST_FRAME_BG +
  '}'

/**
 * Deliberately tiny and synchronous: it runs while <head> is parsed, so the
 * cover is applied before the first paint. The 250 ms watch ends the cover as
 * soon as DSH's boot card is gone (or has dropped its spinner, i.e. failed),
 * and the timeout is the last-resort fallback.
 */
const FIRST_FRAME_SCRIPT =
  '(function(){' +
  'var mode=null;' +
  'try{mode=window.localStorage.getItem(' +
  JSON.stringify(MODE_KEY) +
  ')}catch(error){}' +
  'if(mode==="off")return;' +
  'var root=document.documentElement;' +
  'var watch=null;' +
  'var end=function(){' +
  'if(watch!==null){window.clearInterval(watch);watch=null}' +
  'root.classList.remove("dshgov-first")' +
  '};' +
  'window.' +
  FIRST_FRAME_GLOBAL +
  '={end:end};' +
  'root.classList.add("dshgov-first");' +
  'var seen=false;' +
  'watch=window.setInterval(function(){' +
  'var card=document.querySelector("[data-dsh-boot]");' +
  'if(card===null){if(seen)end();return}' +
  'seen=true;' +
  'if(card.querySelector("[data-dsh-boot-spinner]")===null)end()' +
  '},250);' +
  'window.setTimeout(end,' +
  String(FIRST_FRAME_MAX_MS) +
  ');' +
  '})()'

/**
 * Contribute the first frame to every index response.
 * @param ctx - the plugin context.
 */
export function apply(ctx) {
  ctx.on('webserver/index-inject', (table) => {
    table.push({ kind: 'style', text: FIRST_FRAME_CSS })
    table.push({ kind: 'script', placement: 'head', text: FIRST_FRAME_SCRIPT })
    table.push({ kind: 'global', name: VERSION_GLOBAL, value: VERSION })
  })
}

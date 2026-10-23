/* ------------------------------------------------------------------ */
/* Workbench actions: an explicitly picked card opens a new session in   */
/* the most recent workspace with the card's prompt in the input box.    */
/* Nothing is ever sent.                                                */
/* ------------------------------------------------------------------ */

/** The plugin's apply() context; null until DSH applies the plugin. */
let pluginCtx = null
/** A pick made before apply() ran, or before DSH's workspace lists loaded. */
let queued = null
const LISTS_MAX_MS = 5000

function openWorkbench(app) {
  queued = app
  flushWorkbench()
}

/**
 * Runs the queued pick through DSH's own "new session" path
 * (`uiWorkspace.startSession`), which reuses a blank session instead of
 * piling up new ones and keeps any draft that is already there.
 */
function flushWorkbench() {
  if (queued === null || pluginCtx === null) return
  const app = queued
  queued = null
  let service
  try { service = typeof pluginCtx.get === 'function' ? pluginCtx.get('uiWorkspace') : undefined } catch (error) { service = undefined }
  if (!service || typeof service.startSession !== 'function') {
    console.info('[dsh-gov-boot] uiWorkspace is not available; staying on the current view')
    return
  }
  const snapshot = (name) => {
    const list = service[name] && service[name].list
    return list && typeof list.getSnapshot === 'function' ? list.getSnapshot() : null
  }
  const started = Date.now()
  const attempt = () => {
    const workspaces = snapshot('workspaces')
    const sessions = snapshot('sessions')
    const loading = [workspaces, sessions].some((s) => s !== null && s.phase !== 'ready')
    if (loading && Date.now() - started < LISTS_MAX_MS) { window.setTimeout(attempt, 200); return }
    // With no workspace DSH would only toast "add a workspace first"; stay quiet instead.
    if (workspaces !== null && Array.isArray(workspaces.items) && workspaces.items.length === 0) {
      console.info('[dsh-gov-boot] no workspace yet; not opening a session')
      return
    }
    try {
      service.startSession(undefined, { prompt: app.prompt })
    } catch (error) {
      console.warn('[dsh-gov-boot] could not open a session', error)
    }
  }
  attempt()
}

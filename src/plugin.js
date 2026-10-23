/* ------------------------------------------------------------------ */
/* Plugin entry                                                         */
/* ------------------------------------------------------------------ */

/* Mounted at module evaluation — the earliest a client plugin can draw —
   not from apply(), which runs after the service graph is resolved. */
const splash = mount()

exports.name = 'boot-gov'
exports.inject = ['slots']
exports.apply = (ctx) => {
  pluginCtx = ctx
  flushWorkbench()
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
      pluginCtx = null
      if (splash !== null) splash.dispose()
      if (live !== null) live.dispose()
    },
    'dsh-gov-boot: splash teardown',
  )
}

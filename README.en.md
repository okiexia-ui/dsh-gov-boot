# dsh-gov-boot

[![CI](https://github.com/okiexia-ui/dsh-gov-boot/actions/workflows/ci.yml/badge.svg)](https://github.com/okiexia-ui/dsh-gov-boot/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![DeepSeek Harness plugin](https://img.shields.io/badge/DeepSeek%20Harness-plugin-c8161d.svg)](#install)

[中文](README.md) | English

A government-portal style boot sequence for [DeepSeek Harness](https://www.npmjs.com/package/@deepseek-ai/dsh) (DSH): a rice-paper splash with the Great Wall winding across ink-wash hills → a "unified identity authentication" sign-in screen → a workbench picker that opens a new session with a starter prompt in the input box. Mode, palette, texts and prompts are all editable in Settings.

**Download**: [dsh-gov-boot.tgz](https://github.com/okiexia-ui/dsh-gov-boot/releases/latest/download/dsh-gov-boot.tgz) (always the newest; older versions under [Releases](https://github.com/okiexia-ui/dsh-gov-boot/releases)).

![Demo](https://raw.githubusercontent.com/okiexia-ui/dsh-gov-boot/main/docs/demo.gif)

## What it does

| Stage | Length | Content |
| --- | --- | --- |
| Splash | ~3 s | Meander-pattern gold frame, sun, clouds and hills rise, the Great Wall unrolls left to right, the title reveals, a vermilion seal lands |
| Sign-in | ~2.8 s | Hero title on the left, login card on the right, a classic percentage bar 14 → 38 → 62 → 86 → 100% |
| Workbench picker | 3 s countdown (default) | Four cards (Q&A, Document drafting, Data analysis, Knowledge base); last used is the default |
| Hand-off | ~0.6 s | Fade into DSH |

- **Auto mode (default)**: the full show on the first launch of each version, then the ~3 s splash only; an upgrade plays the full show once more
- **The last stretch of the bar is real**: it holds at 86% until DSH's own boot card is gone (the app is actually up), for at most 10 s
- **Picking a workbench does something**: click a card, press `1`–`4`, or confirm with `Enter`, and the plugin uses DSH's own new-session path to open a session in the most recent workspace (reusing a blank one) with that card's prompt in the input box — **filled, never sent**. The countdown, Esc and "no workspace yet" open nothing. Can be switched off in Settings
- **Three login tabs** (account / QR / CA certificate) are presentational: nothing is typed, read or sent, and the QR code does not scan
- **Click / Enter** steps forward, **Esc** skips everything
- **Keys never leak to the app behind the overlay** (typing, Enter, Tab are swallowed; shortcuts with ⌘ / Ctrl / Alt pass through)
- **Reduced motion** keeps every element, without movement
- **Desktop window stays draggable** while the overlay is up
- The first frame is injected by the host half while the document is parsed, so DSH's own `HARNESS / Loading plugins…` card never flashes
- Pure CSS/JS + inline SVG, generated from fixed seeds; no images, audio or network requests
- The sign-in and picker scenes are built while the splash plays: mounting takes ~25 ms at 4× CPU throttling, with ~100 DOM nodes on screen at first

## Settings

Settings → General gets a row:

![Settings row](preview/stills/settings.png)

| Control | Effect |
| --- | --- |
| Off / Auto / Splash only / Full | Off: straight into DSH. Auto: full show once per version, then splash only. Splash only: ~3 s. Full: everything, every time (~10 s) |
| Tech blue / China red / Midnight blue | Palette of the sign-in and picker scenes (the splash is always paper, red and gold) |
| Preview | Plays the full show right now, even when Off (a pick in the preview never opens a session) |
| Customize… | Splash title (≤16 chars), subtitle, seal text (1–4 chars), countdown (1–9 s), each workbench's name, description and starter prompt, and the "open a session with the prompt" switch; "Reset" restores the defaults |

Stored in `localStorage` (`dsh-gov-boot:mode` / `:theme` / `:app` / `:seen` / `:custom`), applied on next launch.

![China red and midnight blue](preview/stills/themes.jpg)

Every entry dispatches `dsh-gov-boot:enter` on `document` with `detail: { index, name, prompt, explicit }` (`explicit` is true when the user picked the card rather than the countdown).

## Install

Download [dsh-gov-boot.tgz](https://github.com/okiexia-ui/dsh-gov-boot/releases/latest/download/dsh-gov-boot.tgz), then in DSH go to **Settings → Plugins → Install** and enter its absolute path, e.g. `/Users/you/Downloads/dsh-gov-boot.tgz`. Or link a source checkout with `link:/path/to/dsh-gov-boot`, or for a non-desktop profile run `dsh plugin --profile web add /path/to/dsh-gov-boot.tgz`. Then quit the client completely (⌘Q) and reopen it.

> The desktop app owns the `desktop` profile exclusively, so `dsh plugin --profile desktop` is refused; use Settings → Plugins there.

## Preview

Open [`preview/index.html`](preview/index.html) in a browser; it loads the real `lib/client.js` through a fake `__ModuleLoader__`. Query parameters: `?seek=2900` (splash), `?seek=4400` (sign-in), `?seek=6400` (picker), `&tab=qr|ca`, `&theme=red|night`, `&mode=splash`.

## Contributing

Sources live in `src/`; `npm run build` concatenates them into `lib/client.js`, the file DSH loads. The version is written only in `package.json`. See [CONTRIBUTING.md](CONTRIBUTING.md) (in Chinese; English PRs are fine).

```bash
npm install && npx playwright install chromium
npm run build       # src/ → lib/client.js
npm test            # syntax + contract checks
npm run test:e2e    # full flow in headless Chromium
npm run test:dsh    # inside a real DSH (needs npm i -g @deepseek-ai/dsh pnpm)
```

Tested against DeepSeek Harness 0.2.1-rc.2 (web): first frame, settings row in light and dark, preview, and the workbench → prefilled-prompt flow; CI runs it on every push.

Please keep it free of national emblems, party emblems, the national flag and any real institution's name, logo or seal style.

## License

MIT. The first-frame cover, settings row and desktop drag-region techniques follow [dsh-550c-boot](https://github.com/yannicksong0106/dsh-550c-boot) (MIT © Ziyang Song); its license text is included in [LICENSE](LICENSE).

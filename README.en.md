# dsh-gov-boot

[![CI](https://github.com/okiexia-ui/dsh-gov-boot/actions/workflows/ci.yml/badge.svg)](https://github.com/okiexia-ui/dsh-gov-boot/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![DeepSeek Harness plugin](https://img.shields.io/badge/DeepSeek%20Harness-plugin-c8161d.svg)](#install)

[中文](README.md) | English

A government-portal style boot sequence for [DeepSeek Harness](https://www.npmjs.com/package/@deepseek-ai/dsh) (DSH): a rice-paper splash with the Great Wall winding across ink-wash hills → a "unified identity authentication" sign-in screen → a workbench picker → fade into DSH. Mode and palette are switchable in Settings.

**Download**: grab the latest `.tgz` from [Releases](https://github.com/okiexia-ui/dsh-gov-boot/releases/latest), or [dsh-gov-boot-0.4.0.tgz](https://github.com/okiexia-ui/dsh-gov-boot/raw/main/dist/dsh-gov-boot-0.4.0.tgz) directly.

![Splash](preview/stills/splash.jpg)

![Sign-in](preview/stills/signin.jpg)

![Workbench picker](preview/stills/choose.jpg)

## What it does

| Stage | Length | Content |
| --- | --- | --- |
| Splash | ~3 s | Meander-pattern gold frame, sun, clouds and hills rise, the Great Wall unrolls left to right, the title reveals, a vermilion seal lands |
| Sign-in | ~2.8 s | Hero title on the left, login card on the right, a classic percentage bar 14 → 38 → 62 → 86 → 100% |
| Workbench picker | 3 s countdown | Four cards (Q&A, Document drafting, Data analysis, Knowledge base); last used is the default |
| Hand-off | ~0.6 s | Fade into DSH |

- **The last stretch of the bar is real**: it holds at 86% until DSH's own boot card is gone (the app is actually up), for at most 10 s
- **Three login tabs** (account / QR / CA certificate) are presentational: nothing is typed, read or sent, and the QR code does not scan
- **Picker**: click a card or press `1`–`4`; `←` `→` move the selection and pause the countdown; `Enter` confirms. All cards enter the same DSH workspace; the choice is remembered and dispatched as a `dsh-gov-boot:enter` event on `document` (`detail: { index, name }`)
- **Click / Enter** steps forward, **Esc** skips everything
- **Keys never leak to the app behind the overlay** (typing, Enter, Tab are swallowed; shortcuts with ⌘ / Ctrl / Alt pass through)
- **Reduced motion** keeps every element, without movement
- **Desktop window stays draggable** while the overlay is up (macOS no-drag fix + a 28 px drag band)
- The first frame is injected by the host half while the document is parsed, so DSH's own `HARNESS / Loading plugins…` card never flashes
- Pure CSS/JS + inline SVG (the wall, hills and skyline are generated from fixed seeds); no images, audio or network requests

## Settings

Settings → General gets a row:

![Settings row](preview/stills/settings.png)

| Control | Effect |
| --- | --- |
| Off / Splash only / Full | Off: straight into DSH. Splash only: ~3 s. Full: splash + sign-in + picker (~10 s) |
| Tech blue / China red / Midnight blue | Palette of the sign-in and picker scenes (the splash is always paper, red and gold) |
| Preview | Plays the full show right now, even when the mode is Off |

Stored in `localStorage` (`dsh-gov-boot:mode` / `:theme` / `:app`), applied on next launch.

![China red and midnight blue](preview/stills/themes.jpg)

## Install

In DSH: **Settings → Plugins → Install**, and enter the absolute path of the downloaded file, e.g. `/Users/you/Downloads/dsh-gov-boot-0.4.0.tgz`. Or link a source checkout with `link:/path/to/dsh-gov-boot`. Then quit the client completely (⌘Q) and reopen it.

> The desktop app owns the `desktop` profile exclusively, so `dsh plugin --profile desktop` is refused; both routes above use the same host pipeline as the Plugins page.

## Preview

Open [`preview/index.html`](preview/index.html) in a browser; it loads the real `lib/client.js` through a fake `__ModuleLoader__`. Query parameters: `?seek=2900` (splash), `?seek=4400` (sign-in), `?seek=6400` (picker), `&tab=qr|ca`, `&theme=red|night`, `&mode=splash`.

## Contributing

Issues and PRs are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) (in Chinese; English PRs are fine).

```bash
npm install && npx playwright install chromium
npm test            # syntax + contract checks
npm run test:e2e    # full flow in headless Chromium
npm run shots       # regenerate the screenshots
```

Please keep it free of national emblems, party emblems, the national flag and any real institution's name, logo or seal style.

## License

MIT. The first-frame cover, settings row and desktop drag-region techniques follow [dsh-550c-boot](https://github.com/yannicksong0106/dsh-550c-boot) (MIT © Ziyang Song); its license text is included in [LICENSE](LICENSE).

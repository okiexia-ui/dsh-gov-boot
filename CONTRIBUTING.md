# 参与贡献

欢迎 issue 和 PR！改画面、加配色、修 bug、补文档都算。

## 开发环境

需要 Node.js 20+。

```bash
git clone https://github.com/okiexia-ui/dsh-gov-boot
cd dsh-gov-boot
npm install
npx playwright install chromium   # 端到端测试和截图用
```

## 目录

```
lib/index.js        宿主半边：首帧遮挡（webserver/index-inject）+ 注入版本号
src/                客户端源码：constants / prefs / art / markup / style / overlay / actions / settings / plugin
lib/client.js       由 src/ 拼成，DSH 客户端模块加载器直接加载它（生成文件，也要提交）
preview/index.html  浏览器直接打开就能预览，支持 ?seek= 定格
test/               host.test.mjs（零依赖）、e2e.test.cjs（Playwright）、dsh.test.cjs（真实 DSH）
scripts/            build.mjs、shots.mjs（截图）、demo.mjs（演示动图）
```

改 `src/` 之后跑一下 `npm run build`，再刷新预览页。`src/` 里的文件共用一个作用域、按 `scripts/build.mjs` 里的顺序拼接，不用 import/export。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run build` | `src/` → `lib/client.js` |
| `npm test` | 语法检查、两半之间的约定检查、`lib/client.js` 是否与 `src/` 一致（几十毫秒） |
| `npm run test:e2e` | 无头 Chromium 跑完整流程：档位、自动档、按键、减少动态效果、就绪等待、选择工作台、自定义文字、设置行（约 1.5 分钟） |
| `npm run test:dsh` | 在真实的 DSH Web 端里跑：首帧、设置行（浅色 / 深色）、预览、选中工作台后预填提示词。需要 `npm i -g @deepseek-ai/dsh pnpm`，或用 `DSH_BIN` 指向 dsh 可执行文件 |
| `npm run shots` | 重新生成 README 里的截图 |
| `npm run demo` | 重新录制 `docs/demo.gif`（需要 Python 3 + Pillow） |
| `npm pack` | 打出可安装的 `.tgz`（会先 build） |

截图依赖本机字体：macOS 上是宋体 / 苹方；Linux 上装 Noto Serif SC 和 Noto Sans SC 最接近。

## 约定

- **零运行时依赖、不发网络请求**：画面全部是 CSS + 内联 SVG；设置行用的 `react` 由 DSH 提供
- **不使用受法律保护的标志**：国徽、党徽、国旗，以及任何真实机构的名称、Logo、公章样式都不要加
- **按键不漏给后面的应用**、**减少动态效果时照样显示**、**DSH 卡住时最多等 10 秒**：这几条有测试守着，改动时别破坏
- 改了用户能看到的行为，请同时更新 `README.md` 和 `CHANGELOG.md`
- 一个 PR 做一件事；改画面请附前后截图

## 发布（维护者）

1. 改 `package.json` 的 `version`（只有这一处），在 `CHANGELOG.md` 顶部加一节 `## x.y.z`
2. `npm run build && npm run test:all`
3. 推到 `main` 后，在 GitHub 上 **Releases → Draft a new release**，Tag 填 `vx.y.z`（选 Create new tag），说明可以直接贴 CHANGELOG 那一节，点 **Publish release**
4. GitHub Actions 会自动跑测试、打包，把 `dsh-gov-boot-x.y.z.tgz` 和不带版本号的 `dsh-gov-boot.tgz` 都挂到这个 Release 上；仓库里配置了 `NPM_TOKEN` secret 的话还会发布到 npm

## 行为准则

参与即表示同意遵守 [行为准则](CODE_OF_CONDUCT.md)。

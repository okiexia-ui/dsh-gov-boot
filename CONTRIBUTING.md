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
lib/index.js        宿主半边：首帧遮挡（webserver/index-inject）
lib/client.js       客户端半边：片头、认证页、选择工作台、设置行，全部在这一个文件里
preview/index.html  浏览器直接打开就能预览，支持 ?seek= 定格
test/               host.test.mjs（零依赖）+ e2e.test.cjs（Playwright）
scripts/shots.mjs   重新生成 preview/stills/ 的截图
```

`lib/client.js` 是 DSH 客户端模块加载器直接加载的文件，不经过构建，改完刷新预览页就能看到。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm test` | 语法检查 + 宿主半边与两半之间的约定检查（几十毫秒） |
| `npm run test:e2e` | 无头 Chromium 跑完整流程：档位、按键、减少动态效果、就绪等待、选择工作台、设置行（约 1 分钟） |
| `npm run shots` | 重新生成 README 里的截图 |
| `npm pack` | 打出可安装的 `.tgz` |

截图依赖本机字体：macOS 上是宋体 / 苹方；Linux 上装 Noto Serif SC 和 Noto Sans SC 最接近。

## 约定

- **零运行时依赖、不发网络请求**：画面全部是 CSS + 内联 SVG；设置行用的 `react` 由 DSH 提供
- **不使用受法律保护的标志**：国徽、党徽、国旗，以及任何真实机构的名称、Logo、公章样式都不要加
- **按键不漏给后面的应用**、**减少动态效果时照样显示**、**DSH 卡住时最多等 10 秒**：这几条有测试守着，改动时别破坏
- 改了用户能看到的行为，请同时更新 `README.md` 和 `CHANGELOG.md`
- 一个 PR 做一件事；改画面请附前后截图

## 发布（维护者）

1. 同时改 `package.json` 的 `version`、`lib/index.js` 的 `VERSION`、片头左下角的 `V0.x`（`lib/client.js`），在 `CHANGELOG.md` 顶部加一节 `## x.y.z`
2. `npm run test:all`
3. 提交后打标签并推送：`git tag vx.y.z && git push origin main --tags`
4. GitHub Actions 会自动打包、建 Release 并挂上 `.tgz`；仓库里配置了 `NPM_TOKEN` secret 的话还会发布到 npm

## 行为准则

参与即表示同意遵守 [行为准则](CODE_OF_CONDUCT.md)。

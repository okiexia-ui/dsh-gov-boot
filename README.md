# dsh-gov-boot

给 DeepSeek Harness 的**政务风开机动画**：宣纸底朱红大字的长城片头 → 科技蓝统一身份认证（账号 / 扫码 / CA 证书三种登录方式）→ 选择要进入的工作台，再淡入 DSH。设置里可以切换档位和配色。

![开机片头](preview/stills/splash.jpg)

![统一身份认证](preview/stills/signin.jpg)

![选择工作台](preview/stills/choose.jpg)

## 流程

| 阶段 | 时长 | 内容 |
| --- | --- | --- |
| 片头 | 约 3 秒 | 回纹金框 → 朝阳、祥云、远山浮起 → 长城沿山脊自左向右展开 → 「智能政务工作平台」宋体大字揭幕 → 朱文印章落下、底部红绸 |
| 认证 | 约 2.8 秒 | 左侧大标题与温馨提示，右侧登录卡；百分比进度条 14% → 38% → 62% → 86% → 100% |
| 选择工作台 | 3 秒倒计时 | 智能问答 / 公文写作 / 数据分析 / 知识库四张卡片，默认是上次用过的那张 |
| 交接 | 约 0.6 秒 | 整屏淡出，进入 DSH |

- **进度条最后一段是真的**：走到 86% 会停下来，等 DSH 自己的启动卡片消失（应用真正就绪）再走到 100%；最多等 10 秒。应用已经就绪时不会多等
- **三种登录方式**：登录卡顶部可以切换「账号登录 / 扫码登录 / CA 证书」，只是界面展示，不需要也不会读取任何口令，二维码不可扫
- **选择工作台**：点卡片、按 `1`–`4` 直接进入；`←` `→` 切换会暂停倒计时，`Enter` 确认。四个入口都进同一个 DSH 工作台，选择会记住（下次默认选中），并在 `document` 上派发 `dsh-gov-boot:enter` 事件（`detail: { index, name }`），想接自己的逻辑可以监听它
- **点击 / Enter**：片头 → 认证 → 选择工作台，一步一步往前推；**Esc** 随时跳过全部
- **按键不会漏给后面的应用**：遮罩在的时候，打字、Enter、Tab 都被拦下，免得在看不见的输入框里误发消息；带 ⌘ / Ctrl / Alt 的快捷键照常生效
- **减少动态效果**：系统开了「减少动态效果」时，每一拍照常出现，只是不再有位移和渐变
- **桌面端窗口照样能拖**：遮罩在时顶部 28px 是窗口拖动区；macOS 下 DSH 官方样式会让整屏遮罩挡住窗口拖动，这里已经处理
- 首帧由宿主半边在文档解析阶段注入，DSH 自己的 `HARNESS / Loading plugins…` 卡片不会露出来
- 纯 CSS/JS + 内联 SVG（长城、山峦、城市剪影都是按固定种子生成的），无图片、无音频、无网络请求

![三种登录方式](preview/stills/tabs.jpg)

## 设置

设置 → 通用里多一行「政务开机动画」：

![设置行](preview/stills/settings.png)

| 控件 | 作用 |
| --- | --- |
| 关闭 / 仅片头 / 完整 | 关闭：直接进 DSH；仅片头：约 3 秒宣纸片头；完整：片头 + 认证 + 选择工作台（约 10 秒） |
| 科技蓝 / 中国红 / 深夜蓝 | 认证页和选择页的配色（片头始终是宣纸红金）；「仅片头」时不可选 |
| 预览 | 不用重启，当场按当前配色完整播放一遍（「关闭」时也能预览） |

都存在本机 `localStorage`（`dsh-gov-boot:mode` / `:theme` / `:app`），下次启动生效。

![中国红与深夜蓝](preview/stills/themes.jpg)

## 安装

### 从安装包（推荐）

在「设置 → 插件 → 安装」里填安装包的绝对路径：

```
/绝对路径/dsh-gov-boot-0.4.0.tgz
```

或者用宿主 RPC：

```bash
curl -X POST http://127.0.0.1:55988/api/pluginManager/installBundle \
  -H "Cookie: <dsh-auth cookie>" -H "Content-Type: application/json" \
  -d '{"type":"client-request","rpcId":"i","method":"pluginManager/installBundle","payload":{"args":{"spec":"/绝对路径/dsh-gov-boot-0.4.0.tgz","options":{"enabled":true}}}}'
```

### 从源码目录

设置 → 插件 → 安装，填：

```
link:/你的/源码/目录/dsh-gov-boot
```

安装后**完全退出**客户端（⌘Q），重新打开生效。

> 官方桌面端独占 `desktop` profile，命令行 `dsh plugin --profile desktop` 会被拒绝；以上两条都是界面插件页背后的同一条宿主管线。

## 预览

浏览器直接打开 [`preview/index.html`](preview/index.html)，它用假的 `__ModuleLoader__` 加载真正的 `lib/client.js`。左下角工具条可以重播、切换档位和配色。

| 参数 | 作用 |
| --- | --- |
| `?seek=2900` | 定格在片头 |
| `?seek=4400` | 定格在认证页（62%） |
| `?seek=6400` | 定格在选择工作台 |
| `&tab=qr` / `&tab=ca` | 认证页切到扫码 / CA 证书 |
| `&theme=red` / `&theme=night` | 换配色 |
| `&mode=splash` | 只放片头 |

## 想改哪里

| 想改的东西 | 位置 |
| --- | --- |
| 片头标题 / 副标题 | `lib/client.js` 的 `splashMarkup()` |
| 印章文字 | `lib/client.js` 的 `SEAL` |
| 认证页文案、三种登录方式 | `lib/client.js` 的 `authMarkup()` |
| 四个工作台的名称、说明、图标 | `lib/client.js` 顶部的 `APPS` |
| 进度节奏与状态文字 | `lib/client.js` 的 `startAuth()` |
| 倒计时秒数 | `lib/client.js` 的 `CHOOSE_SECONDS` |
| 三套配色 | `lib/client.js` 的 `STYLE` 里 `.gb-root[data-theme=…]` 那三段变量 |
| 长城走势、烽火台位置 | `lib/client.js` 的 `WALL`、`TOWERS` |
| 首帧底色 | `lib/index.js` 的 `FIRST_FRAME_BG`（必须与纸色 `#f6efe2` 一致） |

## 关掉或卸载

- 临时关闭：设置 → 通用 →「政务开机动画」选「关闭」，或者在控制台执行 `localStorage.setItem('dsh-gov-boot:mode','off')`，重启生效
- 卸载：设置 → 插件 → 已安装 → 移除 `dsh-gov-boot`，重启

## 结构

```
lib/index.js     宿主半边：webserver/index-inject 注入首帧 CSS/脚本 + 版本
lib/client.js    客户端半边：shadow DOM、片头时间线、认证页、选择工作台、设置行、跳过与淡出
preview/         独立预览页（加载真实 client.js）与截图
cordis.patch.yml 把宿主半边挂进 profile 的 bundle patch
```

## 说明

- 画面里没有国徽、党徽、国旗等受法律保护的标志；印章是装饰性的方形朱文印，不仿公章样式
- 认证页上的「核验」是启动画面的一部分，并不做真正的身份验证；页面上的温馨提示也写明了这一点
- 字体使用系统自带的 Songti SC / PingFang SC / Kaiti SC（Windows 上回退到宋体 / 微软雅黑 / 楷体），不内嵌字体文件

## 许可与致谢

MIT。首帧遮挡、设置行与桌面端拖动区的做法参考了 [dsh-550c-boot](https://github.com/yannicksong0106/dsh-550c-boot)（MIT © Ziyang Song），许可原文一并附在 [LICENSE](LICENSE) 里。

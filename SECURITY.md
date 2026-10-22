# 安全策略

## 支持的版本

只维护最新的次版本（目前是 0.4.x）。

## 这个插件会做什么

了解范围有助于判断问题是否属于本项目：

- 宿主半边只往 DSH 的首页 HTML 注入一段样式、一段同步脚本和一个版本号（`webserver/index-inject`），不注册任何 HTTP 路由
- 客户端半边只在页面上挂一个 shadow DOM 遮罩，读写 `localStorage` 里 `dsh-gov-boot:` 开头的三个键
- 不发任何网络请求，不读取会话、文件或凭据；认证页上的「口令」「验证码」「二维码」都是静态画面，不收集任何输入

## 报告漏洞

请**不要**开公开 issue。到仓库的 **Security → Report a vulnerability** 私下提交（[直达链接](https://github.com/okiexia-ui/dsh-gov-boot/security/advisories/new)），写明版本、复现步骤和影响。一般会在一周内回复。

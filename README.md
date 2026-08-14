# DeepSeek Harness Desktop

DeepSeek Harness 的 Electron 桌面便携版。下载 Release 中的 ZIP，解压后双击 `DeepSeekHarness.exe` 即可运行，不需要另外安装 Node.js 或 npm。

## 下载使用

请在本仓库的 **Releases** 页面下载最新的 `DeepSeekHarness-Portable.zip`：

1. 解压到一个文件夹；
2. 双击 `DeepSeekHarness.exe`；
3. 在 Web UI 的“设置 → 模型”中填写自己的 API Key。

每台电脑的 API Key、工作区和运行数据单独保存在用户目录中，不会包含发布者的密钥。

## 项目说明

这是 Electron 桌面外壳项目，便携版内置 Electron、Node.js、DeepSeek Harness 运行时和示例插件。源码中的 `main.cjs` 负责启动本地 Web 服务并打开桌面窗口。

## 本地开发

需要 Node.js 和 npm。安装依赖后运行：

```powershell
npm install
npm start
```

Windows 打包命令：

```powershell
npm run dist
```

## 发布说明

便携 ZIP 体积较大，因此作为 GitHub Release 附件发布，不直接提交到 Git 仓库。

# DeepSeek Harness Desktop

DeepSeek Harness 的 Windows Electron 桌面便携版。它把 Harness Web UI 包装成独立桌面应用，并在便携版中内置 Electron、Node.js、Harness 运行时和示例插件。

## 下载

直接下载最新便携版：

[下载 DeepSeekHarness-Portable.zip](https://github.com/YLIULING/deepseek-harness-desktop/releases/latest/download/DeepSeekHarness-Portable.zip)

也可以打开 [Releases 页面](https://github.com/YLIULING/deepseek-harness-desktop/releases) 查看历史版本和更新说明。

## 系统要求

- Windows 10 或 Windows 11；
- 64 位系统；
- 不需要另外安装 Node.js、npm 或 Electron；
- 首次使用需要准备自己的模型 API Key。

## 安装和启动

这是便携版，不需要安装程序：

1. 下载 `DeepSeekHarness-Portable.zip`；
2. 解压到一个独立文件夹；
3. 双击 `DeepSeekHarness.exe`；
4. 等待桌面窗口打开；
5. 进入“设置 → 模型”，填写自己的 API Key 和模型配置。

建议不要只从 ZIP 压缩包内部直接运行，先完整解压到文件夹中。以后更新时也建议先退出应用，再替换整个程序文件夹。

## 数据和隐私

每台电脑的配置、工作区和 API Key 都保存在当前 Windows 用户目录中，不会写入发布的 ZIP，也不会包含发布者的密钥。

主要数据位置：

```text
%APPDATA%\deepseek-harness-desktop\
```

运行日志位置：

```text
%LOCALAPPDATA%\DeepSeekHarness\
```

如果要迁移个人配置，可以备份上述用户目录；如果要彻底重置配置，退出应用后再删除对应目录。

## 本地访问地址

应用内部服务默认监听：

```text
http://127.0.0.1:3080
```

这是本机地址，默认不会直接暴露到局域网或公网。

## 更新方式

官方 Harness 发布新版本后，旧 ZIP 不会自动变化。更新步骤如下：

1. 退出当前 DeepSeek Harness Desktop；
2. 从 Releases 下载新的 ZIP；
3. 解压新版本并替换旧的程序文件夹；
4. 不要删除 `%APPDATA%\deepseek-harness-desktop\`，这样可以保留 API Key、工作区和个人配置；
5. 重新双击 `DeepSeekHarness.exe`。

如果官方版本有插件接口或配置格式变化，需要在新 Release 说明中确认兼容性。

## 常见问题

### 双击后没有窗口

先确认 ZIP 已经完整解压，并检查任务管理器中是否已有多个 `DeepSeekHarness.exe`。退出重复实例后再重新启动。

### 页面打不开或一直加载

应用默认使用 3080 端口。如果本机已有其他程序占用该端口，先关闭旧的 DeepSeek Harness Web 服务或其他占用程序，再重启桌面端。

### API Key 是否会跟着程序包发送给别人

不会。API Key 保存在每个用户自己的 `%APPDATA%\deepseek-harness-desktop\` 目录中，发布 ZIP 不包含发布者的个人配置。

### 可以发给别人使用吗

可以。把 Release 页面或 ZIP 直链发给对方，对方下载、解压并双击 `DeepSeekHarness.exe` 即可。对方需要填写自己的 API Key。

## 项目结构

- `main.cjs`：Electron 主进程，负责启动本地 Harness 服务和桌面窗口；
- `package.json`：Electron 开发和打包配置；
- `icon.ico`、`icon.svg`：应用图标；
- `DeepSeekHarness-Portable.zip`：作为 GitHub Release 附件发布，不直接提交到 Git 仓库。

## 本地开发

需要 Node.js 和 npm：

```powershell
npm install
npm start
```

Windows 打包命令：

```powershell
npm run dist
```

开发运行依赖本机的 Harness 开发环境；普通用户直接使用 Releases 中的便携版即可。

## 许可证

本项目使用 MIT License。项目中包含的第三方运行时仍受其各自许可证约束。

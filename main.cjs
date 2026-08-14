const { app, BrowserWindow, dialog } = require('electron')
const { spawn } = require('node:child_process')
const { existsSync, mkdirSync, openSync, writeFileSync } = require('node:fs')
const { join } = require('node:path')
const { pathToFileURL } = require('node:url')
const http = require('node:http')

const HOST = '127.0.0.1'
const PORT = 3080
const ICON_FILE = join(__dirname, 'icon.ico')

let dshProcess = null
let ownsDshProcess = false
let mainWindow = null
let runtimeConfig = null

function getRuntimeConfig() {
  const packaged = app.isPackaged
  const userData = app.getPath('userData')
  const projectRoot = join(process.env.USERPROFILE || '', 'Documents', 'YLIULING 3')
  const resourcesRoot = process.resourcesPath
  const workspace = packaged ? join(userData, 'workspace') : projectRoot
  const dshEntry = packaged
    ? join(resourcesRoot, 'dsh', 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js')
    : join(process.env.APPDATA || '', 'npm', 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js')
  const nodeExe = packaged
    ? join(resourcesRoot, 'node', 'node.exe')
    : join(process.env.ProgramFiles || 'C:\\Program Files', 'nodejs', 'node.exe')
  const pluginFile = packaged
    ? join(resourcesRoot, 'dsh', 'plugin', 'hello-plugin.mjs')
    : join(projectRoot, 'deepseek-harness-plugin', 'src', 'hello-plugin.ts')
  const patchFile = packaged
    ? join(userData, 'hello-plugin.cordis.yml')
    : join(projectRoot, 'deepseek-harness-plugin', 'cordis.yml')
  return {
    dshEntry,
    dshHome: packaged ? join(userData, 'dsh-home') : undefined,
    logDir: join(process.env.LOCALAPPDATA || userData, 'DeepSeekHarness'),
    nodeExe,
    patchFile,
    pluginFile,
    workspace,
  }
}

function prepareRuntimeConfig() {
  runtimeConfig = getRuntimeConfig()
  mkdirSync(runtimeConfig.workspace, { recursive: true })
  if (app.isPackaged) {
    const pluginUrl = pathToFileURL(runtimeConfig.pluginFile).href
    writeFileSync(
      runtimeConfig.patchFile,
      `- insert:\n    - id: hello-plugin\n      name: '${pluginUrl}'\n`,
      'utf8',
    )
  }
}

function isServerReady() {
  return new Promise((resolve) => {
    const request = http.get(`http://${HOST}:${PORT}`, (response) => {
      response.resume()
      resolve(response.statusCode >= 200 && response.statusCode < 500)
    })
    request.setTimeout(1200, () => {
      request.destroy()
      resolve(false)
    })
    request.on('error', () => resolve(false))
  })
}

function startDsh() {
  if (!existsSync(runtimeConfig.nodeExe)) {
    throw new Error(`没有找到内置 Node.js：${runtimeConfig.nodeExe}`)
  }
  if (!existsSync(runtimeConfig.dshEntry)) {
    throw new Error(`没有找到内置 DeepSeek Harness：${runtimeConfig.dshEntry}`)
  }

  mkdirSync(runtimeConfig.logDir, { recursive: true })
  const stdout = openSync(join(runtimeConfig.logDir, 'desktop-dsh.out.log'), 'a')
  const stderr = openSync(join(runtimeConfig.logDir, 'desktop-dsh.err.log'), 'a')

  dshProcess = spawn(
    runtimeConfig.nodeExe,
    [
      runtimeConfig.dshEntry,
      '--profile',
      'web',
      '--patch',
      runtimeConfig.patchFile,
      '--host',
      HOST,
      '--port',
      String(PORT),
    ],
    {
      cwd: runtimeConfig.workspace,
      env: {
        ...process.env,
        ...(runtimeConfig.dshHome ? { DSH_HOME: runtimeConfig.dshHome } : {}),
      },
      windowsHide: true,
      stdio: ['ignore', stdout, stderr],
    },
  )
  ownsDshProcess = true
}

async function waitForServer(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await isServerReady()) return true
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  return false
}

function stopDsh() {
  if (ownsDshProcess && dshProcess && !dshProcess.killed) {
    dshProcess.kill()
  }
  dshProcess = null
  ownsDshProcess = false
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 960,
    minHeight: 640,
    show: false,
    title: 'DeepSeek Harness',
    icon: ICON_FILE,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  await mainWindow.loadURL(`http://${HOST}:${PORT}`)
}

app.whenReady().then(async () => {
  try {
    prepareRuntimeConfig()
    if (!(await isServerReady())) startDsh()
    if (!(await waitForServer())) {
      throw new Error('DeepSeek Harness 在 30 秒内没有启动成功，请查看日志。')
    }
    await createWindow()
  } catch (error) {
    stopDsh()
    await dialog.showMessageBox({
      type: 'error',
      title: 'DeepSeek Harness 启动失败',
      message: error instanceof Error ? error.message : String(error),
      detail: `日志目录：${runtimeConfig?.logDir || '未创建'}`,
    })
    app.quit()
  }
})

app.on('before-quit', () => stopDsh())

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

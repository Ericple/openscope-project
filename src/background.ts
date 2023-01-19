'use strict'

import { app, protocol, BrowserWindow, Menu, ipcMain, net, dialog } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import path from 'path'
import ipcChannel from './lib/ipcChannel'
import { METAR_URL } from './lib/global'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])
Menu.setApplicationMenu(null);
async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    minWidth: 1400,
    minHeight: 900,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preloads', 'preload.js')
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }
  ipcMain.handle(ipcChannel.app.window.close, () => {
    app.quit();
  })
  ipcMain.handle(ipcChannel.app.window.maximizeOrRestore, () => {
    if (win.isMaximized()) {
      win.restore()
    } else {
      win.maximize()
    }
  })
  ipcMain.handle(ipcChannel.app.window.minimize, () => {
    win.minimize()
  })
  ipcMain.handle(ipcChannel.app.update.prfFile, () => {
    SelectSector();
  })
  ipcMain.on(ipcChannel.app.func.fetchWeather, (e, args: string) => {
    import('https').then((https) => {
      https.get(METAR_URL + args, (res) => {
        res.on('data', (chunk: Buffer) => {
          win.webContents.send(ipcChannel.app.func.fetchWeather, chunk.toString())
        })
      });
    })
  });
  function SelectSector() {
    dialog.showOpenDialog(win, {
      filters: [{ name: 'prf Config', extensions: ['prf'] }]
    }).then((result) => {
      if (result.canceled) return;
      win.webContents.send(ipcChannel.app.update.prfFile, { path: result.filePaths[0] });
    })
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('ready', async () => {
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
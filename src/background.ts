'use strict'

import { app, protocol, BrowserWindow, Menu, ipcMain, dialog, globalShortcut, Notification, Tray, nativeImage } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import path from 'path'
import ipcChannel from './lib/ipcChannel'
import { METAR_URL, obsAcfDataApi } from './lib/global'
import https from 'https'
const isDevelopment = process.env.NODE_ENV !== 'production'
const appIcon = nativeImage.createFromPath(path.join(__dirname, 'public', 'assets', 'image', 'logo.png'))

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])
Menu.setApplicationMenu(null);
const preloadPath = path.join(__dirname, 'preloads', 'preload.js');
console.log(preloadPath);
async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    minWidth: 1400,
    minHeight: 900,
    frame: false,
    icon: appIcon,
    webPreferences: {
      preload: preloadPath
    },
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
    console.log('Select sector')
    SelectSector();
  })
  ipcMain.handle(ipcChannel.app.func.fetchWeather, (e, args: string) => {
    https.get(METAR_URL + args, (res) => {
      res.on('data', (chunk: Buffer) => {
        win.webContents.send(ipcChannel.app.func.fetchWeather, chunk.toString())
      })
    });
  });
  const switch2R1 = globalShortcut.register('Shift+Q', () => {
    win.webContents.send(ipcChannel.app.func.switchRadarView, 0)
  })
  const switch2R2 = globalShortcut.register('Shift+W', () => {
    win.webContents.send(ipcChannel.app.func.switchRadarView, 1)
  })
  const switch2R3 = globalShortcut.register('Shift+E', () => {
    win.webContents.send(ipcChannel.app.func.switchRadarView, 2)
  })
  const switch2R4 = globalShortcut.register('Shift+R', () => {
    win.webContents.send(ipcChannel.app.func.switchRadarView, 3)
  })
  if (!switch2R1 || !switch2R2 || !switch2R3 || !switch2R4) new Notification({
    title: "An error occured",
    body: "Radar view switcher may not be fully functional",
    icon: appIcon
  }).show()
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
ipcMain.handle(ipcChannel.app.update.obsAcfData, (e, args) => {
  https.get(obsAcfDataApi + args, (res) => {
    let result = '';
    res.on('data', (chunk: Buffer) => {
      result += chunk.toString()

    });
    res.on('end', () => {
      e.sender.send(ipcChannel.app.update.obsAcfData, result)
    });
    res.on('error', e => {
      console.error(e);
    });
  });
});
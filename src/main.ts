//引入electron模块
import * as Electron from "electron";
import path from "path";
import fs from "fs";
import ipcChannel from "./lib/ipcChannel";
import { DefaultSectorSettingFilePath, RadarWindowFilePath } from "./global";

const METAR_URL = "https://api.aviationapi.com/v1/weather/metar?apt=";
let RadarWindow: Electron.BrowserWindow;

Electron.Menu.setApplicationMenu(null);

function CreateRadarWindow() {
    Electron.app.name = "OpenScope";
    RadarWindow = new Electron.BrowserWindow({
        minWidth: 1300,//最小宽度1300
        minHeight: 1000,//最小高度1000
        frame: false,//无边框窗口
        webPreferences: {
            preload: path.join(__dirname, "preloads", "RadarPreload.js"),
            nodeIntegrationInWorker: true
        }
    });
    Electron.app.setName("OpenScope");
    //加载窗口文件
    RadarWindow.loadFile(RadarWindowFilePath);
    RadarWindow.on('ready-to-show', () => {
        //显示RadarWindow窗口
        RadarWindow.show();
    })
    RadarWindow.webContents.on('console-message', (e, level, message) => {
        console.log(message);
    })
}

function SelectSector() {
    Electron.dialog.showOpenDialog(RadarWindow, {
        filters: [{ name: 'prf Config', extensions: ['prf'] }]
    }).then((result) => {
        if (result.canceled) return;
        RadarWindow.webContents.send(ipcChannel.app.update.prfFile, { path: result.filePaths[0] });
    });

}

Electron.app.whenReady().then(CreateRadarWindow).then(() => {
    RadarWindow.webContents.openDevTools();
    //判断是否已经设置默认开启的扇区
    if (fs.existsSync(DefaultSectorSettingFilePath))//若已设置，加载默认扇区
    {
        fs.readFile(DefaultSectorSettingFilePath, 'utf-8', (err, data) => {
            if (err) {
                SelectSector();
            }
            else {
                if (fs.existsSync(data)) {
                    RadarWindow.webContents.send(ipcChannel.app.update.prfFile, { path: data });
                }
                else {
                    SelectSector();
                }
            }
        });
    }
    else//若未设置，则让用户选择扇区文件
    {
        SelectSector();
    }
});

Electron.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        Electron.app.quit();
    }
})

Electron.ipcMain.handle(ipcChannel.app.window.close, () => {
    Electron.app.quit();
});

Electron.ipcMain.handle(ipcChannel.app.window.maximizeOrRestore, () => {
    if (RadarWindow.isMaximized()) {
        RadarWindow.restore();
    } else {
        RadarWindow.maximize();
    }
});

Electron.ipcMain.handle(ipcChannel.app.window.minimize, () => {
    RadarWindow.minimize();
});

Electron.ipcMain.handle(ipcChannel.app.msg.error, (e, args) => {
    const result = Electron.dialog.showErrorBox(args.title, args.message);
    e.sender.send(ipcChannel.app.msg.error, result);
});

Electron.ipcMain.handle(ipcChannel.app.msg.warning, (e, args) => {
    const result = Electron.dialog.showMessageBox(RadarWindow, {
        type: "warning",
        title: args.title,
        message: args.message,
    });
    e.sender.send(ipcChannel.app.msg.warning, result);
});

Electron.ipcMain.handle(ipcChannel.app.msg.info, (e, args) => {
    const result = Electron.dialog.showMessageBox(RadarWindow, {
        type: "info",
        title: args.title,
        message: args.message,
    });
    e.sender.send(ipcChannel.app.msg.info, result);
});

Electron.ipcMain.handle(ipcChannel.app.func.connectToNetwork, () => {
    //定义登录窗口
    const LoginWindow = new Electron.BrowserWindow({
        height: 600,
        width: 300,
        frame: true,
        resizable: false,
        modal: true,
        parent: RadarWindow
    });
    LoginWindow.show();
});

Electron.ipcMain.handle(ipcChannel.app.update.prfFile, () => {
    SelectSector();
});

Electron.ipcMain.handle(ipcChannel.app.update.theme, () => {
    if (Electron.nativeTheme.shouldUseDarkColors) {
        Electron.nativeTheme.themeSource = 'light';
    } else {
        Electron.nativeTheme.themeSource = 'dark';
    }
    return Electron.nativeTheme.shouldUseDarkColors;
});

Electron.ipcMain.handle(ipcChannel.app.update.themeSystem, () => {
    Electron.nativeTheme.themeSource = 'system';
    return Electron.nativeTheme.shouldUseDarkColors;
})

Electron.ipcMain.handle(ipcChannel.app.func.fetchWeather, (e,args: string[]) => {
    args.forEach((apt) => {
        if(apt == '.QD') return;
        if(apt == '') return;
        const req = Electron.net.request(METAR_URL+apt);
        req.on('response', (res) => {
            res.on('data', (chunk) => {
                const id = `${apt}metar`;
                const raw = JSON.parse(chunk.toString())[apt]['raw'];
                RadarWindow.webContents.send(ipcChannel.app.func.fetchWeather, {
                    id: id,
                    raw: raw
                });
            });
        });
        req.end();
    });
});
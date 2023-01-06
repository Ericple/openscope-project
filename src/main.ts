//引入electron模块
import * as Electron from "electron";
import path from "path";
import fs from "fs";
import ipcChannel from "./lib/ipcChannel";
const DefaultSectorSettingFilePath = path.join(__dirname,"config","defaultsector.txt");
const RadarWindowFilePath = path.join(__dirname,"pages","html","RadarWindow.html");
Electron.app.on('ready', () => {
    //设置程序名称
    Electron.app.setName("OpenScope");
    //定义雷达窗口
    const RadarWindow = new Electron.BrowserWindow({
        minWidth: 1300,//最小宽度1300
        minHeight: 1000,//最小高度1000
        frame: false,//无边框窗口
        webPreferences: {
            preload: path.join(__dirname, "preloads", "RadarPreload.js")
        }
    });
    //加载窗口文件
    RadarWindow.loadFile(RadarWindowFilePath);
    RadarWindow.webContents.on('console-message',(e,level,message) => {
        console.log(message);
    })
    //显示RadarWindow窗口
    RadarWindow.show();
    // RadarWindow.webContents.openDevTools();
    //判断是否已经设置默认开启的扇区
    if(fs.existsSync(DefaultSectorSettingFilePath))//若已设置，加载默认扇区
    {
        fs.readFile(DefaultSectorSettingFilePath,'utf-8',(err,data) => {
            if(err)
            {
                SelectSector();
            }
            else
            {
                if(fs.existsSync(data))
                {
                    RadarWindow.webContents.send(ipcChannel.app.update.prfFile,{ path: data });
                }
                else
                {
                    SelectSector();
                }
            }
        });
    }
    else//若未设置，则让用户选择扇区文件
    {
        SelectSector();
    }

    Electron.ipcMain.handle(ipcChannel.app.window.close, () => {
        Electron.app.quit();
    });
    
    Electron.ipcMain.handle(ipcChannel.app.window.maximizeOrRestore, () => {
        if(RadarWindow.isMaximized()){
            RadarWindow.restore();
        }else{
            RadarWindow.maximize();
        }
    });

    Electron.ipcMain.handle(ipcChannel.app.window.minimize, () => {
        RadarWindow.minimize();
    });

    Electron.ipcMain.handle(ipcChannel.app.msg.error, (e, args) => {
        Electron.dialog.showErrorBox(args.title, args.content);
    });

    Electron.ipcMain.handle(ipcChannel.app.msg.warning, (e, args) => {
        Electron.dialog.showMessageBox(RadarWindow,{
            type: "warning",
            title: args.title,
            message: args.message,
        });
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
    })

    function SelectSector()
    {
        Electron.dialog.showOpenDialog(RadarWindow,{
            filters:[ { name: 'prf Config', extensions: ['prf'] } ]
        }).then((result) => {
            if(result.canceled) return;
            RadarWindow.webContents.send(ipcChannel.app.update.prfFile,{ path: result.filePaths[0] });
            fs.writeFileSync(DefaultSectorSettingFilePath,result.filePaths[0]);
        });
        
    }
});
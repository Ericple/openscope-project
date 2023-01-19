/**
 * 定义了程序所使用的所有ipcChannel
 */
export const ipcChannel = {
    app: {
        window: {
            close: "app.window.close",
            maximizeOrRestore: "app.window.maximize",
            minimize: "app.window.minimize"
        },
        update: {
            prfFile: "app.update.prfFile",
            theme: "app.toggle.theme",
            themeSystem: "app.toggle.theme.system",
            canvasIndex: "app.update.canvas.index",
            canvasPos: "app.update.canvas.pos"
        },
        msg: {
            error: "app.errmsg",
            warning: "app.wrnmsg",
            info: "app.info"
        },
        func: {
            connectToNetwork: "app.func.connecttonetwork",
            fetchWeather: "app.func.fetchweather",
            initRadar: "app.func.initradar"
        }
    }
}

export default ipcChannel;
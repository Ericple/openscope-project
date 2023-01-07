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
            themeSystem: "app.toggle.theme.system"
        },
        msg: {
            error: "app.errmsg",
            warning: "app.wrnmsg"
        },
        func: {
            connectToNetwork: "app.func.connecttonetwork"
        }
    }
}

export default ipcChannel;
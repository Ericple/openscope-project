import { ipcRenderer } from "electron";
import ipcChannel from "./ipcChannel";

export type BoxMessage = {
    title: string;
    message: string;
    callback?: (response?: number, checkboxChecked?: boolean) => void;
}

export function ErrorBox(options: BoxMessage): void {
    ipcRenderer.invoke(ipcChannel.app.msg.error, {title: options.title, message: options.message});
    ipcRenderer.on(ipcChannel.app.msg.error, (e,args) => {
        if(options.callback) options.callback(args.response, args.checkboxChecked);
    });
}

export function WarningBox(options: BoxMessage): void {
    ipcRenderer.invoke(ipcChannel.app.msg.warning, {title: options.title, message: options.message});
    ipcRenderer.on(ipcChannel.app.msg.warning, (e,args) => {
        if(options.callback) options.callback(args.response, args.checkboxChecked);
    });
}

export function InfoBox(options: BoxMessage): void {
    ipcRenderer.invoke(ipcChannel.app.msg.info, {title: options.title, message: options.message});
    ipcRenderer.on(ipcChannel.app.msg.info, (e,args) => {
        if(options.callback) options.callback(args.response, args.checkboxChecked);
    });
}
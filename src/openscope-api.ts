import * as Electron from 'electron';
export type WindowOptions = Electron.BrowserWindowConstructorOptions;
export function CreateWindow(window: WindowOptions) {
    postMessage(['CreateWindow', window]);
    onmessage = function (e) {
        return e.data[0];
    }
}

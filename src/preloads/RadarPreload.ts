import { contextBridge, ipcRenderer } from "electron";
import ipcChannel from "../lib/ipcChannel";
import elementId from "../lib/elementId";
import Drawer from "../utils/drawer";
contextBridge.exposeInMainWorld('initApp', (rootElement: string) => {
    const drawer = new Drawer(rootElement);
    const connectbtn = document.getElementById(elementId.RadarWindow.Appbar.Buttons.connect);
    const timeIndicator = document.getElementById(elementId.RadarWindow.Appbar.Tags.currentTime);
    const closebtn = document.getElementById(elementId.RadarWindow.Appbar.Buttons.close);
    const restorebtn = document.getElementById(elementId.RadarWindow.Appbar.Buttons.maximizeOrRestore);
    const minimizebtn = document.getElementById(elementId.RadarWindow.Appbar.Buttons.minimize);
    const canvasScreen = document.getElementById(elementId.RadarWindow.Canvas.screen);
    const sectorbtn = document.getElementById(elementId.RadarWindow.Appbar.Buttons.sectorSelect);
    if(canvasScreen == null) return;
    sectorbtn?.addEventListener('click', () => {
        ipcRenderer.invoke(ipcChannel.app.update.prfFile);
    })
    canvasScreen.addEventListener('wheel', (e) => {
        drawer.UpdateCanvasIndex(e);
    });
    canvasScreen.oncontextmenu = function(e) {
        const prex = e.offsetX;
        const prey = e.offsetY;
        canvasScreen.onmousemove = function(ev) {
            drawer.UpdateCanvasPosXY(ev.pageX - prex, ev.pageY - prey);
        }
    };
    canvasScreen.onmouseup = function() {
        canvasScreen.onmousemove = null;
        drawer.ClearCanvas();
    };
    closebtn?.addEventListener('click', () => {
        ipcRenderer.invoke(ipcChannel.app.window.close);
    });
    restorebtn?.addEventListener('click', () => {
        ipcRenderer.invoke(ipcChannel.app.window.maximizeOrRestore);
    });
    minimizebtn?.addEventListener('click', () => {
        ipcRenderer.invoke(ipcChannel.app.window.minimize);
    });
    connectbtn?.addEventListener('click', () => {
        ipcRenderer.invoke(ipcChannel.app.func.connectToNetwork);
    });
    setInterval(function(){
        const date = new Date();
        const hrs = date.getUTCHours().toString().padStart(2,"0");
        const min = date.getUTCMinutes().toString().padStart(2,"0");
        const sec = date.getUTCSeconds().toString().padStart(2,"0");
        if(timeIndicator !== null) timeIndicator.innerText=`${hrs}:${min}:${sec}`;
    }, 1000);
});

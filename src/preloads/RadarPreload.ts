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
    const themebtn = document.getElementById(elementId.RadarWindow.Appbar.Buttons.theme);
    const msgbox = document.querySelectorAll('input')[0];
    const metarContainer = document.getElementById(elementId.RadarWindow.Appbar.Container.metar);
    function defaultKeyDown(e:KeyboardEvent){
        if(msgbox == null) return;
        if(e.code == 'F2') {
            msgbox.value = '.QD ';
            msgbox.focus();
        }
    }
    window.onkeydown = defaultKeyDown;
    msgbox?.addEventListener('focusin', () => {
        if(msgbox == null) return;
        window.onkeydown = function (e) {
            switch(e.key){
                case 'Enter':
                    ResolveBoxData(msgbox.value.toUpperCase());
                    msgbox.value = '';
                    break;
                default:
                    defaultKeyDown(e);
                    break;
            }
        }
    })

    msgbox?.addEventListener('focusout', () => {
        window.onkeydown = defaultKeyDown;
    })

    ipcRenderer.invoke(ipcChannel.app.update.themeSystem);
    themebtn?.addEventListener('click', () => {
        ipcRenderer.invoke(ipcChannel.app.update.theme);
    })
    if (canvasScreen == null) return;
    sectorbtn?.addEventListener('click', () => {
        ipcRenderer.invoke(ipcChannel.app.update.prfFile);
    });
    canvasScreen.addEventListener('wheel', (e) => {
        drawer.UpdateCanvasIndex(e);
    });
    canvasScreen.oncontextmenu = function () {
        // const prex = e.offsetX;
        // const prey = e.offsetY;
        canvasScreen.onmousemove = function (e) {
            // drawer.UpdateCanvasPosXY(ev.pageX - prex, ev.pageY - prey);
            drawer.UpdateCanvasPosXY(e);
        }
    };
    canvasScreen.onmouseup = function () {
        canvasScreen.onmousemove = null;
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
    setInterval(function () {
        const date = new Date();
        const hrs = date.getUTCHours().toString().padStart(2, "0");
        const min = date.getUTCMinutes().toString().padStart(2, "0");
        const sec = date.getUTCSeconds().toString().padStart(2, "0");
        if (timeIndicator !== null) timeIndicator.innerText = `${hrs}:${min}:${sec}`;
    }, 1000);
    function ResolveBoxData(data: string | null) {
        if(data == null) return;
        if(data.startsWith(".QD")){
            const apts = data.split(" ");
            apts.forEach((apt) => {
                if(apt=='.QD') return;
                if(apt=='') {
                    const existtags = document.getElementsByClassName('appbar-metar-tag');
                    for (let index = 0; index < existtags.length; index++) {
                        const el = existtags.item(index);
                        if(el !== null) metarContainer?.removeChild(el);
                    }
                    return;
                }
                const tag = document.createElement('a');
                tag.className = 'appbar-menu-item';
                tag.classList.add('appbar-metar-tag');
                tag.id = apt + 'metar';
                tag.innerText = `${apt} - Fetching...`;
                const existtag = document.getElementById(apt+'metar');
                if(existtag == null) {
                    metarContainer?.appendChild(tag);
                }else{
                    metarContainer?.removeChild(existtag);
                    metarContainer?.appendChild(tag);
                }
            });
            ipcRenderer.invoke(ipcChannel.app.func.fetchWeather, apts);
        }
    
    }
    ipcRenderer.on(ipcChannel.app.func.fetchWeather, (e, args) => {
        const tag = document.getElementById(args.id);
        if(tag == null) return;
        tag.innerText = args.raw;
    });
});
import ipcChannel from '../lib/ipcChannel'
import { ipcRenderer, contextBridge } from 'electron'
import Drawer from '../utils/drawer'
import elementId from '../lib/elementId'
import path from 'path'
import fs from 'fs'
import { DefaultSectorSettingFilePath } from '../lib/global'
contextBridge.exposeInMainWorld('appbar', {
    quitApp: () => ipcRenderer.invoke(ipcChannel.app.window.close),
    maximizeApp: () => ipcRenderer.invoke(ipcChannel.app.window.maximizeOrRestore),
    minimizeApp: () => ipcRenderer.invoke(ipcChannel.app.window.minimize),
    updateTime: () => {
        return getTime()
    },
    openSector: () => ipcRenderer.invoke(ipcChannel.app.update.prfFile)
})
const drawerGroup: Drawer[] = [];
let activeDrawerIndex = 0;
contextBridge.exposeInMainWorld('radar', {
    init: function (rootEl: string) {
        const drawer = new Drawer(rootEl)
        drawerGroup.push(drawer)
        const screen = document.getElementById(elementId.RadarWindow.Canvas.screen)
        if (!screen) return
        screen.addEventListener('wheel', (e) => {
            drawerGroup[activeDrawerIndex].UpdateCanvasIndex(e);
        })
        screen.oncontextmenu = function (ev: MouseEvent) {
            const distX = ev.clientX - screen.offsetLeft;
            const distY = ev.clientY - screen.offsetTop;
            screen.onmousemove = function (e) {
                const tX = e.clientX - distX;
                const tY = e.clientY - distY;
                screen.style.left = `${tX}px`
                screen.style.top = `${tY}px`
                drawerGroup[activeDrawerIndex].UpdateCanvasPosE(e)
            }
        }
        screen.onmouseup = function () {
            drawerGroup[activeDrawerIndex].ClearCanvas();
            screen.style.left = '0px'
            screen.style.top = '45px'
            screen.onmousemove = null
        }
        ipcRenderer.on(ipcChannel.app.update.prfFile, (e, args) => {
            const sectorindicator = document.getElementById(elementId.RadarWindow.Appbar.Tags.currentCoord)
            if (sectorindicator) sectorindicator.innerText = path.basename(args.path)
            if (!fs.existsSync(DefaultSectorSettingFilePath)) {
                fs.openSync(DefaultSectorSettingFilePath, 1)
            }
            fs.writeFileSync(DefaultSectorSettingFilePath, args.path, 'utf-8')
            drawerGroup[activeDrawerIndex].UpdateCache(args.path);
            drawerGroup[activeDrawerIndex].ClearCanvas();
        })
        ipcRenderer.on(ipcChannel.app.func.switchRadarView, (e, args) => {
            //如果所选视图大于已有
            while (args + 1 > drawerGroup.length) {
                drawerGroup.push(new Drawer('radar'))
            }
            drawerGroup.forEach((o) => {
                o.Hide()
            })
            activeDrawerIndex = args
            drawerGroup[args].Show()
        })
    }
})
let isSearchingWx = false
ipcRenderer.on(ipcChannel.app.func.fetchWeather, (e, arg) => {
    isSearchingWx = false
    const metars: string[] = arg.split('\n')
    metars.forEach(metar => {
        const icao = metar.substring(0, 4)
        let exist = false
        for (let index = 0; index < weatherData.length; index++) {
            const weather = weatherData[index];
            if (weather.icao == icao && weather.metar !== metar) {
                weather.metar = metar
                weather.updateTime = getTime()
                exist = true
            }
        }
        if (!exist) weatherData.push({ icao: icao, updateTime: getTime(), metar: metar })
    })
})
const weatherData: { icao: string, metar: string, updateTime: string }[] = []
contextBridge.exposeInMainWorld('weather', {
    requestWx: (icaos: string) => {
        isSearchingWx = true
        ipcRenderer.invoke(ipcChannel.app.func.fetchWeather, icaos)
    },
    weatherData: () => {
        return weatherData
    },
    searchStatus: () => {
        return isSearchingWx
    }
})
const aircraftData: {
    title: string,
    cols: string[],
    contextMenu: any[],
    key: string,
    aircrafts: any[],
}[] = [
        {
            title: 'Departure',
            cols: [
                "C/S", "TYPE", "C", "D", "STS", "R", "DEP", "ARR",
                "RWY", "SIE", "SID", "S/PAD", "ALT", "CRZ", "ASSR"
            ],
            contextMenu: [
                {
                    title: "Clearance",
                    items: [
                        "Unset",
                        "Pending",
                        "Ready"
                    ]
                },
                {
                    title: "Status",
                    items: [
                        "Stand",
                        "Push",
                        "Taxi",
                        "Takeoff",
                        "Climb",
                        "Cruise",
                        "Descend",
                        "Approach"
                    ]
                }
            ],
            key: '1',
            aircrafts: [
                {
                    'C/S': 'CALLSIGN',
                    'TYPE': 'TYPE',
                    'C': 'CLEARANCE',
                    'D': 'UNKNOWN',
                    'STS': 'STATUS',
                    'R': 'UNKNOWN',
                    'DEP': 'A',
                    'ARR': 'B',
                    'RWY': 'C',
                    'SIE': 'SIE',
                },
                {
                    'C/S': 'CALLSIGNB',
                    'TYPE': 'TYPE',
                    'C': 'CLEARANCE',
                    'D': 'UNKNOWN',
                    'STS': 'STATUS',
                    'R': 'UNKNOWN',
                    'DEP': 'A',
                    'ARR': 'B',
                    'RWY': 'C',
                    'SIE': 'SIE',
                }
            ]
        }, {
            title: 'Exit',
            key: '2',
            cols: [
                "RWY", "C/S", "TYPE", "DEP", "ARR", "SIE", "SID",
                "STE", "STAR", "NXT", "EXT", "COPN", "CRZ", "ASSR"
            ],
            contextMenu: [
                "Runway", "C/S", "TYPE", "DEP", "ARR", "SIE", "SID",
                "STE", "STAR", "NXT", "EXT", "COPN", "CRZ", "ASSR"
            ],
            aircrafts: [
            ]
        }, {
            title: 'Inbound',
            key: '3',
            cols: [
                "RWY", "C/S", "TYPE", "R", "DEP", "ARR", "STE", "STAR",
                "NXT", "S/PAD", "ENT", "COPN", "CRZ", "ASSR"
            ],
            contextMenu: [
                "RWY", "C/S", "TYPE", "R", "DEP", "ARR", "STE", "STAR",
                "NXT", "S/PAD", "ENT", "COPN", "CRZ", "ASSR"
            ],
            aircrafts: [
            ]
        }
    ]
let obsAcfData = "";
contextBridge.exposeInMainWorld('acflist', {
    init: () => {
        setInterval(() => {
            ipcRenderer.on(ipcChannel.app.update.obsAcfData, (e, arg) => {
                obsAcfData = arg
            })
        }, 5000)
    },
    aircraftData: () => {
        return aircraftData
    },
    getObsAcfData: () => {
        ipcRenderer.invoke(ipcChannel.app.update.obsAcfData, "ZYTL");
        return obsAcfData;
    }
})
function getTime() {
    const date = new Date()
    const year = date.getUTCFullYear().toString()
    const month = (date.getUTCMonth() + 1).toString()
    const day = date.getUTCDate().toString()
    const hrs = date.getUTCHours().toString().padStart(2, "0")
    const min = date.getUTCMinutes().toString().padStart(2, "0")
    const sec = date.getUTCSeconds().toString().padStart(2, "0")
    return `${month}/${day}/${year} ${hrs}:${min}:${sec}`
}
console.log('preloaded')
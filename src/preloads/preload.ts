import ipcChannel from '../lib/ipcChannel'
import { ipcRenderer, contextBridge } from 'electron'
import Drawer from '../utils/drawer'
import elementId from '../lib/elementId'
contextBridge.exposeInMainWorld('appbar', {
    quitApp: () => ipcRenderer.invoke(ipcChannel.app.window.close),
    maximizeApp: () => ipcRenderer.invoke(ipcChannel.app.window.maximizeOrRestore),
    minimizeApp: () => ipcRenderer.invoke(ipcChannel.app.window.minimize),
    updateTime: () => {
        return getTime()
    },
    openSector: () => ipcRenderer.invoke(ipcChannel.app.update.prfFile)
})

contextBridge.exposeInMainWorld('radar', {
    init: function (rootEl: string) {
        const drawer = new Drawer(rootEl);
        const screen = document.getElementById(elementId.RadarWindow.Canvas.screen);
        if (!screen) return;
        screen.addEventListener('wheel', (e) => {
            drawer.UpdateCanvasIndex(e);
        });
        screen.oncontextmenu = function () {
            screen.onmousemove = function (e) {
                drawer.UpdateCanvasPosXY(e);
            }
        };
        screen.onmouseup = function () {
            screen.onmousemove = null;
        };
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
contextBridge.exposeInMainWorld('acflist', {
    aircraftData: () => {
        return aircraftData
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
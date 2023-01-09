import { AsrData, EseData, PrfData, SctData } from "../lib/sectortype";
import elementId from "../lib/elementId";
import { LoadAsrFileSync, LoadPrfFileSync, LoadSctFileSync, LoadEseFileSync, ReadPrfData, ConvertEsePath, ReadSctFix, ReadSymbol, ReadEseFreeText, ReadSctGeo, ReadSctRegions, ReadSctDefine, AlignPath, ReadSctLoHiAw, ReadSctAirport, ReadSctVORNDB, ReadSctARTCC, ReadSctSidStar, ReadSctRunway } from "./sectorloader";
import { VoiceData, SymbologyData, ProfileData } from "../lib/settingtype";
import { LoadSymbologySync, LoadVoiceSync, LoadProfileSync } from "./settingloader";
import { ipcRenderer } from "electron";
import ipcChannel from "../lib/ipcChannel";
import path from 'path';
import { SctSIDSTAR, SctVorNdb } from "../lib/datatype";
import fs from 'fs';
import { DefaultSectorSettingFilePath } from "../global";

const SCROLL_INDEX = 1.2;
const AP_FREETEXT_LIMIT = 20000;//要显示机场FREETEXT的最小缩放倍数
const FIX_NAME_LIMIT = 150;
const AW_NAME_LIMIT_MIN = 100;
const AW_NAME_LIMIT_MAX = 150;
const ZOOM_INDEX_MAX = 250000;//最大缩放倍数
export class Drawer {
    public rootElement: HTMLElement | null;
    public canvas: HTMLCanvasElement;
    public canvasContext: CanvasRenderingContext2D | null;
    public coordIndicator: HTMLElement | null;
    public canvasIndex: number;
    public canvasPosX: number;
    public canvasPosY: number;
    public prfCache: PrfData | undefined;
    public asrCache: AsrData | undefined;
    public sectorCache: SctData | undefined;
    public eseCache: EseData | undefined;
    public symbolCache: SymbologyData | undefined;
    public voiceCache: VoiceData | undefined;
    public profileCache: ProfileData | undefined;
    constructor(rootElement: string) {
        this.canvas = document.createElement('canvas');
        this.canvasContext = this.canvas.getContext('2d');
        this.coordIndicator = document.getElementById(elementId.RadarWindow.Appbar.Tags.currentCoord);
        this.rootElement = document.getElementById(rootElement);
        this.rootElement?.appendChild(this.canvas);
        this.canvasIndex = 1;
        this.canvasPosX = 0;
        this.canvasPosY = 0;
        //当页面大小被改变时，重新进行绘制
        window.addEventListener('resize', () => {
            this.ClearCanvas();
        });
        //处理扇区选择
        ipcRenderer.on(ipcChannel.app.update.prfFile, (e, args) => {
            const sectorindicator = document.getElementById(elementId.RadarWindow.Appbar.Tags.currentSector);
            if (sectorindicator !== null) sectorindicator.innerText = path.basename(args.path);
            //更新默认开启扇区
            fs.writeFileSync(DefaultSectorSettingFilePath, args.path, 'utf-8');
            //更新绘制缓存
            this.UpdateCache(args.path);
            //绘制
            this.ClearCanvas();
        });
    }
    public ClearCanvas(): void {
        this.canvas.height = window.innerHeight - 136;
        this.canvas.width = window.innerWidth;
        this.Draw();
    }
    public UpdateCanvasIndex(event: WheelEvent): void {
        const xresult = this.canvasPosX + (event.movementX) / this.canvasIndex;
        const yresult = this.canvasPosY + (event.movementY) / this.canvasIndex;
        this.canvasPosX = xresult;
        this.canvasPosY = yresult;
        if (event.deltaY < 0) {
            const result = this.canvasIndex * SCROLL_INDEX;
            if (result < ZOOM_INDEX_MAX) this.canvasIndex = result;
        }
        else {
            const result = this.canvasIndex / SCROLL_INDEX;
            if (result > 1) this.canvasIndex = result;
        }
        /**
         * 检测canvasIndex是否小于绘制FREETEXT的最低要求
         */
        if (this.canvasIndex < AP_FREETEXT_LIMIT) {
            this.asrCache?.items.forEach((item) => {
                if (item.name.lastIndexOf("\\") !== -1) item.draw = false;
            });
        } else {
            this.asrCache?.items.forEach((item) => {
                if (item.name.lastIndexOf("\\") !== -1) item.draw = true;
            });
        }
        /**
         * 检测canvasIndex是否小于绘制FIXNAME的最低要求
         */
        if (this.canvasIndex < FIX_NAME_LIMIT) {
            this.asrCache?.items.forEach((item) => {
                if (item.type == "Fixes") item.draw = false;
            });
        } else {
            this.asrCache?.items.forEach((item) => {
                if (item.type == "Fixes") item.draw = true;
            });
        }
        /**
         * 检测canvasIndex是否在限定绘制Airways name的范围
         */
        if (this.canvasIndex > AW_NAME_LIMIT_MIN && this.canvasIndex < AW_NAME_LIMIT_MAX) {
            this.asrCache?.items.forEach((item) => {
                if (item.type.endsWith("airways") && item.flag == "name") item.draw = true;
            });
        } else {
            this.asrCache?.items.forEach((item) => {
                if (item.type.endsWith("airways") && item.flag == "name") item.draw = false;
            });
        }
        if (!this.coordIndicator) return;
        this.coordIndicator.innerText = `Lat: ${this.canvasPosY} Lon: ${-this.canvasPosX}`;
        this.ClearCanvas();
    }
    public UpdateCanvasPosXY(e: MouseEvent): void {
        const xresult = this.canvasPosX + (e.movementX) / this.canvasIndex;
        const yresult = this.canvasPosY + (e.movementY) / this.canvasIndex;
        this.canvasPosX = xresult;
        this.canvasPosY = yresult;
        if (!this.coordIndicator) return;
        this.coordIndicator.innerText = `Lat: ${this.canvasPosY} Lon: ${-this.canvasPosX}`;
        this.ClearCanvas();
    }
    /**
     * 更新绘制缓存
     * @param prfPath prf文件目录
     */
    public UpdateCache(prfPath: string): void {
        this.prfCache = LoadPrfFileSync(prfPath);
        let asrpath = ReadPrfData(this.prfCache, "Recent1");
        if (!asrpath) return;
        asrpath = path.join(prfPath, "..", AlignPath(asrpath));
        this.asrCache = LoadAsrFileSync(asrpath);
        let sctpath = ReadPrfData(this.prfCache, "sector");
        if (!sctpath) return;
        sctpath = path.join(prfPath, "..", AlignPath(sctpath));
        this.sectorCache = LoadSctFileSync(sctpath);
        const esepath = ConvertEsePath(sctpath);
        this.eseCache = LoadEseFileSync(esepath);
        let symbologypath = ReadPrfData(this.prfCache, "SettingsfileSYMBOLOGY");
        if (!symbologypath) return;
        symbologypath = path.join(prfPath, "..", AlignPath(symbologypath));
        this.symbolCache = LoadSymbologySync(symbologypath);
        const backgroundColor = ReadSymbol(this.symbolCache.colors, "Sector", "active sector background")?.color;
        if (backgroundColor !== undefined) this.canvas.style.backgroundColor = backgroundColor;
        let voicepath = ReadPrfData(this.prfCache, "SettingsfileVOICE");
        if (!voicepath) return;
        voicepath = path.join(prfPath, "..", AlignPath(voicepath));
        this.voiceCache = LoadVoiceSync(voicepath);
        let profilepath = ReadPrfData(this.prfCache, "SettingsfilePROFILE");
        if (!profilepath) return;
        profilepath = path.join(prfPath, "..", AlignPath(profilepath));
        this.profileCache = LoadProfileSync(profilepath);
    }
    public Draw(): void {
        if (!this.canvasContext) return;
        this.canvasContext.translate(window.innerWidth / 2, window.innerHeight / 2);
        this.canvasContext.translate(this.canvasPosX, this.canvasPosY);
        this.canvasContext.translate(this.canvasPosX * (this.canvasIndex - 1), this.canvasPosY * (this.canvasIndex - 1));
        if (!this.asrCache) return;
        this.asrCache.items.forEach((item) => {
            if (!this.sectorCache || !this.symbolCache) return;
            if (item.type == "Regions") {
                const regions = ReadSctRegions(this.sectorCache.REGIONs, item.name);//从缓存中提取出对应regions区域
                if (!regions) return;//如果缓存中不存在该区域，则返回，进行下一次操作
                regions.items.forEach((item) => {//对每个提取出来的区域进行绘制
                    if (!this.sectorCache || !this.canvasContext) return;
                    this.canvasContext.beginPath();//开始绘制
                    const color = ReadSctDefine(this.sectorCache.definitions, item.colorFlag);//从缓存中提取出对应的颜色，region的颜色被定义在sct中
                    if (!color) return;//如果sct中不存在对应的颜色flag定义，说明扇区有问题或读取失败
                    this.canvasContext.lineWidth = 0.1;
                    this.canvasContext.strokeStyle = color;
                    this.canvasContext.fillStyle = color;
                    const count = item.coords.length;//获取坐标总数，为for循环做好准备
                    const line = new Path2D();//新建一个二维路径
                    line.moveTo(item.coords[0].longtitude * this.canvasIndex, item.coords[0].latitude * this.canvasIndex);//将二维路径绘制点移动到初始坐标
                    // this.canvasContext.moveTo(item.coords[0].longtitude * this.canvasIndex, item.coords[0].latitude * this.canvasIndex);
                    for (let index = 1; index < count; index++) {//循环绘制下一个坐标
                        const coord = item.coords[index];
                        // console.log("drawing",coord.longtitude, coord.latitude);
                        line.lineTo(coord.longtitude * this.canvasIndex, coord.latitude * this.canvasIndex);
                        // this.canvasContext.lineTo(coord.longtitude * this.canvasIndex, coord.latitude * this.canvasIndex);
                    }
                    // line.moveTo(coord0.longtitude * this.canvasIndex, coord0.latitude * this.canvasIndex);//将二维路径绘制点移动到初始坐标
                    line.closePath();//闭合路径
                    // this.canvasContext.closePath();
                    this.canvasContext.stroke(line);
                    this.canvasContext.fill(line);
                });
            }
        })
        this.asrCache.items.forEach((item) => {
            if (!item.draw) return;
            if (!this.canvasContext) return;
            if (!this.sectorCache || !this.symbolCache || !this.eseCache) return;
            if (item.type == "Fixes")//绘制fix的symbol或name
            {
                const coord = ReadSctFix(this.sectorCache.fixes, item.name);
                if (!coord) return;
                const symbol = ReadSymbol(this.symbolCache.colors, item.type, item.flag);
                if (!symbol) return;
                this.canvasContext.fillStyle = symbol.color;
                if (item.flag == "name") {
                    this.canvasContext.font = symbol.fontSymbolSize * 2.5 + "px Arial";
                    this.canvasContext.fillText(item.name, coord.longtitude * this.canvasIndex, coord.latitude * this.canvasIndex);
                }
                else {
                    //这里的代码后续需要实现DrawScript
                    const size = symbol.fontSymbolSize;
                    this.canvasContext.fillRect(coord.longtitude * this.canvasIndex, coord.latitude * this.canvasIndex, size, size);
                }
            }
            if (item.type == "Geo")//绘制地面线
            {
                const geogroup = ReadSctGeo(this.sectorCache.GEOs, item.name);
                const symbol = ReadSymbol(this.symbolCache.colors, item.type, "line");
                if (!geogroup || !symbol) return;
                this.canvasContext.lineWidth = symbol.lineWeight + this.canvasIndex / 100000;
                geogroup.forEach((geo) => {
                    if (!this.sectorCache || !this.canvasContext) return;
                    const colorDef = ReadSctDefine(this.sectorCache.definitions, geo.colorFlag);
                    if (!colorDef) return;
                    const line = new Path2D();
                    line.moveTo(geo.coordA.longtitude * this.canvasIndex, geo.coordA.latitude * this.canvasIndex);
                    line.lineTo(geo.coordB.longtitude * this.canvasIndex, geo.coordB.latitude * this.canvasIndex);
                    this.canvasContext.strokeStyle = colorDef;
                    this.canvasContext.stroke(line);
                });
            }
            if (item.type == "High airways")//绘制高空航路
            {
                const aw = ReadSctLoHiAw(this.sectorCache.hiAirways, item.name);
                // console.log(aw)
                if (!aw) return;
                aw.coords.forEach(coord => {
                    if (!coord || !this.symbolCache || !this.canvasContext) return;
                    const symbol = ReadSymbol(this.symbolCache.colors, item.type, item.flag);
                    if (!symbol) return;
                    const line = new Path2D();
                    line.moveTo(coord.coordA.longtitude * this.canvasIndex, coord.coordA.latitude * this.canvasIndex);
                    line.lineTo(coord.coordB.longtitude * this.canvasIndex, coord.coordB.latitude * this.canvasIndex);
                    if (item.flag == "name") {
                        this.canvasContext.fillStyle = symbol.color;
                        this.canvasContext.font = symbol.fontSymbolSize * 3 + "px Arial";
                        this.canvasContext.fillText(aw.group, (coord.coordA.longtitude * this.canvasIndex + coord.coordB.longtitude * this.canvasIndex) / 2, (coord.coordA.latitude * this.canvasIndex + coord.coordB.latitude * this.canvasIndex) / 2)
                    }
                    else {
                        this.canvasContext.lineWidth = symbol.lineWeight;
                        this.canvasContext.strokeStyle = symbol.color;
                        this.canvasContext.stroke(line);
                    }
                });
            }
            if (item.type == "Low airways")//绘制低空航路
            {
                const aw = ReadSctLoHiAw(this.sectorCache.hiAirways, item.name);
                // console.log(aw);
                if (!aw) return;
                aw.coords.forEach(coord => {
                    if (!coord || !this.symbolCache || !this.canvasContext) return;
                    const symbol = ReadSymbol(this.symbolCache.colors, item.type, item.flag);
                    if (!symbol) return;
                    const line = new Path2D();
                    line.moveTo(coord.coordA.longtitude * this.canvasIndex, coord.coordA.latitude * this.canvasIndex);
                    line.lineTo(coord.coordB.longtitude * this.canvasIndex, coord.coordB.latitude * this.canvasIndex);
                    if (item.flag == "name") {
                        this.canvasContext.fillStyle = symbol.color;
                        this.canvasContext.font = symbol.fontSymbolSize * 3 + "px Arial";
                        this.canvasContext.fillText(aw.group, (coord.coordA.longtitude * this.canvasIndex + coord.coordB.longtitude * this.canvasIndex) / 2, (coord.coordA.latitude * this.canvasIndex + coord.coordB.latitude * this.canvasIndex) / 2)
                    }
                    else {
                        this.canvasContext.lineWidth = symbol.lineWeight;
                        this.canvasContext.setLineDash([15, 25]);
                        this.canvasContext.strokeStyle = symbol.color;
                        this.canvasContext.stroke(line);
                    }
                });
            }
            if (item.type == "Runways") {
                const nameItems = item.name.split(" ");
                const runway = ReadSctRunway(this.sectorCache.runways, nameItems[0], nameItems[2]);
                const symbol = ReadSymbol(this.symbolCache.colors, item.type, item.flag);
                if (!runway || !symbol) return;
                this.canvasContext.strokeStyle = symbol.color;
                this.canvasContext.font = symbol.fontSymbolSize * 2.3 + "px Arial";
                if (item.flag == "name") {
                    this.canvasContext.fillText(runway.endPointA, runway.coordA.longtitude * this.canvasIndex, runway.coordA.latitude * this.canvasIndex);
                    this.canvasContext.fillText(runway.endPointB, runway.coordB.longtitude * this.canvasIndex, runway.coordB.latitude * this.canvasIndex);
                }
                else {
                    const line = new Path2D();
                    line.moveTo(runway.coordA.longtitude * this.canvasIndex, runway.coordA.latitude * this.canvasIndex);
                    line.lineTo(runway.coordB.longtitude * this.canvasIndex, runway.coordB.latitude * this.canvasIndex);
                    this.canvasContext.stroke(line);
                }
            }
            if (item.type == "NDBs" || item.type == "VORs") {
                let vorndb: SctVorNdb | undefined;
                if (item.type == "NDBs") vorndb = ReadSctVORNDB(this.sectorCache.ndbs, item.name);
                if (item.type == "VORs") vorndb = ReadSctVORNDB(this.sectorCache.vors, item.name);
                if (!vorndb) return;
                const symbol = ReadSymbol(this.symbolCache.colors, item.type, item.flag);
                if (!symbol) return;
                this.canvasContext.fillStyle = symbol.color;
                const size = symbol.fontSymbolSize;
                this.canvasContext.font = size * 2.3 + "px Arial";
                if (item.flag == "name") {
                    this.canvasContext.fillText(vorndb.name, vorndb.coord.longtitude * this.canvasIndex, vorndb.coord.latitude * this.canvasIndex);
                }
                else {
                    //这里同样要实现绘制脚本
                    this.canvasContext.fillRect(vorndb.coord.longtitude * this.canvasIndex, vorndb.coord.latitude * this.canvasIndex, size, size)
                }
            }
            if (item.type == "Airports") {
                const airport = ReadSctAirport(this.sectorCache.airports, item.name);
                if (!airport) return;
                const symbol = ReadSymbol(this.symbolCache.colors, item.type, item.flag);
                if (!symbol) return;
                this.canvasContext.fillStyle = symbol.color;
                const size = symbol.fontSymbolSize;
                this.canvasContext.font = size * 2.3 + "px Arial";
                if (item.flag == "name") {
                    this.canvasContext.fillText(airport.icao, airport.coord.longtitude * this.canvasIndex, airport.coord.latitude * this.canvasIndex);
                }
                else {
                    this.canvasContext.fillRect(airport.coord.longtitude * this.canvasIndex, airport.coord.latitude * this.canvasIndex, size, size);
                }
            }
            if (item.type == "Free Text")//绘制freetext
            {
                const groupandtext = item.name.split("\\");
                const origincoord = ReadEseFreeText(this.eseCache.freetexts, groupandtext[0], groupandtext[1]);
                const symbol = ReadSymbol(this.symbolCache.colors, "Other", item.flag);
                if (!origincoord) return;
                if (!symbol) return;
                this.canvasContext.font = symbol.fontSymbolSize * 3.3 + "px Arial";
                this.canvasContext.fillText(groupandtext[1], origincoord.longtitude * this.canvasIndex, origincoord.latitude * this.canvasIndex);
            }
            if (item.type == "ARTCC boundary") {
                const artcc = ReadSctARTCC(this.sectorCache.ARTCCs, item.name);
                const symbol = ReadSymbol(this.symbolCache.colors, item.type, "line");
                if (!symbol || !artcc) return;
                this.canvasContext.lineWidth = symbol.lineWeight;
                this.canvasContext.strokeStyle = symbol.color;
                artcc.coords.forEach((coord) => {
                    const line = new Path2D();
                    line.moveTo(coord.coordA.longtitude * this.canvasIndex, coord.coordA.latitude * this.canvasIndex);
                    line.lineTo(coord.coordB.longtitude * this.canvasIndex, coord.coordB.latitude * this.canvasIndex);
                    this.canvasContext?.stroke(line);
                });
            }
            if (item.type == "Sids" || item.type == "Stars") {
                let sidstar: SctSIDSTAR | undefined;
                if (item.type == "Sids") sidstar = ReadSctSidStar(this.sectorCache.sids, item.name);
                if (item.type == "Stars") sidstar = ReadSctSidStar(this.sectorCache.stars, item.name);
                const symbol = ReadSymbol(this.symbolCache.colors, item.type, "line");
                if (!sidstar || !symbol) return;
                this.canvasContext.lineWidth = symbol.lineWeight;
                this.canvasContext.strokeStyle = symbol.color;
                this.canvasContext.setLineDash([5, 5]);
                sidstar.coords.forEach((coordpair) => {
                    const line = new Path2D();
                    line.moveTo(coordpair.coordA.longtitude * this.canvasIndex, coordpair.coordA.latitude * this.canvasIndex);
                    line.lineTo(coordpair.coordB.longtitude * this.canvasIndex, coordpair.coordB.latitude * this.canvasIndex);
                    this.canvasContext?.stroke(line);
                });
            }
        });
    }
}

export default Drawer;
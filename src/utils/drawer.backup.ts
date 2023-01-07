import { AsrData, EseData, PrfData, SctData } from "../lib/sectortype";
import elementId from "../lib/elementId";
import { LoadAsrFileSync, LoadPrfFileSync, LoadSctFileSync, LoadEseFileSync, ReadPrfData, ConvertEsePath, ReadSctFix, ReadSymbol, ReadEseFreeText, ReadSctGeo, ReadSctRegions, ReadSctDefine, AlignPath, ReadSctLoHiAw, ReadSctAirport, ReadSctVORNDB, ReadSctARTCC, ReadSctSidStar, ReadSctRunway } from "./sectorloader";
import { VoiceData, SymbologyData, ProfileData } from "../lib/settingtype";
import { LoadSymbologySync, LoadVoiceSync, LoadProfileSync } from "./settingloader";
import { parse2CoordB } from "../lib/coordparser";
import { ipcRenderer } from "electron";
import ipcChannel from "../lib/ipcChannel";
import path from 'path';
import { SctSIDSTAR, SctVorNdb } from "../lib/datatype";
import fs from 'fs';
import { DefaultSectorSettingFilePath } from "../global";

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
    constructor(rootElement: string)
    {
        this.canvas = document.createElement('canvas');
        this.canvasContext = this.canvas.getContext('2d');
        if(this.canvasContext == undefined) throw "";
        this.coordIndicator = document.getElementById(elementId.RadarWindow.Appbar.Tags.currentCoord);
        this.rootElement = document.getElementById(rootElement);
        if(this.rootElement == undefined) throw "";
        this.rootElement.appendChild(this.canvas);
        this.canvasIndex = 1;
        this.canvasPosX = 0;
        this.canvasPosY = 0;
        //当页面大小被改变时，重新进行绘制
        window.addEventListener('resize', () => {
            this.ClearCanvas();
        });
        //处理扇区选择
        ipcRenderer.on(ipcChannel.app.update.prfFile,(e, args) => {
            const sectorindicator = document.getElementById(elementId.RadarWindow.Appbar.Tags.currentSector);
            if(sectorindicator !== null) sectorindicator.innerText = path.basename(args.path);
            //更新默认开启扇区
            fs.writeFile(DefaultSectorSettingFilePath,args.path,'utf-8',(err)=>{
                if(err) throw err;
                console.log("default sector changed");
            });
            //更新绘制缓存
            this.UpdateCache(args.path);
            //绘制
            this.ClearCanvas();
        });
    }
    public ClearCanvas(e?: MouseEvent) : void
    {
        this.canvas.height = window.innerHeight - 136;
        this.canvas.width = window.innerWidth;
        this.Draw(e);
    }
    public UpdateCanvasIndex(event: WheelEvent) : void
    {
        if(event.deltaY < 0)
        {
            const result = this.canvasIndex * 1.1;
            if(result < 30000) this.canvasIndex = result;
        }
        else
        {
            const result = this.canvasIndex / 1.1;
            if(result > 1) this.canvasIndex = result;
        }
        if(this.coordIndicator == null) return;
        this.coordIndicator.innerText = `Lat: ${this.canvasPosY} Lon: ${-this.canvasPosX} Index: ${this.canvasIndex}`;
        this.ClearCanvas(event);
    }
    public UpdateCanvasPosXY(x: number, y: number) : void
    {
        const xresult = this.canvasPosX + (x)/this.canvasIndex;
        const yresult = this.canvasPosY + (y)/this.canvasIndex;
        this.canvasPosX = xresult;
        this.canvasPosY = yresult;
        if(this.coordIndicator == null) return;
        this.coordIndicator.innerText = `Lat: ${this.canvasPosY} Lon: ${-this.canvasPosX} Index: ${this.canvasIndex}`;
        this.ClearCanvas();
    }
    /**
     * 更新绘制缓存
     * @param prfPath prf文件目录
     */
    public UpdateCache(prfPath: string) : void
    {
        this.prfCache = LoadPrfFileSync(prfPath);
        let asrpath = ReadPrfData(this.prfCache, "Recent1");
        if(asrpath == undefined) return;
        asrpath = path.join(prfPath, "..", AlignPath(asrpath));
        this.asrCache = LoadAsrFileSync(asrpath);
        let sctpath = ReadPrfData(this.prfCache, "sector");
        if(sctpath == undefined) return;
        sctpath = path.join(prfPath, "..", AlignPath(sctpath));
        this.sectorCache = LoadSctFileSync(sctpath);
        const esepath = ConvertEsePath(sctpath);
        this.eseCache = LoadEseFileSync(esepath);
        let symbologypath = ReadPrfData(this.prfCache, "SettingsfileSYMBOLOGY");
        if(symbologypath == undefined) return;
        symbologypath = path.join(prfPath, "..", AlignPath(symbologypath));
        this.symbolCache = LoadSymbologySync(symbologypath);
        const backgroundColor = ReadSymbol(this.symbolCache.colors, "Sector", "active sector background")?.color;
        if(backgroundColor !== undefined) this.canvas.style.backgroundColor = backgroundColor;
        let voicepath = ReadPrfData(this.prfCache, "SettingsfileVOICE");
        if(voicepath == undefined) return;
        voicepath = path.join(prfPath, "..", AlignPath(voicepath));
        this.voiceCache = LoadVoiceSync(voicepath);
        let profilepath = ReadPrfData(this.prfCache, "SettingsfilePROFILE");
        if(profilepath == undefined) throw "Invalid profile settings file";
        profilepath = path.join(prfPath, "..", AlignPath(profilepath));
        this.profileCache = LoadProfileSync(profilepath);
    }
    public Draw(e?: MouseEvent) : void
    {
        if(this.canvasContext == undefined) return;
        this.canvasContext.translate(this.canvasPosX, this.canvasPosY);
        this.canvasContext.translate(this.canvasPosX * (this.canvasIndex - 1), this.canvasPosY * (this.canvasIndex - 1));
        if(e !== undefined) {
            this.canvasContext.translate(this.canvasPosX * (this.canvasIndex - 1), this.canvasPosY * (this.canvasIndex - 1));
            this.canvasContext.translate(e.offsetX, e.offsetY);
        }
        if(this.asrCache == undefined) return;
        this.asrCache.items.forEach((item) => {
            if(!item.draw) return;
            if(this.canvasContext == null) return;
            if(this.sectorCache == undefined || this.symbolCache == undefined || this.eseCache == undefined) return;
            if(item.type == "Fixes")//绘制fix的symbol或name
            {
                const origincoord = ReadSctFix(this.sectorCache.fixes, item.name);
                if(origincoord == undefined) return;
                const coord = parse2CoordB(origincoord);
                const symbol = ReadSymbol(this.symbolCache.colors, item.type, item.flag);
                if(symbol == undefined) return;
                this.canvasContext.fillStyle = symbol.color;
                if(item.flag == "name")
                {
                    this.canvasContext.font = symbol.fontSymbolSize * 2.5 + "px Arial";
                    this.canvasContext.fillText(item.name, coord.longtitude * this.canvasIndex, coord.latitude * this.canvasIndex);
                }
                else
                {
                    //这里的代码后续需要实现DrawScript
                    const size = symbol.fontSymbolSize;
                    this.canvasContext.fillRect(coord.longtitude * this.canvasIndex, coord.latitude * this.canvasIndex, size, size);
                }
            }
            if(item.type == "Free Text")//绘制freetext
            {
                const groupandtext = item.name.split("\\");
                const origincoord = ReadEseFreeText(this.eseCache.freetexts, groupandtext[0], groupandtext[1]);
                const symbol = ReadSymbol(this.symbolCache.colors, "Other", item.flag);
                if(origincoord == undefined) return;
                const coord = parse2CoordB(origincoord);
                if(symbol == undefined) return;
                this.canvasContext.font = symbol.fontSymbolSize * 3 + "px Arial";
                this.canvasContext.fillText(groupandtext[1], coord.longtitude * this.canvasIndex, coord.latitude * this.canvasIndex);
            }
            if(item.type == "Geo")//绘制地面线
            {
                const geogroup = ReadSctGeo(this.sectorCache.GEOs, item.name);
                const symbol = ReadSymbol(this.symbolCache.colors, item.type, "line");
                if(geogroup == undefined || symbol == undefined) return;
                this.canvasContext.lineWidth = symbol.lineWeight;
                geogroup.forEach((geo) => {
                    if(this.sectorCache == undefined || this.canvasContext == undefined) return;
                    const colorDef = ReadSctDefine(this.sectorCache.definitions, geo.colorFlag);
                    if(colorDef == undefined) return;
                    const coordA = parse2CoordB(geo.coordA);
                    const coordB = parse2CoordB(geo.coordB);
                    const line = new Path2D();
                    line.moveTo(coordA.longtitude * this.canvasIndex, coordA.latitude * this.canvasIndex);
                    line.lineTo(coordB.longtitude * this.canvasIndex, coordB.latitude * this.canvasIndex);
                    this.canvasContext.strokeStyle = colorDef;
                    this.canvasContext.stroke(line);
                });
            }
            if(item.type == "High airways")//绘制高空航路
            {
                const aw = ReadSctLoHiAw(this.sectorCache.hiAirways, item.name);
                // console.log(aw)
                if(aw == undefined) return;
                aw.coords.forEach(coord => {
                    if(coord == undefined || this.symbolCache == undefined || this.canvasContext == undefined) return;
                    const symbol = ReadSymbol(this.symbolCache.colors, item.type, item.flag);
                    if(symbol == undefined) return;
                    const line = new Path2D();
                    line.moveTo(coord.coordA.longtitude * this.canvasIndex, coord.coordA.latitude * this.canvasIndex);
                    line.lineTo(coord.coordB.longtitude * this.canvasIndex, coord.coordB.latitude * this.canvasIndex);
                    if(item.flag == "name")
                    {
                        this.canvasContext.fillStyle = symbol.color;
                        this.canvasContext.font = symbol.fontSymbolSize * 3 + "px Arial";
                        this.canvasContext.fillText(aw.group, (coord.coordA.longtitude * this.canvasIndex + coord.coordB.longtitude * this.canvasIndex) / 2, (coord.coordA.latitude * this.canvasIndex + coord.coordB.latitude * this.canvasIndex) / 2)
                    }
                    else
                    {
                        this.canvasContext.lineWidth = symbol.lineWeight;
                        this.canvasContext.strokeStyle = symbol.color;
                        this.canvasContext.stroke(line);
                    }
                });
            }
            if(item.type == "Low airways")//绘制低空航路
            {
                const aw = ReadSctLoHiAw(this.sectorCache.hiAirways, item.name);
                // console.log(aw);
                if(aw == undefined) return;
                aw.coords.forEach(coord => {
                    // console.log("trying to draw loaw...",coordA.latitude,coordA.longtitude,coordB.latitude,coordB.longtitude)
                    if(coord == undefined || this.symbolCache == undefined || this.canvasContext == undefined) return;
                    const symbol = ReadSymbol(this.symbolCache.colors, item.type, item.flag);
                    console.log(symbol);
                    if(symbol == undefined) return;
                    const line = new Path2D();
                    line.moveTo(coord.coordA.longtitude * this.canvasIndex, coord.coordA.latitude * this.canvasIndex);
                    line.lineTo(coord.coordB.longtitude * this.canvasIndex, coord.coordB.latitude * this.canvasIndex);
                    if(item.flag == "name")
                    {
                        this.canvasContext.fillStyle = symbol.color;
                        this.canvasContext.font = symbol.fontSymbolSize * 3 + "px Arial";
                        this.canvasContext.fillText(aw.group, (coord.coordA.longtitude * this.canvasIndex + coord.coordB.longtitude * this.canvasIndex) / 2, (coord.coordA.latitude * this.canvasIndex + coord.coordB.latitude * this.canvasIndex) / 2)
                    }
                    else
                    {
                        this.canvasContext.lineWidth = symbol.lineWeight;
                        this.canvasContext.setLineDash([15,25]);
                        this.canvasContext.strokeStyle = symbol.color;
                        this.canvasContext.stroke(line);
                    }
                });
            }
            if(item.type == "Regions")
            {
                /**
                 * 这个if内的代码有问题，不知道为什么就是绘制不出来……
                 * 有没有大佬能够排故？非常感谢
                 * 我已经在这熬了快六个小时了……
                 * 目前可以公开的情报：
                 * 1. 已知所有变量都不为空，不是这个问题
                 * 2. 没有2了。
                 */
                const regions = ReadSctRegions(this.sectorCache.REGIONs, item.name);
                if(regions == undefined) return;
                regions.items.forEach((region) => {
                    if(this.sectorCache == undefined || this.canvasContext == undefined) return;
                    const color = ReadSctDefine(this.sectorCache.definitions, region.colorFlag);
                    if(color == undefined) return;
                    this.canvasContext.beginPath();
                    const coord0 = parse2CoordB(region.coords[0]);
                    const count = region.coords.length;
                    // const line = new Path2D();
                    // line.moveTo(coord0.longtitude * this.canvasIndex, coord0.latitude * this.canvasIndex);
                    this.canvasContext.moveTo(coord0.longtitude * this.canvasIndex, coord0.latitude * this.canvasIndex);
                    for(let index = 0; index < count; index++)
                    {
                        const coord = parse2CoordB(region.coords[index]);
                        // line.lineTo(coord.longtitude * this.canvasIndex, coord.latitude * this.canvasIndex);
                        this.canvasContext.lineTo(coord.longtitude * this.canvasIndex, coord.latitude * this.canvasIndex);
                    }
                    // line.closePath();
                    this.canvasContext.closePath();
                    this.canvasContext.lineWidth = 0.1;
                    this.canvasContext.strokeStyle = color;
                    this.canvasContext.fillStyle = color;
                    this.canvasContext.stroke();
                    this.canvasContext.fill();
                });
            }
            if(item.type == "Runways")
            {
                const nameItems = item.name.split(" ");
                const runway = ReadSctRunway(this.sectorCache.runways, nameItems[0], nameItems[2]);
                const symbol = ReadSymbol(this.symbolCache.colors, item.type, item.flag);
                if(runway == undefined || symbol == undefined) return;
                this.canvasContext.strokeStyle = symbol.color;
                this.canvasContext.font = symbol.fontSymbolSize * 2.3 + "px Arial";
                if(item.flag == "name")
                {
                    this.canvasContext.fillText(runway.endPointA, runway.coordA.longtitude * this.canvasIndex, runway.coordA.latitude * this.canvasIndex);
                    this.canvasContext.fillText(runway.endPointB, runway.coordB.longtitude * this.canvasIndex, runway.coordB.latitude * this.canvasIndex);
                }
                else
                {
                    const line = new Path2D();
                    line.moveTo(runway.coordA.longtitude * this.canvasIndex, runway.coordA.latitude * this.canvasIndex);
                    line.lineTo(runway.coordB.longtitude * this.canvasIndex, runway.coordB.latitude * this.canvasIndex);
                    this.canvasContext.stroke(line);
                }
            }
            if(item.type == "NDBs" || item.type == "VORs")
            {
                let vorndb: SctVorNdb | undefined;
                if(item.type == "NDBs") vorndb = ReadSctVORNDB(this.sectorCache.ndbs, item.name);
                if(item.type == "VORs") vorndb = ReadSctVORNDB(this.sectorCache.vors, item.name);
                if(vorndb == undefined) return;
                const coord  = parse2CoordB(vorndb.coord);
                const symbol = ReadSymbol(this.symbolCache.colors, item.type, item.flag);
                if(symbol == undefined) return;
                this.canvasContext.fillStyle = symbol.color;
                const size = symbol.fontSymbolSize;
                this.canvasContext.font = size * 2.2 + "px Arial";
                if(item.flag == "name")
                {
                    this.canvasContext.fillText(vorndb.name, coord.longtitude * this.canvasIndex, coord.latitude * this.canvasIndex);
                }
                else
                {
                    //这里同样要实现绘制脚本
                    this.canvasContext.fillRect(coord.longtitude * this.canvasIndex, coord.latitude * this.canvasIndex, size, size)
                }
            }
            if(item.type == "Airports")
            {
                const airport = ReadSctAirport(this.sectorCache.airports, item.name);
                if(airport == undefined) return;
                const coord = parse2CoordB(airport.coord);
                const symbol = ReadSymbol(this.symbolCache.colors, item.type, item.flag);
                if(symbol == undefined) return;
                this.canvasContext.fillStyle = symbol.color;
                const size = symbol.fontSymbolSize;
                this.canvasContext.font = size * 2.2 + "px Arial";
                if(item.flag == "name")
                {
                    this.canvasContext.fillText(airport.icao, coord.longtitude * this.canvasIndex, coord.latitude * this.canvasIndex);
                }
                else
                {
                    this.canvasContext.fillRect(coord.longtitude * this.canvasIndex, coord.latitude * this.canvasIndex, size, size);
                }
            }
            if(item.type == "ARTCC boundary")
            {
                const artcc = ReadSctARTCC(this.sectorCache.ARTCCs, item.name);
                const symbol = ReadSymbol(this.symbolCache.colors, item.type, "line");
                if(symbol == undefined || artcc == undefined) return;
                this.canvasContext.lineWidth = symbol.lineWeight;
                this.canvasContext.strokeStyle = symbol.color;
                artcc.coords.forEach((coord) => {
                    const line = new Path2D();
                    line.moveTo(coord.coordA.longtitude * this.canvasIndex, coord.coordA.latitude * this.canvasIndex);
                    line.lineTo(coord.coordB.longtitude * this.canvasIndex, coord.coordB.latitude * this.canvasIndex);
                    this.canvasContext?.stroke(line);
                });
            }
            if(item.type == "Sids" || item.type == "Stars")
            {
                let sidstar: SctSIDSTAR | undefined;
                if(item.type == "Sids") sidstar = ReadSctSidStar(this.sectorCache.sids, item.name);
                if(item.type == "Stars") sidstar = ReadSctSidStar(this.sectorCache.stars, item.name);
                const symbol = ReadSymbol(this.symbolCache.colors, item.type, "line");
                if(sidstar == undefined || symbol == undefined) return;
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
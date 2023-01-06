import { AsrData, EseData, PrfData, SctData } from "../lib/sectortype";
import elementId from "../lib/elementId";
import { LoadAsrFileSync, LoadPrfFileSync, LoadSctFileSync, LoadEseFileSync, ReadPrfData, ConvertEsePath, ReadSctFix, ReadSymbol, ReadEseFreeText, ReadSctGeo, ReadSctRegions, ReadSctDefine, AlignPath, ReadSctLoHiAw } from "./sectorloader";
import { VoiceData, SymbologyData, ProfileData } from "../lib/settingtype";
import { LoadSymbologySync, LoadVoiceSync, LoadProfileSync } from "./settingloader";
import { parse2CoordB } from "../lib/coordparser";
import { ipcRenderer } from "electron";
import ipcChannel from "../lib/ipcChannel";
import path from 'path';

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
    public drawTimes: number;
    constructor(rootElement: string)
    {
        this.drawTimes = 0;
        this.canvas = document.createElement('canvas');
        this.canvasContext = this.canvas.getContext('2d');
        if(this.canvasContext == undefined) throw "";
        this.coordIndicator = document.getElementById(elementId.RadarWindow.Appbar.Tags.currentCoord);
        this.rootElement = document.getElementById(rootElement);
        if(this.rootElement == undefined) throw "";
        this.rootElement.appendChild(this.canvas);
        this.canvasContext.lineWidth = 1;
        this.canvasContext.moveTo(0,0);
        this.canvasContext.lineTo(100,100);
        this.canvasContext.strokeStyle = "white";
        this.canvasContext.stroke()
        this.canvasIndex = 1;
        this.canvasPosX = 0;
        this.canvasPosY = 0;
        window.addEventListener('resize', () => {
            this.ClearCanvas();
        });
        //处理扇区选择
        ipcRenderer.on(ipcChannel.app.update.prfFile,(e, args) => {
            //缓存prf路径
            //更新绘制缓存
            this.UpdateCache(args.path);
            //绘制
            this.ClearCanvas();
        });
    }
    public ClearCanvas() : void
    {
        this.canvas.height = window.innerHeight - 136;
        this.canvas.width = window.innerWidth;
        this.Draw();
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
        this.ClearCanvas();
    }
    public UpdateCanvasPosXY(x: number, y: number) : void
    {
        const xresult = this.canvasPosX + (x/20)/this.canvasIndex;
        const yresult = this.canvasPosY + (y/20)/this.canvasIndex;
        this.canvasPosX = xresult;
        this.canvasPosY = yresult;
        if(this.coordIndicator == null) return;
        this.coordIndicator.innerText = `Lat: ${this.canvasPosY} Lon: ${-this.canvasPosX} Index: ${this.canvasIndex}`;
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
    public Draw() : void
    {
        this.drawTimes++;
        if(this.canvasContext == undefined) return;
        this.canvasContext.translate(this.canvasPosX, this.canvasPosY);
        this.canvasContext.translate(this.canvasPosX * (this.canvasIndex - 1), this.canvasPosY * (this.canvasIndex - 1))
        if(this.asrCache == undefined) return;
        this.asrCache.items.forEach((item) => {
            if(!item.draw) return;
            if(this.canvasContext == null) return;
            if(this.sectorCache == undefined || this.symbolCache == undefined || this.eseCache == undefined) return;
            if(item.type == "Fixes")
            {
                const origincoord = ReadSctFix(this.sectorCache.fixes, item.name);
                if(origincoord == undefined) return;
                const coord = parse2CoordB(origincoord);
                const symbol = ReadSymbol(this.symbolCache.colors, item.type, item.flag);
                if(symbol == undefined) return;
                this.canvasContext.fillStyle = symbol.color;
                if(item.flag == "name")
                {
                    this.canvasContext.font = parseInt(symbol.fontSymbolSize) * 2.5 + "px Arial";
                    this.canvasContext.fillText(item.name, coord.longtitude * this.canvasIndex, coord.latitude * this.canvasIndex);
                }
                else
                {
                    //这里的代码后续需要实现DrawScript
                    const size = parseInt(symbol.fontSymbolSize);
                    this.canvasContext.fillRect(coord.longtitude * this.canvasIndex, coord.latitude * this.canvasIndex, size, size);
                }
            }
            if(item.type == "Free Text")
            {
                const groupandtext = item.name.split("\\");
                const origincoord = ReadEseFreeText(this.eseCache.freetexts, groupandtext[0], groupandtext[1]);
                const symbol = ReadSymbol(this.symbolCache.colors, "Other", item.flag);
                if(origincoord == undefined) return;
                const coord = parse2CoordB(origincoord);
                if(symbol?.fontSymbolSize == undefined) return;
                this.canvasContext.font = parseInt(symbol.fontSymbolSize) * 3 + "px Arial";
                this.canvasContext.fillText(groupandtext[1], coord.longtitude * this.canvasIndex, coord.latitude * this.canvasIndex);
            }
            if(item.type == "Geo")
            {
                const geogroup = ReadSctGeo(this.sectorCache.GEOs, item.name);
                if(geogroup == undefined) return;
                this.canvasContext.lineWidth = 0.5;
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
            if(item.type == "High airways")
            {
                const aw = ReadSctLoHiAw(this.sectorCache.hiAirways, item.name);
                if(aw == undefined) return;
                aw.coords.forEach(coord => {
                    const coordA = parse2CoordB(coord.coordA);
                    const coordB = parse2CoordB(coord.coordB);
                    if(coordA == undefined || coordB == undefined || this.symbolCache == undefined || this.canvasContext == undefined) return;
                    const symbol = ReadSymbol(this.symbolCache.colors, item.type, item.flag);
                    if(symbol == undefined) return;
                    const line = new Path2D();
                    line.moveTo(coordA.longtitude * this.canvasIndex, coordA.latitude * this.canvasIndex);
                    line.lineTo(coordB.longtitude * this.canvasIndex, coordB.latitude * this.canvasIndex);
                    if(item.flag == "name")
                    {
                        this.canvasContext.fillStyle = symbol.color;
                        this.canvasContext.font = symbol.fontSymbolSize + "px Arial";
                        this.canvasContext.fillText(aw.group, (coordA.longtitude * this.canvasIndex + coordB.longtitude * this.canvasIndex) / 2, (coordA.latitude * this.canvasIndex + coordB.latitude * this.canvasIndex) / 2)
                    }
                    else
                    {
                        this.canvasContext.lineWidth = 0.5;
                        this.canvasContext.strokeStyle = symbol.color;
                        this.canvasContext.stroke(line);
                    }
                });
            }
            if(item.type == "Low airways")
            {
                const aw = ReadSctLoHiAw(this.sectorCache.hiAirways, item.name);
                if(aw == undefined) return;
                aw.coords.forEach(coord => {
                    const coordA = parse2CoordB(coord.coordA);
                    const coordB = parse2CoordB(coord.coordB);
                    if(coordA == undefined || coordB == undefined || this.symbolCache == undefined || this.canvasContext == undefined) return;
                    const symbol = ReadSymbol(this.symbolCache.colors, item.type, item.flag);
                    if(symbol == undefined) return;
                    const line = new Path2D();
                    line.moveTo(coordA.longtitude * this.canvasIndex, coordA.latitude * this.canvasIndex);
                    line.lineTo(coordB.longtitude * this.canvasIndex, coordB.latitude * this.canvasIndex);
                    if(item.flag == "name")
                    {
                        this.canvasContext.fillStyle = symbol.color;
                        this.canvasContext.font = symbol.fontSymbolSize + "px Arial";
                        this.canvasContext.fillText(aw.group, (coordA.longtitude * this.canvasIndex + coordB.longtitude * this.canvasIndex) / 2, (coordA.latitude * this.canvasIndex + coordB.latitude * this.canvasIndex) / 2)
                    }
                    else
                    {
                        this.canvasContext.lineWidth = 0.5;
                        this.canvasContext.strokeStyle = symbol.color;
                        this.canvasContext.stroke(line);
                    }
                });
            }
            if(item.type == "Regions")
            {
                const regions = ReadSctRegions(this.sectorCache.REGIONs, item.name);
                if(regions == undefined) return;
                regions.items.forEach((region) => {
                    if(this.sectorCache == undefined || this.canvasContext == undefined) return;
                    const color = ReadSctDefine(this.sectorCache.definitions, region.colorFlag);
                    if(color == undefined) return;
                    this.canvasContext.beginPath();
                    const coord0 = parse2CoordB(region.coords[0]);
                    const count = region.coords.length;
                    const line = new Path2D();
                    // line.moveTo(coord0.longtitude * this.canvasIndex, coord0.latitude * this.canvasIndex);
                    this.canvasContext.moveTo(coord0.longtitude * this.canvasIndex, coord0.latitude * this.canvasIndex);
                    for(let index = 0; index < count; index++)
                    {
                        const coord = parse2CoordB(region.coords[index]);
                        // line.lineTo(coord.longtitude * this.canvasIndex, coord.latitude * this.canvasIndex);
                        this.canvasContext.lineTo(coord.longtitude * this.canvasIndex, coord.latitude * this.canvasIndex);
                    }
                    line.closePath();
                    this.canvasContext.lineWidth = 0.1;
                    this.canvasContext.fillStyle = color;
                    this.canvasContext.fill('nonzero');
                    // console.log("normally drawed",region.colorFlag);
                    // this.canvasContext.strokeStyle = color;
                    // this.canvasContext.stroke(line);
                });
            }
            
        });
    }
}

export default Drawer;
import fs from "fs";
import * as jschardet from "iconv-jschardet";
import { parse2CoordB_ } from "../lib/coordparser";
import { Coordinate_B, EseFreetext, SctAirport, SctARTCC, SctDefinition, SctFix, SctGEO, SctLoHiAirway, SctREGIONS, SctRunway, SctSIDSTAR, SctVorNdb, SymbologyDefine } from "../lib/datatype";
import * as sectortype from "../lib/sectortype";
import spaceformatter from "../lib/spaceformatter";

/**
 * 读取并处理Prf配置文件
 * @param path 指向prf文件的目录
 * @param callback 读取后调用的回调函数
 */
export function LoadPrfFile(path: string, callback: (err: NodeJS.ErrnoException | null, data: sectortype.PrfData) => void): void {
    const result: sectortype.PrfData = new sectortype.PrfData();
    if (fs.existsSync(path)) {
        fs.readFile(path, (err, data) => {
            DecodeData(data).forEach((line) => {
                const items = line.split('\t');
                if (items.length == 3) {
                    result.settings.push({
                        type: items[0],
                        flag: items[1],
                        data: items[2]
                    });
                }
            });
            callback(err, result);
        });
    }
    else {
        throw `path: ${path} does not exist.`;
    }
}

/**
 * 读取Prf配置文件
 * @param path 指向prf文件的目录
 * @returns Prf读取数据
 */
export function LoadPrfFileSync(path: string): sectortype.PrfData {
    const result: sectortype.PrfData = new sectortype.PrfData();
    if (fs.existsSync(path)) {
        let raw: string[] | Buffer = fs.readFileSync(path);
        raw = DecodeData(raw);
        //之所以不使用forEach是因为forEach特性可能导致提前的返回值
        for (let index = 0; index < raw.length; index++) {
            const line = raw[index];
            const items = line.split('\t');
            if (items.length == 3) {
                result.settings.push({
                    type: items[0],
                    flag: items[1],
                    data: items[2]
                });
            }
        }
        return result;
    }
    else {
        throw `path: ${path} does not exist.`;
    }
}

/**
 * 读取并处理asr配置文件
 * @param path 指向asr文件的目录
 * @param callback Asr读取后调用的回调
 */
export function LoadAsrFile(path: string, callback: (err: NodeJS.ErrnoException | null, data: sectortype.AsrData) => void): void {
    const result: sectortype.AsrData = new sectortype.AsrData();
    if (fs.existsSync(path)) {
        fs.readFile(path, (err, data) => {
            DecodeData(data).forEach((line) => {
                const items = line.split(':');
                switch (items.length) {
                    case 2:
                        result.settings.push({
                            flag: items[0],
                            data: items[1]
                        });
                        break;
                    case 3:
                        result.items.push({
                            type: items[0],
                            name: items[1],
                            flag: items[2],
                            draw: true
                        });
                        break;
                    case 5:
                        result.windowArea = {
                            coord1: parse2CoordB_({
                                latitude: items[1],
                                longitude: items[2]
                            }),
                            coord2: parse2CoordB_({
                                latitude: items[3],
                                longitude: items[4]
                            })
                        }
                }
            });
            callback(err, result);
        });
    }
    else {
        throw `path: ${path} does not exist.`;
    }
}

/**
 * 读取Asr配置文件
 * @param path 指向asr文件的目录
 * @returns Asr读取数据
 */
export function LoadAsrFileSync(path: string): sectortype.AsrData {
    const result: sectortype.AsrData = new sectortype.AsrData();
    if (fs.existsSync(path)) {
        let raw: string[] | Buffer = fs.readFileSync(path);
        raw = DecodeData(raw);
        //之所以不使用forEach是因为forEach特性可能导致提前的返回值
        for (let index = 0; index < raw.length; index++) {
            const line = raw[index];
            const items = line.split(':');
            switch (items.length) {
                case 2:
                    result.settings.push({
                        flag: items[0],
                        data: items[1]
                    });
                    break;
                case 3:
                    result.items.push({
                        type: items[0],
                        name: items[1],
                        flag: items[2],
                        draw: true
                    });
                    break;
                case 5:
                    result.windowArea = {
                        coord1: parse2CoordB_({
                            latitude: items[1],
                            longitude: items[2]
                        }),
                        coord2: parse2CoordB_({
                            latitude: items[1],
                            longitude: items[2]
                        })
                    }
            }
        }
        return result;
    }
    else {
        throw `path: ${path} does not exist.`;
    }
}


export function LoadSctFile(path: string, callback: (err: NodeJS.ErrnoException | null, data: sectortype.SctData) => void): void {
    const result: sectortype.SctData = new sectortype.SctData();
    if (fs.existsSync(path)) {
        fs.readFile(path, (err, data) => {
            const decodedData = DecodeData(data);
            //读取definitions
            decodedData.forEach((line) => {
                //跳过注释
                if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                if (line.startsWith("#define")) {
                    const dataline = line.split(" ");
                    const color = "#" + parseInt(dataline[2]).toString(16).padStart(6, "0");
                    result.definitions.push({
                        flag: dataline[1],
                        color: color
                    });
                }
            });
            let vorreadflag = false;
            //读取VOR
            decodedData.forEach((line) => {
                if (!vorreadflag) {
                    if (line == "[VOR]") vorreadflag = true;//开始读取
                }
                else {
                    if (line.startsWith("[")) {
                        //停止读取
                        vorreadflag = false;
                        return;
                    }
                    //去掉注释
                    if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                    //跳过空行
                    if (line == "") return;
                    //读取vor
                    const dataline = line.split(" ");
                    //跳过格式错误行
                    if (dataline.length !== 4) return;
                    result.vors.push({
                        name: dataline[0],
                        frequency: dataline[1],
                        coord: parse2CoordB_({
                            latitude: dataline[2],
                            longitude: dataline[3]
                        }),
                    });
                }
            });
            //读取NDB
            let ndbreadflag = false;
            decodedData.forEach((line) => {
                if (!ndbreadflag) {
                    if (line == "[NDB]") ndbreadflag = true;
                }
                else {
                    if (line.startsWith("[")) {
                        //停止读取
                        ndbreadflag = false;
                        return;
                    }
                    //去掉注释
                    if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                    //跳过空行
                    if (line == "") return;
                    //读取
                    const dataline = line.split(" ");
                    //跳过格式错误行
                    if (dataline.length !== 4) return;
                    result.ndbs.push({
                        name: dataline[0],
                        frequency: dataline[1],
                        coord: parse2CoordB_({
                            latitude: dataline[2],
                            longitude: dataline[3]
                        }),
                    });
                }
            });
            //读取Airport
            let aptreadflag = false;
            decodedData.forEach((line) => {
                if (!aptreadflag) {
                    if (line == "[AIRPORT]") aptreadflag = true;
                }
                else {
                    if (line.startsWith("[")) {
                        //停止读取
                        aptreadflag = false;
                        return;
                    }
                    //去掉注释
                    if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                    //跳过空行
                    if (line == "") return;
                    //读取
                    const dataline = line.split(" ");
                    //跳过格式错误行
                    if (dataline.length !== 5) return;
                    result.airports.push({
                        icao: dataline[0],
                        frequency: dataline[1],
                        coord: parse2CoordB_({
                            latitude: dataline[2],
                            longitude: dataline[3]
                        }),
                        class: dataline[4],

                    });
                }
            });
            let rwyreadflag = false;
            decodedData.forEach((line) => {
                if (!rwyreadflag) {
                    if (line == "[RUNWAY]") rwyreadflag = true;
                }
                else {
                    if (line.startsWith("[")) {
                        //停止读取
                        rwyreadflag = false;
                        return;
                    }
                    //去掉注释
                    if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                    //跳过空行
                    if (line == "") return;
                    //读取
                    const dataline = line.split(" ");
                    //跳过格式错误行
                    if (dataline.length !== 10) return;
                    result.runways.push({
                        endPointA: dataline[0],
                        endPointB: dataline[1],
                        HeadingA: parseInt(dataline[2]),
                        HeadingB: parseInt(dataline[3]),
                        coordA: parse2CoordB_({
                            latitude: dataline[4],
                            longitude: dataline[5]
                        }),
                        coordB: parse2CoordB_({
                            latitude: dataline[6],
                            longitude: dataline[7]
                        }),
                        airportCode: dataline[8],
                        airportName: dataline[9],

                    });
                }
            });
            let fixreadflag = false;
            decodedData.forEach((line) => {
                if (!fixreadflag) {
                    if (line == "[FIXES]") fixreadflag = true;
                }
                else {
                    if (line.startsWith("[")) {
                        //停止读取
                        fixreadflag = false;
                        return;
                    }
                    //去掉注释
                    if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                    //跳过空行
                    if (line == "") return;
                    //读取
                    const dataline = line.split(" ");
                    //跳过格式错误行
                    if (dataline.length !== 3) return;
                    result.fixes.push({
                        name: dataline[0],
                        coord: parse2CoordB_({
                            latitude: dataline[1],
                            longitude: dataline[2]
                        }),
                    });
                }
            });
            let ARTCCreadflag = false;
            decodedData.forEach((line) => {
                if (!ARTCCreadflag) {
                    if (line == "[ARTCC]") ARTCCreadflag = true;
                }
                else {
                    if (line.startsWith("[")) {
                        //停止读取
                        ARTCCreadflag = false;
                        return;
                    }
                    //去掉注释
                    if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                    //跳过空行
                    if (line == "") return;
                    //读取
                    const dataline = line.split(" ");
                    //获取组名长度
                    const linelen = dataline.length;
                    const groupWordLength = linelen - 4;
                    let group = "";
                    for (let i = 0; i < groupWordLength; i++) {
                        group += dataline[i] + " ";
                    }
                    //去除末尾多余空格
                    group = group.trim();
                    if (result.ARTCCs.length == 0) {
                        result.ARTCCs.push({
                            group: group,
                            coords: [{
                                coordA: parse2CoordB_({
                                    latitude: dataline[linelen - 4],
                                    longitude: dataline[linelen - 3]
                                }),
                                coordB: parse2CoordB_({
                                    latitude: dataline[linelen - 2],
                                    longitude: dataline[linelen - 1]
                                }),
                            }]
                        });
                    }
                    else {
                        if (group == result.ARTCCs[result.ARTCCs.length - 1].group) {
                            result.ARTCCs[result.ARTCCs.length - 1].coords.push({
                                coordA: parse2CoordB_({
                                    latitude: dataline[linelen - 4],
                                    longitude: dataline[linelen - 3]
                                }),
                                coordB: parse2CoordB_({
                                    latitude: dataline[linelen - 2],
                                    longitude: dataline[linelen - 1]
                                }),
                            })
                        }
                        else {
                            result.ARTCCs.push({
                                group: group,
                                coords: [{
                                    coordA: parse2CoordB_({
                                        latitude: dataline[linelen - 4],
                                        longitude: dataline[linelen - 3]
                                    }),
                                    coordB: parse2CoordB_({
                                        latitude: dataline[linelen - 2],
                                        longitude: dataline[linelen - 1]
                                    })
                                }]
                            });
                        }
                    }
                }
            });
            let SIDreadflag = false;
            decodedData.forEach((line) => {
                line = spaceformatter.CleanSpaces(line);
                if (!SIDreadflag) {
                    if (line == "[SID]") SIDreadflag = true;
                }
                else {
                    if (line.startsWith("[")) {
                        //停止读取
                        SIDreadflag = false;
                        return;
                    }
                    //去掉注释
                    if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                    //跳过空行
                    if (line == "") return;
                    //读取
                    const dataline = line.split(" ");
                    if (dataline.length == 5) {
                        result.sids.push({
                            group: dataline[0],
                            coords: [{
                                coordA: parse2CoordB_({
                                    latitude: dataline[1],
                                    longitude: dataline[2]
                                }),
                                coordB: parse2CoordB_({
                                    latitude: dataline[3],
                                    longitude: dataline[4]
                                }),
                            }]
                        });
                    }
                    else {
                        result.sids[result.sids.length - 1].coords.push({
                            coordA: parse2CoordB_({
                                latitude: dataline[0],
                                longitude: dataline[1]
                            }),
                            coordB: parse2CoordB_({
                                latitude: dataline[2],
                                longitude: dataline[3]
                            })
                        })
                    }
                }
            });
            let STARreadflag = false;
            decodedData.forEach((line) => {
                line = spaceformatter.CleanSpaces(line);
                if (!STARreadflag) {
                    if (line == "[STAR]") STARreadflag = true;
                }
                else {
                    if (line.startsWith("[")) {
                        //停止读取
                        STARreadflag = false;
                        return;
                    }
                    //去掉注释
                    if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                    //跳过空行
                    if (line == "") return;
                    //读取
                    const dataline = line.split(" ");
                    if (dataline.length == 5) {
                        result.stars.push({
                            group: dataline[0],
                            coords: [{
                                coordA: parse2CoordB_({
                                    latitude: dataline[1],
                                    longitude: dataline[2]
                                }),
                                coordB: parse2CoordB_({
                                    latitude: dataline[3],
                                    longitude: dataline[4]
                                }),
                            }]
                        });
                    }
                    else {
                        result.stars[result.stars.length - 1].coords.push({
                            coordA: parse2CoordB_({
                                latitude: dataline[0],
                                longitude: dataline[1]
                            }),
                            coordB: parse2CoordB_({
                                latitude: dataline[2],
                                longitude: dataline[3]
                            })
                        })
                    }
                }
            });
            let loreadflag = false;
            decodedData.forEach((line) => {
                if (!loreadflag) {
                    if (line == "[LOW AIRWAY]") loreadflag = true;
                }
                else {
                    if (line.startsWith("[")) {
                        //停止读取
                        loreadflag = false;
                        return;
                    }
                    //去掉注释
                    if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                    //跳过空行
                    if (line == "") return;
                    //读取
                    const dataline = line.split(" ");
                    if (result.loAirways.length - 1 < 0) {
                        result.loAirways.push({
                            group: dataline[0],
                            coords: [{
                                coordA: parse2CoordB_({
                                    latitude: dataline[1],
                                    longitude: dataline[2]
                                }),
                                coordB: parse2CoordB_({
                                    latitude: dataline[3],
                                    longitude: dataline[4]
                                }),
                            }]
                        });
                    }
                    else {
                        if (dataline[0] == result.loAirways[result.loAirways.length - 1].group) {
                            result.loAirways[result.loAirways.length - 1].coords.push({
                                coordA: parse2CoordB_({
                                    latitude: dataline[1],
                                    longitude: dataline[2]
                                }),
                                coordB: parse2CoordB_({
                                    latitude: dataline[3],
                                    longitude: dataline[4]
                                }),
                            })
                        }
                    }
                }
            });
            let hireadflag = false;
            decodedData.forEach((line) => {
                if (!hireadflag) {
                    if (line == "[HIGH AIRWAY]") hireadflag = true;
                }
                else {
                    if (line.startsWith("[")) {
                        //停止读取
                        hireadflag = false;
                        return;
                    }
                    //去掉注释
                    if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                    //跳过空行
                    if (line == "") return;
                    //读取
                    const dataline = line.split(" ");
                    if (result.hiAirways.length - 1 < 0) {
                        result.hiAirways.push({
                            group: dataline[0],
                            coords: [{
                                coordA: parse2CoordB_({
                                    latitude: dataline[1],
                                    longitude: dataline[2]
                                }),
                                coordB: parse2CoordB_({
                                    latitude: dataline[3],
                                    longitude: dataline[4]
                                }),
                            }]
                        });
                    }
                    else {
                        if (dataline[0] == result.hiAirways[result.hiAirways.length - 1].group) {
                            result.hiAirways[result.hiAirways.length - 1].coords.push({
                                coordA: parse2CoordB_({
                                    latitude: dataline[1],
                                    longitude: dataline[2]
                                }),
                                coordB: parse2CoordB_({
                                    latitude: dataline[3],
                                    longitude: dataline[4]
                                }),
                            })
                        }
                    }
                }
            });
            let georeadflag = false;
            decodedData.forEach((line) => {
                if (!georeadflag) {
                    if (line == "[GEO]") georeadflag = true;
                }
                else {
                    if (line.startsWith("[")) {
                        //停止读取
                        georeadflag = false;
                        return;
                    }
                    //去掉注释
                    if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                    //跳过空行
                    if (line == "") return;
                    //读取
                    const dataline = line.split(" ");
                    if (dataline.length == 6) {
                        result.GEOs.push({
                            group: dataline[0],
                            items: [{
                                coordA: parse2CoordB_({
                                    latitude: dataline[1],
                                    longitude: dataline[2]
                                }),
                                coordB: parse2CoordB_({
                                    latitude: dataline[3],
                                    longitude: dataline[4]
                                }),
                                colorFlag: dataline[5],
                            }]
                        });
                    }
                    else {
                        result.GEOs[result.GEOs.length - 1].items.push({
                            coordA: parse2CoordB_(
                                {
                                    latitude: dataline[0],
                                    longitude: dataline[1]
                                }
                            ),
                            coordB: parse2CoordB_({
                                latitude: dataline[2],
                                longitude: dataline[3]
                            }),
                            colorFlag: dataline[4]
                        });
                    }
                }
            });
            let regreadflag = false;
            decodedData.forEach((line) => {
                if (!regreadflag) {
                    if (line == "[REGIONS]") regreadflag = true;
                }
                else {
                    if (line.startsWith("[")) {
                        //停止读取
                        regreadflag = false;
                        return;
                    }
                    //去掉注释
                    if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                    //跳过空行
                    if (line == "") return;
                    //读取
                    const dataline = line.split(" ");
                    if (dataline.length == 4 && dataline[0] !== result.REGIONs[result.REGIONs.length - 1].regionName) {
                        result.REGIONs.push({
                            regionName: dataline[0],
                            items: [{
                                colorFlag: dataline[1],
                                coords: [parse2CoordB_({
                                    latitude: dataline[2], longitude: dataline[3]
                                })]
                            }],
                        });
                    }
                    else {
                        result.REGIONs[result.REGIONs.length - 1].items.push({
                            colorFlag: result.REGIONs[result.REGIONs.length - 1].items[result.REGIONs[result.REGIONs.length - 1].items.length - 1].colorFlag,
                            coords: [parse2CoordB_({
                                latitude: dataline[0], longitude: dataline[1]
                            })]
                        });
                    }
                }
            });
            callback(err, result);
        });
    }
    else {
        throw `path: ${path} does not exist.`;
    }
}

export function LoadSctFileSync(path: string): sectortype.SctData {
    const result: sectortype.SctData = new sectortype.SctData();
    if (fs.existsSync(path)) {
        const data = fs.readFileSync(path);
        const decodedData = DecodeData(data);
        //读取definitions
        decodedData.forEach((line) => {
            //跳过注释
            if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
            if (line.startsWith("#define")) {
                const dataline = line.split(" ");
                const color = "#" + parseInt(dataline[2]).toString(16).padStart(6, "0");
                result.definitions.push({
                    flag: dataline[1],
                    color: color
                });
            }
        });
        let vorreadflag = false;
        //读取VOR
        decodedData.forEach((line) => {
            if (!vorreadflag) {
                if (line == "[VOR]") vorreadflag = true;//开始读取
            }
            else {
                if (line.startsWith("[")) {
                    //停止读取
                    vorreadflag = false;
                    return;
                }
                //去掉注释
                if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                //跳过空行
                if (line == "") return;
                //读取vor
                const dataline = line.split(" ");
                //跳过格式错误行
                if (dataline.length !== 4) return;
                result.vors.push({
                    name: dataline[0],
                    frequency: dataline[1],
                    coord: parse2CoordB_({
                        latitude: dataline[2],
                        longitude: dataline[3]
                    }),

                });
            }
        });
        //读取NDB
        let ndbreadflag = false;
        decodedData.forEach((line) => {
            if (!ndbreadflag) {
                if (line == "[NDB]") ndbreadflag = true;
            }
            else {
                if (line.startsWith("[")) {
                    //停止读取
                    ndbreadflag = false;
                    return;
                }
                //去掉注释
                if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                //跳过空行
                if (line == "") return;
                //读取
                const dataline = line.split(" ");
                //跳过格式错误行
                if (dataline.length !== 4) return;
                result.ndbs.push({
                    name: dataline[0],
                    frequency: dataline[1],
                    coord: parse2CoordB_({
                        latitude: dataline[2],
                        longitude: dataline[3]
                    }),

                });
            }
        });
        //读取Airport
        let aptreadflag = false;
        decodedData.forEach((line) => {
            if (!aptreadflag) {
                if (line == "[AIRPORT]") aptreadflag = true;
            }
            else {
                if (line.startsWith("[")) {
                    //停止读取
                    aptreadflag = false;
                    return;
                }
                //去掉注释
                if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                //跳过空行
                if (line == "") return;
                //读取
                const dataline = line.split(" ");
                //跳过格式错误行
                if (dataline.length !== 5) return;
                result.airports.push({
                    icao: dataline[0],
                    frequency: dataline[1],
                    coord: parse2CoordB_({
                        latitude: dataline[2],
                        longitude: dataline[3]
                    }),
                    class: dataline[4],

                });
            }
        });
        let rwyreadflag = false;
        decodedData.forEach((line) => {
            if (!rwyreadflag) {
                if (line == "[RUNWAY]") rwyreadflag = true;
            }
            else {
                if (line.startsWith("[")) {
                    //停止读取
                    rwyreadflag = false;
                    return;
                }
                //去掉注释
                if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                //跳过空行
                if (line == "") return;
                //读取
                const dataline = line.split(" ");
                //跳过格式错误行
                if (dataline.length !== 10) return;
                result.runways.push({
                    endPointA: dataline[0],
                    endPointB: dataline[1],
                    HeadingA: parseInt(dataline[2]),
                    HeadingB: parseInt(dataline[3]),
                    coordA: parse2CoordB_({
                        latitude: dataline[4],
                        longitude: dataline[5]
                    }),
                    coordB: parse2CoordB_({
                        latitude: dataline[6],
                        longitude: dataline[7]
                    }),
                    airportCode: dataline[8],
                    airportName: dataline[9],

                });
            }
        });
        let fixreadflag = false;
        decodedData.forEach((line) => {
            if (!fixreadflag) {
                if (line == "[FIXES]") fixreadflag = true;
            }
            else {
                if (line.startsWith("[")) {
                    //停止读取
                    fixreadflag = false;
                    return;
                }
                //去掉注释
                if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                //跳过空行
                if (line == "") return;
                //读取
                const dataline = line.split(" ");
                //跳过格式错误行
                if (dataline.length !== 3) return;
                result.fixes.push({
                    name: dataline[0],
                    coord: parse2CoordB_({
                        latitude: dataline[1],
                        longitude: dataline[2]
                    }),
                });
            }
        });
        let ARTCCreadflag = false;
        decodedData.forEach((line) => {
            if (!ARTCCreadflag) {
                if (line == "[ARTCC]") ARTCCreadflag = true;
            }
            else {
                if (line.startsWith("[")) {
                    //停止读取
                    ARTCCreadflag = false;
                    return;
                }
                //去掉注释
                if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                //跳过空行
                if (line == "") return;
                //读取
                const dataline = line.split(" ");
                //获取组名长度
                const linelen = dataline.length;
                const groupWordLength = linelen - 4;
                let group = "";
                for (let i = 0; i < groupWordLength; i++) {
                    group += dataline[i] + " ";
                }
                //去除末尾多余空格
                group = group.trim()
                if (result.ARTCCs.length == 0) {
                    result.ARTCCs.push({
                        group: group,
                        coords: [{
                            coordA: parse2CoordB_({
                                latitude: dataline[linelen - 4],
                                longitude: dataline[linelen - 3]
                            }),
                            coordB: parse2CoordB_({
                                latitude: dataline[linelen - 2],
                                longitude: dataline[linelen - 1]
                            })
                        }]
                    });
                }
                else {
                    if (group == result.ARTCCs[result.ARTCCs.length - 1].group) {
                        result.ARTCCs[result.ARTCCs.length - 1].coords.push({
                            coordA: parse2CoordB_({
                                latitude: dataline[linelen - 4],
                                longitude: dataline[linelen - 3]
                            }),
                            coordB: parse2CoordB_({
                                latitude: dataline[linelen - 2],
                                longitude: dataline[linelen - 1]
                            })
                        })
                    }
                    else {
                        result.ARTCCs.push({
                            group: group,
                            coords: [{
                                coordA: parse2CoordB_({
                                    latitude: dataline[linelen - 4],
                                    longitude: dataline[linelen - 3]
                                }),
                                coordB: parse2CoordB_({
                                    latitude: dataline[linelen - 2],
                                    longitude: dataline[linelen - 1]
                                })
                            }]
                        });
                    }
                }
            }
        });
        let SIDreadflag = false;
        decodedData.forEach((line) => {
            line = spaceformatter.CleanSpaces(line);
            if (!SIDreadflag) {
                if (line == "[SID]") SIDreadflag = true;
            }
            else {
                if (line.startsWith("[")) {
                    //停止读取
                    SIDreadflag = false;
                    return;
                }
                //去掉注释
                if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                //跳过空行
                if (line == "") return;
                //读取
                const dataline = line.split(" ");
                if (dataline.length == 5) {
                    result.sids.push({
                        group: dataline[0],
                        coords: [{
                            coordA: parse2CoordB_({
                                latitude: dataline[1],
                                longitude: dataline[2]
                            }),
                            coordB: parse2CoordB_({
                                latitude: dataline[3],
                                longitude: dataline[4]
                            }),
                        }]
                    });
                }
                else {
                    result.sids[result.sids.length - 1].coords.push({
                        coordA: parse2CoordB_({
                            latitude: dataline[0],
                            longitude: dataline[1]
                        }),
                        coordB: parse2CoordB_({
                            latitude: dataline[2],
                            longitude: dataline[3]
                        })
                    })
                }
            }
        });
        let STARreadflag = false;
        decodedData.forEach((line) => {
            line = spaceformatter.CleanSpaces(line);
            if (!STARreadflag) {
                if (line == "[STAR]") STARreadflag = true;
            }
            else {
                if (line.startsWith("[")) {
                    //停止读取
                    STARreadflag = false;
                    return;
                }
                //去掉注释
                if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                //跳过空行
                if (line == "") return;
                //读取
                const dataline = line.split(" ");
                if (dataline.length == 5) {
                    result.stars.push({
                        group: dataline[0],
                        coords: [{
                            coordA: parse2CoordB_({
                                latitude: dataline[1],
                                longitude: dataline[2]
                            }),
                            coordB: parse2CoordB_({
                                latitude: dataline[3],
                                longitude: dataline[4]
                            }),
                        }]
                    });
                }
                else {
                    result.stars[result.stars.length - 1].coords.push({
                        coordA: parse2CoordB_({
                            latitude: dataline[0],
                            longitude: dataline[1]
                        }),
                        coordB: parse2CoordB_({
                            latitude: dataline[2],
                            longitude: dataline[3]
                        })
                    })
                }
            }
        });
        let loreadflag = false;
        decodedData.forEach((line) => {
            if (!loreadflag) {
                if (line == "[LOW AIRWAY]") loreadflag = true;
            }
            else {
                if (line.startsWith("[")) {
                    //停止读取
                    loreadflag = false;
                    return;
                }
                //去掉注释
                if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                //跳过空行
                if (line == "") return;
                //读取
                const dataline = line.split(" ");
                if (result.loAirways.length - 1 < 0) {
                    result.loAirways.push({
                        group: dataline[0],
                        coords: [{
                            coordA: parse2CoordB_({
                                latitude: dataline[1],
                                longitude: dataline[2]
                            }),
                            coordB: parse2CoordB_({
                                latitude: dataline[3],
                                longitude: dataline[4]
                            }),
                        }]
                    });
                }
                else {
                    if (dataline[0] == result.loAirways[result.loAirways.length - 1].group) {
                        result.loAirways[result.loAirways.length - 1].coords.push({
                            coordA: parse2CoordB_({
                                latitude: dataline[1],
                                longitude: dataline[2]
                            }),
                            coordB: parse2CoordB_({
                                latitude: dataline[3],
                                longitude: dataline[4]
                            }),
                        })
                    }
                    else {
                        result.loAirways.push({
                            group: dataline[0],
                            coords: [{
                                coordA: parse2CoordB_({
                                    latitude: dataline[1],
                                    longitude: dataline[2]
                                }),
                                coordB: parse2CoordB_({
                                    latitude: dataline[3],
                                    longitude: dataline[4]
                                }),
                            }]
                        });
                    }
                }
            }
        });
        let hireadflag = false;
        decodedData.forEach((line) => {
            if (!hireadflag) {
                if (line == "[HIGH AIRWAY]") hireadflag = true;
            }
            else {
                if (line.startsWith("[")) {
                    //停止读取
                    hireadflag = false;
                    return;
                }
                //去掉注释
                if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                //跳过空行
                if (line == "") return;
                //读取
                const dataline = line.split(" ");
                if (result.hiAirways.length - 1 < 0) {
                    result.hiAirways.push({
                        group: dataline[0],
                        coords: [{
                            coordA: parse2CoordB_({
                                latitude: dataline[1],
                                longitude: dataline[2]
                            }),
                            coordB: parse2CoordB_({
                                latitude: dataline[3],
                                longitude: dataline[4]
                            }),
                        }]
                    });
                }
                else {
                    if (dataline[0] == result.hiAirways[result.hiAirways.length - 1].group) {
                        result.hiAirways[result.hiAirways.length - 1].coords.push({
                            coordA: parse2CoordB_({
                                latitude: dataline[1],
                                longitude: dataline[2]
                            }),
                            coordB: parse2CoordB_({
                                latitude: dataline[3],
                                longitude: dataline[4]
                            }),
                        })
                    }
                    else {
                        result.hiAirways.push({
                            group: dataline[0],
                            coords: [{
                                coordA: parse2CoordB_({
                                    latitude: dataline[1],
                                    longitude: dataline[2]
                                }),
                                coordB: parse2CoordB_({
                                    latitude: dataline[3],
                                    longitude: dataline[4]
                                }),
                            }]
                        });
                    }
                }
            }
        });
        let georeadflag = false;
        decodedData.forEach((line) => {
            if (!georeadflag) {
                if (line == "[GEO]") georeadflag = true;
            }
            else {
                if (line.startsWith("[")) {
                    //停止读取
                    georeadflag = false;
                    return;
                }
                //去掉注释
                if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                //跳过空行
                if (line == "") return;
                //读取
                const dataline = line.split(" ");
                if (dataline.length == 6) {
                    result.GEOs.push({
                        group: dataline[0],
                        items: [{
                            coordA: parse2CoordB_({
                                latitude: dataline[1],
                                longitude: dataline[2]
                            }),
                            coordB: parse2CoordB_({
                                latitude: dataline[3],
                                longitude: dataline[4]
                            }),
                            colorFlag: dataline[5],
                        }]
                    });
                }
                else {
                    result.GEOs[result.GEOs.length - 1].items.push({
                        coordA: parse2CoordB_({
                            latitude: dataline[0],
                            longitude: dataline[1]
                        }),
                        coordB: parse2CoordB_({
                            latitude: dataline[2],
                            longitude: dataline[3]
                        }),
                        colorFlag: dataline[4]
                    });
                }
            }
        });
        let regreadflag = false;
        decodedData.forEach((line) => {
            if (!regreadflag) {
                if (line == "[REGIONS]") regreadflag = true;
            }
            else {
                if (line.startsWith("[")) {
                    //停止读取
                    regreadflag = false;
                    return;
                }
                //去掉注释
                if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                //跳过空行
                if (line == "") return;
                if (line.startsWith("REGIONNAME")) {
                    result.REGIONs.push({
                        regionName: line.replace("REGIONNAME ",""),
                        items: []
                    });
                    return;
                }
                //读取
                const dataline = line.trim().split(" ");
                if(dataline.length == 3){
                    result.REGIONs[result.REGIONs.length - 1].items.push({
                        colorFlag: dataline[0],
                        coords: [parse2CoordB_({
                            latitude: dataline[1], longitude: dataline[2]
                        })]
                    });
                    return;
                }
                if(dataline.length == 2){
                    result.REGIONs[result.REGIONs.length - 1].items[result.REGIONs[result.REGIONs.length - 1].items.length - 1].coords.push(parse2CoordB_(
                        {
                            latitude: dataline[0],
                            longitude: dataline[1]
                        }
                    ));
                    return;
                }
                //四行则新建item
                if (dataline.length == 4) {
                    //为空则直接插入
                    if (result.REGIONs.length == 0) {
                        result.REGIONs.push({
                            regionName: dataline[0],
                            items: [{
                                colorFlag: dataline[1],
                                coords: [parse2CoordB_({
                                    latitude: dataline[2], longitude: dataline[3]
                                })]
                            }],
                        });
                    } else {//不为空先判断和最后加入的是否为同一组
                        //是则插入到最后一项中的items里
                        if (dataline[0] == result.REGIONs[result.REGIONs.length - 1].regionName) {
                            result.REGIONs[result.REGIONs.length - 1].items.push({
                                colorFlag: dataline[1],
                                coords: [parse2CoordB_({
                                    latitude: dataline[2], longitude: dataline[3]
                                })]
                            });
                        } else {
                            //否则新建
                            result.REGIONs.push({
                                regionName: dataline[0],
                                items: [{
                                    colorFlag: dataline[1],
                                    coords: [parse2CoordB_({
                                        latitude: dataline[2], longitude: dataline[3]
                                    })]
                                }],
                            });
                        }
                    }
                }
            }
        });
        return result;
    }
    else {
        throw `path: ${path} does not exist.`;
    }
}

export function LoadEseFile(path: string, callback: (err: NodeJS.ErrnoException | null, data: sectortype.EseData) => void): void {
    const result: sectortype.EseData = new sectortype.EseData();
    if (fs.existsSync(path)) {
        fs.readFile(path, (err, data) => {
            const decodedData = DecodeData(data);
            let airspacereadflag = false;
            decodedData.forEach((line) => {
                if (!airspacereadflag) {
                    if (line == "[AIRSPACE]") airspacereadflag = true;
                }
                else {
                    if (line.startsWith("[")) {
                        airspacereadflag = false;
                        return;
                    }
                    //去掉注释
                    if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                    //跳过空行
                    if (line == "") return;
                    //读取
                    const dataline = line.split(":");
                    if (dataline[0] == "SECTORLINE") {
                        result.airspacces.push({
                            sectorline: dataline[0],
                            displayCondition: [],
                            coords: [],
                            subsection: {
                                sector: {
                                    name: null,
                                    loAltLimit: null,
                                    upAltLimit: null
                                },
                                owner: [],
                                altowner: [],
                                border: []
                            },
                            active: null
                        });
                    }
                    else if (dataline[0] == "DISPLAY") {
                        result.airspacces[result.airspacces.length - 1].displayCondition.push({
                            sectorControlling: dataline[1],
                            sectorCovered: [dataline[2], dataline[3]]
                        });
                    }
                    else if (dataline[0] == "COORD") {
                        result.airspacces[result.airspacces.length - 1].coords.push(parse2CoordB_({
                            latitude: dataline[1],
                            longitude: dataline[2]
                        }));
                    }
                    else if (dataline[0] == "SECTOR") {
                        result.airspacces[result.airspacces.length - 1].subsection.sector = {
                            name: dataline[1],
                            loAltLimit: parseInt(dataline[2]),
                            upAltLimit: parseInt(dataline[3])
                        }
                    }
                    else if (dataline[0] == "OWNER") {
                        //注意，owner的第一个项是OWNER标识，所以实际第一个项的下标为1,而不是0
                        result.airspacces[result.airspacces.length - 1].subsection.owner = dataline;
                    }
                    else if (dataline[0] == "ALTOWNER") {
                        //注意同上
                        result.airspacces[result.airspacces.length - 1].subsection.altowner = dataline;
                    }
                    else if (dataline[0] == "BORDER") {
                        //同上
                        result.airspacces[result.airspacces.length - 1].subsection.border = dataline;
                    }
                    else if (dataline[0] == "ACTIVE") {
                        result.airspacces[result.airspacces.length - 1].active = {
                            airport: dataline[1],
                            runway: dataline[2]
                        }
                    }
                }
            });
            let frtreadflag = false;
            decodedData.forEach((line) => {
                if (!frtreadflag) {
                    if (line == "[FREETEXT]") frtreadflag = true;
                }
                else {
                    if (line.startsWith("[")) {
                        frtreadflag = false;
                        return;
                    }
                    //去掉注释
                    if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                    //跳过空行
                    if (line == "") return;
                    //读取
                    const dataline = line.split(":");
                    result.freetexts.push({
                        coord: parse2CoordB_({
                            latitude: dataline[0],
                            longitude: dataline[1]
                        }),
                        group: dataline[2],
                        text: dataline[3],

                    });
                }
            });
            let posreadflag = false;
            decodedData.forEach((line) => {
                if (!posreadflag) {
                    if (line == "[POSITIONS]") posreadflag = true;
                }
                else {
                    if (line.startsWith("[")) {
                        posreadflag = false;
                        return;
                    }
                    //去掉注释
                    if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                    //跳过空行
                    if (line == "") return;
                    //读取
                    const dataline = line.split(":");
                    result.positions.push({
                        name: dataline[0],
                        callsign: dataline[1],
                        frequency: dataline[2],
                        identifier: dataline[3],
                        middleLetter: dataline[4],
                        prefix: dataline[5],
                        suffix: dataline[6],
                        notUsed1: dataline[7],
                        notUsed2: dataline[8],
                        startOfRange: dataline[9],
                        endOfRange: dataline[10]
                    });
                }
            });
            let sistreadflag = false;
            decodedData.forEach((line) => {
                if (!sistreadflag) {
                    if (line == "[SIDSSTARS]") sistreadflag = true;
                }
                else {
                    if (line.startsWith("[")) {
                        posreadflag = false;
                        return;
                    }
                    //去掉注释
                    if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                    //跳过空行
                    if (line == "") return;
                    //读取
                    const dataline = line.split(":");
                    result.sidsstars.push({
                        type: dataline[0],
                        airport: dataline[1],
                        runway: dataline[2],
                        name: dataline[3],
                        route: dataline[4].split(" "),

                    });
                }
            });
            callback(err, result);
        });
    }
    else {
        throw `path: ${path} does not exist.`;
    }
}

export function LoadEseFileSync(path: string): sectortype.EseData {
    if (fs.existsSync(path)) {
        const result: sectortype.EseData = new sectortype.EseData();
        const data = fs.readFileSync(path);
        const decodedData = DecodeData(data);
        let airspacereadflag = false;
        decodedData.forEach((line) => {
            if (!airspacereadflag) {
                if (line == "[AIRSPACE]") airspacereadflag = true;
            }
            else {
                if (line.startsWith("[")) {
                    airspacereadflag = false;
                    return;
                }
                //去掉注释
                if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                //跳过空行
                if (line == "") return;
                //读取
                const dataline = line.split(":");
                if (dataline[0] == "SECTORLINE") {
                    result.airspacces.push({
                        sectorline: dataline[0],
                        displayCondition: [],
                        coords: [],
                        subsection: {
                            sector: {
                                name: null,
                                loAltLimit: null,
                                upAltLimit: null
                            },
                            owner: [],
                            altowner: [],
                            border: []
                        },
                        active: null
                    });
                }
                else if (dataline[0] == "DISPLAY") {
                    result.airspacces[result.airspacces.length - 1].displayCondition.push({
                        sectorControlling: dataline[1],
                        sectorCovered: [dataline[2], dataline[3]]
                    });
                }
                else if (dataline[0] == "COORD") {
                    result.airspacces[result.airspacces.length - 1].coords.push(parse2CoordB_({
                        latitude: dataline[1],
                        longitude: dataline[2]
                    }));
                }
                else if (dataline[0] == "SECTOR") {
                    result.airspacces[result.airspacces.length - 1].subsection.sector = {
                        name: dataline[1],
                        loAltLimit: parseInt(dataline[2]),
                        upAltLimit: parseInt(dataline[3])
                    }
                }
                else if (dataline[0] == "OWNER") {
                    //注意，owner的第一个项是OWNER标识，所以实际第一个项的下标为1,而不是0
                    result.airspacces[result.airspacces.length - 1].subsection.owner = dataline;
                }
                else if (dataline[0] == "ALTOWNER") {
                    //注意同上
                    result.airspacces[result.airspacces.length - 1].subsection.altowner = dataline;
                }
                else if (dataline[0] == "BORDER") {
                    //同上
                    result.airspacces[result.airspacces.length - 1].subsection.border = dataline;
                }
                else if (dataline[0] == "ACTIVE") {
                    result.airspacces[result.airspacces.length - 1].active = {
                        airport: dataline[1],
                        runway: dataline[2]
                    }
                }
            }
        });
        let frtreadflag = false;
        decodedData.forEach((line) => {
            if (!frtreadflag) {
                if (line == "[FREETEXT]") frtreadflag = true;
            }
            else {
                if (line.startsWith("[")) {
                    frtreadflag = false;
                    return;
                }
                //去掉注释
                if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                //跳过空行
                if (line == "") return;
                //读取
                const dataline = line.split(":");
                result.freetexts.push({
                    coord: parse2CoordB_({
                        latitude: dataline[0],
                        longitude: dataline[1]
                    }),
                    group: dataline[2],
                    text: dataline[3],

                });
            }
        });
        let posreadflag = false;
        decodedData.forEach((line) => {
            if (!posreadflag) {
                if (line == "[POSITIONS]") posreadflag = true;
            }
            else {
                if (line.startsWith("[")) {
                    posreadflag = false;
                    return;
                }
                //去掉注释
                if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                //跳过空行
                if (line == "") return;
                //读取
                const dataline = line.split(":");
                result.positions.push({
                    name: dataline[0],
                    callsign: dataline[1],
                    frequency: dataline[2],
                    identifier: dataline[3],
                    middleLetter: dataline[4],
                    prefix: dataline[5],
                    suffix: dataline[6],
                    notUsed1: dataline[7],
                    notUsed2: dataline[8],
                    startOfRange: dataline[9],
                    endOfRange: dataline[10]
                });
            }
        });
        let sistreadflag = false;
        decodedData.forEach((line) => {
            if (!sistreadflag) {
                if (line == "[SIDSSTARS]") sistreadflag = true;
            }
            else {
                if (line.startsWith("[")) {
                    posreadflag = false;
                    return;
                }
                //去掉注释
                if (line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                //跳过空行
                if (line == "") return;
                //读取
                const dataline = line.split(":");
                result.sidsstars.push({
                    type: dataline[0],
                    airport: dataline[1],
                    runway: dataline[2],
                    name: dataline[3],
                    route: dataline[4].split(" "),

                });
            }
        });
        return result;
    }
    else {
        throw `path: ${path} does not exist.`;
    }
}

export function ReadPrfData(data: sectortype.PrfData, flag: string): string | undefined {
    for (let index = 0; index < data.settings.length; index++) {
        const item = data.settings[index];
        if (index < data.settings.length && item.flag == flag) return item.data.trim();//substring(0, item.data.length - 1);
    }
}

export function ConvertEsePath(sctpath: string) {
    return sctpath.substring(0, sctpath.length - 3) + "ese";
}

export function AlignPath(path: string) {
    while (path.lastIndexOf("\\") !== -1 && path.lastIndexOf("\n")) {
        path = path.replace("\\", "/");
        path = path.replace("\n", "");
    }
    return path;
}

export function ReadSctDefine(data: SctDefinition[], flag: string): string | undefined {
    for (let index = 0; index < data.length; index++) {
        const definition = data[index];
        if (definition.flag == flag) return definition.color;
    }
}

export function ReadSctFix(data: SctFix[], name: string): Coordinate_B | undefined {
    for (let index = 0; index < data.length; index++) {
        const fix = data[index];
        if (fix.name == name) return fix.coord;
    }
}

export function ReadEseFreeText(data: EseFreetext[], group: string, text: string) {
    for (let index = 0; index < data.length; index++) {
        const freetext = data[index];
        if (freetext.group == group && freetext.text == text) return freetext.coord;
    }
}

export function ReadSctGeo(data: SctGEO[], group: string) {
    for (let index = 0; index < data.length; index++) {
        const geo = data[index];
        if (geo.group == group) return geo.items;
    }
}

export function ReadSctRegions(data: SctREGIONS[], group: string) {
    for (let index = 0; index < data.length; index++) {
        const region = data[index];
        if (region.regionName == group) return region;
    }
}

export function ReadSctAirport(data: SctAirport[], icao: string) {
    for (let index = 0; index < data.length; index++) {
        const airport = data[index];
        if (airport.icao == icao) return airport;
    }
}

export function ReadSctLoHiAw(data: SctLoHiAirway[], group: string) {
    for (let index = 0; index < data.length; index++) {
        const airway = data[index];
        if (airway.group == group) return airway;
    }
}

export function ReadSctSidStar(data: SctSIDSTAR[], group: string) {
    for (let index = 0; index < data.length; index++) {
        const sidstar = data[index];
        if (sidstar.group == group) return sidstar;
    }
}

export function ReadSctRunway(data: SctRunway[], icao: string, idents: string) {
    for (let index = 0; index < data.length; index++) {
        const runway = data[index];
        if (runway.airportCode == icao && `${runway.endPointA}-${runway.endPointB}` == idents) return runway;
    }
}

export function ReadSctVORNDB(data: SctVorNdb[], name: string) {
    for (let index = 0; index < data.length; index++) {
        const vorndb = data[index];
        if (vorndb.name == name) return vorndb;
    }
}

export function ReadSctARTCC(data: SctARTCC[], group: string) {
    for (let index = 0; index < data.length; index++) {
        const artcc = data[index];
        if (artcc.group == group) return artcc;
    }
}

export function ReadSymbol(data: SymbologyDefine[], type: string, flag: string) {
    for (let index = 0; index < data.length; index++) {
        const symbol = data[index];
        if (symbol.type == type && symbol.flag == flag) return symbol.data;
    }
}

export function DecodeData(data: Buffer): string[] {
    const encodetype = jschardet.detect(data);
    switch (encodetype.encoding) {
        case 'UTF-8':
            return data.toString('utf-8').split("\n");
        default:
            return jschardet.decode(data, 'gbk').split("\n");
    }
}

/**
 * 读取扇区所需要的函数集合
 * 所有读取均会自动识别文件文本编码。
 */
export default {
    LoadPrfFile, LoadPrfFileSync,
    LoadAsrFile, LoadAsrFileSync,
    LoadSctFile, LoadSctFileSync,
    LoadEseFile, LoadEseFileSync,
}
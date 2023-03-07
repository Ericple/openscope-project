import { Coordinate_B, Coordinate_A, PolarCoordinate } from "./datatype";
import {EARTH_RADIUS_LONG} from "./global";


/**
 * 将B类坐标转换成A类坐标
 * @param coord B类坐标
 */
export function parse2CoordA(coord: Coordinate_B): Coordinate_A {
    console.log(coord);
    throw "function not implemented";
}
export function DegToRad(deg:number){
    return Math.PI*(deg/180);
}
/**
 * 将A类坐标转换成B类坐标
 * @param coord A类坐标
 * @returns B类直角绘制坐标
 */
export function parse2CoordB_(coord: Coordinate_A): Coordinate_B {
    let latres;
    let lonres;
    try {
        const pureLatNumber = coord.latitude.substring(1, coord.latitude.length).split(".");
        const pureLonNumber = coord.longitude.substring(1, coord.longitude.length).split(".");
        if (pureLatNumber.length == 4) {
            const deg = parseInt(pureLatNumber[0]); const min = parseInt(pureLatNumber[1]);
            const sec = parseInt(pureLatNumber[2]); const subsec = parseInt(pureLatNumber[3]);
            latres = deg + min / 60 + (sec + subsec / 1000) / 3600;
            if (coord.latitude.startsWith("N")) latres = -latres;
        }
        if (pureLonNumber.length == 4) {
            const deg = parseInt(pureLonNumber[0]); const min = parseInt(pureLonNumber[1]);
            const sec = parseInt(pureLonNumber[2]); const subsec = parseInt(pureLonNumber[3]);
            lonres = deg + min / 60 + (sec + subsec / 1000) / 3600;
        }
        if(latres == undefined || lonres == undefined) return {latitude:0,longitude:0}
        return {
            latitude: Math.log(Math.tan((Math.PI*0.25)+(0.5*DegToRad(latres))))*EARTH_RADIUS_LONG,
            longitude: DegToRad(lonres)*EARTH_RADIUS_LONG
        }
    } catch (error) {
        console.log(coord.latitude, coord.longitude);
        throw error;
    }
}
export function parse2CoordB(coord: Coordinate_A){
    let latres = parseFloat(coord.latitude.substring(1, coord.latitude.length));
    const lonres = parseFloat(coord.longitude.substring(1,coord.longitude.length));
    if(coord.latitude.startsWith("N")) latres = -latres;
    return {
        latitude: latres,
        longitude: lonres
    }
}
/**
 * 将B类坐标转换为极坐标
 * @param coord B类坐标
 * @returns 极坐标
 */
export function parse2PolarCoord(coord: Coordinate_B): PolarCoordinate {
    return {
        radius: Math.atan(coord.latitude / coord.longitude),
        length: Math.sqrt(coord.latitude ^ 2 + coord.longitude ^ 2)
    }
}

export const parserMap = {
    'obscure': parse2CoordB_,
    'precise': parse2CoordB
}

/**
 * 实现坐标与坐标的转换
 * 内置坐标类型： `Coordinate_A` `Coordinate_B` `PolarCoordinate`
 */
export default {
    parse2CoordA, parse2CoordB_, parse2PolarCoord, parse2CoordB
}

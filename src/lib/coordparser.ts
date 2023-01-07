import { Coordinate_B, Coordinate_A, PolarCoordinate } from "./datatype";

/**
 * 将B类坐标转换成A类坐标
 * @param coord B类坐标
 */
export function parse2CoordA(coord: Coordinate_B): Coordinate_A {
    console.log(coord);
    throw "function not implemented";
}
/**
 * 将A类坐标转换成B类坐标
 * @param coord A类坐标
 * @returns B类直角绘制坐标
 */
export function parse2CoordB(coord: Coordinate_A): Coordinate_B {
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
        if(latres == undefined || lonres == undefined) return {latitude:0,longtitude:0}
        return {
            latitude: latres,
            longtitude: lonres
        }
    } catch (error) {
        console.log(coord.latitude, coord.longitude);
        throw error;
    }
}
/**
 * 将B类坐标转换为极坐标
 * @param coord B类坐标
 * @returns 极坐标
 */
export function parse2PolarCoord(coord: Coordinate_B): PolarCoordinate {
    return {
        radius: Math.atan(coord.latitude / coord.longtitude),
        length: Math.sqrt(coord.latitude ^ 2 + coord.longtitude ^ 2)
    }
}

/**
 * 实现坐标与坐标的转换
 * 内置坐标类型： `Coordinate_A` `Coordinate_B` `PolarCoordinate`
 */
export default {
    parse2CoordA, parse2CoordB, parse2PolarCoord
}
/**
 * 由一对字符串组成的坐标，形如 `N40.36.18.000` `E112.52.13.000`
 */
export type Coordinate_A = {
    latitude: string,
    longitude: string
}
/**
 * 由一对浮点数组成的坐标，形如 `40.3613692` `112.7219753`
 */
export type Coordinate_B = {
    latitude: number,
    longtitude: number
}
/**
 * 极坐标
 * @param radius 极角
 * @param length 极径
 */
export type PolarCoordinate = {
    radius: number,
    length: number
}

/**
 * prf配置文件的配置项
 */
export type PrfItem = {
    type: string,
    flag: string,
    data: string
}
/**
 * asr文件中定义的配置
 */
export type AsrSetting = {
    flag: string,
    data: string
}
/**
 * asr文件中定义的绘制项
 * @param type indicate the type of item. Possible value contains 
 * `ARTCC low boundary` `Fixes` `Free Text`
 * `Geo` `Regions` `Runways` `Sids` `Stars`
 * `VORs`
 * @param name indicate the name of item. If the item is freetext, the format of name should be
 * `group`\\`name`
 * @param flag indicate the item to draw. Possible value contains
 * `name` `symbol` `freetext`, for runways, it will be more complex.
 */
export type AsrDrawItem = {
    type: string,
    name: string,
    flag: string,
    draw: boolean
}
/**
 * asr文件中定义的默认显示区域，由左上角坐标及右下角坐标组成
 */
export type AsrWindowArea = {
    coord1: Coordinate_B,
    coord2: Coordinate_B
}

/**
 * sct文件中定义的颜色组，读取时转化为16进制颜色代码
 */
export type SctDefinition = {
    flag: string,
    color: string
}
/**
 * sct文件的版权和信息内容，仅读取版权
 */
export type SctInfo = {
    copyright: string
}
/**
 * sct文件中定义的VOR及NDB
 */
export type SctVorNdb = {
    name: string,
    frequency: string,
    coord: Coordinate_B,
}
export type SctAirport = {
    icao: string,
    frequency: string,
    coord: Coordinate_B,
    class: string,

}
export type SctRunway = {
    endPointA: string,
    endPointB: string,
    HeadingA: number,
    HeadingB: number,
    coordA: Coordinate_B,
    coordB: Coordinate_B,
    airportCode: string,
    airportName: string,

}
export type SctFix = {
    name: string,
    coord: Coordinate_B,

}
export type SctARTCC = {
    group: string,
    coords: {
        coordA: Coordinate_B,
        coordB: Coordinate_B,
    }[]
}
export type SctSIDSTAR = {
    group: string,
    coords: {
        coordA: Coordinate_B,
        coordB: Coordinate_B,
    }[]
}
export type SctLoHiAirway = {
    group: string,
    coords: {
        coordA: Coordinate_B,
        coordB: Coordinate_B,
    }[]

}
export type SctGEO = {
    group: string,
    items: {
        coordA: Coordinate_B,
        coordB: Coordinate_B,
        colorFlag: string,
    }[],
}
export type SctREGIONS = {
    group: string,
    items: {
        colorFlag: string,
        coords: Coordinate_B[],
    }[]
}

export type EseAirspaceDisplay = {
    sectorControlling: string,
    sectorCovered: string[]
}
export type EseAirspaceSubsection = {
    sector: {
        name: string | null,
        loAltLimit: number | null,
        upAltLimit: number | null
    } | null,
    owner: string[] | null,
    altowner: string[] | null,
    border: string[] | null
}
export type EseAirspace = {
    sectorline: string,
    displayCondition: EseAirspaceDisplay[],
    coords: Coordinate_B[],
    subsection: EseAirspaceSubsection,
    active: {
        airport: string,
        runway: string
    } | null
}
export type EseFreetext = {
    coord: Coordinate_B,
    group: string,
    text: string,

}
export type EsePosition = {
    name: string,
    callsign: string,
    frequency: string,
    identifier: string,
    middleLetter: string,
    prefix: string,
    suffix: string,
    notUsed1: string,
    notUsed2: string,
    startOfRange: string,
    endOfRange: string
}
export type EseSidsStars = {
    type: string,
    airport: string,
    runway: string,
    name: string,
    route: string[],

}


/**
 * @param type Symbology definition type, possible value contains
 * `Airports` `Low airways` `High airways` `Fixes` and etc.
 * @param flag SYmbology definition flag, possible value contains
 * `symbol` `name` `line`.
 */
export type SymbologyDefine = {
    type: string,
    flag: string,
    data: {
        color: string,
        fontSymbolSize: number,
        lineWeight: number,
        lineStyle: number,
        alignment: number
    }
}
export type SymbologyDrawScript = {
    ident: number,
    sciprts: string[]
}

export type VoiceChannelDefine = {
    type: string,
    name: string,
    frequency: string,
    server: string,
    callsign: string
}

export type ProfileDefine = {
    info: {
        ident: string,
        range: number,
        facility: number
    },
    atis2: string | null,
    atis3: string | null,
    atis4: string | null
}
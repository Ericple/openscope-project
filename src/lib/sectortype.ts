import { parse2CoordB } from "./coordparser";
import { AsrDrawItem, AsrSetting, AsrWindowArea, EseAirspace, EseFreetext, EsePosition, EseSidsStars, PrfItem, SctAirport, SctARTCC, SctDefinition, SctFix, SctGEO, SctInfo, SctLoHiAirway, SctREGIONS, SctRunway, SctSIDSTAR, SctVorNdb } from "./datatype";

class AsrData {
    settings: AsrSetting[] = [];
    items: AsrDrawItem[] = [];
    windowArea: AsrWindowArea | null = {
        coord1: parse2CoordB({
            latitude: "N0.0.0.0",
            longitude: "E0.0.0.0"
        }),
        coord2: parse2CoordB({
            latitude: "N0.0.0.0",
            longitude: "E0.0.0.0"
        })
    };
}

class PrfData {
    settings: PrfItem[] = [];
}

class SctData {
    definitions: SctDefinition[] = [];
    info: SctInfo = { copyright: "" };
    vors: SctVorNdb[] = [];
    ndbs: SctVorNdb[] = [];
    airports: SctAirport[] = [];
    runways: SctRunway[] = [];
    fixes: SctFix[] = [];
    ARTCCs: SctARTCC[] = [];
    sids: SctSIDSTAR[] = [];
    stars: SctSIDSTAR[] = [];
    loAirways: SctLoHiAirway[] = [];
    hiAirways: SctLoHiAirway[] = [];
    GEOs: SctGEO[] = [];
    REGIONs: SctREGIONS[] = [];
}

class EseData {
    airspacces: EseAirspace[] = [];
    freetexts: EseFreetext[] = [];
    positions: EsePosition[] = [];
    sidsstars: EseSidsStars[] = [];
}



export {
    AsrData, PrfData, EseData, SctData
}
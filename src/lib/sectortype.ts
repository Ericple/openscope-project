import { AsrDrawItem, AsrSetting, AsrWindowArea, EseAirspace, EseFreetext, EsePosition, EseSidsStars, PrfItem, SctAirport, SctARTCC, SctDefinition, SctFix, SctGEO, SctInfo, SctLoHiAirway, SctREGIONS, SctRunway, SctSIDSTAR, SctVorNdb } from "./datatype";

class AsrData {
    settings: AsrSetting[] = [];
    items: AsrDrawItem[] = [];
    windowArea: AsrWindowArea | null = {
        coord1:{
            latitude:"",
            longitude:""
        },
        coord2:{
            latitude:"",
            longitude:""
        }
    };
}

class PrfData {
    settings: PrfItem[] = [];
}

class SctData {
    definitions: SctDefinition[] = [];
    info: SctInfo = { copyright:"" };
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
    AsrData,PrfData,EseData,SctData
}
import path from 'path';
export const VMETAR_URL = "https://api.aviationapi.com/v1/weather/metar?apt=";
export const METAR_URL = "https://metar.vatsim.net/";
export const DefaultSectorSettingFilePath = path.join(__dirname, "config", "defaultsector.txt");
export const obsAcfDataApi = "https://api.aviationapi.com/v1/vatsim/pilots?apt=";
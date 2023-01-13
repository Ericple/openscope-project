import { WarningBox } from "../../lib/popupMsger";
/**
 * 读取-获取解析器-建立索引-解析
 * 1. 读取
 * 直接把文件读入并转换为JSON对象
 * 2. 获取解析器
 * 通过读取对象中的config，构造出合适的解析器
 * 3. 解析
 * 在需要绘制时，使用已构建的解析器进行读取并绘制
 */
export class CSectorLoader {
    rootpath: string;
}
const latSisnMap = {
    'N': -1,
    'S': 1,
}

export const CoordinateReaderMap = {
    'obscure': function(lat: string, lon: string) {
        const signLat = lat[0];
        const larry = lat.substring(1, lat.length).split(".");
        const lorry = lon.substring(1, lon.length).split(".");
        if(larry.length < 3 || lorry.length < 3) {
            WarningBox({title: "Warning", message: `Coordinate like ${lat} or ${lon} is invalid`});
            return {
                latitude: 0,
                longitude: 0
            }
        } else {
            const latitude = latSisnMap[signLat] * (parseInt(larry[0]) + parseInt(larry[1]) / 60 + (parseInt(larry[2]) + parseInt(larry[3]) / 1000) / 3600);
            const longitude = parseInt(lorry[0]) + parseInt(lorry[1]) / 60 + (parseInt(lorry[2]) + parseInt(lorry[3]) / 1000) / 3600;
            return {
                latitude: latitude,
                longitude: longitude
            }
        }
    },
    'precise': function(lat :string, lon: string) {
        return {
            latitude: parseFloat(lat) * (-1),
            longitude: parseFloat(lon)
        }
    }
}

export default CSectorLoader;
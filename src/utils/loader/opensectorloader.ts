import CSectorLoader from "./sectorloader";
import fs from 'fs';
import { ErrorBox } from "../../lib/popupMsger";
import path from 'path';
export class OpenSectorLoader extends CSectorLoader {
    cache: JSON[] = [];
    constructor(path: string) {
        super();
        this.rootpath = path;
    }
    public Read(){
        if (!fs.existsSync(this.rootpath) || path.extname(this.rootpath) !== '.json') {
            ErrorBox({
                title: "错误",
                message: `路径 ${this.rootpath} 不是合法的扇区入口文件`
            });
            return;
        }
        return JSON.parse(fs.readFileSync(this.rootpath, 'utf-8'));
    }
}

export default OpenSectorLoader;
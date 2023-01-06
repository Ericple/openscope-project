import fs from "fs";
import * as jschardet from "iconv-jschardet";
import { ProfileData, SymbologyData, VoiceData } from "../lib/settingtype";

export function LoadSymbology(path: string, callback: (err: NodeJS.ErrnoException | null, data: SymbologyData) => void) : void
{
    if(fs.existsSync(path))
    {
        const result: SymbologyData = new SymbologyData();
        fs.readFile(path,(err,data) => {
            const encodetype = jschardet.detect(data);
            let decodedData: string[];
            switch (encodetype.encoding) {
                case 'UTF-8':
                    decodedData = data.toString('utf-8').split("\n");
                    break;
                default:
                    decodedData = jschardet.decode(data, 'gbk').split("\n");
                    break;
            }
            decodedData.forEach((line) => {
                const dataline = line.split(":");
                if(dataline.length == 7)
                {
                    const hexcolor = dataline[2];
                    result.colors.push({
                        type: dataline[0],
                        flag: dataline[1],
                        data: {
                            color: hexcolor,
                            fontSymbolSize: parseFloat(dataline[3]),
                            lineWeight: parseFloat(dataline[4]) == 0 ? 0.5 : parseFloat(dataline[4]) / 3,
                            lineStyle: parseInt(dataline[5]),
                            alignment: parseInt(dataline[6])
                        }
                    });
                }
                else
                {
                    if(dataline[0] == "SYMBOL")
                    {
                        result.scripts.push({
                            ident: parseInt(dataline[1]),
                            sciprts: []
                        });
                    }
                    else if(dataline[0] == "SYMBOLITEM")
                    {
                        result.scripts[result.scripts.length - 1].sciprts.push(dataline[1]);
                    }
                    else if(dataline[0] == "m_ClipArea")
                    {
                        result.m_ClipArea = parseInt(dataline[1]);
                    }
                }
            });
            callback(err,result);
        });
    }
    else
    {
        throw `path: ${path} does not exist.`;
    }
}

export function LoadSymbologySync(path: string) : SymbologyData
{
    if(fs.existsSync(path))
    {
        const result: SymbologyData = new SymbologyData();
        const data = fs.readFileSync(path);
        const encodetype = jschardet.detect(data);
        let decodedData: string[];
        switch (encodetype.encoding) {
            case 'UTF-8':
                decodedData = data.toString('utf-8').split("\n");
                break;
            default:
                decodedData = jschardet.decode(data, 'gbk').split("\n");
                break;
        }
        decodedData.forEach((line) => {
            const dataline = line.split(":");
            if(dataline.length == 7)
            {
                const color = "#" + parseInt(dataline[2]).toString(16).padStart(6,"0");
                result.colors.push({
                    type: dataline[0],
                    flag: dataline[1],
                    data: {
                        color: color,
                        fontSymbolSize: parseFloat(dataline[3]),
                        lineWeight: parseFloat(dataline[4]) == 0 ? 0.5 : parseFloat(dataline[4]) / 3,
                        lineStyle: parseInt(dataline[5]),
                        alignment: parseInt(dataline[6])
                    }
                });
            }
            else
            {
                if(dataline[0] == "SYMBOL")
                {
                    result.scripts.push({
                        ident: parseInt(dataline[1]),
                        sciprts: []
                    });
                }
                else if(dataline[0] == "SYMBOLITEM")
                {
                    result.scripts[result.scripts.length - 1].sciprts.push(dataline[1]);
                }
                else if(dataline[0] == "m_ClipArea")
                {
                    result.m_ClipArea = parseInt(dataline[1]);
                }
            }
        });
        return result;
    }
    else
    {
        throw `path: ${path} does not exist.`;
    }
}

export function LoadVoice(path: string, callback: (err: NodeJS.ErrnoException | null, data: VoiceData) => void) : void
{
    if(fs.existsSync(path))
    {
        const result: VoiceData = new VoiceData(); 
        fs.readFile(path,(err,data) => {
            const encodetype = jschardet.detect(data);
            let decodedData: string[];
            switch (encodetype.encoding) {
                case 'UTF-8':
                    decodedData = data.toString('utf-8').split("\n");
                    break;
                default:
                    decodedData = jschardet.decode(data, 'gbk').split("\n");
                    break;
            }
            decodedData.forEach((line) => {
                const dataline = line.split(":");
                if(dataline.length == 5)
                {
                    result.channels.push({
                        type: dataline[0],
                        name: dataline[1],
                        frequency: dataline[2],
                        server: dataline[3],
                        callsign: dataline[4]
                    });
                }
            });
            callback(err,result);
        });
    }
    else
    {
        throw `path: ${path} does not exist.`;
    }
}

export function LoadVoiceSync(path: string) : VoiceData
{
    if(fs.existsSync(path))
    {
        const result: VoiceData = new VoiceData();
        const data = fs.readFileSync(path);
        const encodetype = jschardet.detect(data);
        let decodedData: string[];
        switch (encodetype.encoding) {
            case 'UTF-8':
                decodedData = data.toString('utf-8').split("\n");
                break;
            default:
                decodedData = jschardet.decode(data, 'gbk').split("\n");
                break;
        }
        decodedData.forEach((line) => {
            const dataline = line.split(":");
            if(dataline.length == 5)
            {
                result.channels.push({
                    type: dataline[0],
                    name: dataline[1],
                    frequency: dataline[2],
                    server: dataline[3],
                    callsign: dataline[4]
                });
            }
        });
        return result;
    }
    else
    {
        throw `path: ${path} does not exist.`;
    }
}

export function LoadProfile(path: string, callback: (err: NodeJS.ErrnoException | null, data: ProfileData) => void) : void
{
    if(fs.existsSync(path))
    {
        const result: ProfileData = new ProfileData();
        fs.readFile(path,(err,data) => {
            const encodetype = jschardet.detect(data);
            let decodedData: string[];
            switch (encodetype.encoding) {
                case 'UTF-8':
                    decodedData = data.toString('utf-8').split("\n");
                    break;
                default:
                    decodedData = jschardet.decode(data, 'gbk').split("\n");
                    break;
            }
            decodedData.forEach((line) => {
                //跳过空行
                if(line == "") return;
                //除去注释
                if(line.lastIndexOf(";") !== -1) line = line.split(";")[0];
                const dataline = line.split(":");
                if(dataline.length == 4)
                {
                    if(dataline[0] == "PROFILE")
                    {
                        result.profile.push({
                            info: {
                                ident: dataline[1],
                                range: parseInt(dataline[2]),
                                facility: parseInt(dataline[3])
                            },
                            atis2: "",
                            atis3: "",
                            atis4: ""
                        });
                    }
                }
                if(dataline.length == 2)
                {
                    if (dataline[0] == "ATIS2")
                    {
                        result.profile[result.profile.length - 1].atis2 = dataline[1];
                    }
                    else if (dataline[0] == "ATIS3")
                    {
                        result.profile[result.profile.length - 1].atis3 = dataline[1];
                    }
                    else if (dataline[0] == "ATIS4")
                    {
                        result.profile[result.profile.length - 1].atis4 = dataline[1];
                    }
                }
            });
            callback(err,result);
        });
    }
    else
    {
        throw `path: ${path} does not exist.`;
    }
}

export function LoadProfileSync(path: string) : ProfileData
{
    if(fs.existsSync(path))
    {
        const result: ProfileData = new ProfileData();
        const data = fs.readFileSync(path);
        const encodetype = jschardet.detect(data);
        let decodedData: string[];
        switch (encodetype.encoding) {
            case 'UTF-8':
                decodedData = data.toString('utf-8').split("\n");
                break;
            default:
                decodedData = jschardet.decode(data, 'gbk').split("\n");
                break;
        }
        decodedData.forEach((line) => {
            //跳过空行
            if(line == "") return;
            //除去注释
            if(line.lastIndexOf(";") !== -1) line = line.split(";")[0];
            const dataline = line.split(":");
            if(dataline.length == 4)
            {
                if(dataline[0] == "PROFILE")
                {
                    result.profile.push({
                        info: {
                            ident: dataline[1],
                            range: parseInt(dataline[2]),
                            facility: parseInt(dataline[3])
                        },
                        atis2: "",
                        atis3: "",
                        atis4: ""
                    });
                }
            }
            if(dataline.length == 2)
            {
                if (dataline[0] == "ATIS2")
                {
                    result.profile[result.profile.length - 1].atis2 = dataline[1];
                }
                else if (dataline[0] == "ATIS3")
                {
                    result.profile[result.profile.length - 1].atis3 = dataline[1];
                }
                else if (dataline[0] == "ATIS4")
                {
                    result.profile[result.profile.length - 1].atis4 = dataline[1];
                }
            }
        });
        return result;
    }
    else
    {
        throw `path: ${path} does not exist.`;
    }
}

export default {
    LoadSymbology,LoadSymbologySync,
    LoadVoice,LoadVoiceSync,
    LoadProfile,LoadProfileSync
}
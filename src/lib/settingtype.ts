import { SymbologyDefine, SymbologyDrawScript, VoiceChannelDefine, ProfileDefine } from "./datatype";

export class SymbologyData {
    colors: SymbologyDefine[] = [];
    scripts: SymbologyDrawScript[] = [];
    m_ClipArea = 0;
}

export class VoiceData {
    channels: VoiceChannelDefine[] = [];
}

export class ProfileData {
    profile: ProfileDefine[] = [];
}

export default {
    SymbologyData,VoiceData,ProfileData
}
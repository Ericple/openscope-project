import CNetworkConnection, { INetworkConnectOption, prefixActionMap } from "./network";

export class TeleConnection extends CNetworkConnection {
    constructor(options?: INetworkConnectOption) {
        super();
        if(options) this._configure(options);
    }
    /**
     * 开始进行数据接受，当收到数据包时先进行解析，后根据包prefix来调用相应事件
     * @Ericple
     * Tele的Start实现代码与VATSIM的相同，是因为TeleFlightServer在编写时就
     * 考虑到与FSD的兼容性，因此大部分数据包的结构均与FSD Server相似。
     * @returns void
     */
    override _start(): void {
        if (!this.connected) return;
        this.client.on('data', (data) => {
            const dataline = data.toString();
            const action = prefixActionMap[dataline[0]];
            if(!action) {
                this.emitter.emit('error')(new Error(`Cannot read the prefix of dataline ${dataline}`));
                return;
            }
            this.emitter.emit(action)(null, this.parsePacket(dataline));
        });
    }
}
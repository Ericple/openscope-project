import CNetworkConnection, { INetworkConnectOption } from "./network";

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
        if(!this.connected) return;
        this.client.on('data', (data) => {
            const dataline = data.toString();
            switch (dataline[0]) {
                case '$':
                    this.emitter.emit('reqandres')(null, this.parsePacket(dataline));
                    break;
                case '#':
                    this.emitter.emit('tmandca')(null, this.parsePacket(dataline));
                    break;
                case '%':
                    this.emitter.emit('atcupdate')(null, this.parsePacket(dataline));
                    break;
                case '@':
                    this.emitter.emit('aircraftupdate')(null, this.parsePacket(dataline));
                    break;
                default:
                    this.emitter.emit('error')(new Error('cannot read the prefix of dataline.'));
                    break;
            }
        })
    }
}
import NETWORK_CONNECTION, { NetworkConnectInfo, NetworkConnectOption, NETWORK_CONNECTION_EVENTMAP, Packet } from "./network";
/**
 * @class VATSIM_CONNECTION
 * @description Class to handle packets between client and vatsim
 * server
 */
export class VATSIM_CONNECTION extends NETWORK_CONNECTION {
    constructor(options?: NetworkConnectInfo) {
        super();
        if(options) this._configure(options);
    }
    override _configure(options: NetworkConnectInfo): void {
        if(options) this.emitter.emit('configurechanged')(new Event('configurechanged'));
        if(options.callsign) this.callsign = options.callsign;
        if(options.fullName) this.fullName = options.fullName;
        if(options.networkId) this.networkId = options.networkId;
        if(options.password) this.password = options.password;
        if(options.rating) this.rating = options.rating;
    }
    /**
     * 注册一个处理函数以处理抛出事件
     * @param type 事件类型
     * @param callback 回调
     */
    override _eventHandler(type: keyof NETWORK_CONNECTION_EVENTMAP, callback: (event?: Event, data?: Packet | string) => void): void {
        this.emitter.on(type, callback);
    }
    override _connect(options: NetworkConnectOption): void {
        this.client.connect(options.port, options.address, () => {
            this.emitter.emit('connected')();
            this.connected = true;
        });
    }
    override _start(): void {
        if(!this.connected) return;
        this.client.on('data',(data) => {
            const dataline = data.toString();
            switch(dataline[0]) {
                case '$':
                    this.emitter.emit('reqandres')(new Event('reqandres'), this.parsePacket(dataline));
                    break;
                case '#':
                    this.emitter.emit('tmandca')(new Event('tmandca'), this.parsePacket(dataline));
                    break;
                case '%':
                    this.emitter.emit('atcupdate')(new Event('atcupdate'), this.parsePacket(dataline));
                    break;
                case '@':
                    this.emitter.emit('aircraftupdate')(new Event('aircraftupdate'), this.parsePacket(dataline));
                    break;
                default:
                    this.emitter.emit('error')(new Event('error'), 'cannot read the prefix of dataline.');
                    break;
            }
        });
    }
}
export default VATSIM_CONNECTION;
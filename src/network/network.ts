import { Emitter } from "../utils/emitter";
import net from "net";

/**
 * @Ericple
 * @class NETWORK_CONNECTION
 */
export abstract class CNetworkConnection {
    
    protected connectOption: INetworkConnectOption;
    /**
     * 连接使用的端口版本
     */
    protected protocolVersion: string | undefined;

    protected client: net.Socket = new net.Socket();

    protected connected = false;

    protected emitter = new Emitter<InetworkConnectionEventMap>();
    /**
     * 注册一个处理函数以处理抛出事件
     * @param type 事件类型
     * @param callback 回调
     * @example
     * client._eventHandler('connected', () => {
     *  console.log("已连接");
     * })
     */
    protected _eventHandler(type: keyof InetworkConnectionEventMap, callback: (e?: Error | undefined, data?: IPacket | string) => void): void {
        this.emitter.on(type, callback);
    }
    /**
     * 配置连接
     * @param options 连接设置
     * @example
     * client._configure({
     *  address: "example.address",
     *  port: 10000
     * })
     */
    protected _configure(options: INetworkConnectOption): void {
        if (options) this.emitter.emit('configurechanged')();
        if (options.address) this.connectOption.address = options.address;
        if (options.port) this.connectOption.port = options.port;
    }
    /**
     * 连接到配置的服务器
     * 若未进行配置，则不会执行
     * @example
     * client._connect();
     */
    protected _connect(): void {
        if(this.connectOption) return;
        this.client.connect(this.connectOption.port, this.connectOption.address, () => {
            this.emitter.emit('connected')();
            this.connected = true;
        });
        this.client.on('end', () => {
            this.connected = false;
        });
        this.client.on('error', (err) => {
            this.emitter.emit('error')(err);
        });
    }
    /**
     * 开始进行数据接受，当收到数据包时先进行解析，后根据包prefix来调用相应事件
     * @example
     * client._connect({address: 'exampleaddr', port: 0});
     * client._eventHandler('connected', (err) => {
     *  if(err) throw err;
     *  client._start();
     * })
     */
    abstract _start(): void;
    /**
     * 向服务器发送数据，若未连接至服务器，则不会执行。
     * @param data 要发送的数据
     * @example
     * const data = ["$DX", dest, source, data];
     */
    protected _send(data: string[]): void {
        if (!this.connected) return;
        const packet = data.join(":");
        this.client.write(packet, (err) => {
            this.emitter.emit('error')(err);
        });
    }
    protected parsePacket(dataline: string): IPacket {
        const result: string[] = [];
        for (let i = 0; i < 3; i++) {
            const coma = dataline.search(":");
            result.push(dataline.substring(0, coma));
            dataline = dataline.substring(coma + 1, dataline.length);
        }
        if(result.length < 3) throw new Error(`Data: ${dataline} Validation failed`);
        return {
            command: result[0].substring(1,result[0].length),
            destination: result[1],
            source: result[2],
            data: dataline
        }
    }
}

export interface InetworkConnectionEventMap {
    /**
     * Adding/removing clients, text messages
     */
    tmandca: Event;
    query: Event;
    configurechanged: Event;
    connected: Event;
    disconnected: Event;
    reqandres: Event;
    atcupdate: Event;
    aircraftupdate: Event;
    error: Event;
}

export interface INetworkConnectPacket {
    /**
     * 连接时所用的呼号
     * @private
     */
    callsign?: string;
    /**
     * 全名
     * @private 
     */
    fullName?: string;
    /**
     * 用于连接的网络id(cid)
     */
    networkId?: string;
    /**
     * 用于连接的密码
     */
    password?: string;
    /**
     * 管制员登录时请求的管制权限级别
     */
    rating?: string;
}

export interface INetworkConnectOption {
    address: string;
    port: number;
}

export interface IPacket {
    command: string;
    destination: string;
    source: string;
    data: string;
}

export default CNetworkConnection;
import { Emitter } from "../utils/emitter";
import net from "net";

/**
 * @Ericple
 * @class NETWORK_CONNECTION
 */
export abstract class NETWORK_CONNECTION {
    /**
     * 连接时所用的呼号
     * @private
     */
    protected callsign: string | undefined;
    /**
     * 全名
     * @private 
     */
    protected fullName: string | undefined;
    /**
     * 用于连接的网络id(cid)
     */
    protected networkId: string | undefined;
    /**
     * 用于连接的密码
     */
    protected password: string | undefined;
    /**
     * 管制员登录时请求的管制权限级别
     */
    protected rating: string | undefined;
    /**
     * 连接使用的端口版本
     */
    protected protocolVersion: string | undefined;

    protected client: net.Socket = new net.Socket();

    protected connected = false;

    protected emitter = new Emitter<NETWORK_CONNECTION_EVENTMAP>();

    abstract _eventHandler(type: keyof NETWORK_CONNECTION_EVENTMAP, callback: (e?: Event, data?: Packet | string) => void): void;
    abstract _configure(options: NetworkConnectInfo): void;
    abstract _connect(options: NetworkConnectOption): void;
    abstract _start(): void;

    protected parsePacket(dataline: string): Packet {
        const result = [];
        for (let i = 0; i < 3; i++) {
            const coma = dataline.search(":");
            result.push(dataline.substring(0, coma));
            dataline = dataline.substring(coma + 1, dataline.length);
        }
        return {
            command: result[0],
            destination: result[1],
            source: result[2],
            data: dataline
        }
    }
}

export interface NETWORK_CONNECTION_EVENTMAP {
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

export type NetworkConnectInfo = {
    callsign?: string;
    fullName?: string;
    networkId?: string;
    password?: string;
    rating?: string;
}

export type NetworkConnectOption = {
    address: string;
    port: number;
}

export type Packet = {
    command: string;
    destination: string;
    source: string;
    data: string;
}

export default NETWORK_CONNECTION;
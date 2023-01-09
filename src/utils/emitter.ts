import { IPacket } from "../network/network";

export class Emitter<T> {
    private fnMap = new Map<keyof T, (e?: Error | undefined, data?: IPacket | string) => void>();
    /**
     * 注册一个handler
     * @param key 事件类型
     * @param callback 回调
     */
    on<K extends keyof T>(key: K, callback: (e?: Error | undefined, data?: IPacket | string) => void): void {
        this.fnMap.set(key, callback);
    }
    /**
     * 使用一个handler
     * @param key 事件类型
     * @returns 
     */
    emit<K extends keyof T>(key: K): (e?: Error | undefined, data?: IPacket | string) => void {
        const callback = this.fnMap.get(key);
        return (e?: Error | undefined, data?: IPacket | string) => {
            callback && callback(e, data);
        }
    }
}
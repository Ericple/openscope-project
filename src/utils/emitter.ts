import { Packet } from "../network/network";

export class Emitter<T> {
    private fnMap = new Map<keyof T, (e?: Event, data?: Packet | string) => void>();
    /**
     * 注册一个handler
     * @param key 事件类型
     * @param callback 回调
     */
    on<K extends keyof T>(key: K, callback: (e?: Event, data?: Packet | string) => void): void {
        this.fnMap.set(key,callback);
    }
    /**
     * 使用一个handler
     * @param key 事件类型
     * @returns 
     */
    emit<K extends keyof T>(key: K): (e?: Event, data?: Packet | string) => void {
        const callback = this.fnMap.get(key);
        return (e?: Event, data?: Packet | string) => {
            callback && callback(e,data);
        }
    }
}
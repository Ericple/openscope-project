import CNetworkConnection, { INetworkConnectOption, fsdPrefixActionMap } from "./network";
/**
 * @class VatsimConnection
 * @description Class to handle packets between client and vatsim
 * server
 */
export class VatsimConnection extends CNetworkConnection {
    constructor(options?: INetworkConnectOption) {
        super();
        if (options) this._configure(options);
    }
    override _start(): void {
        if (!this.connected) return;
        this.client.on('data', (data) => {
            const dataline = data.toString();
            const action = fsdPrefixActionMap[dataline[0]];
            if(!action) {
                this.emitter.emit('error')(new Error(`Cannot read the prefix of dataline ${dataline}`));
                return;
            }
            this.emitter.emit(action)(null, this.parsePacket(dataline));
        });
    }
}
export default VatsimConnection;
import {Timer} from "../utils/Timer.mjs";

export class ClientProfiler {
    constructor(client) {
        this._client = client;
    }

    async query(query, args) {
        const timer = new Timer();
        let result = this._client.query(query, args);
        const span = timer.stop();
        if (span > 4000) {
            console.debug('Database query (ms)', span);
            // logQuery(query, args);
        }
        return result;
    }

    release() {
        return this._client.release()
    }
}
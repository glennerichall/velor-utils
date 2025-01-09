import {MapArray} from "./map.mjs";

const kp_emitter = Symbol();
const kp_events = Symbol();
const kp_options = Symbol();

export class EventQueue {

    constructor(emitter, options = {}) {
        this[kp_emitter] = emitter;
        let {
            maxEvents = 100
        } = options;

        this[kp_events] = new MapArray();

        this[kp_options] = {
            maxEvents
        };
    }

    all() {
        this[kp_emitter].onAny((event, ...data) => {
            this[kp_events].push(event, data);
        });
        return this;
    }

    listen(event) {
        this[kp_emitter].on(event, (...data) => {
            if (this[kp_events].length(event) > this[kp_options].maxEvents) {
                this[kp_events].pop(event);
            }
            this[kp_events].push(event, data);

        });
        return this;
    }

    clear(event) {
        if (event) {
            this[kp_events].delete(event);
        } else {
            this[kp_events].clear();
        }
        return this;
    }

    dequeue(event, filter) {
        let index = 0;
        if (filter) {
            index = this[kp_events].findIndex(event, filter);
        }
        if (index >= 0) {
            return this[kp_events].pop(event, index);
        }
        return undefined;
    }

    async waitDequeue(event, filter) {
        let data = this.dequeue(event, filter);
        if (data === undefined) {
            return this[kp_emitter].waitOn(event, filter);
        }
        return data;
    }
}
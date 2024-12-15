import {MapArray} from "./map.mjs";

export class EventQueue {
    #emitter;
    #events = new MapArray();
    #options;

    constructor(emitter, options = {}) {
        this.#emitter = emitter;
        let {
            maxEvents = 100
        } = options;

        this.#options = {
            maxEvents
        };
    }

    all() {
        this.#emitter.onAny((event, ...data) => {
            this.#events.push(event, data);
        });
        return this;
    }

    listen(event) {
        this.#emitter.on(event, (...data) => {
            if (this.#events.length(event) > this.#options.maxEvents) {
                this.#events.pop(event);
            }
            this.#events.push(event, data);

        });
        return this;
    }

    clear(event) {
        if (event) {
            this.#events.delete(event);
        } else {
            this.#events.clear();
        }
        return this;
    }

    dequeue(event, filter) {
        let index = 0;
        if (filter) {
            index = this.#events.findIndex(event, filter);
        }
        if (index >= 0) {
            return this.#events.pop(event, index);
        }
        return undefined;
    }

    async waitDequeue(event, filter) {
        let data = this.dequeue(event, filter);
        if (data === undefined) {
            return this.#emitter.waitOn(event, filter);
        }
        return data;
    }
}
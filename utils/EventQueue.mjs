import {MapArray} from "./map.mjs";

export class EventQueue {
    #emitter;
    #events = new MapArray();

    constructor(emitter) {
        this.#emitter = emitter;
    }

    all() {
        this.#emitter.onAny((event, ...data) => {
            this.#events.push(event, data);
        });
        return this;
    }

    listen(event) {
        this.#emitter.on(event, (...data) => {
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

    dequeue(event) {
        return this.#events.pop(event, 0);
    }

    async waitDequeue(event) {
        let data = this.dequeue(event);
        if (data === undefined) {
            return this.#emitter.waitOn(event);
        }
        return data;
    }
}
import {MapArray} from "./map.mjs";

const kp_listeners = Symbol();
const kp_globals = Symbol();
const kp_idCount = Symbol();
const kp_async = Symbol();
const kp_asyncTimeout = Symbol();
const km_emit = Symbol();

export const EmitterMixin = Base => class extends Base {

    constructor({async = false, asyncTimeout = 0} = {}, ...args) {
        super(...args);
        this[kp_async] = async;
        this[kp_asyncTimeout] = asyncTimeout;
        this[kp_idCount] = 1;
        this[kp_globals] = [];
        this[kp_listeners] = new MapArray();
    }

    [km_emit](event, ...value) {
        return () => {

            // copy arrays for iteration to avoid missing callbacks if any are removed while emitting
            let listeners = this[kp_listeners].get(event) ?? [];
            listeners = [...listeners];
            let globals = [...this[kp_globals]];

            for (let listener of listeners) {
                listener.callback(...value)
            }

            for (let listener of globals) {
                listener.callback(event, ...value)
            }
        }
    }

    emitNextTick(event, ...value) {
        let emit = this[km_emit](event, ...value);
        setTimeout(emit, 0);
    }

    emit(event, ...value) {
        let emit = this[km_emit](event, ...value);

        if (!this[kp_async]) {
            emit();
        } else {
            setTimeout(emit, this[kp_asyncTimeout]);
        }
    }

    onAny(callback) {
        this[kp_idCount]++;
        this[kp_globals].push({id: this[kp_idCount], callback});
        const id = this[kp_idCount];
        return () => {
            for (let i = 0; i < this[kp_globals].length; i++) {
                if (this[kp_globals][i].id === id) {
                    this[kp_globals].splice(i, 1);
                    break;
                }
            }
        };
    }

    once(event, callback, filter) {
        const off = this.on(event, (...args) => {
            if (!filter || filter(args)) {
                off();
                callback(...args);
            }
        });
    }

    awaitOn(event, filter) {
        return new Promise((resolve, reject) => {
            this.once(event, (...value) => resolve(value), filter);
        });
    }

    waitOn(event, filter) {
        return this.awaitOn(event, filter);
    }

    on(event, callback) {
        this[kp_idCount]++;
        const id = this[kp_idCount];
        this[kp_listeners].push(event, {id, callback});
        return () => {
            this.off(id);
        }
    }

    off(id) {
        for (let event of [...this[kp_listeners].keys()]) {
            let index = this[kp_listeners].findIndex(event, listener => listener.id === id);
            if (index >= 0) {
                this[kp_listeners].pop(event, index);
            }
        }
    }

    hasListener(event) {
        return this[kp_listeners].has(event);
    }

    clear() {
        this[kp_listeners] = new MapArray();
        this[kp_globals] = [];
        this[kp_idCount] = 0;
    }
}

export const Emitter = EmitterMixin(class {
});

const globalEmitter = new Emitter();

export const on = (event, callback) => globalEmitter.on(event, callback);
export const emit = (event, value) => globalEmitter.emit(event, value);

export const newEmitterFor = event => {
    return {
        on: callback => on(event, callback),
        emit: value => emit(event, value)
    };
}

